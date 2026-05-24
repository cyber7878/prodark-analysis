'use strict';
const fs = require('fs');

const inputPath  = process.argv[2];
const outputPath = process.argv[3];

if (!inputPath || !outputPath) {
    console.error('\nUsage: node deobfuscate.js <input.js> <output.js>\n');
    process.exit(1);
}

const source = fs.readFileSync(inputPath, 'utf8');
const lines  = source.split('\n');

// ── 1. Detect obfuscation function ───────────────────────────────────────────

let obfuscFuncName = null;
const headerPatterns = [
    /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*\(\s*([a-zA-Z_$]\w*)\s*,[^)]+\)\s*=>/,
    /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(\s*([a-zA-Z_$]\w*)\s*,[^)]+\)/,
];
for (let i = 0; i < lines.length && !obfuscFuncName; i++) {
    for (const pat of headerPatterns) {
        const hit = lines[i].match(pat);
        if (!hit) continue;
        const p1 = hit[2];
        for (let j = i; j < Math.min(i + 120, lines.length); j++) {
            if (lines[j].includes(`return ${p1}.slice(`) ||
                (j === i && lines[j].includes(`${p1}.slice(`))) {
                obfuscFuncName = hit[1]; break;
            }
        }
        if (obfuscFuncName) break;
    }
}
if (!obfuscFuncName) { console.error('\nNo obfuscation function found.\n'); process.exit(1); }
console.log(`Detected obfuscation function: "${obfuscFuncName}"`);

// ── 2. Decode every individual call ──────────────────────────────────────────

const escapedName = obfuscFuncName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const callRx = new RegExp(
    `${escapedName}\\(["']([^"']*?)["']\\s*,\\s*["']?(\\d+)["']?\\s*,\\s*["']?(\\d+)["']?\\)`, 'g'
);
const obfuscFn    = (s, a, b) => s.slice(Number(a), Number(b));
const callResults = new Map();
let m;
while ((m = callRx.exec(source)) !== null) callResults.set(m[0], obfuscFn(m[1], m[2], m[3]));
console.log(`Found ${callResults.size} individual calls to decode.`);

// ── Shared utility: substitute only outside string literals ──────────────────
//
// Splits the expression into alternating code/string segments.
// Only replaces the target name in code segments, never inside quoted strings.
// This prevents shorter variable names (like "ss") from matching
// inside the content of longer already-decoded strings (like "ssc").

