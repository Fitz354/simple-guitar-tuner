import { findPitch } from 'pitchy';
import * as tuners from './tuners';
import render from './render';

const getNote = tuners.standart;

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
      const note = getNote(pitch);

      if (clarity > 0.9 && note) {
        render(note);
      }
    }, 100);
  });
