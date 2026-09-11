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

  it('should draw a solid rounded rect filling the given band', () => {
    drawGridTrackAffordanceHandleHighlight(context, { height: 20, width: 20, x: 0, y: 0 }, 0, { x: 0, y: 0 });

    const [, , , rect] = drawRectMock.mock.calls[0];

    expect(rect.fill).toBe('#275cb6');
    expect(rect.x).toBe(0);
    expect(rect.y).toBe(0);
    expect(rect.width).toBe(20);
    expect(rect.height).toBe(20);
  });

  it('should shrink the corner radius in local units as the viewport zooms in', () => {
    const context1x = { ...context, viewport: { x: 0, y: 0, zoom: 1 } };
    const context2x = { ...context, viewport: { x: 0, y: 0, zoom: 2 } };

    drawGridTrackAffordanceHandleHighlight(context1x, { height: 20, width: 20, x: 0, y: 0 }, 0, { x: 0, y: 0 });
    const [, , , rect1x] = drawRectMock.mock.calls[0];

    drawGridTrackAffordanceHandleHighlight(context2x, { height: 20, width: 20, x: 0, y: 0 }, 0, { x: 0, y: 0 });
    const [, , , rect2x] = drawRectMock.mock.calls[1];

    expect(rect2x.cornerRadius).toBe(rect1x.cornerRadius / 2);
  });
});
