// store
import { selectAreFrameOutlinesVisible } from 'store/design/selectors';
import { store } from 'store';
import { toggleFrameOutlinesVisible } from 'store/design/slice';

// types
import { NodeType } from 'types/design/enums';
import { TGroupNode, TSceneNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { drawFrameOutlines } from '../drawFrameOutlines';
import { drawThickOutline } from 'utils/canvas/drawThickOutline/drawThickOutline';

vi.mock('utils/canvas/drawThickOutline/drawThickOutline', () => ({ drawThickOutline: vi.fn() }));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const context = {
  buffer: {} as WebGLBuffer,
  canvasHeight: 100,
  canvasWidth: 100,
  gl: {} as WebGL2RenderingContext,
  imageContext: {} as never,
  program: {} as WebGLProgram,
  viewport: IDENTITY_VIEWPORT,
};

const buildFrame = (id: string): TSceneNode => ({
  childIds: [],
  clipContent: true,
  fill: '#ff0000',
  height: 20,
  id,
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 10,
  x: 0,
  y: 0,
});

const buildRectangle = (id: string): TSceneNode => ({
  fill: '#00ff00',
  height: 20,
  id,
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 10,
  x: 0,
  y: 0,
});

describe('drawFrameOutlines', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    if (!selectAreFrameOutlinesVisible(store.getState())) {
      store.dispatch(toggleFrameOutlinesVisible());
    }
  });

  it('should draw nothing when the preference is off', () => {
    store.dispatch(toggleFrameOutlinesVisible());

    const frameA = buildFrame('a');
    drawFrameOutlines(context, [frameA], createCanvasRefs(), { a: frameA });

    expect(drawThickOutline).not.toHaveBeenCalled();
  });

  it('should draw one outline per frame, skipping every other node type in the same list', () => {
    const frameA = buildFrame('a');
    const rectB = buildRectangle('b');
    const frameC = buildFrame('c');
    drawFrameOutlines(context, [frameA, rectB, frameC], createCanvasRefs(), { a: frameA, b: rectB, c: frameC });

    expect(drawThickOutline).toHaveBeenCalledTimes(2);
  });

  it('should outline a frame at its live reorder-ghost position, not its frozen store position', () => {
    // mock — a same-parent reorder preview has the frame's ghost riding the cursor at (50, 30)
    const refs = createCanvasRefs();
    refs.transform.autoLayoutReorderPreviewRef.current = { activeIndex: 0, frameId: 'parent', positions: { a: { x: 50, y: 30 } } };
    const frameA = buildFrame('a');

    // action — the frame's own store position is still (0, 0)
    drawFrameOutlines(context, [frameA], refs, { a: frameA });

    // result — the outline follows the ghost
    expect(drawThickOutline).toHaveBeenCalledTimes(1);
    expect((drawThickOutline as ReturnType<typeof vi.fn>).mock.calls[0][3]).toMatchObject({ x: 50, y: 30 });
  });

  it('should outline a frame nested inside a dragged group at the group’s inherited ghost position', () => {
    // mock — only the group's id has an override; the nested frame has none of its own
    const refs = createCanvasRefs();
    refs.transform.autoLayoutReorderPreviewRef.current = { activeIndex: 0, frameId: 'parent', positions: { g: { x: 80, y: 90 } } };
    const frameA = { ...buildFrame('a'), parentId: 'g' };
    const group: TGroupNode = { childIds: ['a'], height: 10, id: 'g', name: 'Group', parentId: null, rotation: 0, type: NodeType.group, width: 10, x: 0, y: 0 }; // prettier-ignore

    // action
    drawFrameOutlines(context, [frameA], refs, { a: frameA, g: group });

    // result — the nested frame's outline inherits the group's ghost delta
    expect(drawThickOutline).toHaveBeenCalledTimes(1);
    expect((drawThickOutline as ReturnType<typeof vi.fn>).mock.calls[0][3]).toMatchObject({ x: 80, y: 90 });
  });
});
