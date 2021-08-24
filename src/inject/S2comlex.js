chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	var readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);

		automate(message);

	}
	}, 10);
});

function automate(searchCriteria) {
	document.getElementById('masterPage_cphPageBody_ddlExam').selectedIndex = searchCriteria.comlexType;
	document.getElementById('masterPage_cphPageBody_btnNext').click();
}