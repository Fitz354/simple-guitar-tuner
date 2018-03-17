const notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];

module.exports = (pitch) => {
  const result = (12 * Math.log2(pitch / 440)) + 48;
  const noteIndex = Math.abs(Math.round(result) % 12);
  const name = notes[noteIndex];
  const cents = Math.round((result * 100) - (Math.round(result) * 100));
  const octave = Math.floor(result / 12) + (noteIndex === 0 && cents < 0 ? 1 : 0);

  return { name, cents, octave };
};
