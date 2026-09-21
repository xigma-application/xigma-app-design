// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getExportRenderNodes } from '../getExportRenderNodes';

const rect = (id: string, overrides: Partial<TSceneNode> = {}): TSceneNode =>
  ({
    fills: [],
    height: 20,
    id,
    name: id,
    parentId: null,
    rotation: 0,
    type: NodeType.rectangle,
    width: 20,
    x: 0,
    y: 0,
    ...overrides,
  }) as TSceneNode;

describe('getExportRenderNodes', () => {
  it('should return only the node and its own descendants when ignoring overlapping layers', () => {
    // mock
    const child = rect('c1');
    const other = rect('r2');
    const parent = { ...rect('f1'), childIds: ['c1'], type: NodeType.frame } as TSceneNode;
    const nodesById = { c1: child, f1: parent, r2: other };

    // action
    const result = getExportRenderNodes('f1', nodesById, ['f1', 'r2'], true);

    // result
    expect(result).toEqual([parent, child]);
  });

  it('should return every visible node in the document, in its own render order, when not ignoring overlapping layers', () => {
    // mock
    const child = rect('c1');
    const other = rect('r2');
    const parent = { ...rect('f1'), childIds: ['c1'], type: NodeType.frame } as TSceneNode;
    const nodesById = { c1: child, f1: parent, r2: other };

    // action
    const result = getExportRenderNodes('f1', nodesById, ['r2', 'f1'], false);

    // result — full document order (r2, then f1 and its own child), not just f1's own subtree
    expect(result).toEqual([other, parent, child]);
  });

  it('should drop hidden nodes when not ignoring overlapping layers', () => {
    // mock
    const visible = rect('r1');
    const hidden = rect('r2', { hidden: true });
    const nodesById = { r1: visible, r2: hidden };

    // action
    const result = getExportRenderNodes('r1', nodesById, ['r1', 'r2'], false);

    // result
    expect(result).toEqual([visible]);
  });
});
