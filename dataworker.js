importScripts("comms.js", "misc.js");

self.onmessage = function(e) {
  if (e.data == 'connect')
  {
    connect();

    // TODO - wait for open state, then send these
    setTimeout(function () {
        say("Hello World!");
        getMap(100,100);
    }, 20000);
  }
  self.postMessage("Hello");
};



