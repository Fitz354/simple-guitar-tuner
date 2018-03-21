const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const middleX = canvas.width / 2;
const middleY = canvas.height;
const radius = canvas.width / 2;
const arcHeight = 5;

const startAngleIndex = 1.2;
const endAngleIndex = 1.8;
const centerAngleIndex = (startAngleIndex + endAngleIndex) / 2;
const centsPerAngleIndex = (endAngleIndex - startAngleIndex) / 100;
const startAngle = startAngleIndex * Math.PI;
const endAngle = endAngleIndex * Math.PI;

const digits = [-50, 0, 50];
const digitsOffsetFromArc = -canvas.width / 20;
const dotsRadius = 8;

const arrowWidth = 5;
const arrowLength = 50;

const zonesCount = digits.length - 1;
const step = (endAngleIndex - startAngleIndex) / zonesCount;

const noteY = (middleY - radius) + arrowLength + 25;

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
  ctx.arc(middleX, middleY, radius, startAngle, endAngle, false);
  ctx.lineWidth = arcHeight;
  ctx.strokeStyle = '#000000';
  ctx.stroke();
};

const drawNote = (name) => {
  ctx.font = 'bold 50px Tahoma';
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(name, radius, noteY);
};

const drawDigits = () => {
  digits.forEach((digit, index) => {
    const angle = (startAngleIndex + (step * index)) * Math.PI;

    const x = middleX + ((radius - digitsOffsetFromArc) * Math.cos(angle));
    const y = middleY + ((radius - digitsOffsetFromArc) * Math.sin(angle));

    const xDot = middleX + (radius * Math.cos(angle));
    const yDot = middleY + (radius * Math.sin(angle));

    ctx.font = 'bold 20px Tahoma';
    ctx.fillStyle = '#746845';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(digit, x, y);

    ctx.beginPath();
    ctx.arc(xDot, yDot, dotsRadius, 0, 2 * Math.PI);
    ctx.fillStyle = '#000000';
    ctx.fill();
  });
};

const drawArrow = (arrowAngleIndex) => {
  const angle = arrowAngleIndex * Math.PI;
  const fromX = middleX + ((radius - arrowLength) * Math.cos(angle));
  const fromY = middleY + ((radius - arrowLength) * Math.sin(angle));
  const toX = middleX + (radius * Math.cos(angle));
  const toY = middleY + (radius * Math.sin(angle));

  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.lineWidth = arrowWidth;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#746845';
  ctx.stroke();
};

const drawScale = (name, arrowAngleIndex) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawArc();
  drawDigits();
  drawNote(name);
  drawArrow(arrowAngleIndex);
};

export default (note) => {
  const { name, octave, cents } = note;
  const noteName = name ? `${name}${octave}` : '';
  const resultIndex = centerAngleIndex + (cents * centsPerAngleIndex);
  const offset = resultIndex - state.arrowAngleIndex;
  const angleIndexStep = offset / 15;

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
