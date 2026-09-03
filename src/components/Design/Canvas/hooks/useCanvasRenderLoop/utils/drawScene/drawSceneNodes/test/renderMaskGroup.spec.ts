// types
import { NodeType } from 'types/design/enums';
import { TGroupNode } from 'types/design/types';
import { TMaskRenderer } from '../types';

// utils
import { bindTarget } from '../bindTarget';
import { compositeMask } from '../../compositeMask';
import { renderIds } from '../renderIds';
import { renderIntoTarget } from '../renderIntoTarget';
import { renderMaskGroup } from '../renderMaskGroup';
import { renderNode } from '../renderNode/renderNode';

vi.mock('../bindTarget', () => ({ bindTarget: vi.fn() }));
vi.mock('../../compositeMask', () => ({ compositeMask: vi.fn() }));
vi.mock('../renderIds', () => ({ renderIds: vi.fn() }));
vi.mock('../renderNode/renderNode', () => ({ renderNode: vi.fn() }));
vi.mock('../renderIntoTarget', () => ({
  renderIntoTarget: vi.fn((_renderer, _target, paint: () => void) => paint()),
}));

const buildGroup = (childIds: string[]): TGroupNode => ({
  childIds,
  height: 40,
  id: 'group-1',
  name: 'Group 1',
  parentId: null,
  rotation: 0,
  type: NodeType.group,
  width: 40,
  x: 0,
  y: 0,
});

describe('renderMaskGroup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should composite the children above the mask, using the mask child as the alpha, then draw the children below it straight onto the target', () => {
    const contentTarget = { texture: 'content-tex' };
    const maskTarget = { texture: 'mask-tex' };
    const pool = { acquire: vi.fn().mockReturnValueOnce(contentTarget).mockReturnValueOnce(maskTarget), release: vi.fn() };
    const context = { id: 'context' };
    const renderer = { context, pool } as unknown as TMaskRenderer;
    const group = buildGroup(['above-a', 'above-b', 'mask', 'below-a']);
    const target = { id: 'parent' } as never;

    renderMaskGroup(renderer, group, 2, target);

    expect(pool.acquire).toHaveBeenCalledTimes(2);
    expect(renderIntoTarget).toHaveBeenNthCalledWith(1, renderer, contentTarget, expect.any(Function));
    expect(renderIntoTarget).toHaveBeenNthCalledWith(2, renderer, maskTarget, expect.any(Function));
    expect(renderIds).toHaveBeenCalledWith(renderer, ['above-a', 'above-b'], contentTarget);
    expect(renderNode).toHaveBeenCalledWith(renderer, 'mask', maskTarget);
    expect(bindTarget).toHaveBeenCalledWith(renderer, target);
    expect(compositeMask).toHaveBeenCalledWith(context, 'content-tex', 'mask-tex');
    expect(pool.release).toHaveBeenNthCalledWith(1, contentTarget);
    expect(pool.release).toHaveBeenNthCalledWith(2, maskTarget);
    // the children below the mask paint directly onto the parent target, outside any compositing
    expect(renderIds).toHaveBeenCalledWith(renderer, ['below-a'], target);
  });

  it('should skip all compositing when the mask is the first child, drawing only the children below it', () => {
    const pool = { acquire: vi.fn(), release: vi.fn() };
    const renderer = { context: {}, pool } as unknown as TMaskRenderer;
    const group = buildGroup(['mask', 'below-a', 'below-b']);
    const target = { id: 'parent' } as never;

    renderMaskGroup(renderer, group, 0, target);

    expect(pool.acquire).not.toHaveBeenCalled();
    expect(compositeMask).not.toHaveBeenCalled();
    expect(renderIds).toHaveBeenCalledTimes(1);
    expect(renderIds).toHaveBeenCalledWith(renderer, ['below-a', 'below-b'], target);
  });
});
