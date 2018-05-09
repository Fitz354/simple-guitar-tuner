const tunings = require('../src/js/tunings');

it('chromatic', () => {
  expect(tunings.chromatic.parse(27.5)).toEqual({ name: 'A', octave: 0, cents: 0 });
  expect(tunings.chromatic.parse(150)).toEqual({ name: 'D', octave: 3, cents: 37 });
});

it('standard', () => {
  expect(tunings.standard.parse(20)).toBeFalsy();
  expect(tunings.standard.parse(27.5)).toEqual({ name: 'E', octave: 2, cents: -50 });
  expect(tunings.standard.parse(82.41)).toEqual({ name: 'E', octave: 2, cents: 0 });
  expect(tunings.standard.parse(83)).toEqual({ name: 'E', octave: 2, cents: 12 });
  expect(tunings.standard.parse(85)).toEqual({ name: 'E', octave: 2, cents: 50 });
  expect(tunings.standard.parse(100)).toEqual({ name: 'A', octave: 2, cents: -50 });
  expect(tunings.standard.parse(110)).toEqual({ name: 'A', octave: 2, cents: 0 });
  expect(tunings.standard.parse(350)).toEqual({ name: 'E', octave: 4, cents: 50 });
});
