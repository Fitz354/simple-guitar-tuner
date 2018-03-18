import { findPitch } from 'pitchy';
import getNoteFromPitch from './getNoteFromPitch';
import drawScale from './drawScale';

const lightsElements = document.querySelectorAll('.lightbulb');

const renderLightbulbs = offsetClass =>
  lightsElements.forEach(({ classList }) => {
    if (classList.contains(offsetClass)) {
      classList.add('active');
      return;
    }
    classList.remove('active');
  });

const renderNote = ({ name, cents, octave }) => {
  let lightbulbType = '';

  if (cents >= -5 && cents <= 5) {
    lightbulbType = 'normal';
  } else if (cents > 5) {
    lightbulbType = 'dies';
  } else {
    lightbulbType = 'bemole';
  }

  drawScale(`${name}${octave}`, cents);
  renderLightbulbs(`lightbulb-${lightbulbType}`);
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

drawScale('', 0);
