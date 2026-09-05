// types
import { NodeType } from 'types/design/enums';
import { RootState } from 'store';
import { TSceneNode } from 'types/design/types';

// utils
import { getSelectedSceneNodes } from '../getSelectedSceneNodes';

const rect = (id: string): TSceneNode =>
  ({
    fill: '#000000',
    height: 10,
    id,
    name: id,
    parentId: null,
    rotation: 0,
    type: NodeType.rectangle,
    width: 10,
    x: 0,
    y: 0,
  }) as TSceneNode;

const buildState = (selectedIds: string[], nodes: Record<string, TSceneNode>): RootState =>
  ({
    design: {
      activePageId: 'page-1',
      pages: { 'page-1': { nodes, selectedIds } },
    },
  }) as unknown as RootState;

describe('getSelectedSceneNodes', () => {
  it('should return an empty array when nothing is selected', () => {
    expect(getSelectedSceneNodes(buildState([], {}))).toEqual([]);
  });

  it('should resolve each selected id to its node object, preserving selection order', () => {
    const r1 = rect('r1');
    const r2 = rect('r2');

    expect(getSelectedSceneNodes(buildState(['r2', 'r1'], { r1, r2 }))).toEqual([r2, r1]);
  });

  it('should drop a selected id that no longer has a matching node', () => {
    const r1 = rect('r1');

    expect(getSelectedSceneNodes(buildState(['r1', 'stale-id'], { r1 }))).toEqual([r1]);
  });
});
