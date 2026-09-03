// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getSmartSelectionGapHandleAtPoint } from '../getSmartSelectionGapHandleAtPoint';

const VIEWPORT = { x: 0, y: 0, zoom: 1 };

const rect = (id: string, x: number, y: number, width = 50, height = 50): TSceneNode =>
  ({ fill: '#000', height, id, name: 'Rectangle', parentId: null, rotation: 0, type: NodeType.rectangle, width, x, y }) as TSceneNode;

describe('getSmartSelectionGapHandleAtPoint', () => {
  it('should return null when the selection has no valid layout', () => {
    expect(getSmartSelectionGapHandleAtPoint({ x: 0, y: 0 }, [rect('a', 0, 0)], VIEWPORT)).toBeNull();
  });

  it("should hit a row's gap handle with axis x", () => {
    const nodes = [rect('a', 0, 0), rect('b', 100, 0)];

    const hit = getSmartSelectionGapHandleAtPoint({ x: 75, y: 25 }, nodes, VIEWPORT);

    expect(hit).toMatchObject({ axis: 'x', gapValue: 50 });
  });

  it("should hit a column's gap handle with axis y", () => {
    const nodes = [rect('a', 0, 0), rect('b', 0, 100)];

    const hit = getSmartSelectionGapHandleAtPoint({ x: 25, y: 75 }, nodes, VIEWPORT);

    expect(hit).toMatchObject({ axis: 'y', gapValue: 50 });
  });

  it('should miss when the point is far from every gap', () => {
    const nodes = [rect('a', 0, 0), rect('b', 100, 0)];

    expect(getSmartSelectionGapHandleAtPoint({ x: 75, y: 500 }, nodes, VIEWPORT)).toBeNull();
  });

  // a wider second column separates the column-gap's own midpoint (75, 75) from the row-gap's
  // midpoint (90, 75, since it's centred on the grid's overall bounding box) so the two handles
  // don't coincide
  const buildAsymmetricGrid = (): TSceneNode[] => [
    rect('a', 0, 0, 50),
    rect('b', 100, 0, 80),
    rect('c', 0, 100, 50),
    rect('d', 100, 100, 80),
  ];

  it("should hit a grid's column-gap handle with axis x", () => {
    const hit = getSmartSelectionGapHandleAtPoint({ x: 75, y: 75 }, buildAsymmetricGrid(), VIEWPORT);

    expect(hit).toMatchObject({ axis: 'x', gapValue: 50 });
  });

  it("should hit a grid's row-gap handle with axis y", () => {
    const hit = getSmartSelectionGapHandleAtPoint({ x: 90, y: 75 }, buildAsymmetricGrid(), VIEWPORT);

    expect(hit).toMatchObject({ axis: 'y', gapValue: 50 });
  });

  it('should miss a grid when the point is far from every gap', () => {
    expect(getSmartSelectionGapHandleAtPoint({ x: 500, y: 500 }, buildAsymmetricGrid(), VIEWPORT)).toBeNull();
  });

  it('should scale the hit tolerance down with zoom', () => {
    const nodes = [rect('a', 0, 0), rect('b', 100, 0)];

    expect(getSmartSelectionGapHandleAtPoint({ x: 79, y: 25 }, nodes, VIEWPORT)).not.toBeNull();
    expect(getSmartSelectionGapHandleAtPoint({ x: 79, y: 25 }, nodes, { x: 0, y: 0, zoom: 10 })).toBeNull();
  });
});
