
//Version 3.0

let img, emojiX, emojiY, moreFont;
let iceCubes = [];
let score = 0;

// Eyes as a FRACTION of the image (0–1). Tune these two if the ice
// doesn't pour exactly from her eyes (see calibration note below).
let leftEyeF  = { x: 0.452, y: 0.334 };
let rightEyeF = { x: 0.578, y: 0.337 };

// computed each frame
let imgSize, imgX, imgY, unit;
let leftEye, rightEye;

function preload() {
  img      = loadImage('Assets/Hayley.png');
  emojiX   = loadImage('Assets/OJ.webp');
  emojiY   = loadImage('Assets/Ice.webp');
  moreFont = loadFont('Assets/Kamryn.otf');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  const c = document.querySelector('canvas');
  if (c) c.style.touchAction = 'none';
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function layout() {
  const portrait = height >= width;
  // face fills width on phones, fits height on desktop
  imgSize = portrait ? width * 1.15 : min(height * 0.95, width);
  imgX = width / 2;
  imgY = height / 2;
  unit = imgSize / 1358;            // scales physics & emoji to face size

  const left = imgX - imgSize / 2;
  const top  = imgY - imgSize / 2;
  leftEye  = { x: left + leftEyeF.x  * imgSize, y: top + leftEyeF.y  * imgSize };
  rightEye = { x: left + rightEyeF.x * imgSize, y: top + rightEyeF.y * imgSize };
}

function draw() {
  background(220);
  layout();

  imageMode(CENTER);
  image(img, imgX, imgY, imgSize, imgSize);

  if (frameCount % 15 === 0) {
    iceCubes.push(new IceCube(leftEye.x, leftEye.y));
    iceCubes.push(new IceCube(rightEye.x, rightEye.y));
  }

  const glassSize  = min(width, height) * 0.16;   // finger-friendly
  const catchRadius = glassSize * 0.6;

  for (let i = iceCubes.length - 1; i >= 0; i--) {
    iceCubes[i].update();
    iceCubes[i].display();

    if (dist(iceCubes[i].x, iceCubes[i].y, mouseX, mouseY) < catchRadius) {
      iceCubes.splice(i, 1);
      score++;
      continue;
    }
    if (iceCubes[i].y > height) iceCubes.splice(i, 1);
  }

  // responsive text
  const ts = constrain(width * 0.045, 16, 44);
  textFont(moreFont);

  push();
  fill('black'); stroke(10); textSize(ts); textAlign(CENTER, TOP);
  text("Hayley's OJ is getting warmer\ncollect her ice!", width / 2, ts * 0.6);
  pop();

  push();
  fill('black'); stroke(10); textSize(ts); textAlign(CENTER, BOTTOM);
  text(`Ice collected: ${score}`, width / 2, height - ts * 0.8);
  pop();

  // OJ glass follows finger / cursor
  image(emojiX, mouseX, mouseY, glassSize, glassSize);
}

function touchStarted() { return false; }
function touchMoved()  { return false; }

class IceCube {
  constructor(x, y) {
    this.x = x + random(-5, 5) * unit;
    this.y = y;
    this.speedY = random(2, 5) * unit;
    this.speedX = random(-1, 1) * unit;
    this.rotation = random(0, TWO_PI);
    this.rotSpeed = random(-0.05, 0.05);
    this.size = 45 * unit;
  }
  update() { this.y += this.speedY; this.x += this.speedX; this.rotation += this.rotSpeed; }
  display() {
    push();
    translate(this.x, this.y);
    rotate(this.rotation);
    textSize(this.size);
    image(emojiY, 0, 0, this.size, this.size);
    pop();
  }
}

/* VERSION 2.0

let img, emoji, moreFont;
let iceCubes = [];
let score = 0;

// The screen you ORIGINALLY designed on. Set these to match, then don't touch.
const DESIGN_W = 2560;
const DESIGN_H = 1440;

// Eyes stay in design-space coords (unchanged)
let leftEye  = { x: 1215, y: 495 };
let rightEye = { x: 1386, y: 498 };

let s = 1, offX = 0, offY = 0;   // transform, recomputed each frame

function preload() {
  img     = loadImage('Assets/Hayley.png');
  emoji   = loadImage('Assets/OJ.webp');
  moreFont = loadFont('Assets/Basteleur-Bold.otf');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  const c = document.querySelector('canvas');   // stop mobile scroll/zoom on drag
  if (c) c.style.touchAction = 'none';
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// pointer -> design space
const px = () => (mouseX - offX) / s;
const py = () => (mouseY - offY) / s;

function draw() {
  background(220);

  // fit-to-screen (letterboxed) transform
  s = min(windowWidth / DESIGN_W, windowHeight / DESIGN_H);
  offX = (windowWidth  - DESIGN_W * s) / 2;
  offY = (windowHeight - DESIGN_H * s) / 2;

  push();
  translate(offX, offY);
  scale(s);
  // ---- everything below uses your original coordinates ----

  imageMode(CENTER);
  image(img, DESIGN_W / 2, DESIGN_H / 2, 1358, 1358);

  const mx = px(), my = py();

  if (frameCount % 15 === 0) {
    iceCubes.push(new IceCube(leftEye.x, leftEye.y));
    iceCubes.push(new IceCube(rightEye.x, rightEye.y));
  }

  for (let i = iceCubes.length - 1; i >= 0; i--) {
    iceCubes[i].update();
    iceCubes[i].display();

    if (dist(iceCubes[i].x, iceCubes[i].y, mx, my) < 50) {
      iceCubes.splice(i, 1);
      score++;
      continue;
    }
    if (iceCubes[i].y > DESIGN_H) iceCubes.splice(i, 1);
  }

  push();
  fill('black'); textFont(moreFont); textSize(40); textAlign(CENTER);
  text("Hayley's OJ is getting warmer\n    collect her ice!", 520, 320);
  pop();

  push();
  fill('black'); textFont(moreFont); textSize(40); textAlign(CENTER);
  text(`Ice collected: ${score}`.toUpperCase(), 1920, 320);
  pop();

  image(emoji, mx, my, 100, 100);   // OJ glass follows finger/cursor
  pop();
}

// block pull-to-refresh / scroll on touch
function touchStarted() { return false; }
function touchMoved()  { return false; }

class IceCube {
  constructor(x, y) {
    this.x = x + random(-5, 5);
    this.y = y;
    this.speedY = random(2, 5);
    this.speedX = random(-1, 1);
    this.rotation = random(0, TWO_PI);
    this.rotSpeed = random(-0.05, 0.05);
  }
  update() { this.y += this.speedY; this.x += this.speedX; this.rotation += this.rotSpeed; }
  display() {
    push();
    translate(this.x, this.y);
    rotate(this.rotation);
    textSize(45);           // set here so it isn't affected elsewhere
    text('🧊', 0, 0);
    pop();
  }
}

*/
/* VERSION 1.0
let img;
let iceCubes = [];
let emoji;
let score = 0; // <-- track collected cubes

// Eye Coordinates
let leftEye = { x: 1215, y: 495 };
let rightEye = { x: 1386, y: 498 };

function preload() {
  img = loadImage('Assets/Hayley.png');
  emoji = loadImage('Assets/OJ.webp');
  //scoreFont = loadFont('Assets/VT323-Regular.ttf');
  moreFont = loadFont('Assets/Basteleur-Bold.otf');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  textSize(45);
}

function draw() {
  background(220);

  imageMode(CENTER);
  image(img, width / 2, height / 2, 1358, 1358);

 
 
  // New ice cubes every 15 frames
  if (frameCount % 15 == 0) {
    iceCubes.push(new IceCube(leftEye.x, leftEye.y));
    iceCubes.push(new IceCube(rightEye.x, rightEye.y));
  }

  // Update and display all active ice cubes
  for (let i = iceCubes.length - 1; i >= 0; i--) {
    iceCubes[i].update();
    iceCubes[i].display();

    // --- CATCH CHECK ---
    // Distance from the ice cube to the glass (cursor position)
    let d = dist(iceCubes[i].x, iceCubes[i].y, mouseX, mouseY);
    if (d < 50) {              // 50 = catch radius, tune to taste
      iceCubes.splice(i, 1);   // remove the caught cube
      score++;                 // bump the score
      continue;                // skip the off-screen check below
    }

    // Remove ice cubes once they fall off the screen
    if (iceCubes[i].y > height) {
      iceCubes.splice(i, 1);
    }
  }

  //Peak Coordinate System
  //fill('black');
  //noStroke();
  //text(`${mouseX}, ${mouseY}`, 320, 320); 
  


  
  

    // Hayley's Headline

  push();
  fill('black');
  textFont(moreFont);
  textSize(40);
  textAlign(CENTER);
  text(`Hayley's OJ is getting warmer
    collect her ice!`, 520, 320);
  pop();

  
  
  // Score Display

  push();
  fill('black');
  textFont(moreFont);
  textSize(40);
  textAlign(CENTER);
  text(`Ice collected: ${score}`.toUpperCase(), 1920, 320);
  pop();

  // OJ glass
  push();
  image(emoji, mouseX, mouseY, 100, 100);
  pop();

  
}

// Ice Cube Class
class IceCube {
  constructor(x, y) {
    this.x = x + random(-5, 5);
    this.y = y;
    this.speedY = random(2, 5);
    this.speedX = random(-1, 1);
    this.rotation = random(0, TWO_PI);
    this.rotSpeed = random(-0.05, 0.05);
  }

  update() {
    this.y += this.speedY;
    this.x += this.speedX;
    this.rotation += this.rotSpeed;
  }

  display() {
    push();
    translate(this.x, this.y);
    rotate(this.rotation);
    text('🧊', 0, 0);
    pop();
  }

  
}
*/