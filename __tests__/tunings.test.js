const tunings = require('../src/js/tunings');

it('chromatic', () => {
  const { parse } = tunings.chromatic;

  expect(parse(27.5)).toEqual({ name: 'A', octave: 0, cents: 0 });
  expect(parse(150)).toEqual({ name: 'D', octave: 3, cents: 37 });
});

it('standard', () => {
  const { parse } = tunings.standard;
  expect(parse(20)).toBeFalsy();
  expect(parse(27.5)).toEqual({ name: 'E', octave: 2, cents: -50 });
  expect(parse(82.41)).toEqual({ name: 'E', octave: 2, cents: 0 });
  expect(parse(83)).toEqual({ name: 'E', octave: 2, cents: 12 });
  expect(parse(85)).toEqual({ name: 'E', octave: 2, cents: 50 });
  expect(parse(100)).toEqual({ name: 'A', octave: 2, cents: -50 });
  expect(parse(110)).toEqual({ name: 'A', octave: 2, cents: 0 });
  expect(parse(350)).toEqual({ name: 'E', octave: 4, cents: 50 });
});
