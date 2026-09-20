// types
import { EffectNoiseType, EffectType, NodeType } from 'types/design/enums';
import { TDrawSceneContext } from '../../types';
import { TImageRenderContext } from '../../../../types';
import { TRectangleNode } from 'types/design/types';

// utils
import { createEffect } from 'utils/design/effects/createEffect';
import { drawNoiseShape } from '../drawNoiseShape';

vi.mock('../drawNoiseMask', () => ({ drawNoiseMask: (): unknown => ({ height: 2400, texture: { tag: 'mask' }, width: 2000 }) }));

const createGlMock = (): WebGL2RenderingContext =>
  ({
    ARRAY_BUFFER: 34962,
    FLOAT: 5126,
    STATIC_DRAW: 35044,
    TEXTURE0: 33984,
    TEXTURE_2D: 3553,
    TRIANGLE_FAN: 6,
    activeTexture: vi.fn(),
    bindBuffer: vi.fn(),
    bindTexture: vi.fn(),
    bufferData: vi.fn(),
    disableVertexAttribArray: vi.fn(),
    drawArrays: vi.fn(),
    drawingBufferHeight: 2400,
    drawingBufferWidth: 2000,
    enableVertexAttribArray: vi.fn(),
    getAttribLocation: vi.fn(() => 0),
    getUniformLocation: vi.fn((_program: WebGLProgram, name: string) => ({ name })),
    uniform1f: vi.fn(),
    uniform1i: vi.fn(),
    uniform2f: vi.fn(),
    uniform4f: vi.fn(),
    useProgram: vi.fn(),
    vertexAttribPointer: vi.fn(),
  }) as unknown as WebGL2RenderingContext;

const node: TRectangleNode = {
  fills: [],
  height: 40,
  id: 'r1',
  name: 'Rectangle',
  parentId: null,
  rotation: 90,
  type: NodeType.rectangle,
  width: 100,
  x: 10,
  y: 20,
};

describe('drawNoiseShape', () => {
  it('should draw the shape with the noise program and hand it the node transform, grain size, coverage and color', () => {
    // mock
    const gl = createGlMock();
    const noiseProgram = {} as WebGLProgram;
    const context = {
      buffer: {},
      canvasHeight: 1200,
      canvasWidth: 1000,
      gl,
      imageContext: { noiseProgram, renderTargetPool: { release: vi.fn() } } as unknown as TImageRenderContext,
      viewport: { x: 5, y: 6, zoom: 2 },
    } as unknown as TDrawSceneContext;
    const effect = { ...createEffect(EffectType.noise), color: '#ff0000', density: 50, noiseSize: 3, opacity: 40 };

    // action
    drawNoiseShape(context, node, effect, 0.5);

    // result
    expect(gl.useProgram).toHaveBeenCalledWith(noiseProgram);
    expect(gl.uniform4f).toHaveBeenCalledWith({ name: 'u_color' }, 1, 0, 0, 0.2);
    expect(gl.uniform2f).toHaveBeenCalledWith({ name: 'u_center' }, 60, 40);
    expect(gl.uniform2f).toHaveBeenCalledWith({ name: 'u_viewportOffset' }, 5, 6);
    expect(gl.uniform1f).toHaveBeenCalledWith({ name: 'u_zoom' }, 2);
    expect(gl.uniform1f).toHaveBeenCalledWith({ name: 'u_pixelRatio' }, 2);
    expect(gl.uniform1f).toHaveBeenCalledWith({ name: 'u_drawingBufferHeight' }, 2400);
    expect(gl.uniform1f).toHaveBeenCalledWith({ name: 'u_rotation' }, Math.PI / 2);
    expect(gl.uniform1f).toHaveBeenCalledWith({ name: 'u_cellSize' }, 3);
    expect(gl.uniform1f).toHaveBeenCalledWith({ name: 'u_density' }, 0.25);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLE_FAN, 0, expect.any(Number));
  });

  it('should use the default grain size and full coverage for a fresh noise effect', () => {
    // mock
    const gl = createGlMock();
    const context = {
      buffer: {},
      canvasHeight: 0,
      canvasWidth: 0,
      gl,
      imageContext: { noiseProgram: {}, renderTargetPool: { release: vi.fn() } } as unknown as TImageRenderContext,
      viewport: { x: 0, y: 0, zoom: 1 },
    } as unknown as TDrawSceneContext;

    // action
    drawNoiseShape(context, node, createEffect(EffectType.noise), 1);

    // result
    expect(gl.uniform1f).toHaveBeenCalledWith({ name: 'u_cellSize' }, 0.5);
    expect(gl.uniform1f).toHaveBeenCalledWith({ name: 'u_density' }, 0.5);
    expect(gl.uniform1f).toHaveBeenCalledWith({ name: 'u_pixelRatio' }, 1);
    expect(gl.uniform1i).toHaveBeenCalledWith({ name: 'u_duo' }, 0);
  });

  it('should hand the shader the second color at its own opacity, times the node opacity, for a duo noise', () => {
    // mock
    const gl = createGlMock();
    const context = {
      buffer: {},
      canvasHeight: 1200,
      canvasWidth: 1000,
      gl,
      imageContext: { noiseProgram: {}, renderTargetPool: { release: vi.fn() } } as unknown as TImageRenderContext,
      viewport: { x: 0, y: 0, zoom: 1 },
    } as unknown as TDrawSceneContext;
    const effect = { ...createEffect(EffectType.noise), noiseType: EffectNoiseType.duo, secondaryColor: '#00ff00', secondaryOpacity: 60 };

    // action
    drawNoiseShape(context, node, effect, 0.5);

    // result
    expect(gl.uniform1i).toHaveBeenCalledWith({ name: 'u_duo' }, 1);
    expect(gl.uniform4f).toHaveBeenCalledWith({ name: 'u_secondaryColor' }, 0, 1, 0, 0.3);
  });
});
