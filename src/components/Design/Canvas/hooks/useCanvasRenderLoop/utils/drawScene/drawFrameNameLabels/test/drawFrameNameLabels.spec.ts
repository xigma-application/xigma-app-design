// others
import { FRAME_NAME_LABEL_FILL, FRAME_NAME_LABEL_SELECTED_FILL } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSceneNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { drawFrameNameLabels } from '../drawFrameNameLabels';

const drawFrameNameLabelMock = vi.fn();

vi.mock('../drawFrameNameLabel', () => ({
  drawFrameNameLabel: (...args: unknown[]): void => drawFrameNameLabelMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const imageContext = {} as never;

const buildFrame = (overrides: Partial<TSceneNode> = {}): TSceneNode =>
  ({
    childIds: [],
    clipContent: true,
    fill: '#ffffff',
    height: 100,
    id: 'frame-1',
    name: 'Frame 1',
    parentId: null,
    rotation: 0,
    type: NodeType.frame,
    width: 200,
    x: 0,
    y: 0,
    ...overrides,
  }) as TSceneNode;

const buildRectangle = (): TSceneNode =>
  ({
    fill: '#ffffff',
    height: 10,
    id: 'rect-1',
    name: 'Rectangle',
    parentId: null,
    rotation: 0,
    type: NodeType.rectangle,
    width: 10,
    x: 0,
    y: 0,
  }) as TSceneNode;

const refsWith = (editingLabelId: string | null): TCanvasRefs =>
  createCanvasRefs({ frameName: { editingLabelRef: { current: editingLabelId } } });

describe('drawFrameNameLabels', () => {
  beforeEach(() => {
    drawFrameNameLabelMock.mockClear();
  });

  it('should draw nothing when there are no frame nodes', () => {
    // before
    const rectangle = buildRectangle();

    drawFrameNameLabels(
      { buffer: {} as never, canvasHeight: 150, canvasWidth: 200, gl, imageContext, program: {} as never, viewport: IDENTITY_VIEWPORT },
      [rectangle],
      new Set(),
      null,
      refsWith(null),
      { [rectangle.id]: rectangle },
    );

    // result
    expect(drawFrameNameLabelMock).not.toHaveBeenCalled();
  });

  it('should draw an unselected frame in the muted fill', () => {
    // before
    const frame = buildFrame();

    drawFrameNameLabels(
      { buffer: {} as never, canvasHeight: 150, canvasWidth: 200, gl, imageContext, program: {} as never, viewport: IDENTITY_VIEWPORT },
      [frame],
      new Set(),
      null,
      refsWith(null),
      { [frame.id]: frame },
    );

    // result
    expect(drawFrameNameLabelMock).toHaveBeenCalledWith(gl, imageContext, frame, FRAME_NAME_LABEL_FILL, 200, 150, IDENTITY_VIEWPORT);
  });

  it('should draw a selected frame in the selection blue', () => {
    // before
    const frame = buildFrame();

    drawFrameNameLabels(
      { buffer: {} as never, canvasHeight: 150, canvasWidth: 200, gl, imageContext, program: {} as never, viewport: IDENTITY_VIEWPORT },
      [frame],
      new Set([frame.id]),
      null,
      refsWith(null),
      { [frame.id]: frame },
    );

    // result
    expect(drawFrameNameLabelMock).toHaveBeenCalledWith(
      gl,
      imageContext,
      frame,
      FRAME_NAME_LABEL_SELECTED_FILL,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });

  it('should skip the frame currently being renamed inline', () => {
    // before
    const frame = buildFrame();

    drawFrameNameLabels(
      { buffer: {} as never, canvasHeight: 150, canvasWidth: 200, gl, imageContext, program: {} as never, viewport: IDENTITY_VIEWPORT },
      [frame],
      new Set(),
      null,
      refsWith(frame.id),
      { [frame.id]: frame },
    );

    // result
    expect(drawFrameNameLabelMock).not.toHaveBeenCalled();
  });

  it('should draw a hovered (but unselected) frame’s label in the selection blue', () => {
    // before
    const frame = buildFrame();

    drawFrameNameLabels(
      { buffer: {} as never, canvasHeight: 150, canvasWidth: 200, gl, imageContext, program: {} as never, viewport: IDENTITY_VIEWPORT },
      [frame],
      new Set(),
      frame.id,
      refsWith(null),
      { [frame.id]: frame },
    );

    // result
    expect(drawFrameNameLabelMock).toHaveBeenCalledWith(
      gl,
      imageContext,
      frame,
      FRAME_NAME_LABEL_SELECTED_FILL,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });

  it('should skip a frame whose direct parent is another frame', () => {
    // before
    const outer = buildFrame({ childIds: ['nested'], id: 'outer' });
    const nested = buildFrame({ id: 'nested', parentId: 'outer' });

    drawFrameNameLabels(
      { buffer: {} as never, canvasHeight: 150, canvasWidth: 200, gl, imageContext, program: {} as never, viewport: IDENTITY_VIEWPORT },
      [outer, nested],
      new Set(),
      null,
      refsWith(null),
      { [nested.id]: nested, [outer.id]: outer },
    );

    // result — only the top-level frame gets a label, the one nested inside it does not
    expect(drawFrameNameLabelMock).toHaveBeenCalledTimes(1);
    expect(drawFrameNameLabelMock).toHaveBeenCalledWith(gl, imageContext, outer, FRAME_NAME_LABEL_FILL, 200, 150, IDENTITY_VIEWPORT);
  });

  it('should still draw the label for a frame whose direct parent is a section, not a frame', () => {
    // before
    const section = {
      childIds: ['frame-1'],
      id: 'section-1',
      name: 'Section',
      parentId: null,
      type: NodeType.section,
    } as unknown as TSceneNode;
    const frame = buildFrame({ parentId: 'section-1' });

    drawFrameNameLabels(
      { buffer: {} as never, canvasHeight: 150, canvasWidth: 200, gl, imageContext, program: {} as never, viewport: IDENTITY_VIEWPORT },
      [section, frame],
      new Set(),
      null,
      refsWith(null),
      { [frame.id]: frame, [section.id]: section },
    );

    // result
    expect(drawFrameNameLabelMock).toHaveBeenCalledWith(gl, imageContext, frame, FRAME_NAME_LABEL_FILL, 200, 150, IDENTITY_VIEWPORT);
  });
});
