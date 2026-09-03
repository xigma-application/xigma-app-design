// types
import { TMaskRenderer } from '../types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';

// utils
import { renderIds } from '../renderIds';
import { renderNode } from '../renderNode/renderNode';

vi.mock('../renderNode/renderNode', () => ({ renderNode: vi.fn() }));

const renderer = { id: 'renderer' } as unknown as TMaskRenderer;

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
});
