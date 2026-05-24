/**
 * Dead Code Stripper
 * ------------------
 * Removes padding functions from obfuscated Chrome extension background scripts.
 * Run AFTER deobfuscate.js.
 *
 * Three things this removes:
 *
 * 1. ORPHANED FUNCTION BODIES
 *    When deobfuscate.js rewrites a multi-line function to a single-line
 *    assignment (e.g. hexCheck = "https://..."), the original function body
 *    lines are left in the file. These cause syntax errors because they have
 *    no opening brace. Detection: brace depth would go below 0.
 *    Removed first, before function analysis.
 *
 * 2. DUPLICATE FUNCTION DEFINITIONS (keep first, remove rest)
 *    Any function defined more than once is padding. The first definition
 *    is kept so that call sites inside live functions (like colchk) still work.
 *
 * 3. UNCALLED SINGLETON FUNCTIONS (iterated)
 *    After duplicates are removed, some functions may now have zero callers
 *    because their only callers were just removed. Iterated until stable.
 *
 * Usage:
 *   node strip_dead.js <input.js> <output.js>
 */

'use strict';
const fs = require('fs');

const inputPath  = process.argv[2];
const outputPath = process.argv[3];
if (!inputPath || !outputPath) {
    console.error('\nUsage: node strip_dead.js <input.js> <output.js>\n');
    process.exit(1);
}

const rawSource = fs.readFileSync(inputPath, 'utf8');
const hadCRLF   = rawSource.includes('\r\n');
// Work with LF internally
let source = hadCRLF ? rawSource.replace(/\r\n/g, '\n') : rawSource;

// ── Step 1: Remove orphaned body lines ───────────────────────────────────────
//
// These are remnants of functions whose headers were rewritten to single-line
// assignments by deobfuscate.js. The body lines are now at brace depth 0
// but contain only return statements and closing braces — they cause syntax errors.
//
// Algorithm:
//   Walk the source tracking brace depth (outside strings/comments).
//   Collect all lines where a } would bring depth below 0.
//   For each such closing }, also remove the lines directly preceding it
//   that are indented (they belong to the same orphaned body).

function removeOrphanedBodies(src) {
    const lines = src.split('\n');
    const toDelete = new Set();

    let depth = 0;
    let inStr = null, inLC = false, inBC = false;

    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
        const l = lines[lineIdx];
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

            if (c === '{') depth++;
            if (c === '}') {
                if (depth === 0) {
                    // This } would go negative — it's an orphaned closing brace.
                    // Mark this line and scan backwards to remove the orphaned body.
                    toDelete.add(lineIdx);

                    // Walk backward removing indented lines that belong to this body
                    let prev = lineIdx - 1;
                    while (prev >= 0) {
                        const prevLine = lines[prev];
                        const prevTrim = prevLine.trim();

                        // Stop at a blank line or at a line that looks like
                        // real top-level code (not indented orphan content)
                        if (prevTrim === '') break;
                        if (toDelete.has(prev)) { prev--; continue; } // already marked

                        // Mark lines that start with indentation (they're orphan body content)
                        if (prevLine.startsWith('\t') || prevLine.startsWith('  ')) {
                            toDelete.add(prev);
                            prev--;
                        } else {
                            break;
                        }
                    }
                } else {
                    depth--;
                }
            }
        }
    }

    if (toDelete.size > 0) {
        const kept = lines.filter((_, i) => !toDelete.has(i));
        console.log(`[1] Removed ${toDelete.size} orphaned body lines`);
        return kept.join('\n');
    }
    return src;
}

source = removeOrphanedBodies(source);

// ── Step 2+3: Remove duplicate and uncalled functions ────────────────────────

