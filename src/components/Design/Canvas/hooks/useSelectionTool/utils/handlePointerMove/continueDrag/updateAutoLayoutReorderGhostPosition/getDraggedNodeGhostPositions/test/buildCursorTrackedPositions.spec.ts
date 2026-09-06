// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { buildCursorTrackedPositions } from '../buildCursorTrackedPositions';

const node = (id: string, x: number, y: number): TSceneNode =>
  ({ height: 20, id, rotation: 0, type: NodeType.rectangle, width: 20, x, y }) as unknown as TSceneNode;

describe('buildCursorTrackedPositions', () => {
  it('should map every node to its bounds translated by the drag delta', () => {
    // mock
    const nodes = [node('a', 10, 20), node('b', 30, 40)];

    // before
    const positions = buildCursorTrackedPositions(nodes, 5, -3);

    // result
    expect(positions).toEqual({ a: { x: 15, y: 17 }, b: { x: 35, y: 37 } });
  });

  it('should return an empty map for an empty selection', () => {
    // before
    const positions = buildCursorTrackedPositions([], 5, 5);

    // result
    expect(positions).toEqual({});
  });
});
