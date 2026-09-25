// others
import { FRAME_NAME_LABEL_FONT_SIZE_PX } from 'constant/canvas';

// types
import { TImageRenderContext } from '../../../../types';

// utils
import { drawFrameNameLabelVertices } from '../drawFrameNameLabelVertices';

const drawMsdfGlyphsMock = vi.fn();

vi.mock('utils/canvas/text/drawMsdfGlyphs', () => ({ drawMsdfGlyphs: (...args: unknown[]): unknown => drawMsdfGlyphsMock(...args) }));
vi.mock('utils/canvas/text/getMsdfAtlasTexture', () => ({ getMsdfAtlasTexture: (): string => 'atlas' }));

const gl = {} as WebGL2RenderingContext;
const imageContext = { cache: new Map(), msdfBuffer: 'buffer', msdfProgram: 'program' } as unknown as TImageRenderContext;
const viewport = { x: 0, y: 0, zoom: 2 };

describe('drawFrameNameLabelVertices', () => {
  beforeEach(() => {
    drawMsdfGlyphsMock.mockClear();
  });

  it('should draw the label glyphs at a zoom-independent font size', () => {
    // mock
    const vertices = new Float32Array([1, 2]);

    // before
    drawFrameNameLabelVertices(gl, imageContext, vertices, '#fff', 200, 100, viewport);

    // result
    expect(drawMsdfGlyphsMock).toHaveBeenCalledWith(
      gl,
      'program',
      'buffer',
      'atlas',
      expect.anything(),
      vertices,
      '#fff',
      FRAME_NAME_LABEL_FONT_SIZE_PX / 2,
      200,
      100,
      viewport,
    );
  });

  it('should draw nothing without glyphs', () => {
    // before
    drawFrameNameLabelVertices(gl, imageContext, new Float32Array(), '#fff', 200, 100, viewport);

    // result
    expect(drawMsdfGlyphsMock).not.toHaveBeenCalled();
  });
});
