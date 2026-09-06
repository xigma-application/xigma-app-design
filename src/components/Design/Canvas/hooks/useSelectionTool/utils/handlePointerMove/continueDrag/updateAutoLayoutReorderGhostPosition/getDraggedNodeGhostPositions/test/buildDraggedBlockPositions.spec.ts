// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { buildDraggedBlockPositions } from '../buildDraggedBlockPositions';

const node = (id: string, x: number, y: number): TSceneNode =>
  ({ height: 20, id, rotation: 0, type: NodeType.rectangle, width: 20, x, y }) as unknown as TSceneNode;

describe('buildDraggedBlockPositions', () => {
  it('should place a node with a resolved offset relative to the grabbed ghost', () => {
    // mock
    const nodes = [node('c', 0, 100), node('d', 100, 100)];
    const offsets = { c: { x: 0, y: 0 }, d: { x: 100, y: 0 } };

    // before
    const positions = buildDraggedBlockPositions(nodes, offsets, { x: 5, y: 205 }, 5, 105);

    // result
    expect(positions).toEqual({ c: { x: 5, y: 205 }, d: { x: 105, y: 205 } });
  });

  it('should fall back to cursor-tracking for a node with no resolved offset', () => {
    // mock
    const nodes = [node('x', 300, 300)];

    // before
    const positions = buildDraggedBlockPositions(nodes, {}, { x: 0, y: 0 }, 5, 5);

    // result
    expect(positions).toEqual({ x: { x: 305, y: 305 } });
  });
});
