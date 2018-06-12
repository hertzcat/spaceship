class Spaceship {

  constructor(position, num, team, seed) {

    this.hp = 100;
    this.id = random(100000);

    this.position = position.copy();
    this.velocity = createVector();
    this.acceleration = createVector();
    this.topspeed = 3;

    this.bodyData = [0,-2,-1,1,1,1];
    this.scale = 10;
    this.affectRadius = 100;
    this.bodyRadius = 15;

    this.team = team;
    this.t = seed;

    this.particles = [];
    this.particleCD = 0;

    var colorStep = floor(360 / num);
    var rand = floor(floor(random(colorStep/4))-colorStep/8);
    this.color = color("hsl("+(((colorStep*team)%360+rand+360)%360)+", 100%, 50%)");
    
  }

  update() {

    this.velocity.add(this.acceleration);
    this.velocity.limit(this.topspeed);
    this.position.add(this.velocity);

    this.particles = this.particles.filter(particle => !particle.isDead());
    for (let particle of this.particles) {
      particle.update();
    }

    this.t += 0.005;

  }

  torusEdges() {
    if (this.position.x > width) {
      this.position.x = this.position.x - width;
    } else if (this.position.x < 0) {
      this.position.x = width + this.position.x;
    }
 
    if (this.position.y > height) {
      this.position.y = this.position.y - height;
    }  else if (this.position.y < 0) {
      this.position.y = height + this.position.y;
    }
  }

  drawBody() {
    push();
    noStroke();
    fill(this.color);
    translate(this.position.x, this.position.y);
    var angle = this.velocity.heading();
    rotate(angle+HALF_PI);
    scale(this.scale);
    triangle(
      this.bodyData[0], 
      this.bodyData[1], 
      this.bodyData[2], 
      this.bodyData[3], 
      this.bodyData[4], 
      this.bodyData[5]
    );
    pop();
  }

  render() {

    debugDrawCircle(this.position, this.affectRadius);
    debugDrawCircle(this.position, this.bodyRadius);
    debugDrawForce(this.position, this.acceleration);

    this.drawBody();

    for (let particle of this.particles) {
      particle.render();
    }
  }

  getPosition() {
    return this.position;
  }

  getAffectRadius() {
    return this.affectRadius;
  }

  getTeam() {
    return this.team;
  }

  getParticles() {
    return this.particles;
  }

  getHP() {
    return this.hp;
  }

  getColor() {
    return this.color;
  }

  torusDis(pos1, pos2) {
    return sqrt(
      sq(min(abs(pos1.x-pos2.x), width-abs(pos1.x-pos2.x)))+
      sq(min(abs(pos1.y-pos2.y), height-abs(pos1.y-pos2.y)))
    );
  }

  torusVectorSub(pos1, pos2) {
    var v = createVector();
    if(abs(pos1.x-pos2.x) < width-abs(pos1.x-pos2.x)) {
      v.x = pos1.x - pos2.x;
    }
    else {
      if(pos1.x > pos2.x) {
        v.x = pos1.x - (pos2.x+width);
      }
      else {
        v.x = pos1.x - (pos2.x-width);
      }
    }
    if(abs(pos1.y-pos2.y) < height-abs(pos1.y-pos2.y)) {
      v.y = pos1.y - pos2.y;
    }
    else {
      if(pos1.y > pos2.y) {
        v.y = pos1.y - (pos2.y+height);
      }
      else {
        v.y = pos1.y - (pos2.y-height);
      }
    }
    return v;
  }

  applyForce(force) {
    this.acceleration.add(force);
  }

  aimTarget(spaceships) {
    var target = null;
    var minDis = Infinity;
    for (let spaceship of spaceships) {
      if(this.team == spaceship.getTeam()) continue;
      var dis = p5.Vector.dist(this.position, spaceship.getPosition());
      if(dis < minDis) {
        minDis = dis;
        target = spaceship.getPosition();
      }
    }
    return target;
  }

  attackTarget(target) {
    if(this.particleCD == 0 && target != null) {
      var targetPos = createVector();
      targetPos.x = target.x + randomGaussian(0, 100);
      targetPos.y = target.y + randomGaussian(0, 100);
      this.particles.push(new Particle(this.position, targetPos, this.color));
    }
    this.particleCD = (this.particleCD + 1) % 8;
  }

  hitDetect(spaceships) {
    for (let spaceship of spaceships) {
      for (let particle of spaceship.getParticles()) {
        if(this.id == spaceship.id && particle.justEmit(this.affectRadius)) {
          continue;
        }
        var dis = p5.Vector.dist(this.position, particle.getPosition());
        if(dis < this.bodyRadius) {
          this.hp--;
          particle.hitted();
        }
      }
    }
  }

  calcSeparateForce(pos1, r1, pos2, r2, virtualPos=null) {
    var force = null;
    if(virtualPos != null) {
      var dis = p5.Vector.dist(pos1, pos2);
    }
    else {
      var dis = this.torusDis(pos1, pos2);
    }
    var desiredSeparation = r1+r2;
    if(0 < dis && dis < desiredSeparation) {
      if(virtualPos != null) {
        force = p5.Vector.sub(pos1, virtualPos);
        dis = p5.Vector.dist(pos1, virtualPos);
      }
      else {
        force = this.torusVectorSub(pos1, pos2);
      }
      force.normalize();
      force.mult(sq(desiredSeparation));
      force.div(sq(dis));
    }
    return force;
  }

  getVirtualPosition(pos1, pos2, velocity) {
    var pos = createVector();
    var v = p5.Vector.sub(pos1, pos2);
    var m = velocity.mag();
    var projection = p5.Vector.dot(v, velocity)/m;
    pos = p5.Vector.add(pos2, p5.Vector.mult(velocity, projection/m));
    return pos;
  }

  dodge(spaceships) {

    var dodgeForce = createVector();
    var count = 0;

    // avoid spaceship collision
    for (let spaceship of spaceships) {
      if(this.id == spaceship.id) {
        continue;
      }
      var force = this.calcSeparateForce(this.position, this.affectRadius, spaceship.getPosition(), spaceship.getAffectRadius());
      if(force != null) {
        dodgeForce.add(force);
        count++;
      }
    }

    // dodge particles
    for (let spaceship of spaceships) {
      for (let particle of spaceship.getParticles()) {
        if(this.id == spaceship.id && particle.justEmit(this.affectRadius)) {
          continue;
        }
        var virtualPos = this.getVirtualPosition(this.position, particle.getPosition(), particle.getVelocity());
        var force = this.calcSeparateForce(this.position, this.affectRadius, particle.getPosition(), particle.getAffectRadius(), virtualPos);
        if(force != null) {
          dodgeForce.add(force);
          count++;
        }
      }
    }

    if (count > 0) {
      dodgeForce.div(count);
    }

    return dodgeForce;

  }

  applyBehaviors(spaceships) {

    this.acceleration.mult(0);
 
    var target = this.aimTarget(spaceships);
    this.attackTarget(target);

    var dodgeForce = this.dodge(spaceships);
    var freeForce = createVector(noise(this.t)-0.5,noise(this.t+10000)-0.5);
    freeForce.normalize();

    dodgeForce.add(freeForce);
    dodgeForce.setMag(0.2);
    this.applyForce(dodgeForce);

    this.hitDetect(spaceships);

  }

}