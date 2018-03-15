import { findPitch } from 'pitchy';
import findNote from './findNote';

const renderNote = (note, cents) => {

};

navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    const context = new AudioContext();
    const analyser = context.createAnalyser();
    const source = context.createMediaStreamSource(stream);
    const destination = context.createMediaStreamDestination()
    source.connect(analyser).connect(destination);

    analyser.fftSize = 2048;
    const data = new Float32Array(analyser.fftSize);
    
    setInterval(() => {
      analyser.getFloatTimeDomainData(data);
      const [pitch, clarity] = findPitch(data, context.sampleRate);
      if (clarity > 0.9) {
        findNote(pitch);
      }
    }, 300);
  })
  .catch(err => console.log(err));
