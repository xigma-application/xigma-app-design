// types
import { TPlanarVectorNetwork } from '../../../planarizeVectorNetwork/types';

// utils
import { filterKeptSegments } from '../filterKeptSegments';

const CAPSULE_POLYGON = [
  { x: 0, y: 0 },
  { x: 10, y: 0 },
  { x: 10, y: 10 },
  { x: 0, y: 10 },
];
const FILL_POLYGON = [
  { x: 0, y: 0 },
  { x: 20, y: 0 },
  { x: 20, y: 20 },
  { x: 0, y: 20 },
];

describe('filterKeptSegments', () => {
  it('should keep an original piece whose midpoint lies outside the capsule', () => {
    // mock — a piece entirely to the left of the capsule
    const planar: TPlanarVectorNetwork = {
      segments: { orig1: { endId: 'b', id: 'orig1', startId: 'a', tangentEnd: null, tangentStart: null } },
      vertices: { a: { id: 'a', x: -5, y: 5 }, b: { id: 'b', x: -1, y: 5 } },
    };

    // result
    const { droppedOriginalPiece, keptSegments } = filterKeptSegments(planar, new Set(), CAPSULE_POLYGON, [
      { key: 'fill1', polygon: FILL_POLYGON },
    ]);

    expect(keptSegments).toHaveProperty('orig1');
    expect(droppedOriginalPiece).toBe(false);
  });

  it('should drop an original piece whose midpoint falls inside the capsule', () => {
    // mock — a piece straight through the middle of the capsule
    const planar: TPlanarVectorNetwork = {
      segments: { orig1: { endId: 'b', id: 'orig1', startId: 'a', tangentEnd: null, tangentStart: null } },
      vertices: { a: { id: 'a', x: 2, y: 5 }, b: { id: 'b', x: 8, y: 5 } },
    };

    // result
    const { droppedOriginalPiece, keptSegments } = filterKeptSegments(planar, new Set(), CAPSULE_POLYGON, [
      { key: 'fill1', polygon: FILL_POLYGON },
    ]);

    expect(keptSegments).not.toHaveProperty('orig1');
    expect(droppedOriginalPiece).toBe(true);
  });

  it('should keep a capsule piece whose midpoint falls inside an original filled face', () => {
    // mock
    const planar: TPlanarVectorNetwork = {
      segments: { cap1: { endId: 'y', id: 'cap1', startId: 'x', tangentEnd: null, tangentStart: null } },
      vertices: { x: { id: 'x', x: 2, y: 5 }, y: { id: 'y', x: 8, y: 5 } },
    };

    // result
    const { keptCapsulePiece, keptSegments } = filterKeptSegments(planar, new Set(['cap1']), CAPSULE_POLYGON, [
      { key: 'fill1', polygon: FILL_POLYGON },
    ]);

    expect(keptSegments).toHaveProperty('cap1');
    expect(keptCapsulePiece).toBe(true);
  });

  it('should drop a capsule piece whose midpoint falls outside every original filled face', () => {
    // mock — well outside the fill polygon
    const planar: TPlanarVectorNetwork = {
      segments: { cap1: { endId: 'y', id: 'cap1', startId: 'x', tangentEnd: null, tangentStart: null } },
      vertices: { x: { id: 'x', x: 40, y: 40 }, y: { id: 'y', x: 50, y: 50 } },
    };

    // result
    const { keptCapsulePiece, keptSegments } = filterKeptSegments(planar, new Set(['cap1']), CAPSULE_POLYGON, [
      { key: 'fill1', polygon: FILL_POLYGON },
    ]);

    expect(keptSegments).not.toHaveProperty('cap1');
    expect(keptCapsulePiece).toBe(false);
  });

  it('should recognise a split capsule piece by its pre-`#` real id', () => {
    // mock — `cap1#0` is a piece of `cap1` produced by planarization's crossing split
    const planar: TPlanarVectorNetwork = {
      segments: { 'cap1#0': { endId: 'y', id: 'cap1#0', startId: 'x', tangentEnd: null, tangentStart: null } },
      vertices: { x: { id: 'x', x: 2, y: 5 }, y: { id: 'y', x: 8, y: 5 } },
    };

    // result
    const { keptSegments } = filterKeptSegments(planar, new Set(['cap1']), CAPSULE_POLYGON, [{ key: 'fill1', polygon: FILL_POLYGON }]);

    expect(keptSegments).toHaveProperty('cap1#0');
  });
});
