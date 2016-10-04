importScripts("comms.js", "misc.js");

var fake = false;

self.onmessage = function(e) {
  if (e.data[0] == 'connect')
  {
    connect();
  }
  if (e.data[0] == 'fakeconnect')
  {
    this.fake = true;
  }

  // TODO - wait for open state, then send these
  //setTimeout(function () {
  //    say("Hello World!");
  //    getMap(100,100);
  //}, 20000);

  if (e.data[0] == 'at')
  {
    if (this.fake == true)
    {
      setTimeout(function () {
        fakeProcessMap(e.data[1], e.data[2]);
      }, 5000);
    }
    else
    {
      getMap(e.data[1], e.data[2]);
    }
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

function fakeProcessMap(x,z) {
    console.log('Fake Map message recevied');
    var idx = 0;
    var minX = x * 32;
    var maxX = (x+1) * 32;
    var minY = 0;
    var maxY = 10;
    var minZ = z * 32;
    var maxZ = (z+1) * 32;
    for (var x = 0; x < (maxX - minX); x++) {
        for (var z = 0; z < (maxZ - minZ); z++) {
            for (var y = 0; y < (maxY - minY); y++) {
                var s = 2; // just dirt
                if (s != 0)
                {
                  var spr = sprites[s];
                  self.postMessage(['+',minX+x,y,minZ+z,spr]);
                }
            }
        }
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

