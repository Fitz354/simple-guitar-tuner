import { getPitchFromNote, getNoteFromPitch } from './сonverters';

const standardTuning = [
  { name: 'E', octave: 2 },
  { name: 'A', octave: 2 },
  { name: 'D', octave: 3 },
  { name: 'G', octave: 3 },
  { name: 'B', octave: 3 },
  { name: 'E', octave: 4 },
];

const getParser = (notes) => {
  const tuning = notes.map(item => ({ ...item, pitch: getPitchFromNote(item) }));

  return (pitch) => {
    const note = getNoteFromPitch(pitch);
    if (!note) {
      return false;
    }

    if (tuning.some(({ name, octave }) => note.name === name && note.octave === octave)) {
      return note;
    }

    let lowerOffset = -Infinity;

    const { name, octave } = tuning.reduce((acc, item) => {
      const offset = pitch - item.pitch;
      if (Math.abs(offset) < Math.abs(lowerOffset)) {
        lowerOffset = offset;
        return item;
      }

      return acc;
    }, {});

    return { name, octave, cents: (lowerOffset < 0 ? -50 : 50) };
  };
};

export const chromatic = {
  name: 'Chromatic',
  parse: pitch => getNoteFromPitch(pitch),
};

export const standard = {
  name: 'Standard',
  parse: getParser(standardTuning),
};
