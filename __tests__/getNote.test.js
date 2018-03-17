const getNote = require('../src/js/getNoteFromPitch');

it('60', () => expect(getNote(60)).toEqual({ note: 'B', offset: -49, octave: 1 }));

it('72', () => expect(getNote(72)).toEqual({ note: 'D', offset: -34, octave: 1 }));

it('100', () => expect(getNote(100)).toEqual({ note: 'G', offset: 35, octave: 1 }));

it('108', () => expect(getNote(108)).toEqual({ note: 'A', offset: -32, octave: 2 }));

it('110', () => expect(getNote(110)).toEqual({ note: 'A', offset: 0, octave: 2 }));

it('115', () => expect(getNote(115)).toEqual({ note: 'A#', offset: -23, octave: 2 }));

it('120', () => expect(getNote(120)).toEqual({ note: 'B', offset: -49, octave: 2 }));

it('130', () => expect(getNote(130)).toEqual({ note: 'C', offset: -11, octave: 2 }));

it('140', () => expect(getNote(140)).toEqual({ note: 'C#', offset: 18, octave: 2 }));

it('150', () => expect(getNote(150)).toEqual({ note: 'D', offset: 37, octave: 2 }));

it('200', () => expect(getNote(200)).toEqual({ note: 'G', offset: 35, octave: 2 }));

it('210', () => expect(getNote(210)).toEqual({ note: 'G#', offset: 19, octave: 2 }));

it('218', () => expect(getNote(218)).toEqual({ note: 'A', offset: -16, octave: 3 }));

it('225', () => expect(getNote(225)).toEqual({ note: 'A', offset: 39, octave: 3 }));

it('250', () => expect(getNote(250)).toEqual({ note: 'B', offset: 21, octave: 3 }));

it('270', () => expect(getNote(270)).toEqual({ note: 'C#', offset: -45, octave: 3 }));

it('296', () => expect(getNote(296)).toEqual({ note: 'D', offset: 14, octave: 3 }));

it('315', () => expect(getNote(315)).toEqual({ note: 'D#', offset: 21, octave: 3 }));

it('340', () => expect(getNote(340)).toEqual({ note: 'F', offset: -46, octave: 3 }));

it('440', () => expect(getNote(440)).toEqual({ note: 'A', offset: 0, octave: 4 }));