function replaceOutsideStrings(expr, name, replacement) {
    const esc    = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const nameRx = new RegExp(`\\b${esc}\\b\\s*(?:\\(\\s*\\))?`, 'g');
    const strRx  = /(["'])(?:(?!\1)[^\\]|\\.)*\1/g;

    const parts = [];
    let last = 0, sm;
    while ((sm = strRx.exec(expr)) !== null) {
        parts.push({ code: true,  text: expr.slice(last, sm.index) });
        parts.push({ code: false, text: sm[0] });
        last = sm.index + sm[0].length;
    }
    parts.push({ code: true, text: expr.slice(last) });

    return parts.map(p => p.code ? p.text.replace(nameRx, replacement) : p.text).join('');
}

// ── 3. Collect all variable assignments ──────────────────────────────────────

const allAssigns = new Map();
const assignRx   = /^(?:var|const|let)?\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(.+?)\s*;?\s*$/;
const wrapperRx  = /^([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*\(\s*\)\s*=>\s*\{?\s*(?:return\s+)?(.+?)\s*\}?\s*;?\s*$/;

lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();
    for (const rx of [wrapperRx, assignRx]) {
        const hit = line.match(rx);
        if (hit) { allAssigns.set(hit[1], { rhs: hit[2].trim(), lineNum: idx + 1 }); break; }
    }
});

// Multi-line no-arg functions: name = () => {\n  return expr\n}
for (let i = 0; i < lines.length - 2; i++) {
    const hit = lines[i].trim().match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*\(\s*\)\s*=>\s*\{\s*$/);
    if (!hit) continue;
    const retHit = lines[i + 1].trim().match(/^return\s+(.+?)\s*;?\s*$/);
    if (retHit) allAssigns.set(hit[1], { rhs: retHit[1].trim(), lineNum: i + 1 });
}

// ── 4. Resolve compound variables iteratively ─────────────────────────────────

const decodedVars = new Map();

function tryEval(expr) {
    if (/^(?:"[^"]*"\s*\+\s*)*"[^"]*"$/.test(expr.trim())) {
        try { return new Function('"use strict"; return (' + expr + ')')(); } catch (_) {}
    }
    return null;
}

// Substitute all known values into an expression, safely (outside strings only)
function substituteAll(expr) {
    // 1. Replace direct obfuscation calls first (longest first)
    const sortedCalls = [...callResults.entries()].sort((a, b) => b[0].length - a[0].length);
    for (const [call, val] of sortedCalls) {
        const esc = call.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        expr = expr.replace(new RegExp(esc, 'g'), JSON.stringify(val));
    }
    // 2. Replace decoded variable names — sorted by value length DESCENDING
    //    so longer values are substituted before shorter names that might
    //    be substrings of longer names (e.g. "ss" before "s")
    const sortedVars = [...decodedVars.entries()].sort((a, b) => b[0].length - a[0].length);
    for (const [name, val] of sortedVars) {
        expr = replaceOutsideStrings(expr, name, JSON.stringify(val));
    }
    return expr;
}

// Initial pass
allAssigns.forEach(({ rhs }, name) => {
    const result = tryEval(substituteAll(rhs));
    if (result !== null) decodedVars.set(name, result);
});

// Iterative resolution for cross-variable references
let changed = true, passes = 0;
while (changed && passes < 30) {
    changed = false; passes++;
    allAssigns.forEach(({ rhs }, name) => {
        if (decodedVars.has(name)) return;
        const result = tryEval(substituteAll(rhs));
        if (result !== null) { decodedVars.set(name, result); changed = true; }
    });
}

console.log(`Resolved ${decodedVars.size} variables:`);
[...decodedVars.entries()]
    .sort((a, b) => (allAssigns.get(a[0])?.lineNum ?? 0) - (allAssigns.get(b[0])?.lineNum ?? 0))
    .forEach(([name, val]) => console.log(`  ${name.padEnd(20)} → "${val}"`));

// ── 4b. Find and mark the obfuscation function's dead body for deletion ────────
//
// The obfuscation function header is being replaced with a one-liner.
// But its BODY (all the dead padding code inside it) still exists in the source.
// We need to identify those lines and delete them, otherwise they become
// orphaned code that causes syntax errors after stripping.

const obfuscBodyLinesToDelete = new Set();

{
    // Find the header line of the obfuscation function
    const headerLineIdx = lines.findIndex(l =>
        new RegExp('^' + escapedName + '\\s*=\\s*\\(').test(l.trim())
    );

    if (headerLineIdx !== -1) {
        // Scan forward from header to find the body { and matching }
        let depth = 0, inStr = null, inLC = false, inBC = false;
        let bodyOpenLine = -1;
        let pastParams = false;

        outer2:
        for (let j = headerLineIdx; j < lines.length; j++) {
            const l = lines[j];
            inLC = false;
            for (let k = 0; k < l.length; k++) {
                const c = l[k], c2 = l.slice(k, k+2);
                if (inBC) { if (c2 === '*/') { inBC = false; k++; } continue; }
                if (inLC) break;
                if (inStr && c === '\\') { k++; continue; }
                if (inStr && c === inStr) { inStr = null; continue; }
                if (inStr) continue;
                if (c2 === '//') { inLC = true; break; }
                if (c2 === '/*') { inBC = true; k++; continue; }
                if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }

                if (!pastParams) {
                    if (c === '(') depth++;
                    if (c === ')') { depth--; if (depth === 0) pastParams = true; }
                } else {
                    if (c === '{') { bodyOpenLine = j; break outer2; }
                }
            }
        }

        if (bodyOpenLine !== -1) {
            // Now find closing } of the body
            let braceDepth = 0;
            inStr = null; inLC = false; inBC = false;
            let bodyCloseLine = -1;

            for (let j = bodyOpenLine; j < lines.length; j++) {
                const l = lines[j];
                inLC = false;
                for (let k = 0; k < l.length; k++) {
                    const c = l[k], c2 = l.slice(k, k+2);
                    if (inBC) { if (c2 === '*/') { inBC = false; k++; } continue; }
                    if (inLC) break;
                    if (inStr && c === '\\') { k++; continue; }
                    if (inStr && c === inStr) { inStr = null; continue; }
                    if (inStr) continue;
                    if (c2 === '//') { inLC = true; break; }
                    if (c2 === '/*') { inBC = true; k++; continue; }
                    if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
                    if (c === '{') braceDepth++;
                    if (c === '}') {
                        braceDepth--;
                        if (braceDepth === 0) { bodyCloseLine = j; break; }
                    }
                }
                if (bodyCloseLine !== -1) break;
            }

            // Mark body lines (header+1 .. closing brace) for deletion
            // We keep the header line itself (it gets rewritten to the one-liner)
            // We delete everything from header+1 to bodyCloseLine (inclusive)
            if (bodyCloseLine > headerLineIdx) {
                for (let ln = headerLineIdx + 1; ln <= bodyCloseLine; ln++) {
                    obfuscBodyLinesToDelete.add(ln);
                }
                console.log(`[3] Removed ${bodyCloseLine - headerLineIdx} lines of dead body from "${obfuscFuncName}" function`);
            }
        }
    }
}

// ── 5. Rewrite source line by line ────────────────────────────────────────────

const alreadyRewritten = new Set();

const rewrittenLines = lines.map((rawLine, idx) => {
    // Skip deleted body lines of the obfuscation function
    if (obfuscBodyLinesToDelete.has(idx)) { alreadyRewritten.add(idx); return null; }

    const trimmed = rawLine.trim();
    const indent  = rawLine.match(/^(\s*)/)[1];

    // Obfuscation function header → clean one-liner
    if (new RegExp(`^${escapedName}\\s*=\\s*\\(`).test(trimmed)) {
        alreadyRewritten.add(idx);
        return rawLine.replace(
            new RegExp(`${escapedName}\\s*=\\s*\\([^)]+\\)\\s*=>\\s*\\{`),
            `${obfuscFuncName} = (str, start, end) => str.slice(start, end); /* deobfuscated */`
        );
    }

    // Full variable assignment we decoded completely → replace entire RHS
    for (const [varName, decodedVal] of decodedVars) {
        const esc = varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const rx  = new RegExp(`^((?:var|const|let)\\s+)?\\b${esc}\\b\\s*=\\s*(.+?)\\s*;?\\s*$`);
        const hit = trimmed.match(rx);
        if (!hit) continue;
        if (hit[2] === JSON.stringify(decodedVal)) { alreadyRewritten.add(idx); return rawLine; }
        const keyword = hit[1] ? hit[1].trim() + ' ' : '';
        alreadyRewritten.add(idx);
        return `${indent}${keyword}${varName} = ${JSON.stringify(decodedVal)};`;
    }

    // Inline obfuscation calls within a larger expression
    if (rawLine.includes(obfuscFuncName + '(')) {
        let rewritten = rawLine;
        const sorted = [...callResults.entries()].sort((a, b) => b[0].length - a[0].length);
        for (const [call, val] of sorted) {
            const esc = call.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            rewritten = rewritten.replace(new RegExp(esc, 'g'), JSON.stringify(val));
        }
        alreadyRewritten.add(idx);
        return rewritten;
    }

    return rawLine;
});

// ── 6. Final pass: resolve remaining variable references ──────────────────────
//
// Only touches lines NOT handled in step 5.
// Uses replaceOutsideStrings to safely substitute without corrupting string literals.

const finalLines = rewrittenLines.filter(l => l !== null).map((rawLine, idx) => {
    if (alreadyRewritten.has(idx)) return rawLine;

    const trimmed = rawLine.trim();
    const indent  = rawLine.match(/^(\s*)/)[1];

    const assignHit = trimmed.match(
        /^((?:var|const|let)?\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*=\s*)(.+?)\s*;?\s*$/
    );
    if (!assignHit) return rawLine;

    let rhs = assignHit[2];
    let didSubstitute = false;

    // Sort by name length descending to avoid shorter names matching inside longer ones
    const sortedVars = [...decodedVars.entries()].sort((a, b) => b[0].length - a[0].length);
    for (const [name, val] of sortedVars) {
        const before = rhs;
        rhs = replaceOutsideStrings(rhs, name, JSON.stringify(val));
        if (rhs !== before) didSubstitute = true;
    }

    if (!didSubstitute) return rawLine;

    const collapsed = tryEval(rhs);
    if (collapsed !== null) {
        return `${indent}${assignHit[1]}${JSON.stringify(collapsed)};`;
    }
    return `${indent}${assignHit[1]}${rhs};`;
});

// ── 7. Write output ───────────────────────────────────────────────────────────

const cleanFinalLines = finalLines.filter(l => l !== null);
fs.writeFileSync(outputPath, cleanFinalLines.join('\n'), 'utf8');
console.log(`\nOutput written to: ${outputPath}`);
