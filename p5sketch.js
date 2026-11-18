let bgColor = '#FFBA53';
let flowerColor = '#FF6152';
let overlayColor = '#FFFFFF';
let showInnerCircle
const PRESETS = [
  { name: 'fuchsia and yellow', bg: '#FFBA53', flower: '#FF6152', overlay: '#FFFFFF'},
  
  { name: 'blue and mint', bg: '#76E5BD', flower: '#00BEB6', overlay: '#FFFFFF'},
  
  { name: 'pink and yellow', bg: '#FFBA53', flower: '#FF4234', overlay: '#FFFFFF'},

  { name: 'pink and fuchsia', bg: '#FF85FD', flower: '#FE1F8F', overlay: '#FFFFFF'},

  { name: 'fuchsia and blue', bg: '#00D4F5', flower: '#006FF3', overlay: '#FFFFFF'},

  { name: 'blue and yellow', bg: '#FFBA53', flower: '#009B50', overlay: '#FFFFFF'},

  { name: 'blue and fuchsia', bg: '#FF85FD', flower: '#006FF3', overlay: '#FFFFFF'},

  { name: 'yellow and fuchsia', bg: '#FF85FD', flower: '#FF6152', overlay: '#FFFFFF'},

  { name: 'fuchsia and yellow with overlay', bg: '#FFF4E3', flower: '#FF85FD', overlay: '#FFBA53'},

  { name: 'blue and mint with overlay', bg: '#FFF4E3', flower: '#00D4F5', overlay: '#76E5BD'},
  
  { name: 'pink and yellow with overlay', bg: '#FFF4E3', flower: '#FF5AA1', overlay: '#FFBA53'},

  { name: 'pink and fuchsia with overlay', bg: '#FFF4E3', flower: '#FE3C90', overlay: '#FF85FD'},

  { name: 'fuchsia and blue with overlay', bg: '#FFF4E3', flower: '#FF85FD', overlay: '#00D4F5'},

  { name: 'blue and yellow with overlay', bg: '#FFF4E3', flower: '#00D4F5', overlay: '#FFBA53'},

  { name: 'blue and fuchsia with overlay', bg: '#FFF4E3', flower: '#00D4F5', overlay: '#FF85FD'},

  { name: 'yellow and fuchsia with overlay', bg: '#FFF4E3', flower: '#FFBA53', overlay: '#FF85FD'},

];
let slider;

function setup() {
  let cnv = createCanvas(600, 600);
  cnv.parent('canvas');
  noStroke();
  noLoop();

  createP("COLORS").parent('controls-box');
  const swatchRow = createDiv();
  swatchRow.style('display', 'grid');
  swatchRow.style('grid-template-columns', 'repeat(8, 30px)');
  swatchRow.style('gap', '8px');
  swatchRow.parent('controls-box');

    for (const p of PRESETS) {
    // outer circle = background color
    const bgsw = createDiv();
    bgsw.parent(swatchRow);
    bgsw.attribute('title', p.name);
    bgsw.style('position', 'relative');
    bgsw.style('width', '30px');
    bgsw.style('height', '30px');
    bgsw.style('border-radius', '50%');
    bgsw.style('overflow', 'hidden'); 
    bgsw.style('isolation', 'isolate');   
    bgsw.style('cursor', 'pointer');
    bgsw.style('background', p.bg);

    const incir = createDiv();
    incir.parent(bgsw);
    incir.style('position', 'absolute');
    incir.style('left', '7px');           
    incir.style('top', '7px');
    incir.style('width', '15px');
    incir.style('height', '15px');
    incir.style('border-radius', '50%');
    incir.style('background', p.flower);

    // overlay on the right half, over both circles, only for presets that have one
    if (p.overlay.toUpperCase() !== '#FFFFFF') {
      const ov = createDiv();
      ov.parent(bgsw);
      ov.style('position', 'absolute');
      ov.style('left', '50%');
      ov.style('top', '0');
      ov.style('width', '50%');
      ov.style('height', '100%');
      ov.style('background', p.overlay);
      ov.style('mix-blend-mode', 'multiply');
      ov.style('pointer-events', 'none');   // clicks still reach the swatch
    }
    bgsw.mousePressed(() => {
      bgColor = p.bg;
      flowerColor = p.flower;
      overlayColor = p.overlay;
      redraw();
    });
  }
  
  // 0 = circle, 1 = teardrop
  createP("PETALS SHAPE").parent('controls-box');
  petalsSlider = createSlider(0, 1, 1, 0);
  petalsSlider.parent('controls-box');
  petalsSlider.input(() => redraw());   // redraw only when the slider moves

  createP("PETALS SIZE").parent('controls-box');
  petalsScaler = createSlider(145, 190, 1, 0);
  petalsScaler.parent('controls-box');
  petalsScaler.input(() => redraw());   // redraw only when the slider moves

  createP("INNER PETALS").parent('controls-box');
  leafMode = createRadio();
  leafMode.parent('controls-box');
  leafMode.option('petal', 'TEARDROP');
  leafMode.option('circle', 'CIRCLE');
  leafMode.option('hide', 'HIDE INNER PETALS');
  leafMode.selected('petal');            // default
  leafMode.changed(() => redraw());

  createP("CENTER CIRCLE").parent('controls-box');
  showInnerCircle = createCheckbox("", true);
  showInnerCircle.parent('controls-box');
  showInnerCircle.changed(() => redraw());

  createP("CENTER CIRCLE SIZE").parent('controls-box');
  innerCircleSlider = createSlider(170, 270, 200, 0);
  innerCircleSlider.parent('controls-box');
  innerCircleSlider.input(() => redraw());

  createP("SHOW STROKE").parent('controls-box');
  showStroke = createCheckbox("", false);
  showStroke.parent('controls-box');
  showStroke.changed(() => redraw());

  createP("STROKE WEIGHT").parent('controls-box');
  flowerWeightSlider = createSlider(25, 50, 25, 0);
  flowerWeightSlider.parent('controls-box');
  flowerWeightSlider.changed(() => redraw());

  let jpgButton = createButton('EXPORT JPG').parent('controls-box');
  jpgButton.mousePressed(function() {
    saveCanvas('generative-logo-flower', 'jpg');
  })
}

