import { findPitch } from 'pitchy';
import findNote from './findNote';

const noteElement = document.querySelector('.note');
const pointerElement = document.querySelector('.pointer');
const lightsElements = [...document.querySelectorAll('.light')];

const renderLights = offsetClass =>
  lightsElements.forEach(({ style, classList }) => {
    style.opacity = (classList.contains(offsetClass) ? 1 : 0.3);
  });

const renderNote = ({ note, offset, octave }) => {
  const pointerAngle = (offset * 90) / 50;
  pointerElement.style.transform =
    `translate(-50%, -50%) rotate(${pointerAngle}deg)`;
  noteElement.innerHTML = note + octave;

  if (offset >= -5 && offset <= 5) {
    renderLights('light-normal');
  } else if (offset > 5) {
    renderLights('light-dies');
  } else {
    renderLights('light-bemole');
  }
};

const drawScale = () => {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'green';
  ctx.beginPath();
  ctx.arc(150, 150, 150, 0, Math.PI, true);
  ctx.stroke();
};

navigator.mediaDevices.getUserMedia({ audio: true })
  .then((stream) => {
    const context = new AudioContext();
    const source = context.createMediaStreamSource(stream);

    const analyser = context.createAnalyser();
    analyser.fftSize = 2048;
    const data = new Float32Array(analyser.fftSize);

    const destination = context.createMediaStreamDestination();

    source.connect(analyser).connect(destination);

    setInterval(() => {
      analyser.getFloatTimeDomainData(data);
      const [pitch, clarity] = findPitch(data, context.sampleRate);
      if (clarity > 0.9 && pitch > 50) {
        renderNote(findNote(pitch));
      }
    }, 300);
  })
  .catch(err => console.log(err));

drawScale();
