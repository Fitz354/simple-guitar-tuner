import { findPitch } from 'pitchy';
import getNoteFromPitch from './getNoteFromPitch';
import render from './render';

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
      if (clarity > 0.9 && pitch > 50) {
        // pitch |> getNoteFromPitch |> render;
        const note = getNoteFromPitch(pitch);
        render(note);
      }
    }, 100);
  });
