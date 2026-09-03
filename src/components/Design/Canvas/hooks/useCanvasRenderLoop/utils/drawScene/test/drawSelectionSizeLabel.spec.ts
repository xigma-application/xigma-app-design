// others
import { DRAFT_FRAME_STROKE, SELECTION_SIZE_LABEL_EDGE_GAP_PX } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TBoxSceneNode, TSceneNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
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
    childIds: [],
    clipContent: true,
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
    drawSelectionSizeLabel(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext, program, viewport: IDENTITY_VIEWPORT },
      [],
      [],
      createCanvasRefs(),
    );

    // result
    expect(drawValueLabelMock).not.toHaveBeenCalled();
  });

  it('should draw nothing when every selected node is being vector-edited', () => {
    // before
    drawSelectionSizeLabel(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext, program, viewport: IDENTITY_VIEWPORT },
      [buildNode()],
      ['node-1'],
      createCanvasRefs(),
    );

    // result
    expect(drawValueLabelMock).not.toHaveBeenCalled();
  });

  it('should draw nothing when the only selected node is the path being text-edited', () => {
    // before
    drawSelectionSizeLabel(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext, program, viewport: IDENTITY_VIEWPORT },
      [buildNode()],
      [],
      createCanvasRefs(),
      'node-1',
    );

    // result
    expect(drawValueLabelMock).not.toHaveBeenCalled();
  });

  it('should draw nothing while hovering a Smart Selection gap handle, deferring to its own mouse-following label', () => {
    // before
    drawSelectionSizeLabel(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext, program, viewport: IDENTITY_VIEWPORT },
      [buildNode()],
      [],
      createCanvasRefs({ hover: { hoveredSmartSelectionGapRef: { current: { axis: 'x', gapValue: 50, point: { x: 0, y: 0 } } } } }),
    );

    // result
    expect(drawValueLabelMock).not.toHaveBeenCalled();
  });

  it('should draw nothing while dragging a Smart Selection gap handle', () => {
    // before
    drawSelectionSizeLabel(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext, program, viewport: IDENTITY_VIEWPORT },
      [buildNode()],
      [],
      createCanvasRefs({
        smartSelection: {
          gapDragRef: {
            current: {
              anchorPosition: 0,
              anchorSize: 50,
              axis: 'x',
              badgeAnchor: { x: 0, y: 0 },
              cascadeGroups: [],
              currentGapValue: 50,
              dispatchThrottle: { frameId: null, run: null },
              gapIndex: 0,
              hasMoved: true,
              nodeOrigins: {},
              originalGapValue: 50,
              pointerStart: { x: 0, y: 0 },
            },
          },
        },
      }),
    );

    // result
    expect(drawValueLabelMock).not.toHaveBeenCalled();
  });

  it('should draw nothing while dragging a Smart Selection swap handle', () => {
    // before
    drawSelectionSizeLabel(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext, program, viewport: IDENTITY_VIEWPORT },
      [buildNode()],
      [],
      createCanvasRefs({
        smartSelection: {
          swapDragRef: {
            current: {
              dispatchThrottle: { frameId: null, run: null },
              fromIndex: 0,
              hasMoved: true,
              nodeOrigins: {},
              pointerStart: { x: 0, y: 0 },
              slots: [],
              targetIndex: 0,
            },
          },
        },
      }),
    );

    // result
    expect(drawValueLabelMock).not.toHaveBeenCalled();
  });

  it('should draw a blue "W x H" badge below an unrotated single node', () => {
    // before
    drawSelectionSizeLabel(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext, program, viewport: IDENTITY_VIEWPORT },
      [buildNode()],
      [],
      createCanvasRefs(),
    );

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
    drawSelectionSizeLabel(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext, program, viewport: IDENTITY_VIEWPORT },
      [buildNode({ rotation: 30 })],
      [],
      createCanvasRefs(),
    );

    // result
    const [, , , , text, , , , , , options] = drawValueLabelMock.mock.calls[0];

    expect(text).toBe('200 x 100');
    expect(options.angleDeg).toBeCloseTo(30, 5);
  });

  it("should read a horizontal single line by its length, anchored at its own midpoint and offset a small gap below it — parallel to the line, not the rect-selection case's larger perpendicular offset", () => {
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

    drawSelectionSizeLabel(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext, program, viewport: IDENTITY_VIEWPORT },
      [line],
      [],
      createCanvasRefs(),
    );

    // result — anchored at the line's own midpoint, offset straight down by the same small
    // SELECTION_SIZE_LABEL_EDGE_GAP_PX gap used everywhere else, so it sits close to the line
    // without covering it
    const [, , , , text, anchor, offsetDirection, , , , options] = drawValueLabelMock.mock.calls[0];

    expect(text).toBe('120 x 0');
    expect(anchor.x).toBeCloseTo(70, 5);
    expect(anchor.y).toBeCloseTo(20, 5);
    expect(offsetDirection).toEqual({ x: 0, y: 1 });
    expect(options).toEqual({
      angleDeg: expect.closeTo(0, 5),
      edgeGapPx: SELECTION_SIZE_LABEL_EDGE_GAP_PX,
      fill: DRAFT_FRAME_STROKE,
    });
  });

  it("should tilt a single line's badge to run along the segment, still anchored at its midpoint", () => {
    // before — a 30-60-90 triangle: length 100, angle 30deg
    const line = {
      id: 'line-1',
      name: 'Line',
      parentId: null,
      stroke: '#000',
      type: NodeType.line,
      x1: 0,
      x2: Math.sqrt(3) * 50,
      y1: 0,
      y2: 50,
    } as TSceneNode;

    drawSelectionSizeLabel(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext, program, viewport: IDENTITY_VIEWPORT },
      [line],
      [],
      createCanvasRefs(),
    );

    // result
    const [, , , , text, anchor, , , , , options] = drawValueLabelMock.mock.calls[0];

    expect(text).toBe('100 x 0');
    expect(anchor.x).toBeCloseTo((Math.sqrt(3) * 50) / 2, 5);
    expect(anchor.y).toBeCloseTo(25, 5);
    expect(options.angleDeg).toBeCloseTo(30, 5);
  });

  it("should flip a single line's badge angle to the equivalent readable one once the line crosses vertical, instead of rendering upside down", () => {
    // before — a near-vertical line just past 90deg raw angle
    const line = {
      id: 'line-1',
      name: 'Line',
      parentId: null,
      stroke: '#000',
      type: NodeType.line,
      x1: 0,
      x2: -10,
      y1: 0,
      y2: 100,
    } as TSceneNode;

    drawSelectionSizeLabel(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext, program, viewport: IDENTITY_VIEWPORT },
      [line],
      [],
      createCanvasRefs(),
    );

    // result — raw angle here is just over 90deg; the label must land near -90deg, not over 90deg
    const [, , , , , , , , , , options] = drawValueLabelMock.mock.calls[0];

    expect(options.angleDeg).toBeLessThan(0);
    expect(Math.abs(options.angleDeg)).toBeLessThanOrEqual(90);
  });

  it('should measure the combined axis-aligned bounds for a multi-selection', () => {
    // before
    const nodes = [buildNode({ id: 'a', width: 100, x: 0 }), buildNode({ id: 'b', width: 100, x: 300 })];

    drawSelectionSizeLabel(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext, program, viewport: IDENTITY_VIEWPORT },
      nodes,
      [],
      createCanvasRefs(),
    );

    // result — bounds span x:[0,400], y:[0,100]
    const [, , , , text, anchor, , , , , options] = drawValueLabelMock.mock.calls[0];

    expect(text).toBe('400 x 100');
    expect(anchor.x).toBeCloseTo(200, 5);
    expect(anchor.y).toBeCloseTo(100, 5);
    expect(options.angleDeg).toBeCloseTo(0, 5);
  });
});
