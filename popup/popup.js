document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("connect-btn").addEventListener("click", function () {
        chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
            var activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, { type: "connect" });
        });
    });
    document.getElementById("disconnect-btn").addEventListener("click", function () {
        chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
            var activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, { type: "disconnect" });
            chrome.tabs.sendMessage(tabs[0].id, { method: "getData" }, function (response) {
                if (response && response.data == "CONNECTED") {
                    console.log(response.data);
                    document.getElementById("connect-btn").disabled = true;
                    document.getElementById("disconnect-btn").disabled = false;
                }else if(response && response.data == "DISSCONECT"){
                    console.log(response.data);
                    document.getElementById("connect-btn").disabled = false;
                    document.getElementById("disconnect-btn").disabled = true;
                }
            });
        });
        
    });

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { method: "getData" }, function (response) {
            if (response && response.data == "CONNECTED") {
                console.log(response.data);
                document.getElementById("connect-btn").disabled = true;
                document.getElementById("disconnect-btn").disabled = false;
            }else if(response && response.data == "DISSCONECT"){
                console.log(response.data);
                document.getElementById("connect-btn").disabled = false;
                document.getElementById("disconnect-btn").disabled = true;
            }
        });
    });
});