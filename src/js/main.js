import { findPitch } from 'pitchy';
import getNoteFromPitch from './getNoteFromPitch';
import render from './render';

// const standartTune = [
//   { note: 'E', octave: 2, pitch: 82.41 },
//   { note: 'A', octave: 2, pitch: 110 },
//   { note: 'D', octave: 3, pitch: 146.83 },
//   { note: 'G', octave: 3, pitch: 196 },
//   { note: 'B', octave: 3, pitch: 246.94 },
//   { note: 'E', octave: 4, pitch: 329.63 },
// ];

render({ cents: -50 });

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
      const note = getNoteFromPitch(pitch);

      if (clarity > 0.9 && note) {
        render(note);
      }
    }, 100);
  });
