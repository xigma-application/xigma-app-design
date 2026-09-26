// types
import { TDrawSceneContext } from '../../../types';

// utils
import { drawVectorSolidStroke } from '../drawVectorSolidStroke';
import { makeSquareVector } from 'utils/canvas/vector/stroke/test/fixtures';

const drawVectorThickStrokeVerticesMock = vi.fn();
const drawVectorVariableStrokeMock = vi.fn();
const drawVectorRoundedCapsMock = vi.fn();

vi.mock('utils/canvas/drawVectorNode/drawVectorThickStrokeVertices', () => ({
  drawVectorThickStrokeVertices: (...args: unknown[]): void => drawVectorThickStrokeVerticesMock(...args),
}));
vi.mock('../drawVectorVariableStroke', () => ({
  drawVectorVariableStroke: (...args: unknown[]): void => drawVectorVariableStrokeMock(...args),
}));
vi.mock('utils/canvas/drawVectorNode/drawVectorRoundedCaps', () => ({
  drawVectorRoundedCaps: (...args: unknown[]): void => drawVectorRoundedCapsMock(...args),
}));

const context = {
  buffer: {},
  canvasHeight: 150,
  canvasWidth: 200,
  gl: {},
  imageContext: { strokeBufferCache: new WeakMap() },
  program: {},
  viewport: { x: 0, y: 0, zoom: 1 },
} as unknown as TDrawSceneContext;

const paint = { color: '#00ff00', opacity: 50, type: 'solid' as const };

describe('drawVectorSolidStroke', () => {
  beforeEach(() => {
    drawVectorThickStrokeVerticesMock.mockClear();
    drawVectorVariableStrokeMock.mockClear();
    drawVectorRoundedCapsMock.mockClear();
  });

  it('should draw the uniform stroke and the round caps in the paint color at the paint and node opacity', () => {
    // mock
    const node = makeSquareVector();

    // before
    drawVectorSolidStroke(context, node, paint, 0.5);

    // result
    expect(drawVectorThickStrokeVerticesMock.mock.calls[0][5]).toBe('#00ff00');
    expect(drawVectorThickStrokeVerticesMock.mock.calls[0][9]).toBe(0.25);
    expect(drawVectorRoundedCapsMock.mock.calls[0][4]).toBe('#00ff00');
    expect(drawVectorRoundedCapsMock.mock.calls[0][8]).toBe(0.25);
    expect(drawVectorVariableStrokeMock).not.toHaveBeenCalled();
  });

  it('should draw the variable-width stroke for a node with a width profile', () => {
    // mock
    const node = makeSquareVector({ widthProfile: { points: {} } });

    // before
    drawVectorSolidStroke(context, node, paint, 1);

    // result
    expect(drawVectorVariableStrokeMock.mock.calls[0][4]).toBe('#00ff00');
    expect(drawVectorVariableStrokeMock.mock.calls[0][8]).toBe(0.5);
    expect(drawVectorThickStrokeVerticesMock).not.toHaveBeenCalled();
  });
});
