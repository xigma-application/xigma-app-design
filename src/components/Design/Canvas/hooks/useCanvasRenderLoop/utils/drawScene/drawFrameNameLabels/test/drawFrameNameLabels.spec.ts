// others
import { FRAME_NAME_LABEL_FILL, FRAME_NAME_LABEL_SELECTED_FILL } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSceneNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { drawFrameNameLabels } from '../drawFrameNameLabels';

const drawFrameNameLabelVerticesMock = vi.fn();

vi.mock('../drawFrameNameLabelVertices', () => ({
  drawFrameNameLabelVertices: (...args: unknown[]): void => drawFrameNameLabelVerticesMock(...args),
}));
vi.mock('../getFrameNameLabelVertices', () => ({
  getFrameNameLabelVertices: (node: TSceneNode): Float32Array => new Float32Array([Number(node.id.replace(/\D/g, '') || 0)]),
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
    fills: [{ color: '#ffffff', opacity: 100, type: 'solid' }],
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
    drawFrameNameLabelVerticesMock.mockClear();
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
    expect(drawFrameNameLabelVerticesMock).not.toHaveBeenCalled();
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
    expect(drawFrameNameLabelVerticesMock).toHaveBeenCalledWith(
      gl,
      imageContext,
      expect.any(Float32Array),
      FRAME_NAME_LABEL_FILL,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
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
    expect(drawFrameNameLabelVerticesMock).toHaveBeenCalledWith(
      gl,
      imageContext,
      expect.any(Float32Array),
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
    expect(drawFrameNameLabelVerticesMock).not.toHaveBeenCalled();
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
    expect(drawFrameNameLabelVerticesMock).toHaveBeenCalledWith(
      gl,
      imageContext,
      expect.any(Float32Array),
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
    expect(drawFrameNameLabelVerticesMock).toHaveBeenCalledTimes(1);
    expect(drawFrameNameLabelVerticesMock).toHaveBeenCalledWith(
      gl,
      imageContext,
      expect.any(Float32Array),
      FRAME_NAME_LABEL_FILL,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
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
    expect(drawFrameNameLabelVerticesMock).toHaveBeenCalledWith(
      gl,
      imageContext,
      expect.any(Float32Array),
      FRAME_NAME_LABEL_FILL,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });

  it('should draw all labels of the same colour in one call, and the highlighted ones in a second', () => {
    // before
    const first = buildFrame({ id: 'frame-1' });
    const second = buildFrame({ id: 'frame-2' });
    const third = buildFrame({ id: 'frame-3' });

    drawFrameNameLabels(
      { buffer: {} as never, canvasHeight: 150, canvasWidth: 200, gl, imageContext, program: {} as never, viewport: IDENTITY_VIEWPORT },
      [first, second, third],
      new Set([second.id]),
      null,
      refsWith(null),
      { [first.id]: first, [second.id]: second, [third.id]: third },
    );

    // result
    expect(drawFrameNameLabelVerticesMock).toHaveBeenCalledTimes(2);
    expect(drawFrameNameLabelVerticesMock).toHaveBeenCalledWith(
      gl,
      imageContext,
      new Float32Array([1, 3]),
      FRAME_NAME_LABEL_FILL,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
    expect(drawFrameNameLabelVerticesMock).toHaveBeenCalledWith(
      gl,
      imageContext,
      new Float32Array([2]),
      FRAME_NAME_LABEL_SELECTED_FILL,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });
});
