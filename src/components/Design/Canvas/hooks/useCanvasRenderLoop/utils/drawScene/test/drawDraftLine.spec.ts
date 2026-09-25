// others
import { DRAFT_FRAME_STROKE } from 'constant/canvas';

// types
import { LineEndpoint, NodeType } from 'types/design/enums';
import { TDraftLine } from 'types/design/types';

// utils
import { drawDraftLine } from '../drawDraftLine';
import { drawLineEndpointHandles } from 'utils/canvas/drawLineEndpointHandles';
import { drawVectorFill } from 'utils/canvas/drawVectorNode/drawVectorFill';
import { getLineStrokePolygon } from 'utils/canvas/shapes/getLineStrokePolygon';

vi.mock('utils/canvas/drawLineEndpointHandles', () => ({ drawLineEndpointHandles: vi.fn() }));
vi.mock('utils/canvas/drawVectorNode/drawVectorFill', () => ({ drawVectorFill: vi.fn() }));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;

const draft: TDraftLine = {
  endPoint: LineEndpoint.lineArrow,
  strokes: [{ color: '#000000', opacity: 100, type: 'solid' }],
  type: NodeType.line,
  x1: 0,
  x2: 10,
  y1: 0,
  y2: 10,
};

describe('drawDraftLine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fill the line outline, arrowhead included, in its stroke color and draw both endpoint handles', () => {
    // action
    drawDraftLine(gl, program, buffer, draft, 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(drawVectorFill).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      null,
      null,
      [getLineStrokePolygon(draft)],
      '#000000',
      100,
      100,
      IDENTITY_VIEWPORT,
      true,
    );
    expect(drawLineEndpointHandles).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
      ],
      DRAFT_FRAME_STROKE,
      100,
      100,
      IDENTITY_VIEWPORT,
    );
  });

  it('should only draw the endpoint handles for a zero-length draft or one without a stroke color', () => {
    // action
    drawDraftLine(gl, program, buffer, { ...draft, x2: 0, y2: 0 }, 100, 100, IDENTITY_VIEWPORT);
    drawDraftLine(gl, program, buffer, { ...draft, strokes: [] }, 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(drawVectorFill).not.toHaveBeenCalled();
    expect(drawLineEndpointHandles).toHaveBeenCalledTimes(2);
  });
});
