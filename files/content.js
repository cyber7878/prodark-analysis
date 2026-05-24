let mode = 0;
function darkStopSet() {
	var darki = document.body.getElementsByTagName("*");
	document.body.style.backgroundColor = "#000";
	for (i = 0; i <= darki.length; i++) {
		darki[i].style.color = "#fff";
		darki[i].style.backgroundColor = "#000";
	}
}

chrome.runtime.onMessage.addListener(darkSet);

function darkSet(request, sender, sendResponse) {
	if(request.setLight)
		continueSetLight(request, sender, sendResponse);
	if (request.stoplight) {
		if(!mode) {
			mode = 1;
			darkStopSet();
		}
		else {
			mode = 0;
			window.location.reload();
		}
	}
}

function continueSetLight(request, sender, sendResponse) {
	document.getElementById('bg') && (document.getElementById('sb_feedback').style.backgroundColor = 'white')
	document.getElementById('bg') && (document.getElementById('bg').style.backgroundColor = 'white')
	document.getElementById('sb') && (document.getElementById('sb').style.backgroundColor = 'white')
	document.getElementById('fg') && (document.getElementById('fg').style.backgroundColor = 'white')
	document.getElementById('sb_feedback') && (document.getElementById('sb_feedback').style.display = 'none')
}

document.addEventListener('click', function () {
	chrome.storage.local.get(["darkycolor", "darkbcolor"], function (s) {
		if (!window.location.href.includes(s.darkycolor) && !window.location.href.includes(s.darkbcolor)) {
			chrome.runtime.sendMessage({color: "light"});
		}
	})
})
