// types
import { TDrawSceneContext } from '../../../types';

// utils
import { drawGridTrackAffordanceHandleHighlight } from '../drawGridTrackAffordanceHandleHighlight';

const drawRectMock = vi.fn();

vi.mock('utils/canvas/drawRect/drawRect', () => ({
  drawRect: (...args: unknown[]): void => drawRectMock(...args),
}));

const context: TDrawSceneContext = {
  buffer: {} as WebGLBuffer,
  canvasHeight: 100,
  canvasWidth: 100,
  gl: {} as WebGL2RenderingContext,
  imageContext: {} as never,
  program: {} as WebGLProgram,
  viewport: { x: 0, y: 0, zoom: 1 },
};

describe('drawGridTrackAffordanceHandleHighlight', () => {
  beforeEach(() => {
    drawRectMock.mockClear();
  });

  it('should draw a light-blue rounded rect inset within the given band', () => {
    drawGridTrackAffordanceHandleHighlight(context, { height: 20, width: 20, x: 0, y: 0 }, 0, { x: 0, y: 0 });

    const [, , , rect] = drawRectMock.mock.calls[0];

    expect(rect.fill).toBe('#7eb8f4');
    expect(rect.x).toBe(2);
    expect(rect.y).toBe(2);
    expect(rect.width).toBe(16);
    expect(rect.height).toBe(16);
  });

  it('should shrink the inset in local units as the viewport zooms in', () => {
    const zoomedContext: TDrawSceneContext = { ...context, viewport: { x: 0, y: 0, zoom: 2 } };

    drawGridTrackAffordanceHandleHighlight(zoomedContext, { height: 20, width: 20, x: 0, y: 0 }, 0, { x: 0, y: 0 });

    const [, , , rect] = drawRectMock.mock.calls[0];

    expect(rect.x).toBe(1);
    expect(rect.width).toBe(18);
  });
});
