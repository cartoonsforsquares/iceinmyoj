
//Desktop version, built from version 3.0

//Image, emoji, and font assets loaded once before the sketch starts
let img, emojiX, emojiY, moreFont;

//Active falling ice cubes and the running score
let iceCubes = [];
let score = 0;

//Eyes are stored as a fraction of the image (0 to 1), not fixed pixels
//Tune these two values if the ice does not pour exactly from her eyes
let leftEyeF  = { x: 0.452, y: 0.334 };
let rightEyeF = { x: 0.578, y: 0.337 };

//Layout values recalculated every frame so resizing the window stays correct
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
  //Canvas fills the browser window and stays that size until resized
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
}

function windowResized() {
  //Keep the canvas matched to the window whenever the desktop window resizes
  resizeCanvas(windowWidth, windowHeight);
}

function layout() {
  //Text size is worked out first so the image never has to guess how much room it needs
  ts = constrain(width * 0.03, 20, 56);

  //Reserved vertical space for the title (two lines) and the score (one line)
  titleH = ts * 0.6 + ts * 1.25 * 2 + ts * 0.5;
  scoreH = ts * 0.8 + ts * 1.25 + ts * 0.4;

  //Desktop windows are usually wide, so the image is capped by height, not width
  const availH = max(120, height - titleH - scoreH);
  const maxByWidth = width * 0.6;
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

  //Spawn a new pair of ice cubes from each eye every 15 frames
  if (frameCount % 15 === 0) {
    iceCubes.push(new IceCube(leftEye.x, leftEye.y));
    iceCubes.push(new IceCube(rightEye.x, rightEye.y));
  }

  //Glass size and catch radius are based on the smaller of width or height
  const glassSize   = min(width, height) * 0.12;
  const catchRadius = glassSize * 0.6;

  for (let i = iceCubes.length - 1; i >= 0; i--) {
    iceCubes[i].update();
    iceCubes[i].display();

    //Catch a cube if the cursor is close enough to it
    if (dist(iceCubes[i].x, iceCubes[i].y, mouseX, mouseY) < catchRadius) {
      iceCubes.splice(i, 1);
      score++;
      continue;
    }

    //Remove cubes once they fall past the bottom of the canvas
    if (iceCubes[i].y > height) iceCubes.splice(i, 1);
  }

  textFont(moreFont);

  //Title text sits inside the top band reserved by layout, split across two lines
  push();
  fill('black'); stroke(10); textSize(ts); textAlign(CENTER, TOP);
  text("Hayley's ice is\ngetting warmer!", width / 2, ts * 0.6);
  pop();

  //Score text sits inside the bottom band reserved by layout
  push();
  fill('black'); stroke(10); textSize(ts); textAlign(CENTER, BOTTOM);
  text(`Ice collected: ${score}`, width / 2, height - ts * 0.8);
  pop();

  //The OJ glass follows the mouse cursor on desktop
  image(emojiX, mouseX, mouseY, glassSize, glassSize);
}

class IceCube {
  constructor(x, y) {
    //Start near the eye with a small random offset so cubes do not stack perfectly
    this.x = x + random(-5, 5) * unit;
    this.y = y;
    this.speedY = random(2, 5) * unit;
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
