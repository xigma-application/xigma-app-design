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
    expect(getSmartSelectionGapHandleAtPoint({ x: 0, y: 0 }, [rect('a', 0, 0)], VIEWPORT, {})).toBeNull();
  });

  it("should hit a row's gap handle with axis x", () => {
    const nodes = [rect('a', 0, 0), rect('b', 100, 0)];

    const hit = getSmartSelectionGapHandleAtPoint({ x: 75, y: 25 }, nodes, VIEWPORT, {});

    expect(hit).toMatchObject({ axis: 'x', gapIndex: 0, gapValue: 50 });
  });

  it("should report the hit gap's own index in a row of 3+ nodes", () => {
    const nodes = [rect('a', 0, 0), rect('b', 100, 0), rect('c', 200, 0)];

    const hit = getSmartSelectionGapHandleAtPoint({ x: 175, y: 25 }, nodes, VIEWPORT, {});

    expect(hit).toMatchObject({ axis: 'x', gapIndex: 1, gapValue: 50 });
  });

  it("should hit a column's gap handle with axis y", () => {
    const nodes = [rect('a', 0, 0), rect('b', 0, 100)];

    const hit = getSmartSelectionGapHandleAtPoint({ x: 25, y: 75 }, nodes, VIEWPORT, {});

    expect(hit).toMatchObject({ axis: 'y', gapIndex: 0, gapValue: 50 });
  });

  it('should miss when the point is far from every gap', () => {
    const nodes = [rect('a', 0, 0), rect('b', 100, 0)];

    expect(getSmartSelectionGapHandleAtPoint({ x: 75, y: 500 }, nodes, VIEWPORT, {})).toBeNull();
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

  it("should hit a grid's column-gap handle in its own row, with axis x", () => {
    const hitFirstRow = getSmartSelectionGapHandleAtPoint({ x: 75, y: 25 }, buildAsymmetricGrid(), VIEWPORT, {});
    const hitSecondRow = getSmartSelectionGapHandleAtPoint({ x: 75, y: 125 }, buildAsymmetricGrid(), VIEWPORT, {});

    expect(hitFirstRow).toMatchObject({ axis: 'x', gapIndex: 0, gapValue: 50 });
    expect(hitSecondRow).toMatchObject({ axis: 'x', gapIndex: 0, gapValue: 50 });
  });

  it("should miss a grid's column-gap handle between its rows, where no per-row handle sits", () => {
    // x=75 is the column-gap's own x, but y=75 sits between rows with no per-row handle there;
    // x=140 stays clear of the row-gap's own widened hit area (which spans roughly [34, 122])
    expect(getSmartSelectionGapHandleAtPoint({ x: 140, y: 75 }, buildAsymmetricGrid(), VIEWPORT, {})).toBeNull();
  });

  it("should hit a grid's row-gap handle with axis y", () => {
    const hit = getSmartSelectionGapHandleAtPoint({ x: 90, y: 75 }, buildAsymmetricGrid(), VIEWPORT, {});

    expect(hit).toMatchObject({ axis: 'y', gapIndex: 0, gapValue: 50 });
  });

  it("should hit a grid's row-gap handle anywhere along its full width, not just its centre", () => {
    // span [0, 180], first column width 50, last column width 80: handle spans [40, 116]
    const nearStart = getSmartSelectionGapHandleAtPoint({ x: 45, y: 75 }, buildAsymmetricGrid(), VIEWPORT, {});
    const nearEnd = getSmartSelectionGapHandleAtPoint({ x: 110, y: 75 }, buildAsymmetricGrid(), VIEWPORT, {});

    expect(nearStart).toMatchObject({ axis: 'y', gapIndex: 0, gapValue: 50, midpoint: { x: 78, y: 75 } });
    expect(nearEnd).toMatchObject({ axis: 'y', gapIndex: 0, gapValue: 50, midpoint: { x: 78, y: 75 } });
  });

  it("should miss a grid's row-gap handle past either end of its actual width", () => {
    expect(getSmartSelectionGapHandleAtPoint({ x: 20, y: 75 }, buildAsymmetricGrid(), VIEWPORT, {})).toBeNull();
    expect(getSmartSelectionGapHandleAtPoint({ x: 130, y: 75 }, buildAsymmetricGrid(), VIEWPORT, {})).toBeNull();
  });

  it('should miss a grid when the point is far from every gap', () => {
    expect(getSmartSelectionGapHandleAtPoint({ x: 500, y: 500 }, buildAsymmetricGrid(), VIEWPORT, {})).toBeNull();
  });

  it('should scale the hit tolerance down with zoom', () => {
    const nodes = [rect('a', 0, 0), rect('b', 100, 0)];

    expect(getSmartSelectionGapHandleAtPoint({ x: 79, y: 25 }, nodes, VIEWPORT, {})).not.toBeNull();
    expect(getSmartSelectionGapHandleAtPoint({ x: 79, y: 25 }, nodes, { x: 0, y: 0, zoom: 10 }, {})).toBeNull();
  });
});
