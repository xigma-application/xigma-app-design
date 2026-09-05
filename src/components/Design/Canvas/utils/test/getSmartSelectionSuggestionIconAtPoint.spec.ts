// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getSmartSelectionSuggestionIconAtPoint } from '../getSmartSelectionSuggestionIconAtPoint';

const VIEWPORT = { x: 0, y: 0, zoom: 1 };

const rect = (id: string, x: number, y: number, width = 50, height = 50): TSceneNode =>
  ({ fill: '#000', height, id, name: 'Rectangle', parentId: null, rotation: 0, type: NodeType.rectangle, width, x, y }) as TSceneNode;

describe('getSmartSelectionSuggestionIconAtPoint', () => {
  it('should return null when no suggestion exists, regardless of the point', () => {
    const nodes = [rect('a', 0, 0), rect('b', 100, 0), rect('c', 200, 0)];

    expect(getSmartSelectionSuggestionIconAtPoint({ x: 0, y: 0 }, nodes, VIEWPORT, {})).toBeNull();
  });

  it('should hit when the point is inside the icon rect', () => {
    const nodes = [rect('a', 0, 0), rect('b', 90, 0), rect('c', 230, 0)];

    const hit = getSmartSelectionSuggestionIconAtPoint({ x: 260, y: 30 }, nodes, VIEWPORT, {});

    expect(hit?.suggestion.type).toBe('equalize');
  });

  it('should miss when the point is outside the icon rect', () => {
    const nodes = [rect('a', 0, 0), rect('b', 90, 0), rect('c', 230, 0)];

    expect(getSmartSelectionSuggestionIconAtPoint({ x: 0, y: 0 }, nodes, VIEWPORT, {})).toBeNull();
  });
});
