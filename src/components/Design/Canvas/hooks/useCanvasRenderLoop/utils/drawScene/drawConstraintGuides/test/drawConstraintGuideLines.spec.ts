// others
import { CONSTRAINT_GUIDE_STROKE } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TRectangleNode } from 'types/design/types';

// utils
import { drawConstraintGuideLines } from '../drawConstraintGuideLines';

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

const parent: TFrameNode = {
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
};

const node: TRectangleNode = {
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
};

describe('drawConstraintGuideLines', () => {
  it('should draw one dashed line per axis in the constraint-guide stroke colour', () => {
    // before
    drawConstraintGuideLines(context, node, parent);

    // result
    expect(drawDashedLineMock).toHaveBeenCalledTimes(2);
    expect(drawDashedLineMock.mock.calls[0][4]).toBe(CONSTRAINT_GUIDE_STROKE);
  });
});
