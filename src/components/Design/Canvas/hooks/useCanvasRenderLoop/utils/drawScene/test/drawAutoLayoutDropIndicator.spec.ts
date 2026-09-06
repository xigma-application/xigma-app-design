// others
import { FRAME_DROP_TARGET_STROKE } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { drawAutoLayoutDropIndicator } from '../drawAutoLayoutDropIndicator';

const drawRectMock = vi.fn();

vi.mock('utils/canvas/drawRect/drawRect', () => ({
  drawRect: (...args: unknown[]): void => drawRectMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;

const frame = (rotation: number): TFrameNode => ({
  childIds: [],
  clipContent: true,
  fill: '#fff',
  height: 100,
  id: 'f1',
  name: 'Frame',
  parentId: null,
  rotation,
  type: NodeType.frame,
  width: 200,
  x: 0,
  y: 0,
});

describe('drawAutoLayoutDropIndicator', () => {
  beforeEach(() => {
    drawRectMock.mockClear();
  });

  it('should draw a filled bar at the indicator rect referenced by the drop-target ref, unrotated', () => {
    // mock
    const refs = createCanvasRefs({
      transform: {
        autoLayoutDropTargetRef: {
          current: { frameId: 'f1', index: 0, indicator: { height: 2, width: 30, x: 10, y: 20 }, siblingPositions: {} },
        },
      },
    });

    // before
    drawAutoLayoutDropIndicator(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT },
      refs,
      { f1: frame(0) },
    );

    // result
    expect(drawRectMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { fill: FRAME_DROP_TARGET_STROKE, height: 2, width: 30, x: 10, y: 20 },
      200,
      150,
      IDENTITY_VIEWPORT,
      0,
      { x: 100, y: 50 },
    );
  });

  it('should draw the bar rotated around the frame’s own centre when the frame is rotated', () => {
    // mock — the indicator's own rect is still in the frame's local coordinates; only the rotation
    // pivot (the frame's centre) makes it land correctly once the frame itself is tilted
    const refs = createCanvasRefs({
      transform: {
        autoLayoutDropTargetRef: {
          current: { frameId: 'f1', index: 0, indicator: { height: 2, width: 30, x: 10, y: 20 }, siblingPositions: {} },
        },
      },
    });

    // before
    drawAutoLayoutDropIndicator(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT },
      refs,
      { f1: frame(90) },
    );

    // result
    expect(drawRectMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { fill: FRAME_DROP_TARGET_STROKE, height: 2, width: 30, x: 10, y: 20 },
      200,
      150,
      IDENTITY_VIEWPORT,
      90,
      { x: 100, y: 50 },
    );
  });

  it('should draw nothing when the drop-target ref is empty', () => {
    // before
    drawAutoLayoutDropIndicator(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT },
      createCanvasRefs(),
      {},
    );

    // result
    expect(drawRectMock).not.toHaveBeenCalled();
  });

  it('should draw nothing when the referenced frame no longer resolves to a node', () => {
    // mock
    const refs = createCanvasRefs({
      transform: {
        autoLayoutDropTargetRef: {
          current: { frameId: 'gone', index: 0, indicator: { height: 2, width: 30, x: 10, y: 20 }, siblingPositions: {} },
        },
      },
    });

    // before
    drawAutoLayoutDropIndicator(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT },
      refs,
      {} as Record<string, TSceneNode>,
    );

    // result
    expect(drawRectMock).not.toHaveBeenCalled();
  });
});
