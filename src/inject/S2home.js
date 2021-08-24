chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	var readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);

		automate();

	}
	}, 10);
});

function automate() {
	document.getElementById('masterPage_cphPageBody_lnkSeatAvail2').click();
}