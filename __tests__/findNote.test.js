const findNote = require('../js/findNote');

it('60', () => expect(findNote(60)).toEqual({ note: 'B', offset: -49, octave: 1 }));

it('72', () => expect(findNote(72)).toEqual({ note: 'D', offset: -34, octave: 1 }));

it('100', () => expect(findNote(100)).toEqual({ note: 'G', offset: 35, octave: 1 }));

it('108', () => expect(findNote(108)).toEqual({ note: 'A', offset: -32, octave: 2 }));

it('110', () => expect(findNote(110)).toEqual({ note: 'A', offset: 0, octave: 2 }));

it('115', () => expect(findNote(115)).toEqual({ note: 'A#', offset: -23, octave: 2 }));

it('120', () => expect(findNote(120)).toEqual({ note: 'B', offset: -49, octave: 2 }));

it('130', () => expect(findNote(130)).toEqual({ note: 'C', offset: -11, octave: 2 }));

it('140', () => expect(findNote(140)).toEqual({ note: 'C#', offset: 18, octave: 2 }));

it('150', () => expect(findNote(150)).toEqual({ note: 'D', offset: 37, octave: 2 }));

it('200', () => expect(findNote(200)).toEqual({ note: 'G', offset: 35, octave: 2 }));

it('210', () => expect(findNote(210)).toEqual({ note: 'G#', offset: 19, octave: 2 }));

it('218', () => expect(findNote(218)).toEqual({ note: 'A', offset: -16, octave: 3 }));

it('225', () => expect(findNote(225)).toEqual({ note: 'A', offset: 39, octave: 3 }));

it('250', () => expect(findNote(250)).toEqual({ note: 'B', offset: 21, octave: 3 }));

it('270', () => expect(findNote(270)).toEqual({ note: 'C#', offset: -45, octave: 3 }));

it('296', () => expect(findNote(296)).toEqual({ note: 'D', offset: 14, octave: 3 }));

it('315', () => expect(findNote(315)).toEqual({ note: 'D#', offset: 21, octave: 3 }));

it('340', () => expect(findNote(340)).toEqual({ note: 'F', offset: -46, octave: 3 }));

it('440', () => expect(findNote(440)).toEqual({ note: 'A', offset: 0, octave: 4 }));