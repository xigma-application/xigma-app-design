// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getSmartSelectionSuggestion } from '../getSmartSelectionSuggestion';

const VIEWPORT = { x: 0, y: 0, zoom: 1 };

const rect = (id: string, x: number, y: number, width = 50, height = 50, rotation = 0): TSceneNode =>
  ({ fill: '#000', height, id, name: 'Rectangle', parentId: null, rotation, type: NodeType.rectangle, width, x, y }) as TSceneNode;

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
