// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getSmartSelectionSwapHandleAtPoint } from '../getSmartSelectionSwapHandleAtPoint';

const VIEWPORT = { x: 0, y: 0, zoom: 1 };

const rect = (id: string, x: number, y: number, width = 50, height = 50): TSceneNode =>
  ({ fill: '#000', height, id, name: 'Rectangle', parentId: null, rotation: 0, type: NodeType.rectangle, width, x, y }) as TSceneNode;

describe('getSmartSelectionSwapHandleAtPoint', () => {
  it('should return null when the selection has no valid layout', () => {
    expect(getSmartSelectionSwapHandleAtPoint({ x: 25, y: 25 }, [rect('a', 0, 0)], VIEWPORT)).toBeNull();
  });

  it("should hit a node's swap handle at that node's centre and report its slot index", () => {
    const nodes = [rect('a', 0, 0), rect('b', 100, 0)];

    expect(getSmartSelectionSwapHandleAtPoint({ x: 26, y: 24 }, nodes, VIEWPORT)).toMatchObject({ center: { x: 25, y: 25 }, index: 0 });
    expect(getSmartSelectionSwapHandleAtPoint({ x: 125, y: 25 }, nodes, VIEWPORT)).toMatchObject({ center: { x: 125, y: 25 }, index: 1 });
  });

  it('should miss when the point is farther than the hit radius from every node centre', () => {
    const nodes = [rect('a', 0, 0), rect('b', 100, 0)];

    expect(getSmartSelectionSwapHandleAtPoint({ x: 75, y: 25 }, nodes, VIEWPORT)).toBeNull();
  });

  it('should scale the hit radius down with zoom', () => {
    const nodes = [rect('a', 0, 0), rect('b', 100, 0)];

    // 3px away in world units — inside the 5px radius at zoom 1, outside it at zoom 4 (1.25px)
    expect(getSmartSelectionSwapHandleAtPoint({ x: 28, y: 25 }, nodes, VIEWPORT)).toMatchObject({ center: { x: 25, y: 25 } });
    expect(getSmartSelectionSwapHandleAtPoint({ x: 28, y: 25 }, nodes, { x: 0, y: 0, zoom: 4 })).toBeNull();
  });
});
