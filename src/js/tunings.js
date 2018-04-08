import { getPitchFromNote, getNoteFromPitch } from './сonverters';

const standardStrings = [
  { name: 'E', octave: 2 },
  { name: 'A', octave: 2 },
  { name: 'D', octave: 3 },
  { name: 'G', octave: 3 },
  { name: 'B', octave: 3 },
  { name: 'E', octave: 4 },
];

const ukuleleStrings = [
  { name: 'G', octave: 4 },
  { name: 'C', octave: 4 },
  { name: 'E', octave: 4 },
  { name: 'A', octave: 4 },
];

const getParser = (stringsList) => {
  const strings = stringsList.map(item => ({ ...item, pitch: getPitchFromNote(item) }));

  return (pitch) => {
    const note = getNoteFromPitch(pitch);
    if (!note) {
      return false;
    }

    if (strings.some(({ name, octave }) => note.name === name && note.octave === octave)) {
      return note;
    }

    let lowerOffset = -Infinity;

    const { name, octave } = strings.reduce((acc, item) => {
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
  strings: standardStrings,
  parse: getParser(standardStrings),
};

export const ukulele = {
  name: 'Ukulele',
  strings: ukuleleStrings,
  parse: getParser(ukuleleStrings),
};
