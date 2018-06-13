let spaceships = [];
let num = 3;

function setup() {
  canvas = createCanvas(window.innerWidth, window.innerHeight);

  for(var i = 0; i < num-1; i++) {
    spaceships.push(new Spaceship(createVector(random(width),random(height)), num, floor(random(num)), floor(random(1000))));
  }

  debug = false;
}

function update() {
  spaceships = spaceships.filter(spaceship => (spaceship.getHP() > 0));

  var dicTeam = [];
  for (let spaceship of spaceships) {
    dicTeam[spaceship.getTeam()] = 1;
  }

  if(spaceships.length < num) {
    var team = floor(random(num));
    while(dicTeam[team] == 1) {
      team = floor(random(num));
    }
    spaceships.push(new Spaceship(createVector(random(width),random(height)), num, team, floor(random(1000))));
  }
}

function draw() {
  background(0);

  update();

  for (let spaceship of spaceships) {
    spaceship.applyBehaviors(spaceships);
    spaceship.update();
    spaceship.torusEdges();
    spaceship.render();
  }

  drawHP();

}

function drawHP() {
  for (let spaceship of spaceships) {
    var pos = spaceship.getPosition();
    push();
    strokeWeight(1);
    stroke(spaceship.getColor());
    noFill();
    rect(pos.x-40, pos.y-40, 80, 6);
    pop();
    push();
    noStroke();
    fill(spaceship.getColor());
    rect(pos.x-40, pos.y-40, 80*spaceship.getHP()/100, 6);
    pop();
  }
}