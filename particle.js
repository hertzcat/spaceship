class Particle {

  constructor(position, aim, color) {
    this.position = position.copy();
    this.velocity = p5.Vector.sub(aim,this.position);
    this.velocity.setMag(8);
    this.lifespan = 255.0;
    this.affectRadius = 100;
    this.color = color;
  }

  hitted() {
    this.lifespan = -1;
  }

  getAffectRadius() {
    return this.affectRadius;
  }

  getPosition() {
    return this.position;
  }

  getVelocity() {
    return this.velocity;
  }

  getVelocityMag() {
    return this.velocity.mag();
  }

  getLifeSpan() {
    return this.lifespan;
  }

  update() {
    this.position.add(this.velocity);
    this.lifespan -= 1;
  }

  render() {

    // if(this.justEmit(100)) {
    //   debugDrawCircle(this.position, this.affectRadius);
    // }

    push();
    noStroke();
    fill(this.color, this.lifespan);
    ellipse(this.position.x, this.position.y, 5, 5);
    pop();
  }

  isDead() {
    if (this.lifespan < 0.0) {
      return true;
    }
    return false;
  }

  justEmit(dis) {
    if(this.lifespan > 255 - (dis+this.affectRadius)/this.velocity.mag()) {
      return true;
    }
    return false;
  }

}