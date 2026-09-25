// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode, TSceneNode } from 'types/design/types';

// utils
import { getPageExportBounds } from '../getPageExportBounds';

const rect = (overrides: Partial<TRectangleNode> = {}): TRectangleNode => ({
  fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
  height: 10,
  id: 'rect',
  name: 'rect',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 10,
  x: 0,
  y: 0,
  ...overrides,
});

describe('getPageExportBounds', () => {
  it('should return null for an empty page', () => {
    expect(getPageExportBounds([], {})).toBeNull();
  });

  it('should return null when every root id is missing from the node map', () => {
    expect(getPageExportBounds(['missing'], {})).toBeNull();
  });

  it('should union every root node own content bounds, accounting for each one own width/height', () => {
    // "left" sits far to the left and extends past the origin via its own width; "right" sits far to
    // the right; the union must reach from left's own left edge to right's own right edge
    const left = rect({ height: 10, id: 'left', width: 50, x: -100, y: 0 });
    const right = rect({ height: 10, id: 'right', width: 20, x: 300, y: 0 });
    const nodesById: Record<string, TSceneNode> = { left, right };

    expect(getPageExportBounds(['left', 'right'], nodesById)).toEqual({ height: 10, width: 420, x: -100, y: 0 });
  });

  it('should skip a hidden root node entirely, not fall back to its own declared bounds', () => {
    const hidden = rect({ height: 500, hidden: true, id: 'hidden', width: 500, x: -1000, y: -1000 });
    const visible = rect({ height: 10, id: 'visible', width: 10, x: 0, y: 0 });
    const nodesById: Record<string, TSceneNode> = { hidden, visible };

    expect(getPageExportBounds(['hidden', 'visible'], nodesById)).toEqual({ height: 10, width: 10, x: 0, y: 0 });
  });

  it('should return null when every root node is hidden', () => {
    const hidden = rect({ hidden: true, id: 'hidden' });

    expect(getPageExportBounds(['hidden'], { hidden })).toBeNull();
  });

  it('should leave a slice out of the page bounds', () => {
    const slice = {
      height: 500,
      id: 'slice',
      name: 'slice',
      parentId: null,
      rotation: 0,
      type: NodeType.slice,
      width: 500,
      x: -1000,
      y: -1000,
    } as TSceneNode;
    const visible = rect({ height: 10, id: 'visible', width: 10, x: 0, y: 0 });

    expect(getPageExportBounds(['slice', 'visible'], { slice, visible })).toEqual({ height: 10, width: 10, x: 0, y: 0 });
  });
});
