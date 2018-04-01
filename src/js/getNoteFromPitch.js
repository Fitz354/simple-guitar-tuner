const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const baseFrequency = 440;
const notesNumber = notes.length;
const frequencyRange = {
  min: 27.5,
  max: 1318.5,
};

module.exports = (pitch) => {
  if (pitch < frequencyRange.min || pitch > frequencyRange.max) {
    return false;
  }

  const result = (notesNumber * Math.log2(pitch / baseFrequency)) + ((notesNumber * 4) + 9);
  const noteIndex = Math.abs(Math.round(result) % notesNumber);

  const name = notes[noteIndex];
  const cents = Math.round((result - Math.round(result)) * 100);
  const octave = Math.floor(result / notesNumber) + (noteIndex === 0 && cents < 0 ? 1 : 0);

  return { name, cents, octave };
};
