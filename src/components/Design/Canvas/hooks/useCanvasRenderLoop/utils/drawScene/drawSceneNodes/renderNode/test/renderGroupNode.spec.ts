// types
import { NodeType } from 'types/design/enums';
import { TGroupNode, TSceneNode } from 'types/design/types';
import { TMaskRenderer } from '../../types';

// utils
import { renderGroupNode } from '../renderGroupNode';
import { renderIds } from '../../renderIds';
import { renderMaskGroup } from '../../renderMaskGroup';

vi.mock('../../renderIds', () => ({ renderIds: vi.fn() }));
vi.mock('../../renderMaskGroup', () => ({ renderMaskGroup: vi.fn() }));

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

const buildRenderer = (nodes: Record<string, Partial<TSceneNode>>): TMaskRenderer =>
  ({
    paintLeaf: vi.fn(),
    sceneNodeById: new Map(Object.entries(nodes) as [string, TSceneNode][]),
  }) as unknown as TMaskRenderer;

describe('renderGroupNode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render children straight through when the group holds no mask child', () => {
    const group = buildGroup({ childIds: ['child-a', 'child-b'] });
    const renderer = buildRenderer({ 'child-a': { id: 'child-a' }, 'child-b': { id: 'child-b' } });

    renderGroupNode(renderer, group, null);

    expect(renderIds).toHaveBeenCalledWith(renderer, ['child-a', 'child-b'], null);
    expect(renderMaskGroup).not.toHaveBeenCalled();
  });

  it('should hand off to renderMaskGroup with the mask child index when one child is a mask', () => {
    const group = buildGroup({ childIds: ['content', 'mask'] });
    const renderer = buildRenderer({ content: { id: 'content' }, mask: { id: 'mask', isMask: true } });

    renderGroupNode(renderer, group, null);

    expect(renderMaskGroup).toHaveBeenCalledWith(renderer, group, 1, null);
    expect(renderIds).not.toHaveBeenCalled();
  });
});
