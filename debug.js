let debug = true;

function debugDrawCircle(position, affectRadius) {
  if(!debug) return;
  push();
  strokeWeight(2);
  stroke(200);
  noFill();
  ellipse(position.x, position.y, affectRadius*2, affectRadius*2);
  pop();
}

function debugDrawForce(position, force) {
  if(!debug) return;
  push();
  stroke(200);
  line(
    position.x, 
    position.y, 
    position.x+force.x*300,
    position.y+force.y*300
  );
  pop();
}

function debugDrawPosition(position) {
  if(!debug) return;
  push();
  noStroke();
  fill(0,0,255);
  ellipse(position.x, position.y, 5, 5);
  pop();
}