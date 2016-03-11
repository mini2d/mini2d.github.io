var mini2d;
(function (mini2d) {
    /**
     * The engine author, visit my website for more info http://petyrek.github.io/
     */
    mini2d.author = "Martin Petyrek";
    /**
     * The engine version
     */
    mini2d.version = "0.1";
})(mini2d || (mini2d = {}));
/// <reference path="../mini2d.ts" />
var mini2d;
(function (mini2d) {
    var AudioManager = (function () {
        /**
         * The constructor for the AudioManager class
         * @param game A reference to the game instance
         */
        function AudioManager(game) {
            this.game = game;
            // https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Using_Web_Audio_API
            // Note: Safari can break if you don't explcitly mention the window object when creating a new context!
            // tested to be true on iOS 9.2.1 iPhone6S 
            // Failed to construct 'AudioContext': number of hardware contexts reached maximum
            if (!window.audioContext) {
                this.context = window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            else {
                this.context = window.audioContext;
            }
        }
        /**
         * Creates a new sound
         * @param path Path to the sound file
         */
        AudioManager.prototype.addSound = function (path) {
            return new mini2d.Sound(this.game, path);
        };
        return AudioManager;
    }());
    mini2d.AudioManager = AudioManager;
})(mini2d || (mini2d = {}));
/// <reference path="../mini2d.ts" />
var mini2d;
(function (mini2d) {
    var Sound = (function () {
        /**
         * The constructor for the Sound class
         * @param game a reference to the game object
         * @param string a path to the sound file
         */
        function Sound(game, path) {
            this.game = game;
            this.source = game.audioMgr.context.createBufferSource();
            this.source.buffer = game.resourceMgr.getSound(path);
            this.source.connect(game.audioMgr.context.destination);
        }
        /**
         * Plays the sound
         */
        Sound.prototype.play = function () {
            this.source.start(0);
        };
        return Sound;
    }());
    mini2d.Sound = Sound;
})(mini2d || (mini2d = {}));
/// <reference path="../mini2d.ts" />
var mini2d;
(function (mini2d) {
    var Camera = (function () {
        /**
         * Constructor for the camera class
         */
        function Camera() {
            this.position = new mini2d.Point();
        }
        /**
         * Moves the camera by specified amount
         * @param x Specifies the x-axis move distance
         * @param y Specifies the y-axis move distance
         */
        Camera.prototype.move = function (x, y) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            this.position.x += x;
            this.position.y += y;
        };
        return Camera;
    }());
    mini2d.Camera = Camera;
})(mini2d || (mini2d = {}));
/// <reference path="../mini2d.ts" />
var mini2d;
(function (mini2d) {
    var Debug = (function () {
        /**
         * Constructor for the game debug class
         * @param game A reference to the game instance
         */
        function Debug(game) {
            /**
             * An array of functions that are evaluated every frame and the returned string is rendered
             */
            this.data = [];
            this.game = game;
        }
        /**
         * Adds a function to an array which is then rendered on the screen
         * @param fn function which evaluates to a string which is then displayed for the debugging purposes
         */
        Debug.prototype.add = function (fn) {
            this.data.push(fn);
        };
        /**
         * Renders all the debug data on the screen
         */
        Debug.prototype.render = function () {
            this.game.ctx.font = "12px sans-serif";
            this.game.ctx.fillStyle = "#000";
            this.game.ctx.textBaseline = "top";
            for (var i = 0, j = this.data.length; i < j; i++) {
                this.game.ctx.fillText(this.data[i](), 0, 15 * i);
            }
        };
        return Debug;
    }());
    mini2d.Debug = Debug;
})(mini2d || (mini2d = {}));
/// <reference path="../mini2d.ts" />
var mini2d;
(function (mini2d) {
    var Game = (function () {
        /**
         * Constructor for the game object which handles pretty much everything
         * @param width The width of the game scene and the default width of canvas, which is sized down for smaller screens
         * @param height The height of the game scene and the default height of canvas, which is sized down for smaller screens
         */
        function Game(width, height) {
            /**
             * Input class containing all input information and handling the game input
             */
            this.input = new mini2d.Input(this);
            /**
             * Resource manager which handles loading of all the game assets
             */
            this.resourceMgr = new mini2d.ResourceManager(this);
            /**
             * Audio manager which handles all the audio operations
             */
            this.audioMgr = new mini2d.AudioManager(this);
            /**
             * State manager which handles the transition of game states
            */
            this.stateMgr = new mini2d.StateManager(this);
            this.width = width;
            this.height = height;
            this.ctx = this.setupCanvas();
            this.run();
        }
        /**
         * Loads the assets and upon finishing starts the state given an second argument
         * @param assets Arrray of paths to assets
         * @param state GameState to be started after asset loading is complete
         */
        Game.prototype.load = function (assets, state) {
            this.resourceMgr.load(assets, function () {
                state.start();
            });
        };
        /**
         * Creates a game state instance
         * @param stateObj javascript object with functions init and update
         */
        Game.prototype.addState = function (stateObj) {
            return this.stateMgr.add(stateObj);
        };
        /**
         * Adds a sound to the game, please note that it has to be previously loaded with game.load function
         * @param path Path to the sound file
         */
        Game.prototype.addSound = function (path) {
            return this.audioMgr.addSound(path);
        };
        /**
         * The main game loop is executed here
         */
        Game.prototype.run = function () {
            window.requestAnimationFrame(this.run.bind(this));
            this.stateMgr.run();
        };
        /**
         * Centers the canvas to the middle of the screen, useful for embedding the game on web pages
         */
        Game.prototype.centerCanvas = function () {
            var canvas = this.ctx.canvas;
            canvas.style.position = 'absolute';
            canvas.style.left = window.innerWidth / 2 - canvas.width / 2 + 'px';
            canvas.style.top = window.innerHeight / 2 - canvas.height / 2 + 'px';
        };
        /**
         * Creates and sets up the canvas element, stretches it on mobile devices
         */
        Game.prototype.setupCanvas = function () {
            var canvas = document.createElement('canvas');
            canvas.width = this.width;
            canvas.height = this.height;
            // stretch the canvas on mobile and tablets
            if (mobileTabletCheck()) {
                canvas.style.width = window.innerWidth + 'px';
                canvas.style.height = window.innerHeight + 'px';
            }
            // append canvas to the document         
            document.body.appendChild(canvas);
            // TODO strech / contain
            // rendering context
            return canvas.getContext('2d');
        };
        return Game;
    }());
    mini2d.Game = Game;
})(mini2d || (mini2d = {}));
/// <reference path="../mini2d.ts" />
var mini2d;
(function (mini2d) {
    var Input = (function () {
        /**
         * Constructor for the input class
         * @param game A reference to the game instance
         */
        function Input(game) {
            /**
             * Signalizes whether cursor is down, can be both mouse or touch event
             */
            this.mouseDown = false;
            /**
             * The X coordinate of current or last input
             */
            this.x = null;
            /**
             * The Y coordinate of current or last input
             */
            this.y = null;
            /**
             * A flag signalizing whether iOS audio has been unlocked with an ontouchend event
             */
            this.iosAudioUnlocked = false;
            this.game = game;
            this.initCursorEvents();
        }
        /**
         * A method to determine whether input's current or last position overlaps with a measurable object
         * @param measurable any measurable object
         */
        Input.prototype.contains = function (measurable) {
            return ((this.x > measurable.position.x && this.x < measurable.position.x + measurable.width) && (this.y > measurable.position.y && this.y < measurable.position.y + measurable.height));
        };
        /**
         * Initiates the touch and mouse input events
         */
        Input.prototype.initCursorEvents = function () {
            var _this = this;
            // handle touch event
            document.ontouchstart = function (e) {
                _this.mouseDown = true;
                _this.updateCoordinates(e.touches[0].pageX, e.touches[0].pageY);
                _this.handleCursorDown();
            };
            document.ontouchmove = function (e) {
                _this.updateCoordinates(e.touches[0].pageX, e.touches[0].pageY);
            };
            document.ontouchend = function (e) {
                _this.mouseDown = false;
                _this.handleCursorUp();
                if (_this.iosAudioUnlocked) {
                    _this.unlockIosAudio();
                }
            };
            // handle click event;
            document.onmousedown = function (e) {
                _this.mouseDown = true;
                _this.updateCoordinates(e.pageX, e.pageY);
                _this.handleCursorDown();
            };
            document.onmousemove = function (e) {
                _this.updateCoordinates(e.pageX, e.pageY);
            };
            document.onmouseup = function (e) {
                _this.mouseDown = false;
                _this.handleCursorUp();
            };
        };
        /**
         * A handler function for when cursor is touched / clicked
         */
        Input.prototype.handleCursorDown = function () {
            for (var i = 0, j = this.game.stateMgr.currentState.ui.buttons.length; i < j; i++) {
                if (this.contains(this.game.stateMgr.currentState.ui.buttons[i])) {
                    this.game.stateMgr.currentState.ui.buttons[i].active = true;
                    return;
                }
            }
        };
        /**
         * A handler function for when cursor is released
         */
        Input.prototype.handleCursorUp = function () {
            for (var i = 0, j = this.game.stateMgr.currentState.ui.buttons.length; i < j; i++) {
                this.game.stateMgr.currentState.ui.buttons[i].active = false;
                if (this.contains(this.game.stateMgr.currentState.ui.buttons[i])) {
                    this.game.stateMgr.currentState.ui.buttons[i].onclick();
                }
            }
        };
        /**
         * Updates the coordinates of this class, and recalculates based on canvas position, scaling, to hold accurate information
         * @param x Raw X coordinate which is then recalculated
         * @param y Ray Y coordinate which is then recalculated
         */
        Input.prototype.updateCoordinates = function (x, y) {
            var scaleX = 1;
            var scaleY = 1;
            var canvas = this.game.ctx.canvas;
            if (window.innerWidth < canvas.width) {
                scaleX = canvas.width / window.innerWidth;
            }
            if (canvas.width < canvas.clientWidth) {
                scaleX = canvas.width / canvas.clientWidth;
            }
            if (window.innerHeight < canvas.height) {
                scaleY = canvas.height / window.innerHeight;
            }
            if (canvas.height < canvas.clientHeight) {
                scaleY = canvas.height / canvas.clientHeight;
            }
            var rect = this.game.ctx.canvas.getBoundingClientRect();
            this.x = (x - rect.left) * scaleX;
            this.y = (y - rect.top) * scaleY;
        };
        /**
         * Plays an empty sound, used when first touchendevent happens, because iOS safari doesn't allow to play sounds otherwise
         */
        Input.prototype.unlockIosAudio = function () {
            var buffer = this.game.audioMgr.context.createBuffer(1, 1, 22050);
            var source = this.game.audioMgr.context.createBufferSource();
            source.buffer = buffer;
            source.connect(this.game.audioMgr.context.destination);
            source.start(0);
            this.iosAudioUnlocked = true;
        };
        return Input;
    }());
    mini2d.Input = Input;
})(mini2d || (mini2d = {}));
/// <reference path="../mini2d.ts" />
var mini2d;
(function (mini2d) {
    var ResourceManager = (function () {
        /**
         * The constructor for the ResourceManagers class
         * @param game A reference to the game instance
         */
        function ResourceManager(game) {
            /**
             * Array of Image elements stored with path as the key
             */
            this.images = {};
            /**
             * Array of Sound buffers stored with path as the key
             */
            this.sounds = {};
            this.game = game;
        }
        /**
         * Returns the Image Elemenent with the path specified
         * @param path A path to the image file
         */
        ResourceManager.prototype.getImage = function (path) {
            return this.images[path];
        };
        /**
         * Returns the Sound buffer with the path specified
         * @param path A path to the sound file
         */
        ResourceManager.prototype.getSound = function (path) {
            return this.sounds[path];
        };
        /**
         * Loads the files and upon finishing call the calback
         * @param assets An array of paths to files to be loaded
         * @param callback A function to be executed when the loading of assets is finished
         */
        ResourceManager.prototype.load = function (assets, callback) {
            this.loadAsset(assets, callback, 0);
        };
        /**
         * Loads a single asset with the index specified and upon finishing automatically starts to load the next one, when everything is loaded, callback is called
         * @param assets An array of paths to the files
         * @param callback A function to be executed when the loading of assets is finished
         * @param index index of the file to be loaded
         */
        ResourceManager.prototype.loadAsset = function (assets, callback, index) {
            var _this = this;
            // we have loaded all the files
            if (index == assets.length) {
                callback();
                return;
            }
            var path = assets[index];
            var filetype = this.getFileType(path);
            console.log("loading: ", path);
            if (filetype === "audio") {
                var request = new XMLHttpRequest();
                request.open('GET', path, true);
                request.responseType = 'arraybuffer';
                request.onload = function () {
                    _this.game.audioMgr.context.decodeAudioData(request.response, function (buffer) {
                        _this.sounds[path] = buffer;
                        _this.loadAsset(assets, callback, index + 1);
                    });
                };
                request.send();
            }
            else if (filetype === "image") {
                var element = document.createElement('img');
                element.addEventListener('load', function () {
                    _this.loadAsset(assets, callback, index + 1);
                });
                element.setAttribute('src', path);
                this.images[path] = element;
            }
        };
        /**
         * Determines the file type based on the file extension
         * @param path Path to the file
         */
        ResourceManager.prototype.getFileType = function (path) {
            var extension = path.substring(path.lastIndexOf(".") + 1, path.length);
            if (["mp3", "ogg", "wav"].indexOf(extension) !== -1) {
                return "audio";
            }
            else
                return "image";
        };
        return ResourceManager;
    }());
    mini2d.ResourceManager = ResourceManager;
})(mini2d || (mini2d = {}));
/// <reference path="../mini2d.ts" />
var mini2d;
(function (mini2d) {
    var State = (function () {
        /**
         * The constructor for the State class
         * @param game A reference to the game instance
         * @param stateObj An object specifying the user init and update functions
         */
        function State(game, stateObj) {
            this.game = game;
            this.userInit = stateObj.init;
            this.userUpdate = stateObj.update;
            this.camera = new mini2d.Camera();
            this.world = new mini2d.World(game);
            this.ui = new mini2d.UI(game);
            this.debug = new mini2d.Debug(game);
        }
        /**
         * Starts the game state
         */
        State.prototype.start = function () {
            this.game.stateMgr.currentState = this;
            if (this.userInit) {
                this.userInit();
            }
        };
        /**
         * Update of the game state which is run every frame and after internal update calls the user defined update if specified
         */
        State.prototype.update = function () {
            this.world.update();
            if (this.userUpdate) {
                this.userUpdate();
            }
        };
        /**
         * Renders everything on the screen, sprites, buttons, texts, debug information etc.
         */
        State.prototype.render = function () {
            this.game.ctx.clearRect(0, 0, this.game.width, this.game.height);
            this.world.render();
            this.ui.render();
            this.debug.render();
        };
        /**
         * Adds a sprite to the world
         */
        State.prototype.addSprite = function (x, y, path) {
            return this.world.addSprite(x, y, path);
        };
        /**
         * Adds a button to the user interface
         */
        State.prototype.addButton = function (x, y, onclick, texturePath, activeTexturePath) {
            return this.ui.addButton(x, y, onclick, texturePath, activeTexturePath);
        };
        /**
         * Adds a text to the user interface
         */
        State.prototype.addText = function (text, x, y, font, fillStyle) {
            if (font === void 0) { font = "20px sans-serif"; }
            if (fillStyle === void 0) { fillStyle = "#000"; }
            return this.ui.addText(text, x, y, font, fillStyle);
        };
        /**
         * Nullyfies the references and prepares the objects to be garbage collected
         */
        State.prototype.destroy = function () {
        };
        return State;
    }());
    mini2d.State = State;
})(mini2d || (mini2d = {}));
/// <reference path="../mini2d.ts" />
var mini2d;
(function (mini2d) {
    var StateManager = (function () {
        /**
         * A constructor for the StateManager class
         * @param game A reference to the game instance
         */
        function StateManager(game) {
            this.game = game;
        }
        /**
         * Adds a new game State
         * @param stateObj An object which specifies the user init and update states for this state
         */
        StateManager.prototype.add = function (stateObj) {
            return new mini2d.State(this.game, stateObj);
        };
        /**
         * Runs the update and render on the current game state
         */
        StateManager.prototype.run = function () {
            if (!this.currentState) {
                return;
            }
            this.currentState.update();
            this.currentState.render();
        };
        return StateManager;
    }());
    mini2d.StateManager = StateManager;
})(mini2d || (mini2d = {}));
/// <reference path="../mini2d.ts" />
var mini2d;
(function (mini2d) {
    var UI = (function () {
        /**
         * The constructor for the UI class
         */
        function UI(game) {
            /**
             * An array of button elements
             */
            this.buttons = [];
            /**
             * An array of text elements
             */
            this.texts = [];
            this.game = game;
        }
        /**
         * Renders all the UI elements on the canvas
         */
        UI.prototype.render = function () {
            for (var i = 0, j = this.buttons.length; i < j; i++) {
                this.buttons[i].draw();
            }
            for (var i = 0, j = this.texts.length; i < j; i++) {
                this.texts[i].draw();
            }
        };
        /**
         * Adds a button to the UI
         * @param x The position on the X axis
         * @param y The position on the Y axis
         * @param onclick The callback function to be called upon clicking the button
         * @param texturePath The path to the button texture when in normal state
         * @param activeTexturePath The path to the button texture when in active state (is being pushed down)
         */
        UI.prototype.addButton = function (x, y, onclick, texturePath, activeTexturePath) {
            var texture = this.game.resourceMgr.getImage(texturePath);
            var activeTexture = this.game.resourceMgr.getImage(activeTexturePath);
            var button = new mini2d.Button(this.game, x, y, onclick, texture, activeTexture);
            this.buttons.push(button);
            return button;
        };
        /**
         * Adds a text to the UI
         * @param text The text to be displayed
         * @param x The position on the X axis
         * @param y The position on the Y axis
         * @param font A string specifying the font style e.g.: '20px sans-serif'
         * @param fillStyle A string specifying the color of the text e.g.: '#000'
         */
        UI.prototype.addText = function (text, x, y, font, fillStyle) {
            if (font === void 0) { font = "20px sans-serif"; }
            if (fillStyle === void 0) { fillStyle = "#000"; }
            var textEl = new mini2d.Text(this.game, x, y, text, font, fillStyle);
            this.texts.push(textEl);
            return textEl;
        };
        return UI;
    }());
    mini2d.UI = UI;
})(mini2d || (mini2d = {}));
/// <reference path="../mini2d.ts" />
var mini2d;
(function (mini2d) {
    var World = (function () {
        /**
         * The constructor for the World class
         * @param game A reference to the game object
         */
        function World(game) {
            /**
             * The gravity constant which determines how objects are pulled to the ground
             */
            this.gravity = 0;
            /**
             * An array of game Sprites to be rendered
             */
            this.sprites = [];
            this.game = game;
        }
        /**
         * Updates all the word objects and handles collisions
         */
        World.prototype.update = function () {
            for (var i = 0, j = this.sprites.length; i < j; i++) {
                this.sprites[i].update();
            }
            this.handleCollisions();
        };
        /**
         * Renders all the world objects on the canvas
         */
        World.prototype.render = function () {
            for (var i = 0, j = this.sprites.length; i < j; i++) {
                this.sprites[i].draw();
            }
        };
        /**
         * Adds a sprite to the world
         * @param x The X coordinate in the world
         * @param y The Y coordinate in the world
         */
        World.prototype.addSprite = function (x, y, path) {
            var texture = this.game.resourceMgr.getImage(path);
            var sprite = new mini2d.Sprite(this.game, x, y, texture);
            this.sprites.push(sprite);
            return sprite;
        };
        /**
         * Handles the collisions of world objects with body enabled
         */
        World.prototype.handleCollisions = function () {
            for (var i = 0, j = this.sprites.length; i < j; i++) {
                for (var x = 0, y = this.sprites.length; x < y; x++) {
                    if (i == x || !this.sprites[i].body) {
                        continue;
                    }
                    this.sprites[i].body.handleCollision(this.sprites[x].body);
                }
            }
        };
        return World;
    }());
    mini2d.World = World;
})(mini2d || (mini2d = {}));
/// <reference path="../mini2d.ts" />
var mini2d;
(function (mini2d) {
    var Point = (function () {
        /**
         * The constructor for the Point class
         * @param x The value for the X coordinate
         * @param y The value for the Y coordinate
         */
        function Point(x, y) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            this.x = x;
            this.y = y;
        }
        return Point;
    }());
    mini2d.Point = Point;
})(mini2d || (mini2d = {}));
/// <reference path="../mini2d.ts" />
var mini2d;
(function (mini2d) {
    var Sprite = (function () {
        /**
         * The constructor for the Sprite class
         * @param game A reference to the game instance
         * @param x The position on the X axis
         * @param y The position on the Y axis
         * @param texture The texture of the sprite
         */
        function Sprite(game, x, y, texture) {
            /**
             * The body of the sprite for physics, null by default
             */
            this.body = null;
            this.game = game;
            this.position = new mini2d.Point(x, y);
            this.width = texture.width;
            this.height = texture.height;
            this.texture = texture;
        }
        /**
         * Draws the sprite on the screen
         */
        Sprite.prototype.draw = function () {
            this.game.ctx.drawImage(this.texture, this.position.x - this.game.stateMgr.currentState.camera.position.x, this.position.y - this.game.stateMgr.currentState.camera.position.y);
        };
        /**
         * Updates the sprite
         */
        Sprite.prototype.update = function () {
            if (this.body) {
                this.body.update();
                this.position.x = this.body.position.x;
                this.position.y = this.body.position.y;
            }
        };
        /**
         * Enables the body on the sprite so it is affected by physics
         */
        Sprite.prototype.enableBody = function () {
            this.body = new mini2d.Body(this);
        };
        /**
         * Nullyfies the references and prepares the objects to be garbage collected
         */
        Sprite.prototype.destroy = function () {
            this.position = null;
            this.width = null;
            this.height = null;
            this.texture = null;
            this.body = null;
            this.game = null;
        };
        return Sprite;
    }());
    mini2d.Sprite = Sprite;
})(mini2d || (mini2d = {}));
/**
 * A function that determines whether this is a mobile/tablet device or not, tests the userAgent string, source http://stackoverflow.com/questions/3514784/what-is-the-best-way-to-detect-a-mobile-device-in-jquery
 */
