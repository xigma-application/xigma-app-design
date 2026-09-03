// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getSmartSelectionSuggestionIconRect } from '../getSmartSelectionSuggestionIconRect';

const rect = (id: string, x: number, y: number, width = 50, height = 50): TSceneNode =>
  ({ fill: '#000', height, id, name: 'Rectangle', parentId: null, rotation: 0, type: NodeType.rectangle, width, x, y }) as TSceneNode;

describe('getSmartSelectionSuggestionIconRect', () => {
  it('should place a 24px icon inside the selection bbox, inset from its bottom-right corner by an 8px margin', () => {
    const nodes = [rect('a', 0, 0), rect('b', 100, 100)];

    const iconRect = getSmartSelectionSuggestionIconRect(nodes, { x: 0, y: 0, zoom: 1 });

    // bbox is (0,0)-(150,150); icon sits inset from that corner by margin + its own size
    expect(iconRect).toEqual({ height: 24, width: 24, x: 118, y: 118 });
  });

  it('should keep a constant screen size by dividing by the viewport zoom', () => {
    const nodes = [rect('a', 0, 0), rect('b', 100, 100)];

    const iconRect = getSmartSelectionSuggestionIconRect(nodes, { x: 0, y: 0, zoom: 2 });

    expect(iconRect.height).toBe(12);
    expect(iconRect.width).toBe(12);
    expect(iconRect.x).toBe(150 - 12 - 4);
  });
});
