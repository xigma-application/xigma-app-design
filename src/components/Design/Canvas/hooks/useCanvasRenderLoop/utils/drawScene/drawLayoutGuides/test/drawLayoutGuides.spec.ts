// types
import { LayoutGuideType, NodeType } from 'types/design/enums';
import { TDrawSceneContext } from '../../types';
import { TSceneNode } from 'types/design/types';

// utils
import { drawLayoutGuides } from '../drawLayoutGuides';

const drawRectMock = vi.fn();
const guideRectsMock = vi.fn(() => ['rect-1', 'rect-2']);

vi.mock('utils/canvas/drawRect/drawRect', () => ({ drawRect: (...args: unknown[]): unknown => drawRectMock(...args) }));
vi.mock('utils/canvas/layoutGuides/getLayoutGuideRects', () => ({
  getLayoutGuideRects: (...args: unknown[]): unknown => guideRectsMock(...(args as [])),
}));
vi.mock('store/design/utils/autoLayout/getAutoLayoutFrameCenter', () => ({ getAutoLayoutFrameCenter: (): unknown => ({ x: 5, y: 5 }) }));

const context = {
  buffer: 'b',
  canvasHeight: 100,
  canvasWidth: 200,
  gl: 'gl',
  program: 'p',
  viewport: { x: 0, y: 0, zoom: 2 },
} as unknown as TDrawSceneContext;
const guide = { color: '#f00', opacity: 10, type: LayoutGuideType.columns };
const frame = {
  id: 'f',
  layoutGuides: [guide, { ...guide, visible: false }],
  rotation: 30,
  type: NodeType.frame,
} as unknown as TSceneNode;

describe('drawLayoutGuides', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should draw every visible layout guide of every frame, rotated with the frame', () => {
    // before
    drawLayoutGuides(
      context,
      [frame, { id: 'plain', type: NodeType.frame } as TSceneNode, { id: 'r', type: NodeType.rectangle } as TSceneNode],
      true,
    );

    // result
    expect(guideRectsMock).toHaveBeenCalledTimes(1);
    expect(guideRectsMock).toHaveBeenCalledWith(guide, frame, 0.5);
    expect(drawRectMock).toHaveBeenCalledWith('gl', 'p', 'b', 'rect-1', 200, 100, context.viewport, 30, { x: 5, y: 5 });
    expect(drawRectMock).toHaveBeenCalledTimes(2);
  });

  it('should draw nothing while layout guides are hidden', () => {
    // before
    drawLayoutGuides(context, [frame], false);

    // result
    expect(drawRectMock).not.toHaveBeenCalled();
  });
});
