// types
import { NodeType } from 'types/design/enums';
import { TMaskNode } from 'types/design/types';
import { TMaskRenderer } from '../../types';

// utils
import { bindTarget } from '../../bindTarget';
import { compositeMask } from '../../../compositeMask';
import { renderIds } from '../../renderIds';
import { renderIntoTarget } from '../../renderIntoTarget';
import { renderMaskNode } from '../renderMaskNode';
import { renderNode } from '../renderNode';

vi.mock('../../bindTarget', () => ({ bindTarget: vi.fn() }));
vi.mock('../../../compositeMask', () => ({ compositeMask: vi.fn() }));
vi.mock('../../renderIds', () => ({ renderIds: vi.fn() }));
vi.mock('../renderNode', () => ({ renderNode: vi.fn() }));
vi.mock('../../renderIntoTarget', () => ({
  renderIntoTarget: vi.fn((_renderer, _target, paint: () => void) => paint()),
}));

const buildMask = (childIds: string[]): TMaskNode => ({
  childIds,
  height: 40,
  id: 'mask-1',
  name: 'Mask group',
  parentId: null,
  rotation: 0,
  type: NodeType.mask,
  width: 40,
  x: 0,
  y: 0,
});

describe('renderMaskNode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should composite the content above the last (mask) child, using it as the alpha', () => {
    const contentTarget = { texture: 'content-tex' };
    const maskTarget = { texture: 'mask-tex' };
    const pool = { acquire: vi.fn().mockReturnValueOnce(contentTarget).mockReturnValueOnce(maskTarget), release: vi.fn() };
    const context = { id: 'context' };
    const renderer = { context, pool } as unknown as TMaskRenderer;
    const node = buildMask(['content-a', 'content-b', 'mask']);
    const target = { id: 'parent' } as never;

    renderMaskNode(renderer, node, target);

    expect(pool.acquire).toHaveBeenCalledTimes(2);
    expect(renderIntoTarget).toHaveBeenNthCalledWith(1, renderer, contentTarget, expect.any(Function));
    expect(renderIntoTarget).toHaveBeenNthCalledWith(2, renderer, maskTarget, expect.any(Function));
    expect(renderIds).toHaveBeenCalledWith(renderer, ['content-a', 'content-b'], contentTarget);
    expect(renderNode).toHaveBeenCalledWith(renderer, 'mask', maskTarget);
    expect(bindTarget).toHaveBeenCalledWith(renderer, target);
    expect(compositeMask).toHaveBeenCalledWith(context, 'content-tex', 'mask-tex');
    expect(pool.release).toHaveBeenNthCalledWith(1, contentTarget);
    expect(pool.release).toHaveBeenNthCalledWith(2, maskTarget);
  });

  it('should skip all compositing when the mask is the only child', () => {
    const pool = { acquire: vi.fn(), release: vi.fn() };
    const renderer = { context: {}, pool } as unknown as TMaskRenderer;
    const node = buildMask(['mask']);
    const target = { id: 'parent' } as never;

    renderMaskNode(renderer, node, target);

    expect(pool.acquire).not.toHaveBeenCalled();
    expect(compositeMask).not.toHaveBeenCalled();
    expect(renderIds).not.toHaveBeenCalled();
  });
});
