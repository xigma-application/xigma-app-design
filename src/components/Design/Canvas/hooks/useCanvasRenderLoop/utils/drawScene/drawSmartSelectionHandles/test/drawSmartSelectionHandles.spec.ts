// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { drawSmartSelectionHandles } from '../drawSmartSelectionHandles';

const drawSmartSelectionGapHandlesMock = vi.fn();
const drawSmartSelectionSwapHandlesMock = vi.fn();

vi.mock('../drawSmartSelectionGapHandles', () => ({
  drawSmartSelectionGapHandles: (...args: unknown[]): void => drawSmartSelectionGapHandlesMock(...args),
}));
vi.mock('../drawSmartSelectionSwapHandles', () => ({
  drawSmartSelectionSwapHandles: (...args: unknown[]): void => drawSmartSelectionSwapHandlesMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;

const rect = (id: string, x: number): TSceneNode =>
  ({
    fill: '#000',
    height: 50,
    id,
    name: 'Rectangle',
    parentId: null,
    rotation: 0,
    type: NodeType.rectangle,
    width: 50,
    x,
    y: 0,
  }) as TSceneNode;

describe('drawSmartSelectionHandles', () => {
  beforeEach(() => {
    drawSmartSelectionGapHandlesMock.mockClear();
    drawSmartSelectionSwapHandlesMock.mockClear();
  });

  it('should draw nothing when the selection does not form a valid layout', () => {
    drawSmartSelectionHandles({ buffer, canvasHeight: 200, canvasWidth: 200, gl, program, viewport: IDENTITY_VIEWPORT } as never, [
      rect('a', 0),
    ]);

    expect(drawSmartSelectionGapHandlesMock).not.toHaveBeenCalled();
    expect(drawSmartSelectionSwapHandlesMock).not.toHaveBeenCalled();
  });

  it('should draw gap and swap handles for a valid row selection', () => {
    drawSmartSelectionHandles({ buffer, canvasHeight: 200, canvasWidth: 200, gl, program, viewport: IDENTITY_VIEWPORT } as never, [
      rect('a', 0),
      rect('b', 100),
    ]);

    expect(drawSmartSelectionGapHandlesMock).toHaveBeenCalledTimes(1);
    expect(drawSmartSelectionSwapHandlesMock).toHaveBeenCalledTimes(1);
  });
});
