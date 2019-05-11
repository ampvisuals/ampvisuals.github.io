var Dot, attractToMouse, awayFromMouse, createRandomColor, createRandomDot, dotArray, draw, effectiveRadius, keyPressed, keyReleased, processDots, setup;

dotArray = [];

effectiveRadius = 10;


// ---------- Dot ------------------------------------------------------ //

Dot = (function() {
  class Dot {
    constructor() {
      this.position = createVector(0, 0);
      this.displaySize = 10;
      this.displayColor = color(255);
      this.targetPosition = createVector(0, 0);
      this.currentMoveFrameCount = 0;
      this.isMoving = false;
      this.relayPointRatio = 0;
      this.relayPointPosition = createVector(0, 0);
      this.startPointRatio = 0;
      this.startPointPosition = createVector(0, 0);
      this.endPointRatio = 0;
      this.endPointPosition = createVector(0, 0);
    }

    setTarget(x, y) {
      var displacementX, displacementY;
      if (this.isMoving) {
        this.position.set(this.endPointPosition.x, this.endPointPosition.y);
      }
      this.targetPosition.set(x, y);
      this.currentMoveFrameCount = 0;
      this.isMoving = true;
      displacementX = x - this.position.x;
      displacementY = y - this.position.y;
      if (Math.random() < 0.5) {
        this.relayPointRatio = abs(displacementX) / (abs(displacementX) + abs(displacementY));
        this.relayPointPosition.set(this.position.x + displacementX, this.position.y);
      } else {
        this.relayPointRatio = abs(displacementY) / (abs(displacementX) + abs(displacementY));
        this.relayPointPosition.set(this.position.x, this.position.y + displacementY);
      }
    }

    update() {
      var endPointX, endPointY, ratio, startPointX, startPointY;
      if (this.isMoving) {
        this.currentMoveFrameCount++;
        this.startPointRatio = this.getStartPointRatio();
        this.endPointRatio = this.getEndPointRatio();
        if (this.startPointRatio < this.relayPointRatio) {
          ratio = this.startPointRatio / this.relayPointRatio;
          startPointX = this.position.x + ratio * (this.relayPointPosition.x - this.position.x);
          startPointY = this.position.y + ratio * (this.relayPointPosition.y - this.position.y);
        } else {
          ratio = (this.startPointRatio - this.relayPointRatio) / (1 - this.relayPointRatio);
          startPointX = this.relayPointPosition.x + ratio * (this.targetPosition.x - this.relayPointPosition.x);
          startPointY = this.relayPointPosition.y + ratio * (this.targetPosition.y - this.relayPointPosition.y);
        }
        this.startPointPosition.set(startPointX, startPointY);
        if (this.endPointRatio < this.relayPointRatio) {
          ratio = this.endPointRatio / this.relayPointRatio;
          endPointX = this.position.x + ratio * (this.relayPointPosition.x - this.position.x);
          endPointY = this.position.y + ratio * (this.relayPointPosition.y - this.position.y);
        } else {
          ratio = (this.endPointRatio - this.relayPointRatio) / (1 - this.relayPointRatio);
          endPointX = this.relayPointPosition.x + ratio * (this.targetPosition.x - this.relayPointPosition.x);
          endPointY = this.relayPointPosition.y + ratio * (this.targetPosition.y - this.relayPointPosition.y);
        }
        this.endPointPosition.set(endPointX, endPointY);
        if (this.currentMoveFrameCount >= this.moveDurationFrameCount) {
          this.position.set(this.targetPosition.x, this.targetPosition.y);
          this.isMoving = false;
        }
      }
    }

    display() {
      if (this.isMoving) {
        strokeWeight(this.displaySize/12);
        stroke(this.displayColor);
        noFill();
        beginShape();
        vertex(this.startPointPosition.x, this.startPointPosition.y);
        if (this.startPointRatio < this.relayPointRatio && this.relayPointRatio < this.endPointRatio) {
          vertex(this.relayPointPosition.x, this.relayPointPosition.y);
        }
        vertex(this.endPointPosition.x, this.endPointPosition.y);
        endShape();
      } else {
        noStroke();
        fill(this.displayColor);
        ellipse(this.position.x, this.position.y, this.displaySize/4, this.displaySize/4);
      }
    }

    getMoveProgressRatio() {
      return min(1, this.currentMoveFrameCount / this.moveDurationFrameCount);
    }

    getStartPointRatio() {
      return -(Math.pow(this.getMoveProgressRatio() - 1, 2)) + 1;
    }

    getEndPointRatio() {
      return -(Math.pow(this.getMoveProgressRatio() - 1, 4)) + 1;
    }

    getDistance(x, y) {
      return dist(x, y, this.position.x, this.position.y);
    }

  }

  Dot.prototype.moveDurationFrameCount = 17;

  return Dot;

})();

