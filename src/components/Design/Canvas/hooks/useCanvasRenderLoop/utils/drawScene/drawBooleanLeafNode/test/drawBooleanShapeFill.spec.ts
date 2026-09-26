// types
import { TDrawSceneContext } from '../../types';

// utils
import { booleanShape } from './fixtures';
import { drawBooleanShapeFill } from '../drawBooleanShapeFill';

const drawVectorFillMock = vi.fn();

vi.mock('utils/canvas/drawVectorNode/drawVectorFill', () => ({
  drawVectorFill: (...args: unknown[]): void => drawVectorFillMock(...args),
}));

describe('drawBooleanShapeFill', () => {
  it('should fill the shape into a target of the given size with the origin mapped to its top left corner', () => {
    // mock
    const context = { buffer: { tag: 'b' }, gl: { tag: 'gl' }, program: { tag: 'p' } } as unknown as TDrawSceneContext;

    // action
    drawBooleanShapeFill(context, booleanShape, { height: 50, width: 60 }, { x: 4, y: 6 }, '#ff0000', 0.5);

    // result
    expect(drawVectorFillMock).toHaveBeenCalledWith(
      context.gl,
      context.program,
      context.buffer,
      null,
      null,
      booleanShape.polygons,
      '#ff0000',
      60,
      50,
      { x: -4, y: -6, zoom: 1 },
      true,
      0.5,
      'evenOdd',
    );
  });

  it('should fill every layer of the shape with its own fill rule', () => {
    // mock
    const context = { buffer: {}, gl: {}, program: {} } as unknown as TDrawSceneContext;
    const layers = [
      { fillRule: 'evenOdd' as const, polygons: [[{ x: 0, y: 0 }]] },
      { fillRule: 'nonZero' as const, polygons: [[{ x: 1, y: 1 }]] },
    ];

    drawVectorFillMock.mockClear();

    // action
    drawBooleanShapeFill(context, { ...booleanShape, layers }, { height: 50, width: 60 }, { x: 0, y: 0 }, '#ff0000', 1);

    // result
    expect(drawVectorFillMock.mock.calls.map((call) => [call[5], call[12]])).toEqual([
      [layers[0].polygons, 'evenOdd'],
      [layers[1].polygons, 'nonZero'],
    ]);
  });
});
