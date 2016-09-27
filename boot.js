// Boot will take care of initializing a few settings,

// declare the object that will hold all game states
var GameStates = {
    //quite common to add game variables/constants in here
    
    clientId: 0,
    webServerId: 1000,
    socket: 0,

    text: "",
    button: null,
    x: 32,
    y: 80,
    cursors: null,
    fireButton: null,
};

GameStates.Boot = function (game) {  //declare the boot state

};

GameStates.Boot.prototype = {
    preload: function () {
        // load assets to be used later in the preloader e.g. for loading screen / splashscreen
        this.load.image('preloaderBar', 'assets/preloader-bar.png');
    },
    create: function () {
        // setup game environment
        // scale, input etc..

        // call next state
        this.state.start('Preloader');
    }
};

