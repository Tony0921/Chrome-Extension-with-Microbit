let isConnect = false;

chrome.runtime.onMessage.addListener(
    function (message, sender, sendResponse) {
        if (message.type === "connect") {
            connect();
        }
        if (message.type === "disconnect") {
            disconnect();
        }
        if (message.method === "getData") {
            console.log(message.method);
            if (isConnect) {
                sendResponse({ data: 'CONNECTED' }); // 這裡填寫你希望回傳給popup的資料
            }
            else {
                sendResponse({ data: 'DISSCONECT' }); // 這裡填寫你希望回傳給popup的資料
            }
        }
    }
);
let port;
const connectButton = document.createElement('button');
// const dataContainer = document.createElement('div');
var first_prompt = "目前環境中的光度(light)和溫度temperature)，光度範圍為0~255，溫度以攝氏度表示，環境中有日光燈、檯燈、冷氣機、電風扇、電暖爐可供使用，請依據環境參數提供生活建議，字數不超過 30 字，以上說明若清楚，請回答 我瞭解了";

async function connect() {
    try {
        port = await navigator.serial.requestPort();
        await port.open({ baudRate: 115200 });
        reader = port.readable.getReader();

        // connectButton.disabled = true;
        isConnect = true;
        setFieldValue(first_prompt);
        clickSend();

        readLoop();
    } catch (error) {
        console.error('Error:', error);
    }
}

let disconnecting = false;

async function disconnect() {
    try {
        if (port && !disconnecting) {
            disconnecting = true;

            if (reader) {
                await reader.cancel();
                reader.releaseLock();
                reader = null;
            }
            if (port.readable) {
                await port.close();
                port = null;
            }

            disconnecting = false;
        }
        // connectButton.disabled = false;
        isConnect = false;
    } catch (error) {
        disconnecting = false;
        console.error('Error:', error);
    }
}

async function readLoop() {
    try {
        while (true) {
            const { value, done } = await reader.read();
            if (done) {
                break;
            }

            const textDecoder = new TextDecoder();
            const receivedData = textDecoder.decode(value);
            processInput(receivedData);
            // dataContainer.textContent += receivedData;

        }
    } catch (error) {
        console.error('Read loop error:', error);
    } finally {
        reader.releaseLock();
        port.close();
        // connectButton.disabled = false;
        isConnect = false;
    }
}

let buffer = '';

function processInput(input) {
    const values = input.split('');

    for (let i = 0; i < values.length; i++) {
        const value = values[i];

        if (value === 'l') {
            buffer = '';
            buffer += value;
        } else if (value === '#') {
            // dataContainer.textContent = buffer;
            console.log(buffer);
            setFieldValue(buffer);
            clickSend();
        } else {
            buffer += value;
        }
    }
}

function setFieldValue(value) {
    var inputField = document.getElementById("prompt-textarea");
    inputField.value = value;
    inputField.dispatchEvent(new Event("input", { bubbles: true }));
    inputField.focus();

    // set textfield height
    if (inputField.scrollHeight < 200) {
        inputField.setAttribute("style", " max-height:200px; height:" + (inputField.scrollHeight) + "px; overflow-y: hidden;");
    } else {
        inputField.setAttribute("style", "max-height:200px; height:" + (inputField.scrollHeight) + "px;");
    }

}

function getSendBtn() {
    var element = document.querySelectorAll('button.absolute.p-1');
    return element[0];
}

function clickSend() {
    var sendBtn = getSendBtn();
    sendBtn.click();
    canSend = false;
}