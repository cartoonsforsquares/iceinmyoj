
//Mobile version, built from version 3.0

//Image, emoji, and font assets loaded once before the sketch starts
let img, emojiX, emojiY, moreFont;

//Active falling ice cubes and the running score
let iceCubes = [];
let score = 0;

//Eyes are stored as a fraction of the image (0 to 1), not fixed pixels
//Tune these two values if the ice does not pour exactly from her eyes
let leftEyeF  = { x: 0.452, y: 0.334 };
let rightEyeF = { x: 0.578, y: 0.337 };

//Layout values recalculated every frame so rotating the phone stays correct
let imgSize, imgX, imgY, unit;
let leftEye, rightEye;
let ts, titleH, scoreH;

function preload() {
  //Preload runs before setup, so every asset is ready before the first draw
  img      = loadImage('assets/Hayley.png');
  emojiX   = loadImage('assets/OJ.webp');
  emojiY   = loadImage('assets/Ice.webp');
  moreFont = loadFont('assets/Chubbo-BoldItalic.ttf');
}

function setup() {
  //Canvas fills the phone screen and stays that size until it rotates
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  

  //Stop the page from scrolling or zooming while the player drags a finger
  const c = document.querySelector('canvas');
  if (c) c.style.touchAction = 'none';
}

function windowResized() {
  //Keep the canvas matched to the screen whenever the phone rotates
  resizeCanvas(windowWidth, windowHeight);
}

function layout() {
  //Text size is worked out first so the image never has to guess how much room it needs
  //Doubled from the previous 0.05 / 14 / 30 to make mobile text 1x bigger
  ts = constrain(width * 0.1, 28, 60);

  //Reserved vertical space for the title (two lines) and the score (one line)
  titleH = ts * 0.6 + ts * 1.25 * 2 + ts * 0.5;
  scoreH = ts * 0.8 + ts * 1.25 + ts * 0.4;

  //Phones are usually taller than they are wide, so the image is capped by width
  const portrait = height >= width;
  const availH = max(100, height - titleH - scoreH);
  //Pushed to the edge of the screen (from 0.95 / 0.7) since a square image
  //cannot literally double past 100% of screen width without clipping
  const maxByWidth = portrait ? width * 1.0 : width * 1.0;
  imgSize = min(maxByWidth, availH);

  imgX = width / 2;
  imgY = titleH + availH / 2;
  unit = imgSize / 1358;

  //Eye positions are derived from the image's current top left corner and size
  const left = imgX - imgSize / 2;
  const top  = imgY - imgSize / 2;
  leftEye  = { x: left + leftEyeF.x  * imgSize, y: top + leftEyeF.y  * imgSize };
  rightEye = { x: left + rightEyeF.x * imgSize, y: top + rightEyeF.y * imgSize };
}

function draw() {
  background('pink');
  layout();

  //Draw the main face image centered in the space left over after the text bands
  imageMode(CENTER);
  image(img, imgX, imgY, imgSize, imgSize);

  //Spawn a new pair of ice cubes from each eye every 20 frames
  //Kept lower than desktop so fewer cubes exist at once, since phones lag with too many on screen
  if (frameCount % 20 === 0) {
    iceCubes.push(new IceCube(leftEye.x, leftEye.y));
    iceCubes.push(new IceCube(rightEye.x, rightEye.y));
  }

  //Glass size is larger than on desktop so it is easy to hit with a finger
  const glassSize   = min(width, height) * 0.18;
  const catchRadius = glassSize * 0.65;

  for (let i = iceCubes.length - 1; i >= 0; i--) {
    iceCubes[i].update();
    iceCubes[i].display();

    //Catch a cube if the finger is close enough to it
    if (dist(iceCubes[i].x, iceCubes[i].y, mouseX, mouseY) < catchRadius) {
      iceCubes.splice(i, 1);
      score++;
      continue;
    }

    //Remove cubes once they fall past the bottom of the screen
    if (iceCubes[i].y > height) iceCubes.splice(i, 1);
  }

  textFont(moreFont);

  //Title text sits inside the top band reserved by layout, now split across two lines
  push();
  fill('black'); stroke(10); textSize(ts); textAlign(CENTER, TOP);
  text("Hayley's ice is\ngetting warmer!", width / 2, ts * 0.6);
  pop();

  //Score text sits inside the bottom band reserved by layout
  push();
  fill('black'); stroke(10); textSize(ts); textAlign(CENTER, BOTTOM);
  text(`Ice collected: ${score}`, width / 2, height - ts * 0.8);
  pop();

  //The OJ glass follows the player's finger on mobile
  image(emojiX, mouseX, mouseY, glassSize, glassSize);
}

function touchStarted() {
  //Block the default touch behaviour so the page does not scroll or refresh
  return false;
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
    //Faster fall speed than before, this is how the ice actually falls quicker
    //without needing more cubes on screen at once (which was causing the phone to lag)
    this.speedY = random(4, 9) * unit;
    this.speedX = random(-1, 1) * unit;
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
