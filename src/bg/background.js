window.data = {};
chrome.browserAction.setBadgeBackgroundColor({color: '#ff0000ff'});
//listener for messages from popup and inject scripts
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    //new search from user
    if (message.source == 'popup') {
        window.data = message;
        window.data['mIndex'] = 0;
        window.data['matchedDates'] = {dates: []};
        window.data['siteIndex'] = 0;
        window.data['searching'] = true;
        if (window.data.exam == 'step1') {
            chrome.tabs.create({url : 'http://securereg3.prometric.com/landing.aspx?prg=STEP1'}, function(tab) {
                window.data['tabID'] = tab.id;
            });
        } else if (window.data.exam == 'step2') {
            chrome.tabs.create({url : 'http://securereg3.prometric.com/landing.aspx?prg=STEP2'}, function(tab) {
                window.data['tabID'] = tab.id;
            });
        } else if (window.data.exam == 'comlex') {
            chrome.tabs.create({url : 'https://securereg3.prometric.com/landing.aspx?prg=OME'}, function(tab) {
                window.data['tabID'] = tab.id;
            });
        }
    } else if (window.data.searching) {
        //site selection data
        if (message.source == 'siteSelect') {
            window.data['siteLength'] = message.tableLength;
            window.data['siteList'] = message.siteList;
            window.data['siteDistances'] = message.siteDistances;
        //date availability 
        } else if (message.source == 'seatAvailability') {
            //if there are more dates to search for the site
            if (message.nextPage == true) {
                window.data.matchedDates.dates = window.data.matchedDates.dates.concat(message.matchedDates);
                for (var i = 0, date; date = message.matchedDates[i]; i++) {
                    if (date in window.data.matchedDates) {
                        window.data.matchedDates[date].sites.push(window.data.siteList[window.data.siteIndex]);
                        window.data.matchedDates[date].distance.push(window.data.siteDistances[window.data.siteIndex]);
                    } else {
                        window.data.matchedDates[date] = {
                            sites: [window.data.siteList[window.data.siteIndex]],
                            distance: [window.data.siteDistances[window.data.siteIndex]]
                        }
                    }
                }
            //move to the next site search
            } else {
                window.data['siteIndex'] = window.data.siteIndex + 1;
                window.data['mIndex'] = 0;
                //keep going through list of sites
                if (window.data.siteIndex < window.data.siteLength && window.data.searching) {
                    chrome.tabs.update(window.data.tabID, {url: 'https://securereg3.prometric.com/siteselection.aspx'});
                //if sites list is complete then set badge and store data for the popup
                } else {
                    chrome.browserAction.setBadgeText({text: '1'});
                    chrome.tabs.remove(window.data.tabID);
                    chrome.notifications.create({
                        type: "basic",
                        title: "Search Complete!",
                        message: "Open the extension to view the dates and sites available.",
                        iconUrl: "/icons/SpotAlternate48.png",
                        priority: 1
                    });
                    window.data.searching = false;
                    chrome.storage.local.set({
                        complete: true,
                        completionDate: new Date().toString(),
                        matchedDates: window.data.matchedDates
                    });
                }
            }
        //when search is canceled by user
        } else if(message.source == 'popupCancel') {
            window.data.searching = false;
            chrome.tabs.remove(window.data.tabID);
        //when there is an error in the search
        } else if(message.source == 'siteSelectError') {
            error('invalid location');
            chrome.tabs.remove(window.data.tabID);
        }
    }
});
//listener for the automation tab
chrome.tabs.onUpdated.addListener(function (tabID, changeInfo, tab) {
    if (window.data.searching && (tabID == window.data.tabID)) {
        //country and state selection
        if (changeInfo.url == 'https://securereg3.prometric.com/Dispatch.aspx') {
            chrome.tabs.executeScript(tabID, {
                file: '/src/inject/S2dispatch.js'
            }, function(){
                chrome.tabs.sendMessage(tabID,{
                    'source': 'background',
                    'country': window.data.country,
                    'state': window.data.state,
                    'exam': window.data.exam
                });
            });
        //search for avaialability landing
        } else if (changeInfo.url == 'https://securereg3.prometric.com/professionalhome.aspx') {
            chrome.tabs.executeScript(tabID, {
                file: '/src/inject/S2home.js'
            }, function(){
                chrome.tabs.sendMessage(tabID,{
                    'source': 'background',
                });
            });
        //comlex testing type selection
        } else if (changeInfo.url == 'https://securereg3.prometric.com/ProgramSelection.aspx?mode=seatavail') {
            chrome.tabs.executeScript(tabID, {
                file: '/src/inject/S2comlex.js'
            }, function(){
                chrome.tabs.sendMessage(tabID,{
                    'source': 'background',
                    'comlexType': window.data.comlexType
                });
            });
        //location and radius selection for sites
        } else if (changeInfo.url == 'https://securereg3.prometric.com/siteselection.aspx') {
            chrome.tabs.executeScript(tabID, {
                file: '/src/inject/S2siteSelect.js'
            }, function(){
                chrome.tabs.sendMessage(tabID,{
                    'source': 'background',
                    'location': window.data.location,
                    'radius': window.data.radius,
                    'index': window.data.siteIndex
                });
            });
        //dates available for site
        } else if (changeInfo.title == 'Prometric - Seat Availability') {
            chrome.tabs.executeScript(tabID, {
                file: '/src/inject/S2seatAvailability.js'
            }, function(){
                chrome.tabs.sendMessage(tabID,{
                    'source': 'background',
                    'month': window.data.months[window.data.mIndex],
                    'dates': window.data.dates
                });
            });
            window.data['mIndex'] = window.data.mIndex + 1;
        //error handling for any other webpage encountered 
        } else if(changeInfo.url == 'https://securereg3.prometric.com/ErrorReport.aspx') {
            error('');
            chrome.tabs.remove(window.data.tabID);
        } 
    }
});
//listener for if the automation tab is closed externally
chrome.tabs.onRemoved.addListener(function (tabID, removeInfo) {
    if (window.data.searching && (tabID == window.data.tabID)) {
        error('page closed');
    }
});
//helper function for error handling
function error(details) {
    window.data.searching = false;
    chrome.storage.local.set({
        error: true,
        errorDetail: details
    });
    chrome.browserAction.setBadgeText({text: 'x'});
    chrome.notifications.create({
        type: "basic",
        title: "Search Error",
        message: "Open the extension for more details and create a new search.",
        iconUrl: "/icons/SpotAlternate48.png",
        priority: 1
      });
}