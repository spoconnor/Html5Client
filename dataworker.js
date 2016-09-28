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
    for (var x = 0; x < 10; x++) {
        for (var z = 0; z < 10; z++) {
            var colMin = data.getInt8(idx++);
            var colMax = data.getInt8(idx++);
            for (var y = colMin; y <= colMax; y++) {
                var s = data.getInt8(idx++);
                if (s != 0)
                {
                  var spr = sprites[s];
                  self.postMessage(['+',x,y,z,spr]);
                }
            }
        }
    }
};

