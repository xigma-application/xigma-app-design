// types
import { TMaskRenderer } from '../types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';
import { TSceneNode } from 'types/design/types';

// utils
import { isBatchableRenderRect } from '../isBatchableRenderRect';
import { renderIds } from '../renderIds';
import { renderNode } from '../renderNode/renderNode';
import { renderRectRun } from '../renderRectRun';

vi.mock('../renderNode/renderNode', () => ({ renderNode: vi.fn() }));
vi.mock('../renderRectRun', () => ({ renderRectRun: vi.fn() }));
vi.mock('../isBatchableRenderRect', () => ({ isBatchableRenderRect: vi.fn(() => false) }));

const createRenderer = (hoisted: string[] = [], ids: string[] = ['a', 'b', 'c']): TMaskRenderer =>
  ({
    hoistedIds: new Set(hoisted),
    sceneNodeById: new Map(ids.map((id) => [id, { id } as TSceneNode])),
  }) as unknown as TMaskRenderer;

describe('renderIds', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isBatchableRenderRect).mockReturnValue(false);
  });

  it('should render every id in order, passing the same renderer and target through', () => {
    // mock
    const renderer = createRenderer();
    const target = { id: 'target' } as unknown as TRenderTarget;

    // before
    renderIds(renderer, ['a', 'b', 'c'], target);

    // result
    expect(renderNode).toHaveBeenNthCalledWith(1, renderer, 'a', target);
    expect(renderNode).toHaveBeenNthCalledWith(2, renderer, 'b', target);
    expect(renderNode).toHaveBeenNthCalledWith(3, renderer, 'c', target);
  });

  it('should do nothing for an empty id list', () => {
    // before
    renderIds(createRenderer(), [], null);

    // result
    expect(renderNode).not.toHaveBeenCalled();
  });

  it('should skip ids that have been hoisted out of the clipped scene tree', () => {
    // mock
    const renderer = createRenderer(['b']);

    // before
    renderIds(renderer, ['a', 'b', 'c'], null);

    // result
    expect(renderNode).toHaveBeenCalledTimes(2);
    expect(renderNode).toHaveBeenNthCalledWith(1, renderer, 'a', null);
    expect(renderNode).toHaveBeenNthCalledWith(2, renderer, 'c', null);
  });

  it('should hand an id without a scene node to renderNode', () => {
    // mock
    const renderer = createRenderer([], []);

    // before
    renderIds(renderer, ['ghost'], null);

    // result
    expect(renderNode).toHaveBeenCalledWith(renderer, 'ghost', null);
  });

  it('should gather consecutive batchable rectangles into one run and flush it before the next node', () => {
    // mock
    const renderer = createRenderer([], ['a', 'b', 'c', 'd']);

    vi.mocked(isBatchableRenderRect).mockImplementation((_, node) => node.id !== 'c');

    // before
    renderIds(renderer, ['a', 'b', 'c', 'd'], null);

    // result
    expect(renderRectRun).toHaveBeenNthCalledWith(1, renderer, [{ id: 'a' }, { id: 'b' }]);
    expect(renderNode).toHaveBeenCalledWith(renderer, 'c', null);
    expect(renderRectRun).toHaveBeenLastCalledWith(renderer, [{ id: 'd' }]);
    expect(renderNode).toHaveBeenCalledTimes(1);
  });
});