// Parser: find every function block with name, startLine, endLine (0-indexed)
function parseFunctions(src) {
    const lines  = src.split('\n');
    const blocks = [];

    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
        const line = lines[lineIdx];

        // Match all forms of function header
        // Key: support destructured params { h, s, l } and ({ obj }, extra)
        let name = null;

        const forms = [
            // function name(   OR   function name({
            /^(?:\t| )*function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[({]/,
            // name = function(
            /^(?:\t| )*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*function\s*[({]/,
            // name = (params) => {      (arrow with block body)
            /^(?:\t| )*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*\([^=]*\)\s*=>\s*\{/,
        ];

        for (const rx of forms) {
            const m = line.match(rx);
            if (m) { name = m[1]; break; }
        }
        if (!name) continue;

        // Scan from header line to find:
        // 1. The closing ) of the parameter list (past any destructuring)
        // 2. The { that opens the function body
        // 3. The matching } that closes it

        let parenDepth = 0, pastParams = false;
        let bodyOpenLine = -1, bodyOpenCol = 0;
        let inStr = null, inLC = false, inBC = false;
        let found = false;

        outer:
        for (let j = lineIdx; j < lines.length; j++) {
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
                    if (c === '(') parenDepth++;
                    if (c === ')') { parenDepth--; if (parenDepth === 0) pastParams = true; }
                } else {
                    if (c === '{') { bodyOpenLine = j; bodyOpenCol = k; found = true; break outer; }
                    if (c === ';') break outer; // expression arrow, no block body
                }
            }
        }

        if (!found) continue;

        // Find matching closing }
        let braceDepth = 0, endLine = -1;
        inStr = null; inLC = false; inBC = false;

        for (let j = bodyOpenLine; j < lines.length; j++) {
            const l = lines[j];
            inLC = false;
            const kStart = (j === bodyOpenLine) ? bodyOpenCol : 0;
            for (let k = kStart; k < l.length; k++) {
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
                    if (braceDepth === 0) { endLine = j; break; }
                }
            }
            if (endLine !== -1) break;
        }

        if (endLine !== -1) blocks.push({ name, startLine: lineIdx, endLine });
    }

    return blocks;
}

// Count calls to each function (excluding definition header lines)
function countCalls(src, blocks) {
    const headerLines = new Set(blocks.map(b => b.startLine));
    const counts = new Map();
    const allNames = [...new Set(blocks.map(b => b.name))];

    allNames.forEach(name => {
        const rx = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\(`, 'g');
        let count = 0, match;
        while ((match = rx.exec(src)) !== null) {
            const lineNum = src.substring(0, match.index).split('\n').length - 1;
            if (!headerLines.has(lineNum)) count++;
        }
        counts.set(name, count);
    });

    return counts;
}

// Remove line ranges (0-indexed, inclusive)
function removeRanges(src, ranges) {
    if (!ranges.length) return src;
    const lines = src.split('\n');

    // Merge overlapping ranges
    const sorted = [...ranges].sort((a, b) => a.s - b.s);
    const merged = [];
    for (const r of sorted) {
        if (merged.length && r.s <= merged[merged.length-1].e + 1)
            merged[merged.length-1].e = Math.max(merged[merged.length-1].e, r.e);
        else merged.push({...r});
    }

    const del = new Set();
    for (const { s, e } of merged) for (let i = s; i <= e; i++) del.add(i);

    // Filter and collapse 3+ blank lines to 2
    const kept = lines.filter((_, i) => !del.has(i));
    const result = [];
    let blanks = 0;
    for (const l of kept) {
        if (l.trim() === '') { if (++blanks <= 2) result.push(l); }
        else { blanks = 0; result.push(l); }
    }
    return result.join('\n');
}

// Main loop
const origLines = source.split('\n').length;
const allRemoved = new Set();
let round = 0, changed = true;

while (changed) {
    round++;
    changed = false;

    const blocks = parseFunctions(source);
    const calls  = countCalls(source, blocks);

    const byName = new Map();
    blocks.forEach(b => {
        if (!byName.has(b.name)) byName.set(b.name, []);
        byName.get(b.name).push(b);
    });

    const ranges = [];
    const dupLog = [], deadLog = [];

    byName.forEach((defs, name) => {
        if (defs.length > 1) {
            // Keep first (outermost) definition, remove the rest
            const sorted = [...defs].sort((a, b) => a.startLine - b.startLine);
            for (let i = 1; i < sorted.length; i++)
                ranges.push({ s: sorted[i].startLine, e: sorted[i].endLine });
            dupLog.push(`${name}(×${defs.length}→1)`);
            allRemoved.add(name);
            changed = true;
        } else if ((calls.get(name) ?? 0) === 0) {
            ranges.push({ s: defs[0].startLine, e: defs[0].endLine });
            deadLog.push(name);
            allRemoved.add(name);
            changed = true;
        }
    });

    if (!ranges.length) continue;

    console.log(`[${round + 1}] Round ${round}:`);
    if (dupLog.length)  console.log(`    Duplicates : ${dupLog.sort().join(', ')}`);
    if (deadLog.length) console.log(`    Uncalled   : ${deadLog.sort().join(', ')}`);

    source = removeRanges(source, ranges);
}

// Restore CRLF if original used it
if (hadCRLF) source = source.replace(/\n/g, '\r\n');

fs.writeFileSync(outputPath, source, 'utf8');

const finalLines = source.replace(/\r\n/g, '\n').split('\n').length;
console.log(`\n── Summary ─────────────────────────────────────────────────`);
console.log(`  Lines before    : ${origLines}`);
console.log(`  Lines after     : ${finalLines}`);
console.log(`  Lines removed   : ${origLines - finalLines} (${Math.round((origLines-finalLines)/origLines*100)}%)`);
console.log(`\nOutput: ${outputPath}`);
