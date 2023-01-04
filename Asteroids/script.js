// Getting the DOM element//
const canvas = document.querySelector("#canvas1");
// Getting its 2D rendering context//
const ctx = canvas.getContext("2d");

//CANVAS SIZE//
const W = canvas.width,
  H = canvas.height;

//FONTS AND STYLES//
ctx.fillStyle = "white";
ctx.font = "40px llpixel";

//VARIABLES//
let score = 0,
  acelleration = 0.1,
  angle = 0,
  enemyCount = 10,
  chanceOfEncounter = 1,
  scores = [],
  health = 3,
  playerName = "";

//MOUSE COORDINATES//
let x, y;

//GAMESTART AND BACKBUTTON CONTROL BOOL
let gamestart = false,
  backButtonBool = false;

// object arrays
const asteroids = [],
  ships = [],
  missiles = [];

//sprite imports
let images = {};
loadImage("asteroid");
loadImage("spaceship");
loadImage("enemy");
loadImage("undo");
loadImage("heart");

function loadImage(name) {
  images[name] = new Image();
  images[name].src = "sprites/" + name + ".png";
  images[name].onload = function () {};
}

// CONTROLS//

let keys = {
  ArrowUp: false,
  ArrowLeft: false,
  ArrowRight: false,
  SpaceBar: false,
};

//ASSOCIATE METHODS ON KEYS DOWNS FOR MOVIMENT //

addEventListener("keydown", (event) => {
  if (event.key == "ArrowUp") {
    keys.ArrowUp = true;
  }
  if (event.key == "ArrowLeft") {
    keys.ArrowLeft = true;
  }
  if (event.key == "ArrowRight") {
    keys.ArrowRight = true;
  }
  if(event.keyCode == 32){
    keys.SpaceBar = true;
  }
  event.preventDefault();
});

//GIVE EFFECT TO KEYUP FOR MOVIMENT //
addEventListener("keyup", (event) => {
  if (event.key == "ArrowUp") {
    keys.ArrowUp = false;
  }
  if (event.key == "ArrowLeft") {
    keys.ArrowLeft = false;
  }
  if (event.key == "ArrowRight") {
    keys.ArrowRight = false;
  }
  if(event.keyCode == 32){
    keys.SpaceBar = false;
  }
});

// DETECT MOUSE COORDENATES //

addEventListener("mousemove", (event) => {
  x = event.offsetX;
  y = event.offsetY;
  event.preventDefault();
});

//DETECT CLICK FOR BACK BUTTON //

addEventListener("click", (event) => {
  if (x > 450 && x < 550 && y > 200 && y < 400 && gamestart == false) {
    gamestart = true;
    render();
    event.preventDefault();
  }

  if (backButtonBool == true && x >= 750 && x <= 800 && y >= 85 && y <= 127) {
    callMenu();
  }
});

// PLAYER CLASS WITH METHODS //

class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.angle = 0;
    this.velocity = 0;
    this.maxVelocity = 5;
    this.size = 50;
    this.image = images.spaceship;
  }

  accelerate() {
    if (this.velocity < this.maxVelocity) {
      this.velocity += 0.02;
    }
    this.x += this.velocity*Math.cos(this.angle*Math.PI/180-(Math.PI/2));
    this.y += this.velocity*Math.sin(this.angle*Math.PI/180-(Math.PI/2));
  }

  brake() {
    if (this.velocity > this.minVelocity) {
      this.velocity -= 0.5;
    }
  }

  shoot(){
    Missile.draw()
  }

  turnLeft() {
    this.angle <= 0 ? (this.angle = 359) : (this.angle -= 1);
    this.turnShip();
  }

  turnRight() {
    this.angle >= 360 ? (this.angle = 1) : (this.angle += 1);
    this.turnShip();
  }

  turnShip() {
    ctx.save();
    ctx.translate(this.x + (this.size / 2), this.y + (this.size / 2));
    ctx.rotate((this.angle * Math.PI) / 180);
    ctx.drawImage(this.image,-this.size/2,-this.size/2, this.size, this.size);
    ctx.restore();
  }

  update() {
    if (this.y < -this.size) {
      this.y = H;
    }
    if (this.y > H + this.size) {
      this.y = 0;
    }
    if(this.x<-this.size){
      this.x = W
    }
    if(this.x > W+this.size){
      this.x = 0;
    }
  }
}

//CREATING NEW PLAYER FROM PREVIOUS CLASS//

const myPlayer = new Player(W / 2 - 50, H / 2 - 50);
console.log(myPlayer);

// ASTEROIDS CLASS DEFINITION WITH METHODS//

class Asteroid {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.angle = 0;
    this.velocity = 0;
    this.maxVelocity = 2;
    this.image = images.asteroid;
  }
  draw() {
    ctx.drawImage(this.image, this.x, this.y, this.size, this.size);
  }
  update() {
    if (this.x > 0) {
      this.x = W - this.size;
    }
    if (this.x - this.size > W) {
      this.x = 0;
    }
    if (this.y - this.size < 0) {
      this.y = H;
    }
    if (this.y > H) {
      this.y = this.size;
    }
  }
  destroy() {
    asteroids.splice(asteroids.indexOf(this), 1);
    console.log(asteroids);
  }
}

//ENEMY SHIP CLASS DEFINITION //

