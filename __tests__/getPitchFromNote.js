const { getPitchFromNote } = require('../src/js/сonverters');

it('noteToPitch', () => {
  expect(getPitchFromNote({ name: 'E', octave: 2 })).toBe(82.41);
  expect(getPitchFromNote({ name: 'A', octave: 2 })).toBe(110);
  expect(getPitchFromNote({ name: 'D', octave: 3 })).toBe(146.83);
  expect(getPitchFromNote({ name: 'G', octave: 3 })).toBe(196);
  expect(getPitchFromNote({ name: 'B', octave: 3 })).toBe(246.94);
  expect(getPitchFromNote({ name: 'E', octave: 4 })).toBe(329.63);
});
