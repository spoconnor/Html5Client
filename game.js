GameStates.Game = function (game) {

};

var theGame;
var furtherestBlock = {};
var closestBlock = {};
var boundBlocks = {};

function mapToScreenCoords(map) {
    var x = ((map.x - map.z) * 32);// + 400;
    var y = 256 + (map.x + map.z) * 16 - (map.y * 21);
    // z calc
    //var x1 = map.x - furtherestBlock.x;
    //var y1 = map.y - furtherestBlock.y;    
    //var z1 = map.z - furtherestBlock.z;
    //var z = z1 + (y1 * boundBlocks.z * boundBlocks.x) + x1;
    var z = (map.x + map.z) * 256 + map.y;
    return { x: x, y: y, z: z };
};
function screenToMapCoords(scr, y) {
    var xyDiff = scr.x/32;
    var xyAdd  = (scr.y-256+(21*y))/16;
    var y = (xyAdd - xyDiff) / 2;
    var x = (xyAdd + xyDiff) / 2;
    var z = (y - 256 + 21 * y) / 16 - x;
    return { x: x, y: y, z: z };
};
function mapToChunkCoords(map) {
    return { x: (map.x / 32 >> 0), z: (map.z / 32 >> 0) };  // The '>> 0' does a quick round down
};

GameStates.Game.prototype = {

    //create: function () {
    //    //below code creates a simple tween animation. You will want to delete this when adding your code
    //    var logo = this.add.sprite(this.world.centerX, this.world.centerY, 'logo');
    //    logo.anchor.setTo(0.5, 0.5);
    //    logo.scale.setTo(0.2, 0.2);
    //    this.add.tween(logo.scale).to({ x: 1, y: 1 }, 2000, Phaser.Easing.Bounce.Out, true);
    //},

    mapDataWorker: null,
    lookAt: { x: 0, y: 0, z: 0 },
    currentChunk: { x: 0, z: 0},

    processMapData: function(e) {
      if (e.data[0] = '+')
      {
        var x=e.data[1];
        var y=e.data[2];
        var z = e.data[3];
        var spr = e.data[4];
if (y < 10)
{
        var scrLoc = mapToScreenCoords({ x: x, y: y, z: z });
        //console.log('Add aprite at: ' + x + "," + y + "," + z + "=>" + scrLoc.x + ',' + scrLoc.y);
        var block = theGame.add.sprite(scrLoc.x, scrLoc.y, 'iso-outside');
        //console.log('frameName: ' + x + ',' + z + '=' + mapsprites[z*10+x] + '=>' + sprites[mapsprites[z*10+x]])
        block.z = scrLoc.z;
        block.frameName = spr;
        block.anchor.setTo(0.5, 0.5);
}
      }
      //alert(e.data);
    },

    create: function() {

        theGame = this.game;
        //  Modify the world and camera bounds
        //this.world.setBounds(-40000, -40000, 40000, 40000);
        // this.world.resize(2000, 2000);
        this.lookAt = { x: 1000, y: 0, z: 1000 };

        minWorld = mapToScreenCoords({ x: this.lookAt.x - 1000, y:0, z: this.lookAt.z });
        maxWorld = mapToScreenCoords({ x: this.lookAt.x + 1000, y:0, z: this.lookAt.z });
        this.game.world.setBounds(minWorld.x, minWorld.y, maxWorld.x-minWorld.x, maxWorld.y-minWorld.y);
        furtherestBlock = screenToMapCoords({x:minWorld.x, y:minWorld.y}, 0);
        closestBlock = screenToMapCoords({x:maxWorld.x, y:maxWorld.y}, 128);
        boundBlocks = {
		x: closestBlock.x - furtherestBlock.x,
		y: closestBlock.y - furtherestBlock.y,
		z: closestBlock.z - furtherestBlock.z};

        var cam = mapToScreenCoords(this.lookAt);
        this.game.camera.x = cam.x;
        this.game.camera.y = cam.y;
        this.currentChunk = mapToChunkCoords(this.lookAt);

        this.stage.backgroundColor = '#404040';

        cursors = this.input.keyboard.createCursorKeys();
        fireButton = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        
        this.mapDataWorker = new Worker("dataworker.js");

        // receive messages from web worker
        this.mapDataWorker.onmessage = this.processMapData;
        this.mapDataWorker.onerror = function(e) {
  	  alert("Error in file: "+e.filename+"nline: "+e.lineno+"nDescription: "+e.message);
        };
        // send message to web worker
        this.mapDataWorker.postMessage(['connect']);

        //this.mapDataWorker.postMessage(['at',this.currentChunk.x,this.currentChunk.z]);
        //setTimeout(function() {
        //  this.mapDataWorker.postMessage(['at',100,100]);
        //}, 10000);
    },

    update: function () {
        //  Scroll the background
        //starfield.tilePosition.y += 2;

        var moved = false;
        if (cursors.up.isDown)
        {
            this.lookAt.z -= 1;
            moved = true;
        }
        else if (cursors.down.isDown)
        {
            this.lookAt.z += 1;
            moved = true;
        }

        if (cursors.left.isDown)
        {
            this.lookAt.x -= 1;
            moved = true;
        }
        else if (cursors.right.isDown)
        {
            this.lookAt.x += 1;
            moved = true;
        }

        if (moved)
        {
          var cam = mapToScreenCoords(this.lookAt);
          this.game.camera.x = cam.x; // TODO - combine with above?
          this.game.camera.y = cam.y;
          //console.log('move camera to: ' + cam.x + ',' + cam.y);
          chunk = mapToChunkCoords(this.lookAt);
          if (chunk.x != this.currentChunk.x || chunk.z != this.currentChunk.z)
          {
              this.currentChunk = chunk;
              this.mapDataWorker.postMessage(['at',this.currentChunk.x,this.currentChunk.z]);
          }
        }
    },

    render: function () {
        this.game.debug.cameraInfo(this.game.camera, 32, 32);
        
        // for (var i = 0; i < aliens.length; i++)
        // {
        //     this.debug.body(aliens.children[i]);
        // }
    },
    

};
