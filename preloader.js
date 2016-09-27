// Preloader will load all of the assets like graphics and audio
GameStates.Preloader = function (game) {
    this.preloadBar = null;
}

GameStates.Preloader.prototype = {
    preload: function () {
        try {
            console.log('Loading textures');
            // common to add a loading bar sprite here...
            this.preloadBar = this.add.sprite(this.game.width / 2 - 100, this.game.height / 2, 'preloaderBar');
            this.load.setPreloadSprite(this.preloadBar);
            // load all game assets
            // images, spritesheets, atlases, audio etc..
            this.load.image('logo', 'assets/phaser2.png');

            //  We load a TexturePacker JSON file and image and show you how to make several unique sprites from the same file
            this.load.atlas('iso-outside', 'resources/iso-64x64-outside.png', 'resources/iso-64x64-outside.json');
            this.load.spritesheet('button', 'resources/button_sprite_sheet.png', 193, 71);
            //game.load.image('block', 'resources/block.png');
        } catch (exception) {
            console.log('Error:' + exception);
        }
    },

    create: function () {
        //call next state
        this.state.start('MainMenu');
    }
};