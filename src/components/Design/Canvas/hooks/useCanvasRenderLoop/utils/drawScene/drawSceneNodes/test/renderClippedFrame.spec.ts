// types
import { NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';
import { TMaskRenderer } from '../types';

// utils
import { bindTarget } from '../bindTarget';
import { compositeMask } from '../../compositeMask';
import { drawRect } from 'utils/canvas/drawRect/drawRect';
import { renderClippedFrame } from '../renderClippedFrame';
import { renderIds } from '../renderIds';
import { renderIntoTarget } from '../renderIntoTarget';

vi.mock('../bindTarget', () => ({ bindTarget: vi.fn() }));
vi.mock('../../compositeMask', () => ({ compositeMask: vi.fn() }));
vi.mock('utils/canvas/drawRect/drawRect', () => ({ drawRect: vi.fn() }));
vi.mock('../renderIds', () => ({ renderIds: vi.fn() }));
vi.mock('../renderIntoTarget', () => ({
  renderIntoTarget: vi.fn((_renderer, _target, paint: () => void) => paint()),
}));

const buildFrame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: ['child-a', 'child-b'],
  clipContent: true,
  fill: '#123456',
  height: 40,
  id: 'frame-1',
  name: 'Frame 1',
  parentId: null,
  rotation: 12,
  type: NodeType.frame,
  width: 40,
  x: 5,
  y: 6,
  ...overrides,
});

describe('renderClippedFrame', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the children into one target, a white full-alpha frame rect into another, then composite them back onto the parent target', () => {
    const contentTarget = { texture: 'content-tex' };
    const maskTarget = { texture: 'mask-tex' };
    const pool = { acquire: vi.fn().mockReturnValueOnce(contentTarget).mockReturnValueOnce(maskTarget), release: vi.fn() };
    const context = {
      buffer: { id: 'buffer' },
      canvasHeight: 100,
      canvasWidth: 200,
      gl: { id: 'gl' },
      program: { id: 'program' },
      viewport: { x: 0, y: 0, zoom: 1 },
    };
    const renderer = { context, pool } as unknown as TMaskRenderer;
    const frame = buildFrame();
    const parentTarget = { id: 'parent' } as never;

    renderClippedFrame(renderer, frame, parentTarget);

    expect(pool.acquire).toHaveBeenCalledTimes(2);
    expect(renderIntoTarget).toHaveBeenNthCalledWith(1, renderer, contentTarget, expect.any(Function));
    expect(renderIntoTarget).toHaveBeenNthCalledWith(2, renderer, maskTarget, expect.any(Function));
    expect(renderIds).toHaveBeenCalledWith(renderer, ['child-a', 'child-b'], contentTarget);
    expect(drawRect).toHaveBeenCalledWith(
      context.gl,
      context.program,
      context.buffer,
      { ...frame, fill: '#ffffff', fillAlpha: 1 },
      200,
      100,
      context.viewport,
      12,
    );
    expect(bindTarget).toHaveBeenCalledWith(renderer, parentTarget);
    expect(compositeMask).toHaveBeenCalledWith(context, 'content-tex', 'mask-tex');
    expect(pool.release).toHaveBeenNthCalledWith(1, contentTarget);
    expect(pool.release).toHaveBeenNthCalledWith(2, maskTarget);
  });
});
