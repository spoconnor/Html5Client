importScripts("comms.js", "misc.js");

self.onmessage = function(e) {
  if (e.data[0] == 'connect')
  {
    connect();
  }

  // TODO - wait for open state, then send these
  //setTimeout(function () {
  //    say("Hello World!");
  //    getMap(100,100);
  //}, 20000);

  if (e.data[0] == 'at')
  {
    getMap(e.data[1], e.data[2]);
  }
};

function processMessage(message, binData)
{
  if (message.Map != null)
  {
    binDataDv = new DataView(binData);
    processMap(message, binDataDv);
  }
};

function processMap(msg, data) {
    console.log('Map message recevied');
    var idx = 0;
    var minX = msg.Map.MinPosition.X;
    var maxX = msg.Map.MaxPosition.X;
    var minY = msg.Map.MinPosition.Y;
    var maxY = msg.Map.MaxPosition.Y;
    var minZ = msg.Map.MinPosition.Z;
    var maxZ = msg.Map.MaxPosition.Z;
    for (var x = 0; x < (maxX - minX); x++) {
        for (var z = 0; z < (maxZ - minZ); z++) {
            for (var y = 0; y < (maxY - minY); y++) {
                var s = data.getInt8(idx++);
                if (s != 0)
                {
                  var spr = sprites[s];
                  self.postMessage(['+',minX+x,y,minZ+z,spr]);
                }
            }
        }
    }
};