class Ship {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.angle = 0;
    this.size = 30;
    this.image = images.enemy;
  }
  draw() {
    ctx.drawImage(this.image, this.x, this.y, this.size, this.size);
  }
  update() {
    if (this.x > 0) {
      this.x = W - this.size;
    }
    if (this.x - this.size > W) {
      this.x = 0;
    }
    if (this.y - this.size < 0) {
      this.y = H;
    }
    if (this.y > H) {
      this.y = this.size;
    }
  }
}

//PLAYER MISSILE CLASS DEFINITION //

class Missile {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.color = "white";
    this.radius = 10;
    this.velocity = 2;
  }
  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x+(myPlayer.size/2), this.y-(myPlayer.size/2), this.radius, 0, 2 * Math.PI)
    ctx.fill();
    ctx.closePath();
  }
  update(){
    this.x += this.velocity*Math.cos(myPlayer.angle*Math.PI/180-(Math.PI/2));
    this.y += this.velocity*Math.sin(myPlayer.angle*Math.PI/180-(Math.PI/2));
    
    
  }
  destroy() {
    if(this.x<0 || this.x>W || this.y <0 || this.y>W){
      missiles.splice(missiles.indexOf(this), 1);
    }
    
  }
}

//METHOD TO ADD MISSILES TO THE ARRAY //

function pushMissiles() {
  missiles.push(new Missile(myPlayer.x, myPlayer.y));
  console.log(missiles);
}

pushMissiles();

//FUNCTION THAT CHOOSES IF WE CREATE AN ASTEROID OR AN ENEMY SHIP (10% CHANGE IT IS A SHIP)//

function createAsteroidsOrEnemys() {
  chanceOfEncounter = Math.round(Math.random() * chanceOfEncounter);
  if (chanceOfEncounter > 0.9) {
    ships.push(
      new Ship(Math.round(Math.random() * W), Math.round(Math.random() * H))
    );
    enemyCount--;
    console.log(ships);
    for (let i = 0; i < enemyCount; i++) {
      asteroids.push(
        new Asteroid(
          Math.round(Math.random() * W),
          Math.round(Math.random() * H)
        )
      );
    }
    enemyCount++;
    console.log(asteroids);
  } else {
    for (let i = 0; i < enemyCount; i++) {
      asteroids.push(
        new Asteroid(
          Math.round(Math.random() * W),
          Math.round(Math.random() * H)
        )
      );
    }
    console.log(asteroids);
  }
}

//FUNCTION TO CLEAR CANVAS//

function clear() {
  ctx.clearRect(0, 0, W, H);
}

//FUNCTION TO START THE GAME ASSOCIATED TO HTML BUTTON//

function startGame() {
  gamestart = true;
  document.getElementById("menu").style.display = "none";
  document.getElementById("canvas1").style.backgroundColor = "black";
  document.getElementById("canvas1").style.backgroundImage = "";
  console.log("Game started");
  render();
}

//FUNCTION TO DISPLAY LEADERBOARD ASSOCIATED TO HTML BUTTON//

function leaderBoard() {
  document.getElementById("menu").style.display = "none";
  clear();
  ctx.font = "45px llpixel";
  ctx.textAlign = "center";
  ctx.fillText("Leaderboard", W / 2, H / 5);
  backButton();
}

//FUNCTION TO DISPLAY HELP MENU ASSOCIATED TO HTML BUTTON//

function help() {
  document.getElementById("menu").style.display = "none";
  clear();
  ctx.font = "45px llpixel";
  ctx.textAlign = "center";
  ctx.fillText("Help", W / 2, H / 5);
  backButton();
}

function insertName() {
  document.getElementById("menu").style.display = "none";
  document.getElementById("insertNameDiv").style.display = "inline";
  clear();
  ctx.font = "70PX llpixel";
  ctx.textAlign = "center";
  ctx.fillText("Insert name", W / 2, H / 5);
}

//FUNCTION TO CALL THE GAME MENU//

function callMenu() {
  clear();
  health = 3;
  document.getElementById("menu").style.display = "inline-block";
  let bg = document.getElementById("canvas1");
  bg.style.backgroundImage = "url(../sprites/galaxy.gif)";
  bg.style.backgroundSize = "cover";
  gamestart = false;
}

//FUNCTION THAT DEFINES THE BACKBUTTON//

function backButton() {
  backButtonBool = true;
  ctx.drawImage(images.undo, W - 150, 80, 50, 50);
}

//FUNCTION TO DISPLAY POINTS AND HP//

function displayHUD() {
  for (let i = 1; i < health + 1; i++) {
    ctx.drawImage(images.heart, 25 * i, 45, 20, 20);
  }
  ctx.font = "20px llpixel";
  ctx.textAlign = "left";
  ctx.fillText(`Score: ${score}`, 25, 30);
}

createAsteroidsOrEnemys();


//RENDER FUNCTION//

function render() {
  if (gamestart == true) {


    clear();
    
    myPlayer.draw();
    myPlayer.update();

    if (keys.ArrowUp == true) {
      myPlayer.accelerate();
    }
    if (keys.ArrowLeft == true) {
      myPlayer.turnLeft();
    }
    if (keys.ArrowRight == true) {
      myPlayer.turnRight();
    }

    displayHUD();
    
    if (health == 0) {
      callMenu();
    }
  }
  requestAnimationFrame(render);
}