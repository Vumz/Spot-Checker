chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	var readyStateCheckInterval = setInterval(function() {
        if (document.readyState === "complete") {
            clearInterval(readyStateCheckInterval);
            
            automate(message);

        }
	}, 10);
});

function automate(searchCriteria) {
    var sitesReady = setInterval(function() {
        if (document.querySelector('[id^="masterPage_cphPageBody_calSeatSelectionCalendar"]')) {
            clearInterval(sitesReady);

             
            var matchedDates = [];
            var datesAvail = document.getElementsByClassName('calActiveLink');
            for (var i = 0, pdate; pdate = datesAvail[i]; i++) {
                for(var j = 0, date; date = searchCriteria.dates[j]; j++) {
                    if (date == pdate.title) {
                        matchedDates.push(date);
                    }
                }
            }
            if (matchedDates.length > 0) {
                chrome.runtime.sendMessage({
                    source: 'seatAvailability',
                    matchedDates: matchedDates,
                    nextPage: true
                });
            }
            if (searchCriteria.month == null) {
                chrome.runtime.sendMessage({
                    source: 'seatAvailability',
                    nextPage: false
                });
            }
            var monthsAvail = document.getElementsByTagName('option');
            for (var i = 0, pmonth; pmonth = monthsAvail[i]; i++) {
                if (searchCriteria.month == pmonth.value) {
                    pmonth.selected = true;
                    document.getElementById('masterPage_cphPageBody_btnGoCal').click();
                }
            }
            
        }
    }, 100);
}