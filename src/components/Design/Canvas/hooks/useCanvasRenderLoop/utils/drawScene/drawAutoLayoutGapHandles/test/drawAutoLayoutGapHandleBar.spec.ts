// others
import {
  SMART_SELECTION_GAP_HANDLE_FILL_INSET_PX,
  SMART_SELECTION_GAP_HANDLE_LENGTH_PX,
  SMART_SELECTION_GAP_HANDLE_WIDTH_PX,
} from 'constant/canvas';

// types
import { TDrawSceneContext } from '../../types';

// utils
import { drawAutoLayoutGapHandleBar } from '../drawAutoLayoutGapHandleBar';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    STATIC_DRAW: 35044,
    TRIANGLES: 4,
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
    drawArrays: vi.fn(),
    enableVertexAttribArray: vi.fn(),
    getAttribLocation: vi.fn(() => 0),
    getUniformLocation: vi.fn(() => ({})),
    uniform1f: vi.fn(),
    uniform2f: vi.fn(),
    uniform4fv: vi.fn(),
    useProgram: vi.fn(),
    vertexAttribPointer: vi.fn(),
  }) as unknown as WebGL2RenderingContext;

const createContext = (zoom = 1): TDrawSceneContext =>
  ({
    buffer: {} as WebGLBuffer,
    canvasHeight: 200,
    canvasWidth: 200,
    gl: createGlMock(),
    imageContext: {} as never,
    program: {} as WebGLProgram,
    viewport: { x: 0, y: 0, zoom },
  }) as TDrawSceneContext;

const fillRect = { height: 20, width: 20, x: 90, y: 40 };
const frameCenter = { x: 100, y: 50 };

describe('drawAutoLayoutGapHandleBar', () => {
  it('should draw a tall, narrow quad centred on the fill rect for a vertical bar', () => {
    // mock
    const context = createContext();

    // before
    drawAutoLayoutGapHandleBar(context, fillRect, 'vertical', frameCenter, 0);

    // result — one filled quad for the white background, one smaller filled quad for the pink centre
    expect(context.gl.drawArrays).toHaveBeenCalledTimes(2);

    const [[, vertices]] = (context.gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;

    expect(vertices[0]).toBeCloseTo(100 - SMART_SELECTION_GAP_HANDLE_WIDTH_PX / 2);
    expect(vertices[1]).toBeCloseTo(50 - SMART_SELECTION_GAP_HANDLE_LENGTH_PX / 2);
  });

  it('should draw a wide, short quad for a horizontal bar', () => {
    // mock
    const context = createContext();

    // before
    drawAutoLayoutGapHandleBar(context, fillRect, 'horizontal', frameCenter, 0);

    // result
    const [[, vertices]] = (context.gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;

    expect(vertices[0]).toBeCloseTo(100 - SMART_SELECTION_GAP_HANDLE_LENGTH_PX / 2);
    expect(vertices[1]).toBeCloseTo(50 - SMART_SELECTION_GAP_HANDLE_WIDTH_PX / 2);
  });

  it('should inset the fill quad from the background quad on every side', () => {
    // mock
    const context = createContext();

    // before
    drawAutoLayoutGapHandleBar(context, fillRect, 'vertical', frameCenter, 0);

    // result
    const [, [, fillVertices]] = (context.gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const insetWidth = SMART_SELECTION_GAP_HANDLE_WIDTH_PX - 2 * SMART_SELECTION_GAP_HANDLE_FILL_INSET_PX;
    const insetLength = SMART_SELECTION_GAP_HANDLE_LENGTH_PX - 2 * SMART_SELECTION_GAP_HANDLE_FILL_INSET_PX;

    expect(fillVertices[0]).toBeCloseTo(100 - insetWidth / 2);
    expect(fillVertices[1]).toBeCloseTo(50 - insetLength / 2);
  });

  it('should keep a constant screen size regardless of zoom', () => {
    // mock
    const context = createContext(4);

    // before
    drawAutoLayoutGapHandleBar(context, fillRect, 'vertical', frameCenter, 0);

    // result
    const [[, vertices]] = (context.gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const worldWidth = Math.abs(vertices[2] - vertices[0]);

    expect(worldWidth).toBeCloseTo(SMART_SELECTION_GAP_HANDLE_WIDTH_PX / 4);
  });

  it('should rotate the bar around the given frame centre', () => {
    // mock — 90deg rotation around the frame centre should move the drawn quad off the un-rotated x
    const context = createContext();

    // before
    drawAutoLayoutGapHandleBar(context, fillRect, 'vertical', frameCenter, 90);

    // result
    const [[, vertices]] = (context.gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;

    expect(vertices[0]).not.toBeCloseTo(100 - SMART_SELECTION_GAP_HANDLE_WIDTH_PX / 2);
  });
});
