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

    create: function() {

        //  Modify the world and camera bounds
        // this.world.setBounds(-2000, -2000, 4000, 4000);
        this.world.resize(2000, 2000);
        
        this.stage.backgroundColor = '#404040';

        cursors = this.input.keyboard.createCursorKeys();
        fireButton = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        
        var mapDataWorker = new Worker("dataworker.js");

        // receive messages from web worker
        mapDataWorker.onmessage = function(e) {
	  alert(e.data);
        };
        mapDataWorker.onerror = function(e) {
  	  alert("Error in file: "+e.filename+"nline: "+e.lineno+"nDescription: "+e.message);
        };
        // send message to web worker
        mapDataWorker.postMessage("connect");
    },

    update: function () {
        //  Scroll the background
        //starfield.tilePosition.y += 2;

        if (cursors.up.isDown)
        {
            this.camera.y -= 4;
        }
        else if (cursors.down.isDown)
        {
            this.camera.y += 4;
        }

        if (cursors.left.isDown)
        {
            this.camera.x -= 4;
        }
        else if (cursors.right.isDown)
        {
            this.camera.x += 4;
        }

        //  Run collision
        //    this.physics.arcade.overlap(bullets, aliens, collisionHandler, null, this);
        //    this.physics.arcade.overlap(enemyBullets, player, enemyHitsPlayer, null, this);
    },

    render: function () {
        this.debug.cameraInfo(this.camera, 32, 32);
        
        // for (var i = 0; i < aliens.length; i++)
        // {
        //     this.debug.body(aliens.children[i]);
        // }
    },
};
