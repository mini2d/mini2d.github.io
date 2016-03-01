/// <reference path="../mini2d.ts" />
var mini2d;
(function (mini2d) {
    var Audio = (function () {
        function Audio(game) {
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
        Audio.prototype.addSound = function (path) {
            return new mini2d.Sound(this.game, path);
        };
        return Audio;
    }());
    mini2d.Audio = Audio;
})(mini2d || (mini2d = {}));
/// <reference path="../mini2d.ts" />
var mini2d;
(function (mini2d) {
    var Sound = (function () {
        function Sound(game, path) {
            this.game = game;
            this.source = game.audio.context.createBufferSource();
            this.source.buffer = game.resources.getSound(path);
            this.source.connect(game.audio.context.destination);
        }
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
        function Camera() {
            this.position = new mini2d.Point();
        }
        Camera.prototype.move = function (x, y) {
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
        function Debug(game) {
            this.data = [];
            this.game = game;
        }
        Debug.prototype.add = function (fn) {
            this.data.push(fn);
        };
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
        function Game(width, height, selector) {
            this.camera = new mini2d.Camera();
            this.resources = new mini2d.Resources(this);
            this.world = new mini2d.World(this);
            this.ui = new mini2d.UI(this);
            this.input = new mini2d.Input(this);
            this.debug = new mini2d.Debug(this);
            this.audio = new mini2d.Audio(this);
            this.width = width;
            this.height = height;
            this.ctx = this.setupCanvas(selector);
        }
        Game.prototype.load = function (assets) {
            var _this = this;
            this.resources.load(assets, function () {
                // initiate the game loop upon loading
                _this.init();
                _this.run();
            });
        };
        Game.prototype.centerCanvas = function () {
            var canvas = this.ctx.canvas;
            canvas.style.position = 'absolute';
            canvas.style.left = window.innerWidth / 2 - canvas.width / 2 + 'px';
            canvas.style.top = window.innerHeight / 2 - canvas.height / 2 + 'px';
        };
        Game.prototype.run = function () {
            // game loop
            window.requestAnimationFrame(this.run.bind(this));
            // run user defined update if defined
            if (this.update) {
                this.update();
            }
            this.world.update();
            this.render();
        };
        Game.prototype.render = function () {
            this.ctx.clearRect(0, 0, this.width, this.height);
            this.world.render();
            this.ui.render();
            this.debug.render();
        };
        Game.prototype.setupCanvas = function (selector) {
            var canvas = document.createElement('canvas');
            canvas.width = this.width;
            canvas.height = this.height;
            // stretch the canvas on mobile and tablets
            if (mobileTabletCheck()) {
                canvas.style.width = window.innerWidth + 'px';
                canvas.style.height = window.innerHeight + 'px';
            }
            // append canvas to the document
            if (selector) {
                document.querySelector(selector).appendChild(canvas);
            }
            else {
                document.body.appendChild(canvas);
            }
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
        function Input(game) {
            this.mouseDown = false;
            this.x = null;
            this.y = null;
            this.iosAudioUnlocked = false;
            this.game = game;
            this.initCursorEvents();
        }
        Input.prototype.contains = function (measurable) {
            return ((this.x > measurable.position.x && this.x < measurable.position.x + measurable.width) && (this.y > measurable.position.y && this.y < measurable.position.y + measurable.height));
        };
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
        Input.prototype.handleCursorDown = function () {
            for (var i = 0, j = this.game.ui.buttons.length; i < j; i++) {
                if (this.contains(this.game.ui.buttons[i])) {
                    this.game.ui.buttons[i].active = true;
                    return;
                }
            }
        };
        Input.prototype.handleCursorUp = function () {
            for (var i = 0, j = this.game.ui.buttons.length; i < j; i++) {
                this.game.ui.buttons[i].active = false;
                if (this.contains(this.game.ui.buttons[i])) {
                    this.game.ui.buttons[i].onclick();
                }
            }
        };
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
        Input.prototype.unlockIosAudio = function () {
            var buffer = this.game.audio.context.createBuffer(1, 1, 22050);
            var source = this.game.audio.context.createBufferSource();
            source.buffer = buffer;
            source.connect(this.game.audio.context.destination);
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
    var Resources = (function () {
        function Resources(game) {
            this.images = {};
            this.sounds = {};
            this.game = game;
        }
        Resources.prototype.getImage = function (path) {
            return this.images[path];
        };
        Resources.prototype.getSound = function (path) {
            return this.sounds[path];
        };
        Resources.prototype.load = function (assets, callback) {
            this.loadAsset(assets, callback, 0);
        };
        Resources.prototype.loadAsset = function (assets, callback, index) {
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
                    _this.game.audio.context.decodeAudioData(request.response, function (buffer) {
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
        Resources.prototype.getFileType = function (path) {
            var extension = path.substring(path.lastIndexOf(".") + 1, path.length);
            if (["mp3", "ogg", "wav"].indexOf(extension) !== -1) {
                return "audio";
            }
            else
                return "image";
        };
        return Resources;
    }());
    mini2d.Resources = Resources;
})(mini2d || (mini2d = {}));
/// <reference path="../mini2d.ts" />
var mini2d;
(function (mini2d) {
    var UI = (function () {
        function UI(game) {
            this.buttons = [];
            this.texts = [];
            this.game = game;
        }
        UI.prototype.render = function () {
            for (var i = 0, j = this.buttons.length; i < j; i++) {
                this.buttons[i].draw();
            }
            for (var i = 0, j = this.texts.length; i < j; i++) {
                this.texts[i].draw();
            }
        };
        UI.prototype.addButton = function (x, y, onclick, texturePath, activeTexturePath) {
            var texture = this.game.resources.getImage(texturePath);
            var activeTexture = this.game.resources.getImage(activeTexturePath);
            var button = new mini2d.Button(this.game, x, y, onclick, texture, activeTexture);
            this.buttons.push(button);
            return button;
        };
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
        function World(game) {
            this.gravity = 0;
            this.sprites = [];
            this.game = game;
        }
        World.prototype.update = function () {
            this.handleCollisions();
            for (var i = 0, j = this.sprites.length; i < j; i++) {
                this.sprites[i].update();
            }
        };
        World.prototype.render = function () {
            for (var i = 0, j = this.sprites.length; i < j; i++) {
                this.sprites[i].draw();
            }
        };
        World.prototype.addSprite = function (x, y, path) {
            var texture = this.game.resources.getImage(path);
            var sprite = new mini2d.Sprite(this.game, x, y, texture);
            this.sprites.push(sprite);
            return sprite;
        };
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
        function Sprite(game, x, y, texture) {
            this.body = null;
            this.game = game;
            this.position = new mini2d.Point(x, y);
            this.width = texture.width;
            this.height = texture.height;
            this.texture = texture;
        }
        Sprite.prototype.draw = function () {
            this.game.ctx.drawImage(this.texture, this.position.x - this.game.camera.position.x, this.position.y - this.game.camera.position.y);
        };
        Sprite.prototype.update = function () {
            if (this.body) {
                this.body.update();
                this.position.x = this.body.position.x;
                this.position.y = this.body.position.y;
            }
        };
        Sprite.prototype.enableBody = function () {
            this.body = new mini2d.Body(this);
        };
        return Sprite;
    }());
    mini2d.Sprite = Sprite;
})(mini2d || (mini2d = {}));
// source http://stackoverflow.com/questions/3514784/what-is-the-best-way-to-detect-a-mobile-device-in-jquery
var mobileTabletCheck = function () {
    return (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4)));
};
/// <reference path="../mini2d.ts" />
/// <reference path="../mini2d.ts" />
/// <reference path="../mini2d.ts" />
var mini2d;
(function (mini2d) {
    var Body = (function () {
        function Body(sprite) {
            this.velocity = new mini2d.Point();
            this.bounce = 0;
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
        Body.prototype.update = function () {
            this.handleWorldCollision();
            this.previousPosition.x = this.position.x;
            this.previousPosition.y = this.position.y;
            this.velocity.y += this.game.world.gravity / 60;
            this.position.x += this.velocity.x / 60;
            this.position.y += this.velocity.y / 60;
        };
        Body.prototype.collideWorldBounds = function (callback) {
            this.checkWorldCollision = {
                top: true,
                bottom: true,
                left: true,
                right: true
            };
            this.worldCollisionCallback = callback;
        };
        Body.prototype.handleCollision = function (body) {
            // collision on horizontal axis
            if (this.position.x + this.width >= body.position.x && this.position.x <= body.position.x + body.width) {
                // collision on vertical axis
                if (this.position.y + this.height >= body.position.y && this.position.y <= body.position.y + body.height) {
                    this.resoluteCollision(body);
                }
            }
        };
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
        Body.prototype.handleWorldCollision = function () {
            var direction = null;
            // collision with left world boundary
            if (this.position.x < this.game.camera.position.x) {
                this.position.x = this.game.camera.position.x;
                this.velocity.x = (this.velocity.x * -1) * this.bounce;
                direction = 'left';
            }
            // collision with right world boundary
            if (this.position.x + this.width > this.game.width + this.game.camera.position.x) {
                this.position.x = this.game.width - this.width + this.game.camera.position.x;
                this.velocity.x = (this.velocity.x * -1) * this.bounce;
                direction = 'right';
            }
            // collision with top world boundary
            if (this.position.y < this.game.camera.position.y) {
                this.position.y = this.game.camera.position.y;
                this.velocity.y = (this.velocity.y * -1) * this.bounce;
                direction = 'top';
            }
            // collision with bottom world boundary
            if (this.position.y + this.height > this.game.height + this.game.camera.position.y) {
                this.position.y = this.game.height - this.height + this.game.camera.position.y;
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
        function Button(game, x, y, onclick, texture, activeTexture) {
            this.active = false;
            this.game = game;
            this.position = new mini2d.Point(x, y);
            this.width = texture.width;
            this.height = texture.height;
            this.onclick = onclick;
            this.texture = texture;
            this.activeTexture = activeTexture;
        }
        Button.prototype.addText = function (text, font, fillStyle) {
            this.text = new mini2d.Text(this.game, this.position.x, this.position.y + this.height / 2, text, font, fillStyle);
            this.text.position.x = this.position.x + this.width / 2 - this.text.width / 2;
            this.text.game = this.game;
        };
        Button.prototype.draw = function () {
            var texture = (this.active) ? this.activeTexture : this.texture;
            this.game.ctx.drawImage(texture, this.position.x, this.position.y);
            if (this.text) {
                this.text.draw();
            }
        };
        return Button;
    }());
    mini2d.Button = Button;
})(mini2d || (mini2d = {}));
/// <reference path="../mini2d.ts" />
var mini2d;
(function (mini2d) {
    var Text = (function () {
        function Text(game, x, y, text, font, fillStyle) {
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
        Text.prototype.draw = function () {
            this.game.ctx.font = this.font;
            this.game.ctx.fillStyle = this.fillStyle;
            this.game.ctx.textBaseline = this.baseline;
            this.game.ctx.fillText(this.text, this.position.x, this.position.y);
        };
        return Text;
    }());
    mini2d.Text = Text;
})(mini2d || (mini2d = {}));
