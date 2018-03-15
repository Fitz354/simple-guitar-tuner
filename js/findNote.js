const notes = ['A', 'A#', 'B', 'C', 'C#','D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];

module.exports = freq => {
  const result = 12 * Math.log2(freq / 440) + 48;
  const noteNumber = Math.abs(Math.round(result) % 12);
  const note = notes[noteNumber];
  const offset = Math.round(result * 100 - Math.round(result) * 100);
  const octave = Math.floor(result / 12) + (noteNumber === 0 && offset < 0 ? 1 : 0);

  return { note, offset, octave };
};