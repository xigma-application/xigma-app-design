// others
import { DRAFT_FRAME_STROKE, SELECTION_SIZE_LABEL_EDGE_GAP_PX } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TBoxSceneNode, TSceneNode } from 'types/design/types';

// utils
import { drawSelectionSizeLabel } from '../drawSelectionSizeLabel';

const drawValueLabelMock = vi.fn();

vi.mock('utils/canvas/text/drawValueLabel/drawValueLabel', () => ({
  drawValueLabel: (...args: unknown[]): void => drawValueLabelMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;
const imageContext = {} as never;

const buildNode = (overrides: Partial<TBoxSceneNode> = {}): TSceneNode =>
  ({
    fill: '#ff0000',
    height: 100,
    id: 'node-1',
    name: 'Frame',
    parentId: null,
    rotation: 0,
    type: NodeType.frame,
    width: 200,
    x: 0,
    y: 0,
    ...overrides,
  }) as TSceneNode;

describe('drawSelectionSizeLabel', () => {
  beforeEach(() => {
    drawValueLabelMock.mockClear();
  });

  it('should draw nothing when there is no selection', () => {
    // before
    drawSelectionSizeLabel(gl, program, buffer, imageContext, [], 200, 150, IDENTITY_VIEWPORT, []);

    // result
    expect(drawValueLabelMock).not.toHaveBeenCalled();
  });

  it('should draw nothing when every selected node is being vector-edited', () => {
    // before
    drawSelectionSizeLabel(gl, program, buffer, imageContext, [buildNode()], 200, 150, IDENTITY_VIEWPORT, ['node-1']);

    // result
    expect(drawValueLabelMock).not.toHaveBeenCalled();
  });

  it('should draw nothing when the only selected node is the path being text-edited', () => {
    // before
    drawSelectionSizeLabel(gl, program, buffer, imageContext, [buildNode()], 200, 150, IDENTITY_VIEWPORT, [], 'node-1');

    // result
    expect(drawValueLabelMock).not.toHaveBeenCalled();
  });

  it('should draw a blue "W x H" badge below an unrotated single node', () => {
    // before
    drawSelectionSizeLabel(gl, program, buffer, imageContext, [buildNode()], 200, 150, IDENTITY_VIEWPORT, []);

    // result
    const [, , , , text, anchor, offsetDirection, , , , options] = drawValueLabelMock.mock.calls[0];

    expect(text).toBe('200 x 100');
    expect(anchor.x).toBeCloseTo(100, 5);
    expect(anchor.y).toBeCloseTo(100, 5);
    expect(offsetDirection.y).toBeCloseTo(1, 5);
    expect(options).toEqual({ angleDeg: expect.closeTo(0, 5), edgeGapPx: SELECTION_SIZE_LABEL_EDGE_GAP_PX, fill: DRAFT_FRAME_STROKE });
  });

  it('should keep the badge parallel to the edge when the single node is rotated', () => {
    // before
    drawSelectionSizeLabel(gl, program, buffer, imageContext, [buildNode({ rotation: 30 })], 200, 150, IDENTITY_VIEWPORT, []);

    // result
    const [, , , , text, , , , , , options] = drawValueLabelMock.mock.calls[0];

    expect(text).toBe('200 x 100');
    expect(options.angleDeg).toBeCloseTo(30, 5);
  });

  it('should treat a single line as unrotated, measuring its endpoint span', () => {
    // before
    const line = {
      id: 'line-1',
      name: 'Line',
      parentId: null,
      stroke: '#000',
      type: NodeType.line,
      x1: 10,
      x2: 130,
      y1: 20,
      y2: 20,
    } as TSceneNode;

    drawSelectionSizeLabel(gl, program, buffer, imageContext, [line], 200, 150, IDENTITY_VIEWPORT, []);

    // result
    const [, , , , text, , , , , , options] = drawValueLabelMock.mock.calls[0];

    expect(text).toBe('120 x 0');
    expect(options.angleDeg).toBeCloseTo(0, 5);
  });

  it('should measure the combined axis-aligned bounds for a multi-selection', () => {
    // before
    const nodes = [buildNode({ id: 'a', width: 100, x: 0 }), buildNode({ id: 'b', width: 100, x: 300 })];

    drawSelectionSizeLabel(gl, program, buffer, imageContext, nodes, 200, 150, IDENTITY_VIEWPORT, []);

    // result — bounds span x:[0,400], y:[0,100]
    const [, , , , text, anchor, , , , , options] = drawValueLabelMock.mock.calls[0];

    expect(text).toBe('400 x 100');
    expect(anchor.x).toBeCloseTo(200, 5);
    expect(anchor.y).toBeCloseTo(100, 5);
    expect(options.angleDeg).toBeCloseTo(0, 5);
  });
});
