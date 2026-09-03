// others
import { FRAME_DROP_TARGET_STROKE, FRAME_DROP_TARGET_STROKE_WIDTH_PX } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { drawDropTargetFrameOutline } from '../drawDropTargetFrameOutline';

const drawThickOutlineMock = vi.fn();

vi.mock('utils/canvas/drawThickOutline/drawThickOutline', () => ({
  drawThickOutline: (...args: unknown[]): void => drawThickOutlineMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;

const frame = (id: string, x: number, y: number, width: number, height: number, rotation = 0): TSceneNode =>
  ({
    childIds: [],
    clipContent: true,
    fill: '#fff',
    height,
    id,
    name: 'Frame',
    parentId: null,
    rotation,
    type: NodeType.frame,
    width,
    x,
    y,
  }) as TSceneNode;

const section = (id: string, x: number, y: number, width: number, height: number): TSceneNode =>
  ({
    childIds: [],
    fill: '#444',
    height,
    id,
    name: 'Section',
    parentId: null,
    rotation: 0,
    type: NodeType.section,
    width,
    x,
    y,
  }) as TSceneNode;

const rect = (id: string, x: number, y: number, width: number, height: number): TSceneNode =>
  ({ fill: '#000', height, id, name: 'Rectangle', parentId: null, rotation: 0, type: NodeType.rectangle, width, x, y }) as TSceneNode;

describe('drawDropTargetFrameOutline', () => {
  beforeEach(() => {
    drawThickOutlineMock.mockClear();
  });

  it('should draw a thick outline around the frame referenced by the drop-target ref', () => {
    // mock
    const targetFrame = frame('f1', 10, 20, 100, 50, 30);
    const nodesById = { f1: targetFrame };
    const refs = createCanvasRefs({ transform: { dropTargetFrameIdRef: { current: 'f1' } } });

    // before
    drawDropTargetFrameOutline(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT },
      refs,
      nodesById,
    );

    // result
    expect(drawThickOutlineMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { height: 50, width: 100, x: 10, y: 20 },
      FRAME_DROP_TARGET_STROKE,
      FRAME_DROP_TARGET_STROKE_WIDTH_PX,
      200,
      150,
      IDENTITY_VIEWPORT,
      30,
    );
  });

  it('should draw nothing when the drop-target ref is empty', () => {
    // before
    drawDropTargetFrameOutline(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT },
      createCanvasRefs(),
      {},
    );

    // result
    expect(drawThickOutlineMock).not.toHaveBeenCalled();
  });

  it('should draw nothing when the referenced id no longer resolves to a node', () => {
    // before
    const refs = createCanvasRefs({ transform: { dropTargetFrameIdRef: { current: 'gone' } } });

    drawDropTargetFrameOutline(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT },
      refs,
      {},
    );

    // result
    expect(drawThickOutlineMock).not.toHaveBeenCalled();
  });

  it('should draw a thick outline around a section referenced by the drop-target ref, same as a frame', () => {
    // mock
    const targetSection = section('s1', 10, 20, 100, 50);
    const nodesById = { s1: targetSection };
    const refs = createCanvasRefs({ transform: { dropTargetFrameIdRef: { current: 's1' } } });

    // before
    drawDropTargetFrameOutline(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT },
      refs,
      nodesById,
    );

    // result
    expect(drawThickOutlineMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { height: 50, width: 100, x: 10, y: 20 },
      FRAME_DROP_TARGET_STROKE,
      FRAME_DROP_TARGET_STROKE_WIDTH_PX,
      200,
      150,
      IDENTITY_VIEWPORT,
      0,
    );
  });

  it('should draw nothing when the referenced id resolves to a non-container node', () => {
    // mock
    const targetRect = rect('r1', 10, 20, 100, 50);
    const nodesById = { r1: targetRect };
    const refs = createCanvasRefs({ transform: { dropTargetFrameIdRef: { current: 'r1' } } });

    // before
    drawDropTargetFrameOutline(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT },
      refs,
      nodesById,
    );

    // result
    expect(drawThickOutlineMock).not.toHaveBeenCalled();
  });
});
