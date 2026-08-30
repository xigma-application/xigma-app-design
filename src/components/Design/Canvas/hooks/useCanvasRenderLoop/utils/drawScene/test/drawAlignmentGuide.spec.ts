// utils
import { drawAlignmentGuide } from '../drawAlignmentGuide';

const drawLineMock = vi.fn();

vi.mock('utils/canvas/drawLine', () => ({ drawLine: (...args: unknown[]): void => drawLineMock(...args) }));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const call = (guide: Parameters<typeof drawAlignmentGuide>[3]): void => {
  drawAlignmentGuide({} as WebGL2RenderingContext, {} as WebGLProgram, {} as WebGLBuffer, guide, 200, 150, IDENTITY_VIEWPORT);
};

describe('drawAlignmentGuide', () => {
  beforeEach(() => {
    drawLineMock.mockClear();
  });

  it('should draw nothing when there is no guide', () => {
    // before
    call(null);

    // result
    expect(drawLineMock).not.toHaveBeenCalled();
  });

  it('should draw nothing when neither axis has a match', () => {
    // before
    call({ horizontal: null, vertical: null });

    // result
    expect(drawLineMock).not.toHaveBeenCalled();
  });

  it('should draw only a vertical line, from its own anchor to the matched vertical candidate, when only that axis matched', () => {
    // before
    call({ horizontal: null, vertical: { anchor: { x: 10, y: 10 }, match: { x: 10, y: 200 } } });

    // result
    expect(drawLineMock).toHaveBeenCalledTimes(1);
    expect(drawLineMock).toHaveBeenCalledWith({}, {}, {}, { x1: 10, x2: 10, y1: 10, y2: 200 }, '#cd4422', 1, 200, 150, IDENTITY_VIEWPORT);
  });

  it('should draw only a horizontal line, from its own anchor to the matched horizontal candidate, when only that axis matched', () => {
    // before
    call({ horizontal: { anchor: { x: 10, y: 10 }, match: { x: 300, y: 10 } }, vertical: null });

    // result
    expect(drawLineMock).toHaveBeenCalledTimes(1);
    expect(drawLineMock).toHaveBeenCalledWith({}, {}, {}, { x1: 10, x2: 300, y1: 10, y2: 10 }, '#cd4422', 1, 200, 150, IDENTITY_VIEWPORT);
  });

  it('should draw both lines independently, each from its own anchor, when both axes matched — even onto two different anchors (e.g. two different vertices dragged together in a group)', () => {
    // before
    call({
      horizontal: { anchor: { x: 10, y: 10 }, match: { x: 300, y: 10 } },
      vertical: { anchor: { x: 50, y: 60 }, match: { x: 50, y: 200 } },
    });

    // result
    expect(drawLineMock).toHaveBeenCalledTimes(2);
    expect(drawLineMock).toHaveBeenNthCalledWith(
      1,
      {},
      {},
      {},
      { x1: 50, x2: 50, y1: 60, y2: 200 },
      '#cd4422',
      1,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
    expect(drawLineMock).toHaveBeenNthCalledWith(
      2,
      {},
      {},
      {},
      { x1: 10, x2: 300, y1: 10, y2: 10 },
      '#cd4422',
      1,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });

  it('should scale the stroke width down with zoom', () => {
    // before
    drawAlignmentGuide(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      { horizontal: { anchor: { x: 10, y: 10 }, match: { x: 300, y: 10 } }, vertical: null },
      200,
      150,
      { x: 0, y: 0, zoom: 2 },
    );

    // result
    expect(drawLineMock.mock.calls[0][5]).toBe(0.5);
  });
});
