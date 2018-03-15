import { findPitch } from 'pitchy';
import findNote from './findNote';

const noteElement = document.querySelector('.tuner-note');
const pointerElement = document.querySelector('.pointer');

const renderNote = ({ note, offset, octave }) => {
  pointerElement.style.top = `${100 - ( offset + 50)}%`;
  noteElement.innerHTML = note + octave;
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
      if (clarity > 0.8) {
        renderNote(findNote(pitch));
      }
    }, 300);
  })
  .catch(err => console.log(err));
