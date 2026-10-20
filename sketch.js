
//Version 4.0, one sketch for both desktop and mobile

//Image, emoji, and font assets loaded once before the sketch starts
let img, emojiX, emojiY, scoreFont;

//Active falling ice cubes, the running score, and how many cubes hit the floor
let iceCubes = [];
let score = 0;
let missed = 0;
let gameOver = false;
let lastSpawnFrame = 0;

const MAX_MISSED  = 20; //game stops once this many ice cubes have been missed
const LEVEL_EVERY = 50; //game speeds up every 50 ice cubes (see hud.js); higher than the other games
                        //because ice comes so fast that 50 here takes about as long as 20 there
const MAX_SPREAD  = 12; //how much wider the ice sprays sideways at max chaos

//True on touch devices (phones/tablets); detected once in setup()
let isMobile = false;

//Eyes are stored as a fraction of the image (0 to 1), not fixed pixels
//Tune these two values if the ice does not pour exactly from her eyes
let leftEyeF  = { x: 0.452, y: 0.334 };
let rightEyeF = { x: 0.578, y: 0.337 };

//Layout values recalculated every frame so resizing or rotating stays correct
let imgSize, imgX, imgY, unit;
let leftEye, rightEye;

function preload() {
  //Preload runs before setup, so every asset is ready before the first draw
  img      = loadImage('assets/Hayley.png');
  emojiX   = loadImage('assets/OJ.webp');
  emojiY   = loadImage('assets/Ice.webp');
  scoreFont = loadFont('assets/GeistMono-Bold.ttf');
}

function setup() {
  //Detect touch devices once, so sizes and speeds can adapt to fingers vs a cursor
  isMobile = (window.matchMedia && matchMedia('(pointer: coarse)').matches) || 'ontouchstart' in window;

  //Canvas fills the window and stays that size until it is resized or rotated
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);

  //Stop the page from scrolling or zooming while the player drags a finger
  const c = document.querySelector('canvas');
  if (c) c.style.touchAction = 'none';
}

function windowResized() {
  //Keep the canvas matched to the window whenever it resizes or the phone rotates
  resizeCanvas(windowWidth, windowHeight);
}

function layout() {
  //The image fits in the space between the headline and the scoreboard (sizes come from hud.js)
  const hud = hudLayout();
  const areaTop = hud.headBottom + hud.ts * 0.5;
  const availH = max(100, hud.scoreTop - hud.ts * 0.5 - areaTop);

  //Desktop windows are wide, so the image is capped by height
  //Phones are narrow, so the image is allowed to reach the edges of the screen
  const maxByWidth = width * (isMobile ? 1.0 : 0.6);
  imgSize = min(maxByWidth, availH);

  imgX = width / 2;
  imgY = areaTop + availH / 2;
  unit = imgSize / 1358;

  //Eye positions are derived from the image's current top left corner and size
  const left = imgX - imgSize / 2;
  const top  = imgY - imgSize / 2;
  leftEye  = { x: left + leftEyeF.x  * imgSize, y: top + leftEyeF.y  * imgSize };
  rightEye = { x: left + rightEyeF.x * imgSize, y: top + rightEyeF.y * imgSize };
}

function draw() {
  background(CREAM);
  layout();

  //Draw the main face image centered in the space left over after the text bands
  imageMode(CENTER);
  image(img, imgX, imgY, imgSize, imgSize);

  //Glass size is based on the smaller of width or height
  //Larger on mobile so it is easy to hit with a finger
  const glassSize   = min(width, height) * (isMobile ? 0.18 : 0.12);
  const catchRadius = glassSize * (isMobile ? 0.65 : 0.6);

  if (gameOver) {
    drawHUD();
    drawRetryScreen();
    image(emojiX, mouseX, mouseY, glassSize, glassSize);
    return;
  }

  checkLevelUp();

  //Spawn a new pair of ice cubes from each eye every 15 frames (20 on mobile)
  //Fewer on mobile so fewer cubes exist at once, since phones lag with too many on screen
  if (frameCount - lastSpawnFrame >= (isMobile ? 20 : 15)) {
    iceCubes.push(new IceCube(leftEye.x, leftEye.y));
    iceCubes.push(new IceCube(rightEye.x, rightEye.y));
    lastSpawnFrame = frameCount;
  }

  for (let i = iceCubes.length - 1; i >= 0; i--) {
    iceCubes[i].update();
    iceCubes[i].display();

    //Catch a cube if the cursor or finger is close enough to it
    if (dist(iceCubes[i].x, iceCubes[i].y, mouseX, mouseY) < catchRadius) {
      iceCubes.splice(i, 1);
      score++;
      continue;
    }

    //Cubes that fall past the bottom of the canvas count as missed
    //Misses only start counting after the first catch, so the game cannot end
    //before the player has found the glass
    if (iceCubes[i].y > height) {
      iceCubes.splice(i, 1);
      if (score > 0) missed++;
      if (missed >= MAX_MISSED) gameOver = true;
    }
  }

  drawHUD();
  drawLevelBanner();

  //The OJ glass follows the mouse cursor on desktop and the finger on mobile
  image(emojiX, mouseX, mouseY, glassSize, glassSize);
}

function drawHUD() {
  drawHeadline("Hayley's OJ is\ngetting warmer!");
  drawScoreboard(`Ice: ${score}   Missed: ${missed}`);
}

// The headline, scoreboard, retry screen, and speed-ups live in hud.js, shared by every game

function mousePressed() {
  attemptRetry();
}

function touchStarted() {
  //p5 does not run mousePressed once touchStarted exists, so taps retry from here
  attemptRetry();
  //Block the default touch behaviour so the page does not scroll or refresh
  return false;
}

//Resets the game back to its starting state, only once the game is over
function attemptRetry() {
  if (!gameOver) return;

  score = 0;
  missed = 0;
  iceCubes = [];
  gameOver = false;
  resetLevels();
  lastSpawnFrame = frameCount;
}

function touchMoved() {
  //Block the default touch behaviour so dragging does not scroll the page
  return false;
}

class IceCube {
  constructor(x, y) {
    //Start near the eye with a small random offset so cubes do not stack perfectly
    this.x = x + random(-5, 5) * unit;
    this.y = y;
    //Faster fall on mobile, so the ice still feels quick without more cubes on screen
    //Both get faster as the game speeds up, and the ice sprays wider sideways
    const spread = 1 + MAX_SPREAD * (chaos() - 1) / (MAX_CHAOS - 1);
    this.speedY = (isMobile ? random(4, 9) : random(2, 5)) * unit * chaos();
    this.speedX = random(-1, 1) * unit * spread;
    this.rotation = random(0, TWO_PI);
    this.rotSpeed = random(-0.05, 0.05);
    this.size = 45 * unit;
  }

  update() {
    //Move the cube downward and slightly sideways, and keep it spinning
    this.y += this.speedY;
    this.x += this.speedX;
    this.rotation += this.rotSpeed;
  }

  display() {
    push();
    translate(this.x, this.y);
    rotate(this.rotation);
    image(emojiY, 0, 0, this.size, this.size);
    pop();
  }
}
