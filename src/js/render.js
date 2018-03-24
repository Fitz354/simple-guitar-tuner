const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const arcX = canvas.width / 2;
const arcY = canvas.height;
const arcRadius = canvas.width / 2;
const arcHeight = 3;
const startAngleIndex = 1.2;
const endAngleIndex = 1.8;
const centerAngleIndex = (startAngleIndex + endAngleIndex) / 2;
const centsPerAngleIndex = (endAngleIndex - startAngleIndex) / 100;
const startAngle = startAngleIndex * Math.PI;
const endAngle = endAngleIndex * Math.PI;

const digits = [-50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50];
const step = (endAngleIndex - startAngleIndex) / (digits.length - 1);
const digitsOffsetFromArc = 20;
const tickLength = 8;
const tickWidth = 2;
const digitsAngles = digits.map((digit, index) => (startAngleIndex + (step * index)) * Math.PI);
const digitsCoords = digits.map((digit, index) =>
  ({
    x: arcX + ((arcRadius + digitsOffsetFromArc) * Math.cos(digitsAngles[index])),
    y: arcY + ((arcRadius + digitsOffsetFromArc) * Math.sin(digitsAngles[index])),
  }));
const ticksCoords = digits.map((digit, index) =>
  ({
    fromX: arcX + (arcRadius * Math.cos(digitsAngles[index])),
    fromY: arcY + (arcRadius * Math.sin(digitsAngles[index])),
    toX: arcX + ((arcRadius - tickLength) * Math.cos(digitsAngles[index])),
    toY: arcY + ((arcRadius - tickLength) * Math.sin(digitsAngles[index])),
  }));

const arrowWidth = 3;
const arrowLength = 50;

const noteFontSize = 50;
const noteY = (arcY - arcRadius) + arrowLength + (noteFontSize / 2);

const state = {
  arrowAngleIndex: centerAngleIndex,
  lastAnimationId: null,
};

const lightsElements = document.querySelectorAll('.lightbulb');

const drawLightbulbs = (cents) => {
  let lightbulbType = '';

  if (cents >= -5 && cents <= 5) {
    lightbulbType = 'normal';
  } else if (cents > 5) {
    lightbulbType = 'dies';
  } else {
    lightbulbType = 'bemole';
  }

  lightsElements.forEach(({ classList }) => {
    if (classList.contains(`lightbulb-${lightbulbType}`)) {
      classList.add('active');
      return;
    }
    classList.remove('active');
  });
};

const drawArc = () => {
  ctx.beginPath();
  ctx.arc(arcX, arcY, arcRadius, startAngle, endAngle, false);
  ctx.lineWidth = arcHeight;
  ctx.strokeStyle = '#000000';
  ctx.stroke();
};

const drawNote = (name) => {
  ctx.font = `bold ${noteFontSize}px Tahoma`;
  ctx.fillStyle = '#161616';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(name, arcRadius, noteY);
};

const drawDigits = () => {
  digits.forEach((digit, index) => {
    const { x, y } = digitsCoords[index];

    ctx.font = '16px Tahoma';
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(digit, x, y);
  });
};

const drawTicks = () => {
  digits.forEach((digit, index) => {
    const {
      fromX,
      fromY,
      toX,
      toY,
    } = ticksCoords[index];

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.lineWidth = tickWidth;
    ctx.lineCap = 'butt';
    ctx.strokeStyle = '#000000';
    ctx.stroke();
  });
};

const drawArrow = (arrowAngleIndex) => {
  const angle = arrowAngleIndex * Math.PI;
  const fromX = arcX + ((arcRadius - arrowLength) * Math.cos(angle));
  const fromY = arcY + ((arcRadius - arrowLength) * Math.sin(angle));
  const toX = arcX + (arcRadius * Math.cos(angle));
  const toY = arcY + (arcRadius * Math.sin(angle));

  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.lineWidth = arrowWidth;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#c41f09';
  ctx.stroke();
};

const drawScale = (name, arrowAngleIndex) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawArc();
  drawDigits();
  drawTicks();
  drawNote(name);
  drawArrow(arrowAngleIndex);
};

export default (note) => {
  const { name, octave, cents } = note;
  const noteName = name ? `${name}${octave}` : '';
  const resultIndex = centerAngleIndex + (cents * centsPerAngleIndex);
  const offset = resultIndex - state.arrowAngleIndex;
  const angleIndexStep = offset / 10;

  const animateArrow = () => {
    if (Math.abs(resultIndex - state.arrowAngleIndex) <= Math.abs(angleIndexStep)) {
      drawScale(noteName, resultIndex);
      state.arrowAngleIndex = resultIndex;
      return;
    }

    state.arrowAngleIndex += angleIndexStep;
    drawScale(noteName, state.arrowAngleIndex);
    state.lastAnimationId = window.requestAnimationFrame(animateArrow);
  };

  drawLightbulbs(cents);
  cancelAnimationFrame(state.lastAnimationId);
  state.lastAnimationId = window.requestAnimationFrame(animateArrow);
};
