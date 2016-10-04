GameStates.Game = function (game) {

};

var theGame;
var isoProjector;
var furtherestBlock = {};
var closestBlock = {};
var isoGroup;
var blockHeight = 21;
var blockWidth = 32;

function coordMultBlockSize(x,y,z) {
  return { x:(x * this.blockWidth), y:(y * this.blockHeight), z:(z * this.blockWidth) };
}
function blockCoordToIsoCoord(coord)
{
    return new Phaser.Plugin.Isometric.Point3(coord.x*this.blockWidth, coord.z*this.blockWidth, coord.y*this.blockHeight);
}
function mapToScreenCoords(map) {
    var x = ((map.x - map.z) * 32);// + 400;
    var y = 256 + (map.x + map.z) * 16 - (map.y * 21);
    // z calc
    //var x1 = map.x - furtherestBlock.x;
    //var y1 = map.y - furtherestBlock.y;    
    //var z1 = map.z - furtherestBlock.z;
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
        var scrLoc = coordMultBlockSize(x,y,z);
        var block = theGame.add.isoSprite(scrLoc.x, scrLoc.z, scrLoc.y, 'iso-outside', 0, isoGroup);
        block.anchor.set(0.5);
        //block.frameName = spr;
        block.anchor.setTo(0.5, 0.5);
        block.body = null;
}
      }
      //alert(e.data);
    },

    create: function() {
        theGame = this.game;
        isoGroup = this.game.add.group();

        //  Modify the world and camera bounds
        this.isoProjector = new Phaser.Plugin.Isometric.Projector(this.game, null);
        this.cursor = {x:100, y:0, z:100};
        this.lookAt = blockCoordToIsoCoord(this.cursor);
        this.scrLookAt = this.isoProjector.project(this.lookAt);

        boundBottom = this.isoProjector.project(blockCoordToIsoCoord({x:this.cursor.x - 100, y:0, z:this.cursor.z - 100}));
        boundTop = this.isoProjector.project(blockCoordToIsoCoord({x:this.cursor.x + 100, y:0, z:this.cursor.z + 100}));
        boundLeft = this.isoProjector.project(blockCoordToIsoCoord({x:this.cursor.x, y:0, z:this.cursor.z + 100}));
        boundRight = this.isoProjector.project(blockCoordToIsoCoord({x:this.cursor.x + 100, y:0, z:this.cursor.z}));

        this.game.world.setBounds(boundRight.x, boundBottom.y, boundLeft.x - boundRight.x, boundTop.y - boundBottom.y);

        //this.game.physics.startSystem(Phaser.Plugin.Isometric.ISOARCADE); // Physics system
        this.game.iso.anchor.setTo(0.5,0.5);

        this.game.camera.x = this.scrLookAt.x;
        this.game.camera.y = this.scrLookAt.y;
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
            this.cursor.z -= 1;
            moved = true;
        }
        else if (cursors.down.isDown)
        {
            this.cursor.z += 1;
            moved = true;
        }

        if (cursors.left.isDown)
        {
            this.cursor.x -= 1;
            moved = true;
        }
        else if (cursors.right.isDown)
        {
            this.cursor.x += 1;
            moved = true;
        }

        if (moved)
        {
          this.lookAt = blockCoordToIsoCoord(this.cursor);
          this.scrLookAt = this.isoProjector.project(this.lookAt);
          this.game.camera.x = this.scrLookAt.x;
          this.game.camera.y = this.scrLookAt.y;

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
