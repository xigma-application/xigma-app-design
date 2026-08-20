// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { drawVectorEditOutline } from '../drawVectorEditOutline';

const drawEditModeOutlineMock = vi.fn();
const drawHoveredSegmentHighlightMock = vi.fn();

vi.mock('../drawEditModeOutline', () => ({ drawEditModeOutline: (...args: unknown[]): void => drawEditModeOutlineMock(...args) }));
vi.mock('../drawHoveredSegmentHighlight', () => ({
  drawHoveredSegmentHighlight: (...args: unknown[]): void => drawHoveredSegmentHighlightMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const node: TVectorNode = {
  fillColor: null,
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {},
};

describe('drawVectorEditOutline', () => {
  beforeEach(() => {
    drawEditModeOutlineMock.mockClear();
    drawHoveredSegmentHighlightMock.mockClear();
  });

  it('should draw the edit-mode outline and the hovered-segment highlight, each as its own concern', () => {
    // before
    const gl = {} as WebGL2RenderingContext;
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    drawVectorEditOutline(gl, program, buffer, node, 's1', 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawEditModeOutlineMock).toHaveBeenCalledWith(gl, program, buffer, node, 200, 150, IDENTITY_VIEWPORT);
    expect(drawHoveredSegmentHighlightMock).toHaveBeenCalledWith(gl, program, buffer, node, 's1', 200, 150, IDENTITY_VIEWPORT);
  });
});
