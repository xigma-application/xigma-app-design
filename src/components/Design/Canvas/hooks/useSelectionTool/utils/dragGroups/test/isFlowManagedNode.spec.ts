// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { isFlowManagedNode } from '../isFlowManagedNode';

const frame = (id: string, layoutMode?: LayoutMode): TSceneNode =>
  ({ childIds: [], height: 10, id, layoutMode, parentId: null, type: NodeType.frame, width: 10, x: 0, y: 0 }) as unknown as TSceneNode;

const rect = (id: string, parentId: string | null, ignoreAutoLayout = false): TSceneNode =>
  ({ height: 10, id, ignoreAutoLayout, parentId, type: NodeType.rectangle, width: 10, x: 0, y: 0 }) as unknown as TSceneNode;

describe('isFlowManagedNode', () => {
  it('should be true for a flow child of a linear auto-layout frame', () => {
    // mock
    const parent = frame('p', LayoutMode.vertical);

    // result
    expect(isFlowManagedNode(rect('r', 'p'), { p: parent })).toBe(true);
  });

  it('should be true for a flow child of a grid frame', () => {
    // mock
    const parent = frame('p', LayoutMode.grid);

    // result
    expect(isFlowManagedNode(rect('r', 'p'), { p: parent })).toBe(true);
  });

  it('should be false for an absolute-position child of an auto-layout frame', () => {
    // mock
    const parent = frame('p', LayoutMode.horizontal);

    // result
    expect(isFlowManagedNode(rect('r', 'p', true), { p: parent })).toBe(false);
  });

  it('should be false for a child of a free-form frame', () => {
    // mock
    const parent = frame('p');

    // result
    expect(isFlowManagedNode(rect('r', 'p'), { p: parent })).toBe(false);
  });

  it('should be false for a root node', () => {
    // result
    expect(isFlowManagedNode(rect('r', null), {})).toBe(false);
  });

  it('should be false when the parent is missing from the lookup', () => {
    // result
    expect(isFlowManagedNode(rect('r', 'gone'), {})).toBe(false);
  });
});
