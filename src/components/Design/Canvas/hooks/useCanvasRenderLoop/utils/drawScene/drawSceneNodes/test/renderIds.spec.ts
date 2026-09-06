// types
import { TMaskRenderer } from '../types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';

// utils
import { renderIds } from '../renderIds';
import { renderNode } from '../renderNode/renderNode';

vi.mock('../renderNode/renderNode', () => ({ renderNode: vi.fn() }));

const renderer = { hoistedIds: new Set<string>(), id: 'renderer' } as unknown as TMaskRenderer;

describe('renderIds', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render every id in order, passing the same renderer and target through', () => {
    const target = { id: 'target' } as unknown as TRenderTarget;

    renderIds(renderer, ['a', 'b', 'c'], target);

    expect(renderNode).toHaveBeenNthCalledWith(1, renderer, 'a', target);
    expect(renderNode).toHaveBeenNthCalledWith(2, renderer, 'b', target);
    expect(renderNode).toHaveBeenNthCalledWith(3, renderer, 'c', target);
  });

  it('should do nothing for an empty id list', () => {
    renderIds(renderer, [], null);

    expect(renderNode).not.toHaveBeenCalled();
  });

  it('should skip ids that have been hoisted out of the clipped scene tree', () => {
    const withHoisted = { hoistedIds: new Set(['b']) } as unknown as TMaskRenderer;

    renderIds(withHoisted, ['a', 'b', 'c'], null);

    expect(renderNode).toHaveBeenCalledTimes(2);
    expect(renderNode).toHaveBeenNthCalledWith(1, withHoisted, 'a', null);
    expect(renderNode).toHaveBeenNthCalledWith(2, withHoisted, 'c', null);
  });
});
