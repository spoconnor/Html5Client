

//var socket = new WebSocket("ws://localhost:8000/socket/server/startDaemon.php");
//
//socket.onopen = function(){
//console.log("Socket has been opened!");
//}
//socket.onmessage = function(msg){
//console.log(msg);
//}


function connect() {
    try {
        var host = "ws://localhost:8083/WebSocket";// /socket/server/startDaemon.php";
        socket = new WebSocket(host);
        socket.binaryType = "arraybuffer"; // or assign to "blob"

        console.log('Socket Status: ' + socket.readyState);

        socket.onopen = function () {
            console.log('Socket Status: ' + socket.readyState + ' (open)');
            ping(socket);
        };

        socket.onmessage = function (msg) {
            if (typeof msg.data === "string") {
                console.log("Received Text data from the server: " + msg.data);
            } else if (msg.data instanceof Blob) {
                console.log("Received Blob data from the server");
            } else if (msg.data instanceof ArrayBuffer) {
                console.log("Received ArrayBuffer data from the server");

                var data = msg.data;
                var dv = new DataView(data);
                var msgLen = dv.getUint16(0);
                console.log("MsgLen=" + msgLen);
                if (msgLen > 1024)
                    throw new UserException("MsgLen exceeds max");
                var msgArray = data.slice(2, 2 + msgLen);
                var dataLen = dv.getUint32(2 + msgLen);
                console.log("DataLen=" + dataLen);
                if (dataLen > 1048576)
                    throw new UserException("DataLen exceeds max");
                var binData = data.slice(2 + msgLen + 4, 2 + msgLen + 4 + dataLen);

                var msgStr = ab2str(msgArray);
                console.log("json message=" + msgStr);
                var message = JSON.parse(msgStr);

                processMessage(message, binData);
            }
        };

        socket.onclose = function () {
            console.log('Socket Status: ' + socket.readyState + ' (Closed)');
        };
    } catch (exception) {
        console.log('Error' + exception);
    }
}

function sendMessage(message) {
    var msgJson = JSON.stringify(message);
    var msgBin = str2ab(msgJson);
    var msgLen = msgBin.byteLength;
    var lenBuf = new Uint8Array(2);
    lenBuf[0] = msgLen / 256;
    lenBuf[1] = msgLen % 256;
    var msg = appendBuffer(lenBuf, msgBin);
    var dataLen = new Uint8Array(4);
    dataLen[0] = 0;
    dataLen[1] = 0;
    dataLen[2] = 0;
    dataLen[3] = 0;
    var packet = appendBuffer(msg, dataLen);
    socket.send(packet.buffer);
    console.log("Message Sent");
}

function ping(socket) {
    try {
        console.log('Sending Ping...');
        var msg = { "Ping": { "Message": "Ping" } }
        sendMessage(msg);
    } catch (exception) {
        console.log('Ping Error:' + exception);
    }
}

var sprites = [
  "null", // 0
  "grass_slope_n.png",  // 1
  "grass_slope_ne.png", // 2
  "grass_slope_nw.png", // 3
  "grass_slope_e.png",  // 4
  "grass_block.png",    // 5
  "grass_slope_w.png",  // 6
  "grass_slope_se.png", // 7
  "grass_slope_sw.png", // 8
  "grass_slope_s.png",  // 9
  "grass_slope_wse.png",// 10
  "grass_slope_nws.png",// 11
  "grass_slope_wne.png",// 12
  "grass_slope_nes.png",// 13
  "rock_outcrop_.png",  // 14
  "rock_slope_n.png",   // 15
  "rock_slope_nw.png",  // 16
  "rock_slope_e.png",   // 17
  "rock_block_1.png",   // 18
  "rock_block_2.png",   // 19
  "rock_slope_w.png",   // 20
  "rock_slope_se.png",  // 21
  "rock_slope_sw.png",  // 22
  "rock_slope_s.png"   // 23
];

function processResponse(msg) {
    if (msg.response.code === 1) {
        clientId = msg.dest;
        console.log('Logged in, clientId = ' + clientId);
    }
}

function say(text) {
    try {
        console.log('Sending Say...');
        var msg = { "Say": { "Text": text } }
        sendMessage(msg);
    } catch (exception) {
        console.log('Say Error:' + exception);
    }
}

function getMap(x, y) {
    try {
        console.log('Sending GetMap...');
        var msg = { "MapRequest": { "Coords": { "X": x, "Z": y } } }
        sendMessage(msg);
    } catch (exception) {
        console.log('GetMap Error:' + exception);
    }
}
