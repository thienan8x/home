// Code by Matheus Lin
// While developing a version of "Chain Reaction", I ended up on
// those "fireworks-like" things. I leave it to you here.
// Chain Reaction coming up next!
// Configs
var screenWidth = window.innerWidth;
var screenHeight = window.innerHeight;
var gravity = 1;

var minVx = -10;
var deltaVx = 20;
var minVy = 25
var deltaVy = 15;

function setSpeedParams() {
    var heightReached = 0;
    var vy = 0;

    while (heightReached < screenHeight && vy >= 0) {
        vy += gravity;
        heightReached += vy;
        console.log("hey");
    }

    minVy = vy / 2;
    deltaVy = vy - minVy;

    vx = (1 / 4) * screenWidth / (vy / 2);
    minVx = -vx;
    deltaVx = 2 * vx;
};

setSpeedParams();


var explosionRadius = 50;
var deltaExplosionRadius = 150
var del
var bombRadius = 5;
var deltaBombRadius = 10;
var explodingDuration = 100;
var explosionDividerFactor = 10; // I couldn't find a better name. Got any?

var nBombs = 1; // initial
var percentChanceNewBomb = 5;

// Color utils forked from http://andreasstorm.com/
// (or someone who forked from there)

function Color(min) {
    min = min || 0;
    this.r = colorValue(min);
    this.g = colorValue(min);
    this.b = colorValue(min);
    this.style = createColorStyle(this.r, this.g, this.b);
};

function colorValue(min) {
    return Math.floor(Math.random() * 255 + min);
}

function createColorStyle(r, g, b) {
    return 'rgba(' + r + ',' + g + ',' + b + ', 0.8)';
}

// A Bomb. Or firework.
function Bomb() {
    var self = this;

    self.radius = bombRadius + Math.random() * deltaBombRadius;
    self.previousRadius = bombRadius;
    self.explosionRadius = explosionRadius + Math.random() * deltaExplosionRadius;
    self.explodingDuration = explodingDuration;
    self.hasExploded = false;
    self.alive = true;
    self.color = new Color();

    //  self.px = Math.random() * window.innerWidth;
    self.px = (window.innerWidth / 4) + (Math.random() * window.innerWidth / 2);

    //  self.py = Math.random() * window.innerHeight;
    self.py = window.innerHeight;

    self.vx = minVx + Math.random() * deltaVx;
    self.vy = (minVy + Math.random() * deltaVy) * -1; // because y grows downwards

    self.update = function() {
        if (self.hasExploded) {
            var deltaRadius = self.explosionRadius - self.radius;
            self.previousRadius = self.radius;
            self.radius += deltaRadius / explosionDividerFactor;
            self.explodingDuration--;
            if (self.explodingDuration == 0) {
                self.alive = false;
            }
        } else {
            self.vx += 0;
            self.vy += gravity;
            if (self.vy >= 0) { // invertion point
                self.explode();
            }

            self.px += self.vx;
            self.py += self.vy;
        }
    };

    self.draw = function(ctx) {
        ctx.beginPath();
        ctx.arc(self.px, self.py, self.previousRadius, 0, Math.PI * 2, false);
        if (self.hasExploded) {
            ctx.strokeStyle = self.color.style;
            var width = self.radius - self.previousRadius;
            if (width < 1) {
                width = 1;
            }
            ctx.lineWidth = width;
            ctx.stroke();
        } else {
            ctx.fillStyle = self.color.style;
            ctx.lineWidth = 1;
            ctx.fill();
        }

    };


    self.explode = function() {
        self.hasExploded = true;
    };

}

function Controller() {
    var self = this;
    self.canvas = document.getElementById("screen");
    self.canvas.width = screenWidth;
    self.canvas.height = screenHeight;
    self.ctx = self.canvas.getContext('2d');

    self.init = function() {
        self.readyBombs = [];
        self.explodedBombs = [];

        for (var i = 0; i < nBombs; i++) {
            self.readyBombs.push(new Bomb());
        }
    }

    self.update = function() {
        var aliveBombs = [];
        while (self.explodedBombs.length > 0) {
            var bomb = self.explodedBombs.shift();
            bomb.update();
            if (bomb.alive) {
                aliveBombs.push(bomb);
            }
        }
        self.explodedBombs = aliveBombs;

        var notExplodedBombs = [];
        while (self.readyBombs.length > 0) {
            var bomb = self.readyBombs.shift();
            bomb.update();
            if (bomb.hasExploded) {
                self.explodedBombs.push(bomb);
            } else {
                notExplodedBombs.push(bomb);
            }
        }
        self.readyBombs = notExplodedBombs;
    }

    self.draw = function() {
        self.ctx.beginPath();
        self.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'; // Ghostly effect
        self.ctx.fillRect(0, 0, self.canvas.width, self.canvas.height);




        for (var i = 0; i < self.readyBombs.length; i++) {
            self.readyBombs[i].draw(self.ctx);
        }

        for (var i = 0; i < self.explodedBombs.length; i++) {
            self.explodedBombs[i].draw(self.ctx);
        }
    }

    self.animation = function() {
        self.update();
        self.draw();

        if (Math.random() * 100 < percentChanceNewBomb) {
            self.readyBombs.push(new Bomb());
        }


        requestAnimationFrame(self.animation);
    }
}

var controller = new Controller();
controller.init();
requestAnimationFrame(controller.animation);