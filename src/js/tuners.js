import getNoteFromPitch from './getNoteFromPitch';

const standartTuning = [
  { name: 'E', octave: 2, pitch: 82.41 },
  { name: 'A', octave: 2, pitch: 110 },
  { name: 'D', octave: 3, pitch: 146.83 },
  { name: 'G', octave: 3, pitch: 196 },
  { name: 'B', octave: 3, pitch: 246.94 },
  { name: 'E', octave: 4, pitch: 329.63 },
];

const getTuner = tune => (pitch) => {
  const note = getNoteFromPitch(pitch);
  if (!note) {
    return false;
  }

  if (tune.some(({ name, octave }) => note.name === name && note.octave === octave)) {
    return note;
  }

  let lowerOffset = -Infinity;

  const { name, octave } = tune.reduce((acc, item) => {
    const offset = pitch - item.pitch;
    if (Math.abs(offset) < Math.abs(lowerOffset)) {
      lowerOffset = offset;
      return item;
    }

    return acc;
  }, {});

  return { name, octave, cents: (lowerOffset < 0 ? -50 : 50) };
};

export const chromatic = pitch => getNoteFromPitch(pitch);

export const standart = getTuner(standartTuning);
