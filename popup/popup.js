// document.addEventListener("DOMContentLoaded", function () {
//     document.getElementById("connect-btn").addEventListener("click", function () {
//         chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
//             var activeTab = tabs[0];
//             chrome.tabs.sendMessage(activeTab.id, { type: "connect" });
//         });
//     });
//     document.getElementById("disconnect-btn").addEventListener("click", function () {
//         chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
//             var activeTab = tabs[0];
//             chrome.tabs.sendMessage(activeTab.id, { type: "disconnect" });
//             chrome.tabs.sendMessage(activeTab.id, { method: "getData" }, function (response) {
//                 if (response && response.data == "CONNECTED") {
//                     console.log(response.data);
//                     document.getElementById("connect-btn").disabled = true;
//                     document.getElementById("disconnect-btn").disabled = false;
//                 }else if(response && response.data == "DISSCONECT"){
//                     console.log(response.data);
//                     document.getElementById("connect-btn").disabled = false;
//                     document.getElementById("disconnect-btn").disabled = true;
//                 }
//             });
//         });

//     });

//     chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
//         var activeTab = tabs[0];
//         chrome.tabs.sendMessage(activeTab.id, { method: "getData" }, function (response) {
//             if (response && response.data == "CONNECTED") {
//                 console.log(response.data);
//                 document.getElementById("connect-btn").disabled = true;
//                 document.getElementById("disconnect-btn").disabled = false;
//             }else if(response && response.data == "DISSCONECT"){
//                 console.log(response.data);
//                 document.getElementById("connect-btn").disabled = false;
//                 document.getElementById("disconnect-btn").disabled = true;
//             }
//         });
//     });
// });
document.addEventListener("DOMContentLoaded", function () {
    const connectBtn = document.getElementById("connect-btn");
    const disconnectBtn = document.getElementById("disconnect-btn");

    function queryTabsAndSendMessage(message, callback) {
        chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
            var activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, message, callback);
        });
    }

    function handleResponse(response) {
        if (response) {
            console.log(response);
            console.log(response.data);
            var isConnected = (response && response.data == "CONNECTED");
            connectBtn.disabled = isConnected;
            disconnectBtn.disabled = !isConnected;
        }
    }

    connectBtn.addEventListener("click", function () {
        queryTabsAndSendMessage({ type: "connect" });
    });

    disconnectBtn.addEventListener("click", function () {
        queryTabsAndSendMessage({ type: "disconnect" });
        queryTabsAndSendMessage({ method: "getData" }, handleResponse);
    });

    queryTabsAndSendMessage({ method: "getData" }, handleResponse);
});
