// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { buildBlockMemberTargetOffsets } from '../buildBlockMemberTargetOffsets';

const F0 = { x: 0, y: 200 };
const F1 = { x: 100, y: 200 };

const node = (id: string): TSceneNode =>
  ({ height: 20, id, rotation: 0, type: NodeType.rectangle, width: 20, x: 0, y: 0 }) as unknown as TSceneNode;

describe('buildBlockMemberTargetOffsets', () => {
  it('should build one offset per selected node that owns a footprint slot', () => {
    // mock — 'x' is selected but has no slot
    const nodes = [node('c'), node('d'), node('x')];
    const slots = { c: F0, d: F1 };

    // before — cursor is over the grabbed member’s own slot
    const offsets = buildBlockMemberTargetOffsets(nodes, slots, 'c', 'c', F0, F0);

    // result — grabbed 'c' gets a zero offset, companion 'd' keeps its own slot, 'x' is skipped
    expect(offsets).toEqual({ c: { x: 0, y: 0 }, d: { x: 100, y: 0 } });
  });

  it('should send a companion into the grabbed member’s slot when the cursor is over the companion’s slot', () => {
    // mock
    const nodes = [node('c'), node('d')];
    const slots = { c: F0, d: F1 };

    // before — cursor is over 'd'’s slot, so 'd' takes 'c'’s vacated slot
    const offsets = buildBlockMemberTargetOffsets(nodes, slots, 'c', 'd', F1, F0);

    // result
    expect(offsets).toEqual({ c: { x: 0, y: 0 }, d: { x: -100, y: 0 } });
  });

  it('should return an empty map when no selected node owns a slot', () => {
    // before
    const offsets = buildBlockMemberTargetOffsets([node('x')], { c: F0 }, 'c', 'c', F0, F0);

    // result
    expect(offsets).toEqual({});
  });
});
