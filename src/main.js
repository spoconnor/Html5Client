window.onload = function() {

var game = new Phaser.Game(800, 600, Phaser.AUTO, 'Html5Client', 
    { preload: preload, create: create, update: update, render: render });

function preload() {
    try {
      console.log('Loading textures');
      //  We load a TexturePacker JSON file and image and show you how to make several unique sprites from the same file
      game.load.atlas('iso-outside', 'resources/iso-64x64-outside.png', 'resources/iso-64x64-outside.json');
      game.load.spritesheet('button', 'resources/button_sprite_sheet.png', 193, 71);
      //game.load.image('block', 'resources/block.png');
    } catch(exception) {
      console.log('Error:' + exception);
    }
};

var clientId = 0;
var webServerId = 1000;
var socket;

var text;
var button;
var x = 32;
var y = 80;
var cursors;
var fireButton;



function create() {

    //  Modify the world and camera bounds
    // game.world.setBounds(-2000, -2000, 4000, 4000);
    game.world.resize(2000, 2000);
    
    game.stage.backgroundColor = '#404040';

    cursors = game.input.keyboard.createCursorKeys();
    fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    
    //	Just to kick things off
    button = game.add.button(200, 100, 'button', start, this, 2, 1, 0);

    //	Progress report
    text = game.add.text(32, 128, 'Click to login', { fill: '#ffffff' });
};


function start() {
    //  We load a TexturePacker JSON file and image and show you how to make several unique sprites from the same file
    //game.load.image('picture1', 'assets/pics/mighty_no_09_cover_art_by_robduenas.jpg');
    
    connect();

    // TODO - wait for open state, then send these
    setTimeout(function () {
      say("Hello World!");
      getMap(1,1);
    }, 20000);
    
    button.visible = false;
};

function update() {
    //  Scroll the background
    //starfield.tilePosition.y += 2;

    if (cursors.up.isDown)
    {
         game.camera.y -= 4;
    }
    else if (cursors.down.isDown)
    {
        game.camera.y += 4;
    }

    if (cursors.left.isDown)
    {
        game.camera.x -= 4;
    }
    else if (cursors.right.isDown)
    {
        game.camera.x += 4;
    }

    //  Run collision
    //    game.physics.arcade.overlap(bullets, aliens, collisionHandler, null, this);
    //    game.physics.arcade.overlap(enemyBullets, player, enemyHitsPlayer, null, this);
}

function render() {
    game.debug.cameraInfo(game.camera, 32, 32);
    
    // for (var i = 0; i < aliens.length; i++)
    // {
    //     game.debug.body(aliens.children[i]);
    // }
}

//var socket = new WebSocket("ws://localhost:8000/socket/server/startDaemon.php");
//
//socket.onopen = function(){
    //console.log("Socket has been opened!");
//}
//socket.onmessage = function(msg){
    //console.log(msg);
//}

/**
 * Creates a new Uint8Array based on two different ArrayBuffers
 *
 * @private
 * @param {ArrayBuffers} buffer1 The first buffer.
 * @param {ArrayBuffers} buffer2 The second buffer.
 * @return {ArrayBuffers} The new ArrayBuffer created out of the two.
 */
function appendBuffer(buffer1, buffer2) {
  var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
  tmp.set(new Uint8Array(buffer1), 0);
  tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
  return tmp;//.buffer;
};

function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}

function str2ab(str) {
  var buf = new ArrayBuffer(str.length); // 1 bytes for each char
  var bufView = new Uint8Array(buf);
  for (var i=0, strLen=str.length; i<strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

function UserException(message) {
   this.message = message;
   this.name = "UserException";
}

function connect() {
    try {
        var host = "ws://localhost:8083/WebSocket";// /socket/server/startDaemon.php";
        socket = new WebSocket(host);
        socket.binaryType = "arraybuffer"; // or assign to "blob"

        console.log('Socket Status: '+socket.readyState);

        socket.onopen = function() {
            console.log('Socket Status: '+socket.readyState+' (open)');
            ping(socket);
        };

        socket.onmessage = function(msg) {
            if (typeof msg.data === "string"){
              console.log("Received Text data from the server: " + msg.data);
            } else if (msg.data instanceof Blob){
              console.log("Received Blob data from the server");
            } else if (msg.data instanceof ArrayBuffer){
              console.log("Received ArrayBuffer data from the server");

              var data = msg.data;
              var dv = new DataView(data);
              var msgLen = dv.getUint16(0);
              console.log("MsgLen=" + msgLen);
              if (msgLen > 1024)
                throw new UserException("MsgLen exceeds max");
              var msgArray = data.slice(2,2+msgLen);
              var dataLen = dv.getUint32(2+msgLen);
              console.log("DataLen=" + dataLen);
              if (dataLen > 1048576)
                throw new UserException("DataLen exceeds max");
              var binData = data.slice(2+msgLen+4,2+msgLen+4+dataLen);
            
              var msgStr = ab2str(msgArray);
              console.log("json message=" + msgStr);
              var message = JSON.parse(msgStr);
              
              if (message.Map != null)
              {
                binDataDv = new DataView(binData);
                processMap(message, binDataDv);
              }
            }
        };

        socket.onclose = function() {
            console.log('Socket Status: '+socket.readyState+' (Closed)');
        };          
    } catch(exception) {
        console.log('Error'+exception);
    }
}

function sendMessage(message) {
  console.log("Preparing to send message");
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
  console.log("Sending...");
  socket.send(packet.buffer);
  console.log("Message Sent");
}  

function ping(socket) {
    try {
        console.log('Ping...');
        var msg = {"Ping":{"Message":"Ping"}}
        sendMessage(msg);
    } catch(exception) {
       console.log('Error:' + exception);
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
        console.log('Logged in, clientId = '+clientId);
    }
}
function processMap(msg, data) {
    console.log('Map message recevied');
    var idx=0;
    for (var x=0; x<10; x++){
        for (var y=0; y<10; y++){
            var colMin=data.getInt8(idx++);
            var colMax=data.getInt8(idx++);
            for (var z=colMin; z<=colMax; z++){
                var spr=sprites[data.getInt8(idx++)];
                var block = game.add.sprite(400+(x-y)*32,256+(x+y)*16-z*21, 'iso-outside');
                //console.log('frameName: ' + x + ',' + y + '=' + mapsprites[y*10+x] + '=>' + sprites[mapsprites[y*10+x]])
                block.frameName = spr;
                block.anchor.setTo(0.5, 0.5);
            }
        }
    }
}

function say(text) {
    try {
        console.log('Say...');
        var msg = {"Say":{"Text":text}}
        sendMessage(msg);
    } catch(exception) {
       console.log('Error:' + exception);
    }
}

function getMap(x,y) {
    try {
        console.log('GetMap...');
        var msg = {"MapRequest":{"Coords":{"X":x,"Z":y}}}
        sendMessage(msg);
    } catch(exception) {
       console.log('Error:' + exception);
    }
}

//socket.close();
}
