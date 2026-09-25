// others
import {
  SLICE_OUTLINE_DASH_GAP_PX,
  SLICE_OUTLINE_DASH_LENGTH_PX,
  SLICE_OUTLINE_SELECTED_STROKE,
  SLICE_OUTLINE_STROKE,
} from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { drawDashedRectOutline } from 'utils/canvas/drawDashedRectOutline';
import { drawSliceOutlines } from '../drawSliceOutlines';

vi.mock('utils/canvas/drawDashedRectOutline', () => ({ drawDashedRectOutline: vi.fn() }));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const context = {
  buffer: {} as WebGLBuffer,
  canvasHeight: 100,
  canvasWidth: 200,
  gl: {} as WebGL2RenderingContext,
  imageContext: {} as never,
  program: {} as WebGLProgram,
  viewport: IDENTITY_VIEWPORT,
};

const slice = {
  height: 20,
  id: 'slice',
  name: 'Slice',
  parentId: null,
  rotation: 0,
  type: NodeType.slice,
  width: 10,
  x: 0,
  y: 0,
} as TSceneNode;
const rectangle = { ...slice, fills: [], id: 'rectangle', type: NodeType.rectangle } as TSceneNode;

describe('drawSliceOutlines', () => {
  beforeEach(() => {
    vi.mocked(drawDashedRectOutline).mockClear();
  });

  it('should draw a dark dashed outline around every slice and skip other layers', () => {
    // before
    drawSliceOutlines(context, [slice, rectangle], new Set());

    // result
    expect(drawDashedRectOutline).toHaveBeenCalledTimes(1);
    expect(drawDashedRectOutline).toHaveBeenCalledWith(
      context.gl,
      context.program,
      context.buffer,
      { height: 20, width: 10, x: 0, y: 0 },
      SLICE_OUTLINE_STROKE,
      200,
      100,
      IDENTITY_VIEWPORT,
      0,
      SLICE_OUTLINE_DASH_LENGTH_PX,
      SLICE_OUTLINE_DASH_GAP_PX,
    );
  });

  it('should outline the upright box around a rotated slice, in blue while it is selected', () => {
    // mock
    const rotated = { ...slice, height: 10, rotation: 90, width: 30 } as TSceneNode;

    // before
    drawSliceOutlines(context, [rotated], new Set(['slice']));

    // result
    const [, , , rect, color, , , , rotation] = vi.mocked(drawDashedRectOutline).mock.calls[0];

    expect(rect.x).toBeCloseTo(10);
    expect(rect.y).toBeCloseTo(-10);
    expect(rect.width).toBeCloseTo(10);
    expect(rect.height).toBeCloseTo(30);
    expect(color).toBe(SLICE_OUTLINE_SELECTED_STROKE);
    expect(rotation).toBe(0);
  });
});
