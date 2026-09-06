// types
import { TSceneNode } from 'types/design/types';

// utils
import { buildContiguousMemberOffsets } from '../buildContiguousMemberOffsets';

const node = (id: string): TSceneNode => ({ id }) as TSceneNode;

describe('buildContiguousMemberOffsets', () => {
  it('offsets every member off the grabbed member, straight from the recorded contiguous slots', () => {
    const slots = { a: { x: 0, y: 0 }, b: { x: 110, y: 0 }, c: { x: 220, y: 0 } };

    // grabbed 'b' → 'a' is one step back, 'c' one step forward
    expect(buildContiguousMemberOffsets([node('a'), node('b'), node('c')], slots, 'b')).toEqual({
      a: { x: -110, y: 0 },
      b: { x: 0, y: 0 },
      c: { x: 110, y: 0 },
    });
  });

  it('skips selected nodes that have no recorded slot', () => {
    const slots = { a: { x: 0, y: 0 }, b: { x: 100, y: 0 } };

    expect(buildContiguousMemberOffsets([node('a'), node('b'), node('x')], slots, 'a')).toEqual({
      a: { x: 0, y: 0 },
      b: { x: 100, y: 0 },
    });
  });
});
