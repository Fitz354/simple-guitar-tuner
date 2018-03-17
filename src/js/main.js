import { findPitch } from 'pitchy';
import getNoteFromPitch from './getNoteFromPitch';
import drawScale from './drawScale';

const noteElement = document.querySelector('.note');
const lightsElements = document.querySelectorAll('.light');

const renderLights = offsetClass =>
  lightsElements.forEach(({ style, classList }) => {
    style.opacity = (classList.contains(offsetClass) ? 1 : 0.3); // eslint-disable-line
  });

const renderNote = ({ name, cents, octave }) => {
  drawScale(cents);
  noteElement.innerHTML = `${name}${octave}`;

  if (cents >= -5 && cents <= 5) {
    renderLights('light-normal');
  } else if (cents > 5) {
    renderLights('light-dies');
  } else {
    renderLights('light-bemole');
  }
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
        renderNote(getNoteFromPitch(pitch));
      }
    }, 300);
  });

drawScale(0);
