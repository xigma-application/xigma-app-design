import { RefObject } from 'react';

// types
import { TColorSampleRequest } from 'utils/canvas/colorPixelSampler/types';

// utils
import { resolveColorSampleRequest } from '../resolveColorSampleRequest';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.width = 70;
  canvas.height = 70;
  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
    bottom: 70,
    height: 70,
    left: 0,
    right: 70,
    toJSON: vi.fn(),
    top: 0,
    width: 70,
    x: 0,
    y: 0,
  });

  return canvas;
};

const createGlMock = (fillValue: number): WebGL2RenderingContext =>
  ({
    RGBA: 6408,
    UNSIGNED_BYTE: 5121,
    readPixels: vi.fn((_x, _y, _width, _height, _format, _type, pixels: Uint8Array) => {
      pixels.fill(fillValue);
    }),
  }) as unknown as WebGL2RenderingContext;

describe('resolveColorSampleRequest', () => {
  it('should do nothing when no sample is pending', () => {
    // mock
    const gl = createGlMock(0);
    const canvas = createCanvas();
    const requestRef: RefObject<TColorSampleRequest | null> = { current: null };

    // action
    resolveColorSampleRequest(gl, canvas, requestRef);

    // result
    expect(gl.readPixels).not.toHaveBeenCalled();
  });

  it('should read a pixel block around the requested point and resolve it as a 49-entry RGBA grid', () => {
    // mock
    const gl = createGlMock(128);
    const canvas = createCanvas();
    const onSample = vi.fn();
    const requestRef: RefObject<TColorSampleRequest | null> = { current: { onSample, x: 35, y: 35 } };

    // action
    resolveColorSampleRequest(gl, canvas, requestRef);

    // result
    expect(onSample).toHaveBeenCalledTimes(1);
    expect(onSample.mock.calls[0][0]).toHaveLength(49);
    expect(onSample.mock.calls[0][0][24]).toStrictEqual({ a: 128, b: 128, g: 128, r: 128 });
  });

  it('should flip the requested Y into WebGL bottom-left readback coordinates', () => {
    // mock
    const gl = createGlMock(0);
    const canvas = createCanvas();
    const requestRef: RefObject<TColorSampleRequest | null> = { current: { onSample: vi.fn(), x: 35, y: 10 } };

    // action
    resolveColorSampleRequest(gl, canvas, requestRef);

    // result — requested y=10 near the top of a 70px canvas should read from near the top of the
    // drawing buffer, i.e. a high gl-space y (readPixels' second argument), not a low one
    const [, glY] = (gl.readPixels as ReturnType<typeof vi.fn>).mock.calls[0];

    expect(glY).toBeGreaterThan(50);
  });

  it('should clear the pending request once resolved', () => {
    // mock
    const gl = createGlMock(0);
    const canvas = createCanvas();
    const requestRef: RefObject<TColorSampleRequest | null> = { current: { onSample: vi.fn(), x: 35, y: 35 } };

    // action
    resolveColorSampleRequest(gl, canvas, requestRef);

    // result
    expect(requestRef.current).toBeNull();
  });
});
