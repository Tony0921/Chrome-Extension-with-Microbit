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
    const input_1 = document.getElementById("input-1");
    const input_2 = document.getElementById("input-2");
    const input_3 = document.getElementById("input-3");

    function queryTabsAndSendMessage(message, callback) {
        chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
            var activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, message, callback);
        });
    }

    function handleResponse(response) {
        if (response) {
            console.log(response);
            console.log(response.status);
            var isConnected = (response && response.status == "CONNECTED");
            connectBtn.disabled = isConnected;
            disconnectBtn.disabled = !isConnected;
            // console.log(response.inputData);
            input_1.value = response.inputData.input_1;
            input_2.value = response.inputData.input_2;
            input_3.value = response.inputData.input_3;

            input_1.disabled = isConnected;
            input_2.disabled = isConnected;
            input_3.disabled = isConnected;
        }
    }

    function replaceWords(value){
        return value.replace(/[^A-Za-z0-9\s-_]/g, '');
    }

    connectBtn.addEventListener("click", function () {
        if (input_1.value == "" ){
            return;
        }
        if (input_2.value == "" ){
            return;
        }
        if (input_3.value == "" ){
            return;
        }
        queryTabsAndSendMessage({ method: "connect" });
    });

    disconnectBtn.addEventListener("click", function () {
        queryTabsAndSendMessage({ method: "disconnect" });
        queryTabsAndSendMessage({ method: "getData" }, handleResponse);
    });

    input_1.addEventListener('blur', function (event) {
        input_1.value = replaceWords(input_1.value);
        queryTabsAndSendMessage({ method: "saveData", data: {input_1: input_1.value, input_2: input_2.value, input_3: input_3.value}});
    });

    input_2.addEventListener('blur', function (event) {
        input_2.value = replaceWords(input_2.value);
        queryTabsAndSendMessage({ method: "saveData", data: {input_1: input_1.value, input_2: input_2.value, input_3: input_3.value}});
    });

    input_3.addEventListener('blur', function (event) {
        input_3.value = replaceWords(input_3.value);
        queryTabsAndSendMessage({ method: "saveData", data: {input_1: input_1.value, input_2: input_2.value, input_3: input_3.value}});
    });

    queryTabsAndSendMessage({ method: "getData" }, handleResponse);
});
