GameStates.Game = function (game) {

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

    processMapData: function(e) {
      if (e.data[0] = '+')
      {
        var x=e.data[1];
        var y=e.data[2];
        var z=e.data[3];
        var spr=e.data[4];
        var block = this.game.add.sprite(400 + (x - z) * 32, 256 + (x + z) * 16 - y * 21, 'iso-outside');
        //console.log('frameName: ' + x + ',' + z + '=' + mapsprites[z*10+x] + '=>' + sprites[mapsprites[z*10+x]])
        block.frameName = spr;
        block.anchor.setTo(0.5, 0.5);
      }
      //alert(e.data);
    },

    create: function() {

        //  Modify the world and camera bounds
        // this.world.setBounds(-2000, -2000, 4000, 4000);
        this.world.resize(2000, 2000);
        
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
            this.camera.y -= 4;
            moved = true;
        }
        else if (cursors.down.isDown)
        {
            this.camera.y += 4;
            moved = true;
        }

        if (cursors.left.isDown)
        {
            this.camera.x -= 4;
            moved = true;
        }
        else if (cursors.right.isDown)
        {
            this.camera.x += 4;
            moved = true;
        }

        if (moved)
        {
          this.mapDataWorker.postMessage(['at',100,100]);
        }

        //  Run collision
        //    this.physics.arcade.overlap(bullets, aliens, collisionHandler, null, this);
        //    this.physics.arcade.overlap(enemyBullets, player, enemyHitsPlayer, null, this);
    },

    render: function () {
        //this.debug.cameraInfo(this.camera, 32, 32);
        
        // for (var i = 0; i < aliens.length; i++)
        // {
        //     this.debug.body(aliens.children[i]);
        // }
    },
    

};