function draw() {
  background(bgColor);
  translate(width / 2, height / 2);
  scale(0.5);

  const t = petalsSlider.value();
  petalsScale = petalsScaler.value();
  const outline = showStroke.checked();

  // petals: flower color or stroke flower color
  if (outline) {
    noFill();
    stroke(flowerColor);
    strokeWeight(flowerWeightSlider.value());
    strokeJoin(ROUND);
  } else {
    noStroke();
    fill(flowerColor);
  }

  for (let i = 0; i < 6; i++) {
    push();
    rotate(i * TWO_PI / 6);
    petal(t);
    pop();
  }

    // inner leaves
  const mode = leafMode.value();
  noStroke();
  fill(outline ? flowerColor : bgColor);

  if (mode === 'petal' && t > 0.02) {
    // lens leaves still shrink with the teardrop slider
    for (let i = 0; i < 6; i++) {
      push();
      rotate(i * TWO_PI / 6);
      translate(160, 0);
      scale(t);
      translate(-200, 0);
      leafPetal();
      pop();
    }
  } else if (mode === 'circle') {
    // circle leaves keep a constant size
    for (let i = 0; i < 6; i++) {
      push();
      rotate(i * TWO_PI / 6);
      translate(-40, 0);
      leafCircle();
      pop();
    }
  }

  function innerCircle(outline, d = innerCircleSlider.value()) {
  if (outline) {
    stroke(flowerColor);
    strokeWeight(flowerWeightSlider.value());   // same weight as the petals
  } else {
    noStroke();
  }
  fill(bgColor);
  circle(0, 0, d);
}

  if (showInnerCircle.checked()) {
    innerCircle(outline);
  }
  
  // multiply overlay (drawn in screen space, outside the translate/scale)
  resetMatrix();
  blendMode(MULTIPLY);
  noStroke();
  fill(overlayColor);
  rect(width / 2, 0, width / 2, height);   // right half
  blendMode(BLEND);                        // reset so the next frame isn't affected
}

function cubic(x0, y0, x1, y1, x2, y2, x3, y3, steps = 30) {
  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    vertex(
      bezierPoint(x0, x1, x2, x3, u),
      bezierPoint(y0, y1, y2, y3, u)
    );
  }
}

// t = 0 -> circle, t = 1 -> teardrop
function petal(t) {
  const cx = 355, r = petalsScale;
  const k = 0.5523;   // magic number for approximating a quarter circle with a cubic

  // start point and control points, blended between circle and teardrop
  const tipX = lerp(cx - r,     0,   t);
  const c1x  = lerp(cx - r,     120, t);
  const c1y  = lerp(-k * r,     -20, t);
  const c2x  = lerp(cx - k * r, 220, t);
  const c2y  = -r;

  beginShape();
  // top edge
  cubic(tipX, 0, c1x, c1y, c2x, c2y, cx, -r);
  // round head
  for (let a = -HALF_PI; a <= HALF_PI; a += 0.05) {
    vertex(cx + r * cos(a), r * sin(a));
  }
  vertex(cx, r);
  // bottom edge (mirror of the top)
  cubic(cx, r, c2x, -c2y, c1x, -c1y, tipX, 0);
  endShape(CLOSE);
}

function leafPetal() {
  beginShape();
  cubic(35, 0, 120, -50, 220, -60, 300, 0);
  cubic(300, 0, 220, 60, 120, 50, 35, 0);
  endShape(CLOSE);
}

function leafCircle(d = 220) {
  circle(400, 0, d);   // x = middle of the leaf (35..300), y = 0, diameter d
}