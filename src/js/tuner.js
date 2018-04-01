import { findPitch } from 'pitchy';
import * as tunings from './tunings';
import render from './render';

let { parse } = tunings.chromatic;

const selectElement = document.querySelector('.tunings');
selectElement.innerHTML =
  `<select>${Object.keys(tunings).map(key => `<option value=${key}>${tunings[key].name}</option>`).join('')}</select>`;
selectElement.addEventListener('change', () => {
  ({ parse } = tunings[selectElement.value]);
});

render({ cents: -50 });

window.navigator.mediaDevices.getUserMedia({ audio: true })
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

      if (clarity > 0.9) {
        render(parse(pitch));
      }
    }, 100);
  });
