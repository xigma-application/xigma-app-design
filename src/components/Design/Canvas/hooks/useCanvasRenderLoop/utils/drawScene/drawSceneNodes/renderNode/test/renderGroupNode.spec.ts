// types
import { NodeType } from 'types/design/enums';
import { TGroupNode } from 'types/design/types';
import { TMaskRenderer } from '../../types';

// utils
import { renderGroupNode } from '../renderGroupNode';
import { renderIds } from '../../renderIds';

vi.mock('../../renderIds', () => ({ renderIds: vi.fn() }));

const buildGroup = (overrides: Partial<TGroupNode> = {}): TGroupNode => ({
  childIds: ['child-a', 'child-b'],
  height: 40,
  id: 'group-1',
  name: 'Group 1',
  parentId: null,
  rotation: 0,
  type: NodeType.group,
  width: 40,
  x: 0,
  y: 0,
  ...overrides,
});

const buildRenderer = (): TMaskRenderer => ({ paintLeaf: vi.fn(), sceneNodeById: new Map() }) as unknown as TMaskRenderer;

describe('renderGroupNode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render every child straight through — a group never has masking of its own', () => {
    const group = buildGroup({ childIds: ['child-a', 'child-b'] });
    const renderer = buildRenderer();

    renderGroupNode(renderer, group, null);

    expect(renderIds).toHaveBeenCalledWith(renderer, ['child-a', 'child-b'], null);
  });
});
