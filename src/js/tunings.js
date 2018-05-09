import { getPitchFromNote, getNoteFromPitch } from './сonverters';

const mapStrings = item => ({ ...item, pitch: getPitchFromNote(item) });

const parse = function parse(pitch) {
  const note = getNoteFromPitch(pitch);
  if (!note) {
    return false;
  }

  if (this.strings.some(({ name, octave }) => note.name === name && note.octave === octave)) {
    return note;
  }

  let lowerOffset = -Infinity;

  const { name, octave } = this.strings.reduce((acc, item) => {
    const offset = pitch - item.pitch;
    if (Math.abs(offset) < Math.abs(lowerOffset)) {
      lowerOffset = offset;
      return item;
    }

    return acc;
  }, {});

  return { name, octave, cents: (lowerOffset < 0 ? -50 : 50) };
};

export const chromatic = {
  name: 'Chromatic',
  parse: pitch => getNoteFromPitch(pitch),
};

export const standard = {
  name: 'Standard',
  strings: [
    { name: 'E', octave: 2 },
    { name: 'A', octave: 2 },
    { name: 'D', octave: 3 },
    { name: 'G', octave: 3 },
    { name: 'B', octave: 3 },
    { name: 'E', octave: 4 },
  ].map(mapStrings),
  parse,
};

export const openC = {
  name: 'Open C',
  strings: [
    { name: 'C', octave: 2 },
    { name: 'G', octave: 2 },
    { name: 'C', octave: 3 },
    { name: 'G', octave: 3 },
    { name: 'C', octave: 4 },
    { name: 'E', octave: 4 },
  ].map(mapStrings),
  parse,
};

export const openD = {
  name: 'Open D',
  strings: [
    { name: 'D', octave: 2 },
    { name: 'A', octave: 2 },
    { name: 'D', octave: 3 },
    { name: 'F#', octave: 3 },
    { name: 'A', octave: 3 },
    { name: 'D', octave: 4 },
  ].map(mapStrings),
  parse,
};

export const openG = {
  name: 'Open G',
  strings: [
    { name: 'D', octave: 2 },
    { name: 'G', octave: 2 },
    { name: 'D', octave: 3 },
    { name: 'G', octave: 3 },
    { name: 'B', octave: 3 },
    { name: 'D', octave: 4 },
  ].map(mapStrings),
  parse,
};

export const dropD = {
  name: 'Drop D',
  strings: [
    { name: 'D', octave: 2 },
    { name: 'A', octave: 2 },
    { name: 'D', octave: 3 },
    { name: 'G', octave: 3 },
    { name: 'B', octave: 3 },
    { name: 'E', octave: 4 },
  ].map(mapStrings),
  parse,
};

export const dropC = {
  name: 'Drop C',
  strings: [
    { name: 'C', octave: 2 },
    { name: 'G', octave: 2 },
    { name: 'C', octave: 3 },
    { name: 'F', octave: 3 },
    { name: 'A', octave: 3 },
    { name: 'D', octave: 4 },
  ].map(mapStrings),
  parse,
};

export const ukulele = {
  name: 'Ukulele',
  strings: [
    { name: 'G', octave: 4 },
    { name: 'C', octave: 4 },
    { name: 'E', octave: 4 },
    { name: 'A', octave: 4 },
  ].map(mapStrings),
  parse,
};
