import { findPitch } from 'pitchy';
import * as tunings from './tunings';
import render from './render';

const tuningSelectElement = document.querySelector('.tunings-list');
const stringsListElement = document.querySelector('.strings');

const defaultTuning = 'standard';
let activeTuning = tunings[defaultTuning];

tuningSelectElement.innerHTML = Object.keys(tunings)
  .map(key => `<option value=${key} ${key === defaultTuning && 'selected'}>${tunings[key].name}</option>`)
  .join('');

const handleTuningChange = () => {
  activeTuning = tunings[tuningSelectElement.value];
  if (!activeTuning.strings) {
    stringsListElement.innerHTML = '';
    return;
  }

  stringsListElement.innerHTML = activeTuning.strings
    .map(({ name, octave }) =>
      `<div class="strings-item" data-note="${name + octave}">
        <div class="string-lightbulb"></div>
        <span class="string-name">${name + octave}</span>
      </div>`)
    .join('');
};
handleTuningChange();
tuningSelectElement.addEventListener('change', handleTuningChange);
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
        render(activeTuning.parse(pitch));
      }
    }, 100);
  });
