let activeTabId, lastUrl, lastTitle;

function getTabInfo(tabId) {
    chrome.tabs.get(tabId, function (tab) {
        if (lastUrl != tab.url || lastTitle != tab.title)
            console.log(lastUrl = tab.url, lastTitle = tab.title);
        if (tab.url.includes("chat.openai.com")) {
            console.log("match");
            // chrome.action.enable();
            chrome.action.setPopup({ popup: './popup/popup.html' });
        } else {
            // chrome.action.disable();
            chrome.action.setPopup({ popup: './popup/popup2.html' });
        }
    });
}

chrome.tabs.onActivated.addListener(function (activeInfo) {
    getTabInfo(activeTabId = activeInfo.tabId);

});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (activeTabId == tabId) {
        getTabInfo(tabId);
    }
});