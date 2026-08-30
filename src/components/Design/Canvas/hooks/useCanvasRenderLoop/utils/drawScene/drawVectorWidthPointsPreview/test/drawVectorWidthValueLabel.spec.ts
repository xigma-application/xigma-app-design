// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { drawVectorWidthValueLabel } from '../drawVectorWidthValueLabel';

const drawValueLabelMock = vi.fn();
const getVectorWidthLabelTargetsMock = vi.fn();

vi.mock('utils/canvas/text/drawValueLabel/drawValueLabel', () => ({
  drawValueLabel: (...args: unknown[]): void => drawValueLabelMock(...args),
}));
vi.mock('../getVectorWidthLabelTargets', () => ({
  getVectorWidthLabelTargets: (...args: unknown[]): unknown => getVectorWidthLabelTargetsMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;
const imageContext = {} as never;

const buildNode = (overrides: Partial<TVectorNode> = {}): TVectorNode => ({
  fillColor: '#000',
  filledFaceKeys: [],
  id: 'node-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
  strokeColor: '#000',
  strokeWidth: 4,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
  ...overrides,
});

describe('drawVectorWidthValueLabel', () => {
  beforeEach(() => {
    drawValueLabelMock.mockClear();
    getVectorWidthLabelTargetsMock.mockClear();
  });

  it('should draw nothing when the resolver finds no targets', () => {
    // mock
    getVectorWidthLabelTargetsMock.mockReturnValue([]);

    // before
    drawVectorWidthValueLabel(gl, program, buffer, imageContext, {}, createCanvasRefs(), 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawValueLabelMock).not.toHaveBeenCalled();
  });

  it('should draw nothing for a target whose node no longer exists', () => {
    // mock
    getVectorWidthLabelTargetsMock.mockReturnValue([
      { nodeId: 'missing-node', point: { id: 'p1', leftOffset: 4, position: 0.5, rightOffset: 6 }, side: 'right' },
    ]);

    // before
    drawVectorWidthValueLabel(gl, program, buffer, imageContext, {}, createCanvasRefs(), 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawValueLabelMock).not.toHaveBeenCalled();
  });

  it('should draw nothing for a target whose node no longer has a valid chain', () => {
    // mock — an empty segments map has no chain to walk
    const node = buildNode({ segments: {} });
    const nodes: Record<string, TSceneNode> = { [node.id]: node };

    getVectorWidthLabelTargetsMock.mockReturnValue([
      { nodeId: node.id, point: { id: 'p1', leftOffset: 4, position: 0.5, rightOffset: 6 }, side: 'right' },
    ]);

    // before
    drawVectorWidthValueLabel(gl, program, buffer, imageContext, nodes, createCanvasRefs(), 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawValueLabelMock).not.toHaveBeenCalled();
  });

  it('should anchor the label at the right handle, showing the total width, when the target side is right', () => {
    // mock — a(0,0)->b(100,0), point at midpoint (50,0), normal (0,1); rightHandle = anchor - normal*rightOffset(6)
    const node = buildNode();
    const nodes: Record<string, TSceneNode> = { [node.id]: node };

    getVectorWidthLabelTargetsMock.mockReturnValue([
      { nodeId: node.id, point: { id: 'p1', leftOffset: 4, position: 0.5, rightOffset: 6 }, side: 'right' },
    ]);

    // before
    drawVectorWidthValueLabel(gl, program, buffer, imageContext, nodes, createCanvasRefs(), 200, 150, IDENTITY_VIEWPORT);

    // result — leftOffset(4) + rightOffset(6) = 10; direction is -normal, continuing past the handle
    expect(drawValueLabelMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      imageContext,
      '10',
      { x: 50, y: -6 },
      { x: 0, y: -1 },
      200,
      150,
      IDENTITY_VIEWPORT,
      { isHovered: false },
    );
  });

  it('should anchor the label at the left handle, offset further along the normal, when the target side is left', () => {
    // mock — leftHandle = anchor + normal*leftOffset(4)
    const node = buildNode();
    const nodes: Record<string, TSceneNode> = { [node.id]: node };

    getVectorWidthLabelTargetsMock.mockReturnValue([
      { nodeId: node.id, point: { id: 'p1', leftOffset: 4, position: 0.5, rightOffset: 6 }, side: 'left' },
    ]);

    // before
    drawVectorWidthValueLabel(gl, program, buffer, imageContext, nodes, createCanvasRefs(), 200, 150, IDENTITY_VIEWPORT);

    // result — direction is +normal here, continuing past the handle on the opposite side
    // (normal.x is computed as -0 for this horizontal segment — harmless, but exact here)
    expect(drawValueLabelMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      imageContext,
      '10',
      { x: 50, y: 4 },
      { x: -0, y: 1 },
      200,
      150,
      IDENTITY_VIEWPORT,
      { isHovered: false },
    );
  });

  it('should mark the label hovered when the hovered-label ref matches its node, segment and t', () => {
    // mock — midpoint of the single segment resolves to { segmentId: 's1', t: 0.5 }
    const node = buildNode();
    const nodes: Record<string, TSceneNode> = { [node.id]: node };
    const refs = createCanvasRefs();

    refs.hover.hoveredVectorWidthLabelRef.current = { nodeId: node.id, segmentId: 's1', t: 0.5 };
    getVectorWidthLabelTargetsMock.mockReturnValue([
      { nodeId: node.id, point: { id: 'p1', leftOffset: 4, position: 0.5, rightOffset: 6 }, side: 'right' },
    ]);

    // before
    drawVectorWidthValueLabel(gl, program, buffer, imageContext, nodes, refs, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawValueLabelMock.mock.calls[0][10]).toEqual({ isHovered: true });
  });

  it('should not mark the label hovered when the hovered-label ref points at a different width point', () => {
    // mock
    const node = buildNode();
    const nodes: Record<string, TSceneNode> = { [node.id]: node };
    const refs = createCanvasRefs();

    refs.hover.hoveredVectorWidthLabelRef.current = { nodeId: node.id, segmentId: 's1', t: 0.2 };
    getVectorWidthLabelTargetsMock.mockReturnValue([
      { nodeId: node.id, point: { id: 'p1', leftOffset: 4, position: 0.5, rightOffset: 6 }, side: 'right' },
    ]);

    // before
    drawVectorWidthValueLabel(gl, program, buffer, imageContext, nodes, refs, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawValueLabelMock.mock.calls[0][10]).toEqual({ isHovered: false });
  });

  it('should draw one label per target when the resolver returns a whole synced group', () => {
    // mock — a group resize: two regulators on the same node, both on the right side
    const node = buildNode({
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    });
    const nodes: Record<string, TSceneNode> = { [node.id]: node };

    getVectorWidthLabelTargetsMock.mockReturnValue([
      { nodeId: node.id, point: { id: 'p1', leftOffset: 4, position: 0.2, rightOffset: 4 }, side: 'right' },
      { nodeId: node.id, point: { id: 'p2', leftOffset: 9, position: 0.7, rightOffset: 9 }, side: 'right' },
    ]);

    // before
    drawVectorWidthValueLabel(gl, program, buffer, imageContext, nodes, createCanvasRefs(), 200, 150, IDENTITY_VIEWPORT);

    // result — one call per synced regulator, each at its own position but the same shared side
    expect(drawValueLabelMock).toHaveBeenCalledTimes(2);
    expect(drawValueLabelMock).toHaveBeenNthCalledWith(
      1,
      gl,
      program,
      buffer,
      imageContext,
      '8',
      { x: 20, y: -4 },
      { x: 0, y: -1 },
      200,
      150,
      IDENTITY_VIEWPORT,
      { isHovered: false },
    );
    expect(drawValueLabelMock).toHaveBeenNthCalledWith(
      2,
      gl,
      program,
      buffer,
      imageContext,
      '18',
      { x: 70, y: -9 },
      { x: 0, y: -1 },
      200,
      150,
      IDENTITY_VIEWPORT,
      { isHovered: false },
    );
  });
});
