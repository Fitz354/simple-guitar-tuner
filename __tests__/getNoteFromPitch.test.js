const getNote = require('../src/js/сonverters').getNoteFromPitch;

it('27,4', () => expect(getNote(27.4)).toBeFalsy());

it('27.5', () => expect(getNote(27.5)).toEqual({ name: 'A', cents: 0, octave: 0 }));

it('60', () => expect(getNote(60)).toEqual({ name: 'B', cents: -49, octave: 1 }));

it('72', () => expect(getNote(72)).toEqual({ name: 'D', cents: -34, octave: 2 }));

it('100', () => expect(getNote(100)).toEqual({ name: 'G', cents: 35, octave: 2 }));

it('108', () => expect(getNote(108)).toEqual({ name: 'A', cents: -32, octave: 2 }));

it('110', () => expect(getNote(110)).toEqual({ name: 'A', cents: 0, octave: 2 }));

it('115', () => expect(getNote(115)).toEqual({ name: 'A#', cents: -23, octave: 2 }));

it('120', () => expect(getNote(120)).toEqual({ name: 'B', cents: -49, octave: 2 }));

it('130', () => expect(getNote(130)).toEqual({ name: 'C', cents: -11, octave: 3 }));

it('140', () => expect(getNote(140)).toEqual({ name: 'C#', cents: 18, octave: 3 }));

it('150', () => expect(getNote(150)).toEqual({ name: 'D', cents: 37, octave: 3 }));

it('200', () => expect(getNote(200)).toEqual({ name: 'G', cents: 35, octave: 3 }));

it('210', () => expect(getNote(210)).toEqual({ name: 'G#', cents: 19, octave: 3 }));

it('218', () => expect(getNote(218)).toEqual({ name: 'A', cents: -16, octave: 3 }));

it('225', () => expect(getNote(225)).toEqual({ name: 'A', cents: 39, octave: 3 }));

it('250', () => expect(getNote(250)).toEqual({ name: 'B', cents: 21, octave: 3 }));

it('270', () => expect(getNote(270)).toEqual({ name: 'C#', cents: -45, octave: 4 }));

it('296', () => expect(getNote(296)).toEqual({ name: 'D', cents: 14, octave: 4 }));

it('315', () => expect(getNote(315)).toEqual({ name: 'D#', cents: 21, octave: 4 }));

it('340', () => expect(getNote(340)).toEqual({ name: 'F', cents: -46, octave: 4 }));

it('440', () => expect(getNote(440)).toEqual({ name: 'A', cents: 0, octave: 4 }));

it('450', () => expect(getNote(450)).toEqual({ name: 'A', cents: 39, octave: 4 }));

it('1318.6', () => expect(getNote(1318.6)).toBeFalsy());
