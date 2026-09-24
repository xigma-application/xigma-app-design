// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getSmartSelectionSuggestion } from '../getSmartSelectionSuggestion';

const VIEWPORT = { x: 0, y: 0, zoom: 1 };

const rect = (id: string, x: number, y: number, width = 50, height = 50, rotation = 0): TSceneNode =>
  ({
    fills: [{ color: '#000', opacity: 100, type: 'solid' }],
    height,
    id,
    name: 'Rectangle',
    parentId: null,
    rotation,
    type: NodeType.rectangle,
    width,
    x,
    y,
  }) as TSceneNode;

describe('getSmartSelectionSuggestion', () => {
  it('should return null when fewer than 3 nodes are selected', () => {
    expect(getSmartSelectionSuggestion([rect('a', 0, 0), rect('b', 90, 0)], VIEWPORT, {})).toBeNull();
  });

  it('should return null when a node is rotated off-axis', () => {
    const nodes = [rect('a', 0, 0), rect('b', 90, 0, 50, 50, 15), rect('c', 230, 0)];

    expect(getSmartSelectionSuggestion(nodes, VIEWPORT, {})).toBeNull();
  });

  it('should return null when an exact layout already exists (handled by the existing gap/swap UI instead)', () => {
    const nodes = [rect('a', 0, 0), rect('b', 100, 0), rect('c', 200, 0)];

    expect(getSmartSelectionSuggestion(nodes, VIEWPORT, {})).toBeNull();
  });

  it('should return an equalize suggestion for an aligned row with uneven gaps', () => {
    const nodes = [rect('a', 0, 0), rect('b', 90, 0), rect('c', 230, 0)];

    expect(getSmartSelectionSuggestion(nodes, VIEWPORT, {})?.type).toBe('equalize');
  });

  it('should return an append suggestion for a clean row plus a spatial outlier', () => {
    const nodes = [rect('a', 0, 0), rect('b', 100, 0), rect('c', 200, 0), rect('d', 400, 300)];

    expect(getSmartSelectionSuggestion(nodes, VIEWPORT, {})?.type).toBe('append');
  });

  it('should return null when nothing is even close to a row/column', () => {
    const nodes = [rect('a', 0, 0), rect('b', 500, 500), rect('c', 1000, 1000)];

    expect(getSmartSelectionSuggestion(nodes, VIEWPORT, {})).toBeNull();
  });

  it('should return a grid-equalize suggestion for a near-miss grid with uneven column gaps', () => {
    const nodes = [rect('a', 0, 0), rect('b', 100, 0), rect('c', 250, 0), rect('d', 0, 100), rect('e', 100, 100), rect('f', 250, 100)];

    expect(getSmartSelectionSuggestion(nodes, VIEWPORT, {})?.type).toBe('grid-equalize');
  });

  it('should return a grid-append suggestion for an otherwise-valid grid plus a spatial outlier', () => {
    // a 2x3 grid with (row 0, column 1) empty, plus x, far enough away that it doesn't also
    // read as a near-miss grid on its own (that's covered by getSmartSelectionGridEqualizeSuggestion)
    const nodes = [rect('a', 0, 0), rect('c', 200, 0), rect('d', 0, 100), rect('e', 100, 100), rect('f', 200, 100), rect('x', 500, 500)];

    expect(getSmartSelectionSuggestion(nodes, VIEWPORT, {})?.type).toBe('grid-append');
  });
});

describe('getSmartSelectionSuggestion caching and limits', () => {
  it('should hand back the very same suggestion for the same nodes, nodes record and zoom, and recompute when any changes', () => {
    // mock
    const nodes = [rect('cache-a', 0, 0), rect('cache-b', 90, 0), rect('cache-c', 230, 0)];
    const nodesById = {};

    // before
    const first = getSmartSelectionSuggestion(nodes, VIEWPORT, nodesById);

    // result
    expect(first?.type).toBe('equalize');
    expect(getSmartSelectionSuggestion(nodes, { x: 30, y: 30, zoom: 1 }, nodesById)).toBe(first);
    expect(getSmartSelectionSuggestion(nodes, { x: 0, y: 0, zoom: 2 }, nodesById)).not.toBe(first);
    expect(getSmartSelectionSuggestion(nodes, { x: 0, y: 0, zoom: 2 }, {})).not.toBe(first);
  });

  it('should not suggest anything for a selection larger than the limit, however uneven it is', () => {
    // mock
    const nodes = Array.from({ length: 301 }, (_, index) => rect(`big${index}`, index * 90 + (index % 2) * 7, 0));

    // result
    expect(getSmartSelectionSuggestion(nodes, VIEWPORT, {})).toBeNull();
  });
});