createRandomDot = function() {
  var newDot;
  newDot = new Dot();
  newDot.position = createVector(random(width), random(height));
  newDot.displaySize = 4 * width / 640;
  newDot.displayColor = createRandomColor(50, 100);
  return newDot;
};

createRandomColor = function(saturationValue, brightnessValue) {
  var newColor;
  colorMode(HSB);
  newColor = color(random(360), saturationValue, brightnessValue);
  colorMode(RGB);
  return newColor;
};


// ---------- Methods for controlling dots ------------------------------------------ //

processDots = function(func, effectiveRadius, probability) {
  var eachDot, i, len;
  for (i = 0, len = dotArray.length; i < len; i++) {
    eachDot = dotArray[i];
    if (eachDot.isMoving) {
      continue;
    }
    if (!(Math.random() < probability)) {
      continue;
    }
    func(eachDot, effectiveRadius);
  }
};

awayFromMouse = function(dot, effectiveRadius) {
  if (!(dot.getDistance(mouseX, mouseY) < effectiveRadius)) {
    return;
  }
  dot.setTarget(random(width), random(height));
};

attractToMouse = function(dot, effectiveRadius) {
  var angle, distance, x, y;
  distance = Math.random() * effectiveRadius;
  angle = Math.random() * TWO_PI;
  x = mouseX + distance * cos(angle);
  if (x < 0) {
    x = -x;
  } else if (x > width) {
    x = width - (x - width);
  }
  y = mouseY + distance * sin(angle);
  if (y < 0) {
    y = -y;
  } else if (y > height) {
    y = height - (y - height);
  }
  dot.setTarget(x, y);
};


/*
attractToMouse = function(dot, effectiveRadius) {
  var angle, distance, x, y;
  distance = Math.random() * effectiveRadius;
  angle = Math.random() * TWO_PI;
  x = mouseX + distance * cos(angle);
  if (x < 0) {
    x = -x;
  } else if (x > width) {
    x = width - (x - width);
  }
  y = mouseY + distance * sin(angle);
  if (y < 0) {
    y = -y;
  } else if (y > height) {
    y = height - (y - height);
  }
  dot.setTarget(x, y);
};
*/
// ---------- Setup & Draw ------------------------------------------ //

setup = function() {
  
	createCanvas(1500, 1000);
  for (i = 0; i < 300; i++) {
    dotArray.push(createRandomDot());
  }
  effectiveRadius = 0.25 * width;
  
};
 

draw = function() {
  var eachDot, i, len;
  blendMode(BLEND);
  //background(0, 0, 40);
	background(255);
  blendMode(BLEND);
  for (i = 0, len = dotArray.length; i < len; i++) {
    eachDot = dotArray[i];
    eachDot.update();
    eachDot.display();
  }
   blendMode(MULTIPLY);
  stroke(183, 178, 178);
  strokeWeight(4);
 fill(255);
 rect(250, 250, 500,300);
 fill(255);
circle(500, 400, 100);
stroke(0);
fill(0);
circle(500, 400, 75);
stroke(183, 178, 178);
  strokeWeight(4);
 fill(255);
 rect(250, 170, 125, 75);
 strokeWeight(4);
 fill(255);
 rect(262, 182, 100, 50);
 arc(500, 400, 60, 60, 0, PI+QUARTER_PI, CHORD);
  stroke(183, 178, 178);
  strokeWeight(4);
 fill(0);
 rect(450, 550, 100, 50);
 strokeWeight(8);
 line(750, 800, 550, 600);
 line(250, 800, 450, 600);
 line(500, 800, 500, 602);

if (mouseIsPressed) {
    fill(255);
  } else {
    fill (0);
  }
  rect(262, 182, 100, 50);

  if (mouseIsPressed) {
    processDots(awayFromMouse, effectiveRadius, 1);
    processDots(attractToMouse, effectiveRadius, 0.001);
  } else {
    processDots(attractToMouse, effectiveRadius, 0.1);
  }
};

keyPressed = function() {
  if (key === 'P') {
    noLoop();
  }
};

keyReleased = function() {
  if (key === 'P') {
    loop();
  }
  
};