var mobileTabletCheck = function () {
    return (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4)));
};
/// <reference path="../mini2d.ts" />
/// <reference path="../mini2d.ts" />
/// <reference path="../mini2d.ts" />
/// <reference path="../mini2d.ts" />
/// <reference path="../mini2d.ts" />
var mini2d;
(function (mini2d) {
    var Body = (function () {
        /**
         * The constructor for the Body class
         */
        function Body(sprite) {
            /**
             * The velocity of the object
             */
            this.velocity = new mini2d.Point();
            /**
             * The bounce quocient [0-1]
             */
            this.bounce = 0;
            /**
             * If true, it isn't affected by collision with other objects
             */
            this.immovable = false;
            this.game = sprite.game;
            this.position = new mini2d.Point(sprite.position.x, sprite.position.y);
            this.previousPosition = new mini2d.Point(sprite.position.x, sprite.position.y);
            this.width = sprite.width;
            this.height = sprite.height;
            this.checkWorldCollision = {
                top: false,
                bottom: false,
                left: false,
                right: false
            };
            this.checkCollision = {
                top: true,
                bottom: true,
                left: true,
                right: true
            };
        }
        /**
         * Updates the body
         */
        Body.prototype.update = function () {
            this.handleWorldCollision();
            this.previousPosition.x = this.position.x;
            this.previousPosition.y = this.position.y;
            this.velocity.y += this.game.stateMgr.currentState.world.gravity / 60;
            this.position.x += this.velocity.x / 60;
            this.position.y += this.velocity.y / 60;
        };
        /**
         * Function to enable collision with world bounds
         * @param callback a function with the direction parameter which specifies which world bound was collided: Top, Bottom, Left, Right
         */
        Body.prototype.collideWorldBounds = function (callback) {
            this.checkWorldCollision = {
                top: true,
                bottom: true,
                left: true,
                right: true
            };
            this.worldCollisionCallback = callback;
        };
        /**
         * Handle the collision with another body
         * @param Another body to be check for collision with
         */
        Body.prototype.handleCollision = function (body) {
            // collision on horizontal axis
            if (this.position.x + this.width >= body.position.x && this.position.x <= body.position.x + body.width) {
                // collision on vertical axis
                if (this.position.y + this.height >= body.position.y && this.position.y <= body.position.y + body.height) {
                    this.resoluteCollision(body);
                }
            }
        };
        /**
         * Nullyfies the references and prepares the objects to be garbage collected
         */
        Body.prototype.destroy = function () {
            this.position = null;
            this.previousPosition = null;
            this.width = null;
            this.height = null;
            this.velocity = null;
            this.bounce = null;
            this.immovable = null;
            this.worldCollisionCallback = null;
            this.checkWorldCollision = null;
            this.checkCollision = null;
            this.game = null;
        };
        /**
         * Changes the velocities, positions etc. based on the collision with another body
         * @param body the other body that has been detected to be colliding with this one
         */
        Body.prototype.resoluteCollision = function (body) {
            var offsetX = 0;
            var offsetY = 0;
            // left collision
            if (this.checkCollision.right && body.checkCollision.left && this.previousPosition.x + this.width < body.previousPosition.x && this.position.x + this.width >= body.position.x) {
                offsetX = this.position.x + this.width - body.position.x;
                this.velocity.x *= -this.bounce;
                body.velocity.x *= -body.bounce;
            }
            else if (this.checkCollision.left && body.checkCollision.right && this.previousPosition.x >= body.previousPosition.x + body.width && this.position.x < body.position.x + body.width) {
                offsetX = this.position.x - body.position.x - body.width;
                this.velocity.x *= -this.bounce;
                body.velocity.x *= -body.bounce;
            }
            else if (this.checkCollision.bottom && body.checkCollision.top && this.previousPosition.y + this.height < body.previousPosition.y && this.position.y + this.height >= body.position.y) {
                offsetY = this.position.y + this.height - body.position.y;
                this.velocity.y *= -this.bounce;
                body.velocity.y *= -body.bounce;
            }
            else if (this.checkCollision.top && body.checkCollision.bottom && this.previousPosition.y >= body.previousPosition.y + body.height && this.position.y < body.position.y + body.height) {
                offsetY = this.position.y - body.position.y - body.height;
                this.velocity.y *= -this.bounce;
                body.velocity.y *= -body.bounce;
            }
            // seperate the two colliding objects so that they no longer collide
            if (this.immovable && !body.immovable) {
                body.position.x += offsetX;
                body.position.y += offsetY;
            }
            if (body.immovable && !this.immovable) {
                this.position.x -= offsetX;
                this.position.y -= offsetY;
            }
            if (!this.immovable && !body.immovable) {
                this.position.x -= offsetX / 2;
                body.position.x += offsetX / 2;
                this.position.y -= offsetY / 2;
                body.position.y += offsetY / 2;
            }
        };
        /**
         * Handles the physics for collision with the world bounds
         */
        Body.prototype.handleWorldCollision = function () {
            var direction = null;
            // collision with left world boundary
            if (this.position.x < this.game.stateMgr.currentState.camera.position.x) {
                this.position.x = this.game.stateMgr.currentState.camera.position.x;
                this.velocity.x = (this.velocity.x * -1) * this.bounce;
                direction = 'left';
            }
            // collision with right world boundary
            if (this.position.x + this.width > this.game.width + this.game.stateMgr.currentState.camera.position.x) {
                this.position.x = this.game.width - this.width + this.game.stateMgr.currentState.camera.position.x;
                this.velocity.x = (this.velocity.x * -1) * this.bounce;
                direction = 'right';
            }
            // collision with top world boundary
            if (this.position.y < this.game.stateMgr.currentState.camera.position.y) {
                this.position.y = this.game.stateMgr.currentState.camera.position.y;
                this.velocity.y = (this.velocity.y * -1) * this.bounce;
                direction = 'top';
            }
            // collision with bottom world boundary
            if (this.position.y + this.height > this.game.height + this.game.stateMgr.currentState.camera.position.y) {
                this.position.y = this.game.height - this.height + this.game.stateMgr.currentState.camera.position.y;
                this.velocity.y = (this.velocity.y * -1) * this.bounce;
                direction = 'bottom';
            }
            if (direction && this.worldCollisionCallback) {
                this.worldCollisionCallback(direction);
            }
        };
        return Body;
    }());
    mini2d.Body = Body;
})(mini2d || (mini2d = {}));
/// <reference path="../mini2d.ts" />
/// <reference path="../mini2d.ts" />
var mini2d;
(function (mini2d) {
    var Button = (function () {
        /**
         * The constructor for the Button class
         * @param game A reference to the game instance
         * @param x The position on the X axis
         * @param y The position on the Y axis
         * @param onclick The callback to be called upon clicking the button
         * @param texture The texture to be displayed when in normal state
         * @param activeTexture The texture to be displayed when in active state (pressed down)
         */
        function Button(game, x, y, onclick, texture, activeTexture) {
            /**
             * Signalizes whether button is active (pressed down) or not
             */
            this.active = false;
            this.game = game;
            this.position = new mini2d.Point(x, y);
            this.width = texture.width;
            this.height = texture.height;
            this.onclick = onclick;
            this.texture = texture;
            this.activeTexture = activeTexture;
        }
        /**
         * Adds a text element to the button effectively making it a text button
         */
        Button.prototype.addText = function (text, font, fillStyle) {
            this.text = new mini2d.Text(this.game, 0, 0, text, font, fillStyle);
            this.text.game = this.game;
            return this;
        };
        /**
         * Draws the button on the canvas
         */
        Button.prototype.draw = function () {
            var texture = (this.active) ? this.activeTexture : this.texture;
            this.game.ctx.drawImage(texture, this.position.x, this.position.y);
            if (this.text) {
                this.text.position.x = this.position.x + this.width / 2 - this.text.width / 2;
                this.text.position.y = this.position.y + this.height / 2;
                this.text.draw();
            }
        };
        /**
         * Nullyfies the references and prepares the objects to be garbage collected
         */
        Button.prototype.destroy = function () {
            this.text.destroy();
            this.position = null;
            this.width = null;
            this.height = null;
            this.onclick = null;
            this.texture = null;
            this.activeTexture = null;
            this.active = null;
            this.text = null;
            this.game = null;
        };
        return Button;
    }());
    mini2d.Button = Button;
})(mini2d || (mini2d = {}));
/// <reference path="../mini2d.ts" />
var mini2d;
(function (mini2d) {
    var Text = (function () {
        /**
         * The constructor for the Text class
         * @param game A reference to the game instance
         * @param x The position on the X axis
         * @param y The position on the Y axis
         * @param text The string to be displayed
         * @param font The font style string e.g.: "20px sans-serif"
         * @param fillStyle The color of the font string in hex format e.g.: '#000'
         */
        function Text(game, x, y, text, font, fillStyle) {
            /**
             * The text baseline e.g.: alphabetic, top hanging, middle, ideographic, bottom
             */
            this.baseline = "middle";
            this.game = game;
            this.position = new mini2d.Point(x, y);
            this.text = text;
            this.font = font;
            this.fillStyle = fillStyle;
            // set canvas so the text can be measured
            this.game.ctx.font = this.font;
            this.game.ctx.fillStyle = this.fillStyle;
            this.width = this.game.ctx.measureText(text).width;
            this.height = 0;
        }
        /**
         * Draws the text on the canvas
         */
        Text.prototype.draw = function () {
            this.game.ctx.font = this.font;
            this.game.ctx.fillStyle = this.fillStyle;
            this.game.ctx.textBaseline = this.baseline;
            this.game.ctx.fillText(this.text, this.position.x, this.position.y);
        };
        /**
         * Nullyfies the references and prepares the objects to be garbage collected
         */
        Text.prototype.destroy = function () {
            this.position = null;
            this.width = null;
            this.height = null;
            this.text = null;
            this.font = null;
            this.fillStyle = null;
            this.baseline = null;
            this.game = null;
        };
        return Text;
    }());
    mini2d.Text = Text;
})(mini2d || (mini2d = {}));
