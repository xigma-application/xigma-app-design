// types
import { NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';
import { TMaskRenderer } from '../../types';

// utils
import { renderClippedFrame } from '../../renderClippedFrame';
import { renderFrameNode } from '../renderFrameNode';
import { renderIds } from '../../renderIds';

vi.mock('../../renderIds', () => ({ renderIds: vi.fn() }));
vi.mock('../../renderClippedFrame', () => ({ renderClippedFrame: vi.fn() }));

const buildFrame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: ['child-a'],
  clipContent: true,
  fill: '#fff',
  height: 40,
  id: 'frame-1',
  name: 'Frame 1',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 40,
  x: 0,
  y: 0,
  ...overrides,
});

const buildRenderer = (): TMaskRenderer => ({ paintLeaf: vi.fn() }) as unknown as TMaskRenderer;

describe('renderFrameNode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should composite through renderClippedFrame when the frame clips content and has children', () => {
    const renderer = buildRenderer();
    const frame = buildFrame({ childIds: ['child-a'], clipContent: true });

    renderFrameNode(renderer, frame, null);

    expect(renderer.paintLeaf).toHaveBeenCalledWith(frame);
    expect(renderClippedFrame).toHaveBeenCalledWith(renderer, frame, null);
    expect(renderIds).not.toHaveBeenCalled();
  });

  it('should recurse into children directly when clip content is off', () => {
    const renderer = buildRenderer();
    const frame = buildFrame({ childIds: ['child-a'], clipContent: false });

    renderFrameNode(renderer, frame, null);

    expect(renderer.paintLeaf).toHaveBeenCalledWith(frame);
    expect(renderIds).toHaveBeenCalledWith(renderer, ['child-a'], null);
    expect(renderClippedFrame).not.toHaveBeenCalled();
  });

  it('should recurse into children directly when a clipping frame has no children', () => {
    const renderer = buildRenderer();
    const frame = buildFrame({ childIds: [], clipContent: true });

    renderFrameNode(renderer, frame, null);

    expect(renderIds).toHaveBeenCalledWith(renderer, [], null);
    expect(renderClippedFrame).not.toHaveBeenCalled();
  });
});
