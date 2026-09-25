// others
import { NOISE_MAX_COVERAGE } from '../constants';

// types
import { EffectNoiseType } from 'types/design/enums';
import { TDrawSceneContext } from '../../types';
import { TEffect } from 'types/design/types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';

// utils
import { createGlProxy, TGlProxy } from 'test/createGlProxy';
import { drawNoisePolygon } from '../drawNoisePolygon';

const noiseMock = vi.fn();

vi.mock('utils/design/effects/getEffectNoise', () => ({ getEffectNoise: (...args: unknown[]): unknown => noiseMock(...args) }));
vi.mock('utils/canvas/toFanVertices', () => ({ toFanVertices: (): number[] => [0, 0] }));

const points = [
  { x: 0, y: 0 },
  { x: 10, y: 0 },
  { x: 10, y: 10 },
];

const createContext = (gl: TGlProxy, canvasWidth = 200): TDrawSceneContext & { imageContext: { renderTargetPool: { release: TFunc } } } =>
  ({
    buffer: {},
    canvasHeight: 100,
    canvasWidth,
    devicePixelHeight: 200,
    devicePixelWidth: 400,
    gl,
    imageContext: { noiseProgram: {}, renderTargetPool: { release: vi.fn() } },
    viewport: { x: 0, y: 0, zoom: 1 },
  }) as unknown as TDrawSceneContext & { imageContext: { renderTargetPool: { release: TFunc } } };

describe('drawNoisePolygon', () => {
  beforeEach(() => {
    noiseMock.mockReturnValue({
      density: 50,
      noiseSize: 3,
      noiseType: EffectNoiseType.duo,
      secondaryColor: '#000000',
      secondaryOpacity: 50,
    });
  });

  it('should draw a masked duo noise fan over the polygon and release the mask', () => {
    // mock
    const gl = createGlProxy({ getUniformLocation: vi.fn((_program: unknown, name: string) => name) });
    const context = createContext(gl);
    const mask = { height: 5, texture: 'mask', width: 6 } as unknown as TRenderTarget;

    // before
    drawNoisePolygon(context, { color: '#ffffff', opacity: 50 } as TEffect, 0.5, points, { x: 5, y: 5 }, 90, mask);

    // result
    expect(gl.uniform1i).toHaveBeenCalledWith('u_useMask', 1);
    expect(gl.bindTexture).toHaveBeenCalledWith('TEXTURE_2D', 'mask');
    expect(gl.uniform2f).toHaveBeenCalledWith('u_maskSize', 6, 5);
    expect(gl.uniform4f).toHaveBeenCalledWith('u_color', 1, 1, 1, 0.25);
    expect(gl.uniform1i).toHaveBeenCalledWith('u_duo', 1);
    expect(gl.uniform1i).toHaveBeenCalledWith('u_multi', 0);
    expect(gl.uniform1f).toHaveBeenCalledWith('u_pixelRatio', 2);
    expect(gl.uniform1f).toHaveBeenCalledWith('u_rotation', Math.PI / 2);
    expect(gl.uniform1f).toHaveBeenCalledWith('u_density', 0.5 * NOISE_MAX_COVERAGE);
    expect(gl.drawArrays).toHaveBeenCalledWith('TRIANGLE_FAN', 0, 5);
    expect(gl.bindTexture).toHaveBeenLastCalledWith('TEXTURE_2D', null);
    expect(context.imageContext.renderTargetPool.release).toHaveBeenCalledWith(mask);
  });

  it('should draw an unmasked multi noise and fall back to a unit pixel ratio on a zero-width canvas', () => {
    // mock
    noiseMock.mockReturnValue({
      density: 100,
      noiseSize: 1,
      noiseType: EffectNoiseType.multi,
      secondaryColor: '#000000',
      secondaryOpacity: 0,
    });
    const gl = createGlProxy({ getUniformLocation: vi.fn((_program: unknown, name: string) => name) });
    const context = createContext(gl, 0);

    // before
    drawNoisePolygon(context, { color: '#000000', opacity: 100 } as TEffect, 1, points, { x: 0, y: 0 }, 0, null);

    // result
    expect(gl.uniform1i).toHaveBeenCalledWith('u_useMask', 0);
    expect(gl.uniform1i).toHaveBeenCalledWith('u_multi', 1);
    expect(gl.uniform1f).toHaveBeenCalledWith('u_pixelRatio', 1);
    expect(gl.activeTexture).not.toHaveBeenCalled();
    expect(context.imageContext.renderTargetPool.release).not.toHaveBeenCalled();
  });
});
