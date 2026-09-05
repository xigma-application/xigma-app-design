// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getSmartSelectionLayout } from '../getSmartSelectionLayout';

const VIEWPORT = { x: 0, y: 0, zoom: 1 };

const rect = (id: string, x: number, y: number, width = 50, height = 50): TSceneNode =>
  ({ fill: '#000', height, id, name: 'Rectangle', parentId: null, rotation: 0, type: NodeType.rectangle, width, x, y }) as TSceneNode;

describe('getSmartSelectionLayout', () => {
  it('should return null when the selection is not eligible', () => {
    expect(getSmartSelectionLayout([rect('a', 0, 0)], VIEWPORT, {})).toBeNull();
  });

  it('should detect a row before ever trying a column or grid', () => {
    const layout = getSmartSelectionLayout([rect('a', 0, 0), rect('b', 100, 0)], VIEWPORT, {});

    expect(layout?.type).toBe('row');
  });

  it('should detect a column when no row match exists', () => {
    const layout = getSmartSelectionLayout([rect('a', 0, 0), rect('b', 0, 100)], VIEWPORT, {});

    expect(layout?.type).toBe('column');
  });

  it('should detect a grid when neither a plain row nor column matches', () => {
    const nodes = [rect('a', 0, 0), rect('b', 100, 0), rect('c', 0, 100), rect('d', 100, 100)];

    expect(getSmartSelectionLayout(nodes, VIEWPORT, {})?.type).toBe('grid');
  });

  it('should return null when nothing matches at all', () => {
    const nodes = [rect('a', 0, 0), rect('b', 300, 300)];

    expect(getSmartSelectionLayout(nodes, VIEWPORT, {})).toBeNull();
  });

  it('should scale tolerance down with zoom', () => {
    const nodes = [rect('a', 0, 0), rect('b', 150, 0), rect('c', 302, 0)];

    expect(getSmartSelectionLayout(nodes, { x: 0, y: 0, zoom: 1 }, {})).not.toBeNull();
    expect(getSmartSelectionLayout(nodes, { x: 0, y: 0, zoom: 10 }, {})).toBeNull();
  });

  it('should return null when the selected nodes are children of a managed-layout (horizontal/vertical/grid) frame', () => {
    const parent: TSceneNode = {
      childIds: ['a', 'b'],
      clipContent: true,
      fill: '#fff',
      height: 100,
      id: 'frame-1',
      layoutMode: LayoutMode.horizontal,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 200,
      x: 0,
      y: 0,
    } as TSceneNode;
    const nodes = [rect('a', 0, 0, 50, 50), rect('b', 100, 0, 50, 50)].map((node) => ({ ...node, parentId: 'frame-1' }));

    expect(getSmartSelectionLayout(nodes, VIEWPORT, { 'frame-1': parent })).toBeNull();
  });
});
