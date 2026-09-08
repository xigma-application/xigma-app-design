// others
import { CONSTRAINT_GUIDE_STROKE } from 'constant/canvas';

// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode, TLineNode, TRectangleNode, TSceneNode } from 'types/design/types';

// utils
import { drawConstraintGuides } from '../drawConstraintGuides';

const drawDashedLineMock = vi.fn();

vi.mock('utils/canvas/drawDashedLine', () => ({
  drawDashedLine: (...args: unknown[]): void => drawDashedLineMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const context = {
  buffer: {} as WebGLBuffer,
  canvasHeight: 150,
  canvasWidth: 200,
  gl: {} as WebGL2RenderingContext,
  imageContext: {} as never,
  program: {} as WebGLProgram,
  viewport: IDENTITY_VIEWPORT,
};

const frame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: ['r1'],
  clipContent: true,
  fill: '#fff',
  height: 200,
  id: 'frame-1',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 400,
  x: 100,
  y: 100,
  ...overrides,
});

const rect = (overrides: Partial<TRectangleNode> = {}): TRectangleNode => ({
  fill: '#000',
  height: 40,
  id: 'r1',
  name: 'Rectangle',
  parentId: 'frame-1',
  rotation: 0,
  type: NodeType.rectangle,
  width: 40,
  x: 150,
  y: 130,
  ...overrides,
});

describe('drawConstraintGuides', () => {
  beforeEach(() => {
    drawDashedLineMock.mockClear();
  });

  it('should draw one dashed line per axis for a single selected freeform-frame child', () => {
    const child = rect();

    drawConstraintGuides(context, [child], { 'frame-1': frame(), r1: child });

    expect(drawDashedLineMock).toHaveBeenCalledTimes(2);
    expect(drawDashedLineMock.mock.calls[0][4]).toBe(CONSTRAINT_GUIDE_STROKE);
  });

  it('should draw nothing when more than one node is selected', () => {
    const child = rect();
    const other = rect({ id: 'r2' });

    drawConstraintGuides(context, [child, other], { 'frame-1': frame(), r1: child, r2: other });

    expect(drawDashedLineMock).not.toHaveBeenCalled();
  });

  it('should draw nothing for a plain flow child of an auto-layout frame', () => {
    const child = rect();

    drawConstraintGuides(context, [child], { 'frame-1': frame({ layoutMode: LayoutMode.horizontal }), r1: child });

    expect(drawDashedLineMock).not.toHaveBeenCalled();
  });

  it('should draw for an ignoreAutoLayout child of an auto-layout frame', () => {
    const child = rect({ ignoreAutoLayout: true });

    drawConstraintGuides(context, [child], { 'frame-1': frame({ layoutMode: LayoutMode.vertical }), r1: child });

    expect(drawDashedLineMock).toHaveBeenCalledTimes(2);
  });

  it('should draw nothing for a non-box selected node', () => {
    const line: TLineNode = {
      id: 'l1',
      name: 'Line',
      parentId: 'frame-1',
      stroke: '#000',
      type: NodeType.line,
      x1: 0,
      x2: 10,
      y1: 0,
      y2: 10,
    };

    drawConstraintGuides(context, [line as TSceneNode], { 'frame-1': frame({ childIds: ['l1'] }), l1: line });

    expect(drawDashedLineMock).not.toHaveBeenCalled();
  });

  it('should draw nothing when the selected node has no parent', () => {
    const child = rect({ parentId: null });

    drawConstraintGuides(context, [child], { r1: child });

    expect(drawDashedLineMock).not.toHaveBeenCalled();
  });
});
