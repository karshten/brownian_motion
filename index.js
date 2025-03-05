let particles = [];
let eyeMolecule;
let path = []; // No limit on path history
let tempSlider;

class Particle {
  constructor(x, y, r) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(1, 8)); // Initial velocity
    this.r = r;
  }

  update(temperature) {
    // Scale velocity magnitude based on temperature (0-100 maps to 0-8)
    let speedFactor = map(temperature, 0, 100, 0, 8);
    let currentSpeed = this.vel.mag();
    if (currentSpeed > 0) {
      this.vel.setMag(speedFactor); // Adjust speed without changing direction
    } else {
      this.vel = p5.Vector.random2D().mult(speedFactor); // Set initial direction if stationary
    }

    this.pos.add(this.vel);
    if (this.pos.x < this.r || this.pos.x > width / 2 - this.r)
      this.vel.x *= -1;
    if (this.pos.y < this.r || this.pos.y > height - this.r) this.vel.y *= -1;
  }

  show() {
    noStroke();
    fill(100, 150, 255, 150);
    ellipse(this.pos.x, this.pos.y, this.r * 2);
  }
}

class EyeMolecule {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.r = 15;
  }

  update() {
    this.pos.add(this.vel);
    this.vel.mult(0.95);
    this.pos.x = constrain(this.pos.x, this.r, width / 2 - this.r);
    this.pos.y = constrain(this.pos.y, this.r, height - this.r);
  }

  collide(other) {
    let d = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
    if (d < this.r + other.r) {
      let force = p5.Vector.sub(this.pos, other.pos);
      force.setMag(0.5);
      this.vel.add(force);
    }
  }

  show() {
    noStroke();
    fill(255, 100, 100);
    ellipse(this.pos.x, this.pos.y, this.r * 2);
  }
}

function setup(amountOfWaterParticles = 200, temp = 50) {
  let canvas = createCanvas(window.innerWidth - 40, 700);
  canvas.parent("canvas-container"); // Attach canvas to the div
  particles = [];
  path = [];
  eyeMolecule = null;
  tempSlider = document.getElementById("tempSlider");
  tempSlider.value = temp;
  document.getElementById("tempValue").textContent = tempSlider.value;

  for (let i = 0; i < amountOfWaterParticles; i++) {
    particles.push(new Particle(random(width / 2), random(height), 6));
  }
  eyeMolecule = new EyeMolecule(width / 4, height / 2);

  // Setup temperature slider
  tempSlider.addEventListener("input", () => {
    document.getElementById("tempValue").textContent = tempSlider.value;
  });
}

function drawBrownianMotion() {
  // Left side: Brownian motion animation
  push();
  fill(255);
  rect(0, 0, width / 2, height); // White background for animation
  let temperature = parseInt(tempSlider.value); // Get temperature from slider
  for (let p of particles) {
    p.update(temperature); // Pass temperature to update
    p.show();
    eyeMolecule.collide(p);
  }
  eyeMolecule.update();
  eyeMolecule.show();
  pop();
}

function drawPathRecorder() {
  // Right side: Paper-like path recorder with full history
  push(); 
  translate(width / 2, 0);
  fill(100, 150, 255, 150); // Light beige "paper" color
  rect(0, 0, width / 2, height); // Paper background

  // Record the path (no erasing)
  path.push(eyeMolecule.pos.copy());

  // Draw the full path history
  stroke(0);
  strokeWeight(2);
  noFill();
  beginShape();
  for (let p of path) {
    let mappedX = map(p.x, 0, width / 2, 0, width / 2); // Fixed typo here
    vertex(mappedX, p.y);
  }
  endShape();

  // Add a "pen" effect at the current position
  noStroke();
  fill(255, 100, 100);
  let currentX = map(eyeMolecule.pos.x, 0, width / 2, 0, width / 2);
  ellipse(currentX, eyeMolecule.pos.y, 30, 30);
  pop();
}

function draw() {
  background(220); // Light gray for the whole canvas
  drawBrownianMotion();
  drawPathRecorder();

  // Draw a divider line between the two sections
  stroke(150);
  strokeWeight(5);
  line(width / 2, 0, width / 2, height);
}

// window.addEventListener("keydown", (e) => {
//   if (e.keyCode === 82) {
//     setup();
//   }
// });

const inputParticlesAmount = document.getElementById("amountOfParticles");
const applyBtn = document.getElementById("applyBtn");
applyBtn.addEventListener("click", () => {
  console.log(inputParticlesAmount.value);
  if (
    !isNaN(+inputParticlesAmount.value) &&
    inputParticlesAmount.value <= 10000 &&
    inputParticlesAmount.value > 0
  ) {
    tempSlider = document.getElementById("tempSlider");
    setup(inputParticlesAmount.value, tempSlider.value);
  }
});
