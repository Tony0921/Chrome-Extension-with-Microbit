let isConnect = false;
let nowStateData = '';

let inputVal_1 = "LED lights";
let inputVal_2 = "Air conditioners";
let inputVal_3 = "Electric heaters";
let inputVal_prompt = `I will provide you with information about the current light intensity (light) and temperature(temperature) in the environment. The light intensity ranges from 0 to 255, larger number is lighter,the target light intensity is 100. The temperature is in Celsius, and target temperature target is 26.

There are LED lights({{variable_1}}), air conditioners({{variable_2}}) and electric heaters({{variable_3}}) available in the environment. turn on fluorescent lights will increase light intensity,vice versa. Turn on air conditioners will reduce temperature. Turn on electric heaters will increase temperature.

Based on the environmental parameters give the control command about turn on of off these available devices to reach target light intensity and temperature based on provided values.

only show the control format without any other words:

{{variable_1}}: {ON|OFF}
{{variable_2}}: {ON|OFF}
{{variable_3}}: {ON|OFF}

If the instructions are clear, please respond with 'I understand.'`;

// 偵測GPT回答  狀態
let canSend = true;
var interval_1 = setInterval(function () {
    // var rs = document.getElementsByClassName("result-streaming");
    var rs = document.querySelectorAll('div.result-streaming.markdown');
    // console.log(rs);
    var tag1 = document.querySelectorAll('div.markdown.prose');
    var tag2 = document.querySelectorAll('div.flex.flex-col.items-start');
    if (tag2.length / tag1.length != 2.0){
        return;
    }

    if (rs.length == 0) {
        canSend = true;
    } else {
        canSend = false;
    }
}, 1000);

async function sendToMicroBit() {
    if (nowStateData == '') return;

    // 等待回答完成
    while (!canSend) {
        console.log('wait');
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    var gpt_ans = document.querySelectorAll('div.markdown.prose'); //gpt回答
    // 取得最後一個物件
    const lastObject = gpt_ans[gpt_ans.length - 1];
    // console.log(lastObject.innerText);

    // serial 傳送字串
    var message = lastObject.innerText; // 你可以在此處添加你想要傳送的資訊

    let outputVal_1 = '';
    let outputVal_2 = '';
    let outputVal_3 = '';

    // 使用正则表达式匹配状态
    try {
        outputVal_1 = message.match(new RegExp(`${inputVal_1}: (ON|OFF)`, "i"))[0];
        // 处理成功匹配的情况
    } catch (error) {
        // 处理找不到匹配或其他错误的情况
        console.error(`Error processing inputVal_1: ${error.message}`);
    }
    
    try {
        outputVal_2 = message.match(new RegExp(`${inputVal_2}: (ON|OFF)`, "i"))[0];
        // 处理成功匹配的情况
    } catch (error) {
        // 处理找不到匹配或其他错误的情况
        console.error(`Error processing inputVal_2: ${error.message}`);
    }
    
    try {
        outputVal_3 = message.match(new RegExp(`${inputVal_3}: (ON|OFF)`, "i"))[0];
        // 处理成功匹配的情况
    } catch (error) {
        // 处理找不到匹配或其他错误的情况
        console.error(`Error processing inputVal_3: ${error.message}`);
    }
    

    // serial 傳送字串
    if(port.writable){
        const writer = port.writable.getWriter();
        const data = new TextEncoder().encode(outputVal_1 + "," + outputVal_2 + "," + outputVal_3 + "#");
        writer.write(data);
        writer.releaseLock();
    }
}

chrome.runtime.onMessage.addListener(
    function (message, sender, sendResponse) {
        if (message.method === "connect") {
            connect();
        }
        if (message.method === "disconnect") {
            disconnect();
        }
        if (message.method === "saveData") {
            inputVal_prompt = message.data.input_prompt;
            inputVal_1 = message.data.input_1;
            inputVal_2 = message.data.input_2;
            inputVal_3 = message.data.input_3;
        }
        if (message.method === "getData") {
            // console.log(message.method);
            if (isConnect) {
                sendResponse({ status: 'CONNECTED', inputData: {input_prompt: inputVal_prompt, input_1: inputVal_1, input_2: inputVal_2, input_3: inputVal_3 } }); // 這裡填寫你希望回傳給popup的資料
            }
            else {
                sendResponse({ status: 'DISSCONECT', inputData: {input_prompt: inputVal_prompt, input_1: inputVal_1, input_2: inputVal_2, input_3: inputVal_3 } }); // 這裡填寫你希望回傳給popup的資料
            }
        }
    }
);
let port;
const connectButton = document.createElement('button');
// const first_prompt = "目前環境中的光度(light)和溫度temperature)，光度範圍為0~255，溫度以攝氏度表示，環境中有日光燈、檯燈、冷氣機、電風扇、電暖爐可供使用，請依據環境參數提供生活建議，字數不超過 30 字，以上說明若清楚，請回答 我瞭解了";

function setOutputPrompt(val_1, val_2, val_3){
    let outpput_prompt = inputVal_prompt.replace(/{{variable_1}}/g,val_1).replace(/{{variable_2}}/g, val_2).replace(/{{variable_3}}/g, val_3);
    return outpput_prompt;
}

async function connect() {
    try {
        port = await navigator.serial.requestPort();
        await port.open({ baudRate: 115200 });
        reader = port.readable.getReader();

        isConnect = true;
       
        resault = setOutputPrompt(inputVal_1, inputVal_2, inputVal_3);

        console.log(resault);
        console.log(inputVal_1, inputVal_2, inputVal_3);
        setFieldValue(resault);
        clickSend();

        readLoop();
    } catch (error) {
        if (error.message === "Failed to execute 'requestPort' on 'Serial': No port selected by the user.") {
            console.log("User cancelled port selection");
        } else {
            console.error('Error:', error);
        }
    }
}

async function disconnect() {
    let disconnecting = false;
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
            console.log(buffer);
            nowStateData = buffer;
            setFieldValue(buffer);
            clickSend();
            sendToMicroBit();
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
    var element = document.querySelectorAll('button.absolute[data-testid="send-button"]');
    return element[0];
}

function clickSend() {
    var sendBtn = getSendBtn();
    sendBtn.click();
    canSend = false;
    
}