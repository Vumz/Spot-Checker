chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	var readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);

		automate(message);

	}
	}, 10);
});

function automate(searchCriteria) {
	document.getElementById('masterPage_cphPageBody_ddlCountry').selectedIndex = searchCriteria.country;
	//US
	if (((searchCriteria.exam == 'step1') && (searchCriteria.country == 68)) || ((searchCriteria.exam == 'step2') && (searchCriteria.country == 64)) || ((searchCriteria.exam == 'comlex') && (searchCriteria.country == 4))) {
		document.getElementById('masterPage_cphPageBody_ddlStateProvince').selectedIndex = searchCriteria.state;
	//Canada
	} else if (searchCriteria.country == 8 || (searchCriteria.exam == 'comlex') && (searchCriteria.country == 1)) {
		document.getElementById('masterPage_cphPageBody_ddlStateProvince').selectedIndex = searchCriteria.state;
	}
	document.getElementById('masterPage_cphPageBody_btnNext').click();
}