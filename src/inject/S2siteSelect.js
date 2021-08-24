chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	var readyStateCheckInterval = setInterval(function() {
        if (document.readyState === "complete") {
            clearInterval(readyStateCheckInterval);
            
            automate(message);

        }
	}, 10);
});

function automate(searchCriteria) {
    document.getElementById('txtSearch').value = searchCriteria.location;
    document.getElementById('ddlRange').selectedIndex = searchCriteria.radius;
    document.getElementById('btnSearch').click();
    var sitesReady = setInterval(function() {
        if (document.getElementById('sites_container')) {
            clearInterval(sitesReady);
            
            var table = document.getElementsByClassName('site_table')[0].rows;
            if (searchCriteria.index == 0) {
                var siteList = [];
                var siteDistances = [];
                for (var i = 0, row; row = table[i]; i++) {
                    siteList.push(row.cells[1].innerText)
                    siteDistances.push(row.cells[2].getElementsByTagName('span')[0].textContent);
                }
                chrome.runtime.sendMessage({
                    source: 'siteSelect',
                    tableLength: table.length,
                    siteList: siteList,
                    siteDistances: siteDistances
                });
            } 
            table[searchCriteria.index].cells[2].getElementsByTagName('a')[0].click();

        } else if (document.getElementById('site_nosites')) {
            chrome.runtime.sendMessage({
                source: 'siteSelectError'
            });
        }
    }, 100);
}