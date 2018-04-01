const tuners = require('../src/js/tuners');

it('chromatic', () => {
  const { chromatic } = tuners;

  expect(chromatic(27.5)).toEqual({ name: 'A', octave: 0, cents: 0 });
  expect(chromatic(150)).toEqual({ name: 'D', octave: 3, cents: 37 });
});

it('standart', () => {
  const { standart } = tuners;
  expect(standart(20)).toBeFalsy();
  expect(standart(27.5)).toEqual({ name: 'E', octave: 2, cents: -50 });
  expect(standart(82.41)).toEqual({ name: 'E', octave: 2, cents: 0 });
  expect(standart(83)).toEqual({ name: 'E', octave: 2, cents: 12 });
  expect(standart(85)).toEqual({ name: 'E', octave: 2, cents: 50 });
  expect(standart(100)).toEqual({ name: 'A', octave: 2, cents: -50 });
  expect(standart(110)).toEqual({ name: 'A', octave: 2, cents: 0 });
  expect(standart(350)).toEqual({ name: 'E', octave: 4, cents: 50 });
});
