// types
import { NodeType } from 'types/design/enums';
import { TMaskRenderer } from '../../types';
import { TSectionNode } from 'types/design/types';

// utils
import { renderIds } from '../../renderIds';
import { renderSectionNode } from '../renderSectionNode';

vi.mock('../../renderIds', () => ({ renderIds: vi.fn() }));

const buildSection = (overrides: Partial<TSectionNode> = {}): TSectionNode => ({
  childIds: ['child-a', 'child-b'],
  fill: '#222',
  height: 40,
  id: 'section-1',
  name: 'Section 1',
  parentId: null,
  rotation: 0,
  type: NodeType.section,
  width: 40,
  x: 0,
  y: 0,
  ...overrides,
});

const buildRenderer = (): TMaskRenderer => ({ paintLeaf: vi.fn() }) as unknown as TMaskRenderer;

describe('renderSectionNode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should paint the section itself and then render its children', () => {
    const renderer = buildRenderer();
    const section = buildSection();

    renderSectionNode(renderer, section, null);

    expect(renderer.paintLeaf).toHaveBeenCalledWith(section);
    expect(renderIds).toHaveBeenCalledWith(renderer, ['child-a', 'child-b'], null);
  });

  it('should still paint an empty section and pass its empty child list through', () => {
    const renderer = buildRenderer();
    const section = buildSection({ childIds: [] });
    const target = { framebuffer: {} } as never;

    renderSectionNode(renderer, section, target);

    expect(renderer.paintLeaf).toHaveBeenCalledWith(section);
    expect(renderIds).toHaveBeenCalledWith(renderer, [], target);
  });
});
