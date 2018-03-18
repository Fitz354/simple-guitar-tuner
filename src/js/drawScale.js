const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const middleX = canvas.width / 2;
const middleY = canvas.height;
const radius = canvas.width / 2;

const startAngleIndex = 1.2;
const endAngleIndex = 1.8;
const centerAngleIndex = (startAngleIndex + endAngleIndex) / 2;
const centsPerAngleIndex = (endAngleIndex - startAngleIndex) / 100;

const digits = [-50, 0, 50];
const digitsOffsetFromArc = -canvas.width / 20;

const arrowWidth = 5;
const arrowLength = 50;

const startAngle = startAngleIndex * Math.PI;
const endAngle = endAngleIndex * Math.PI;
const zonesCount = digits.length - 1;
const step = (endAngleIndex - startAngleIndex) / zonesCount;

const noteY = (middleY - radius) + arrowLength + 25;

const state = {
  arrowAngleIndex: centerAngleIndex,
  lastAnimationId: null,
};

const drawShape = () => {
  ctx.beginPath();
  ctx.arc(middleX, middleY, radius, startAngle, endAngle, false);
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#000';
  ctx.stroke();
};

const drawNote = (name) => {
  ctx.font = 'bold 50px Tahoma';
  ctx.fillStyle = '#000';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(name, radius, noteY);
};

const drawDigits = () => {
  let angleIndex = startAngleIndex;
  digits.forEach((digit) => {
    const angle = angleIndex * Math.PI;
    angleIndex += step;

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
    ctx.arc(xDot, yDot, 3, 0, 2 * Math.PI, false);
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#000';
    ctx.stroke();
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

const drawAll = (name, arrowAngleIndex) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawShape();
  drawDigits();
  drawNote(name);
  drawArrow(arrowAngleIndex);
};

export default (name, cents) => {
  const resultIndex = centerAngleIndex + (cents * centsPerAngleIndex);
  const offset = resultIndex - state.arrowAngleIndex;
  const angleIndexStep = offset / 15;
  const animateArrow = () => {
    if (Math.abs(resultIndex - state.arrowAngleIndex) <= Math.abs(angleIndexStep)) {
      drawAll(name, resultIndex);
      state.arrowAngleIndex = resultIndex;
      return;
    }

    state.arrowAngleIndex += angleIndexStep;
    drawAll(name, state.arrowAngleIndex);
    state.lastAnimationId = window.requestAnimationFrame(animateArrow);
  };

  cancelAnimationFrame(state.lastAnimationId);
  state.lastAnimationId = window.requestAnimationFrame(animateArrow);
};
