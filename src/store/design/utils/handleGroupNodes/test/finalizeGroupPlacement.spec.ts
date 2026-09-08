// types
import { NodeType } from 'types/design/enums';
import { TDesignPage } from '../../../types';
import { TGroupNode } from 'types/design/types';

// utils
import { finalizeGroupPlacement } from '../finalizeGroupPlacement';

const buildGroup = (overrides: Partial<TGroupNode> = {}): TGroupNode => ({
  childIds: [],
  height: 10,
  id: 'group-1',
  name: 'Group',
  parentId: null,
  rotation: 0,
  type: NodeType.group,
  width: 10,
  x: 0,
  y: 0,
  ...overrides,
});

const buildPage = (overrides: Partial<TDesignPage> = {}): TDesignPage => ({
  backgroundPaint: { color: '#d9d9d9', opacity: 100, type: 'solid' },
  comments: {},
  guides: [],
  id: 'page-1',
  name: 'Page 1',
  nodes: {},
  paint: { color: '#d9d9d9', opacity: 100, type: 'solid' },
  rootOrder: [],
  selectedIds: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  ...overrides,
});

describe('finalizeGroupPlacement', () => {
  it('should place the group into the root order and select it when there is no parent', () => {
    // mock
    const page = buildPage({ rootOrder: ['a'] });

    // action
    finalizeGroupPlacement(page, null, 'group-1', ['a']);

    // result
    expect(page.rootOrder).toEqual(['group-1']);
    expect(page.selectedIds).toEqual(['group-1']);
  });

  it('should place the group into the parent childIds and select it when there is a group parent', () => {
    // mock
    const outer = buildGroup({ childIds: ['a'], id: 'outer' });
    const page = buildPage({ nodes: { outer }, rootOrder: ['outer'] });

    // action
    finalizeGroupPlacement(page, 'outer', 'group-1', ['a']);

    // result
    expect((page.nodes.outer as TGroupNode).childIds).toEqual(['group-1']);
    expect(page.rootOrder).toEqual(['outer']);
    expect(page.selectedIds).toEqual(['group-1']);
  });
});
