chrome.runtime.onMessage.addListener(
    function (message, sender, sendResponse) {
        if (message.type === "connect") {
            connect();
        }
    }
);
let port;
const connectButton = document.createElement('button');
// const dataContainer = document.createElement('div');

async function connect(){
    try {
        port = await navigator.serial.requestPort();
        await port.open({ baudRate: 115200 });
        reader = port.readable.getReader();

        connectButton.disabled = true;
        readLoop();
    } catch (error) {
        console.error('Error:', error);
    }
}

connectButton.addEventListener('click', async () => {
    try {
        port = await navigator.serial.requestPort();
        await port.open({ baudRate: 115200 });
        reader = port.readable.getReader();

        connectButton.disabled = true;
        readLoop();
    } catch (error) {
        console.error('Error:', error);
    }
});

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
        connectButton.disabled = false;
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
        } else {
            buffer += value;  
        }
    }
}

function setFieldValue(value) {
    var inputField = document.getElementsByTagName("textarea")[0];
    inputField.value = value;

    // set textfield height
    if (inputField.scrollHeight < 200) {
        inputField.setAttribute("style", " max-height:200px; height:" + (inputField.scrollHeight) + "px; overflow-y: hidden;");
    } else {
        inputField.setAttribute("style", "max-height:200px; height:" + (inputField.scrollHeight) + "px;");
    }
}

function getSendBtn() {
    var element_1 = document.querySelectorAll('button.absolute.p-1');
    return element_1[0];
}

function checkFieldValue(value) {
    var sendBtn = getSendBtn();

    // enable button
    if (value != "") {
        sendBtn.disabled = false;
    } else {
        sendBtn.disabled = true;
    }
}