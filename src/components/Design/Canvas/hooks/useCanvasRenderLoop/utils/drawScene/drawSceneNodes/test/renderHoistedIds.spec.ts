// types
import { TMaskRenderer } from '../types';

// utils
import { renderHoistedIds } from '../renderHoistedIds';
import { renderNode } from '../renderNode/renderNode';

vi.mock('../renderNode/renderNode', () => ({ renderNode: vi.fn() }));

describe('renderHoistedIds', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders every hoisted id unclipped, straight to the screen target', () => {
    const renderer = { hoistedIds: new Set(['a', 'b']) } as unknown as TMaskRenderer;

    renderHoistedIds(renderer);

    expect(renderNode).toHaveBeenCalledTimes(2);
    expect(renderNode).toHaveBeenCalledWith(renderer, 'a', null);
    expect(renderNode).toHaveBeenCalledWith(renderer, 'b', null);
  });

  it('does nothing when there is nothing to hoist', () => {
    renderHoistedIds({ hoistedIds: new Set() } as unknown as TMaskRenderer);

    expect(renderNode).not.toHaveBeenCalled();
  });
});
