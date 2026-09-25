// types
import { TEffect, TSceneNode } from 'types/design/types';
import { TMaskRenderer } from '../types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';

// utils
import { createGlProxy, TGlProxy } from 'test/createGlProxy';
import { drawTexturePass } from '../drawTexturePass';

const textureProgramMock = vi.fn();

vi.mock('../getTextureProgram', () => ({ getTextureProgram: (...args: unknown[]): unknown => textureProgramMock(...args) }));
vi.mock('utils/design/effects/getEffectTexture', () => ({ getEffectTexture: (): unknown => ({ radius: 3, size: 7 }) }));
vi.mock('../../drawBoxLeafNode/resetEffectVertexAttributes', () => ({ resetEffectVertexAttributes: vi.fn() }));

const content = { texture: 'content' } as unknown as TRenderTarget;
const output = { height: 50, width: 80 } as unknown as TRenderTarget;
const node = { height: 10, id: 'n', rotation: 90, type: 'rectangle', width: 20, x: 0, y: 0 } as unknown as TSceneNode;

const createRenderer = (canvasWidth: number): TMaskRenderer & { gl: TGlProxy } =>
  ({
    context: { canvasWidth, devicePixelHeight: 100, devicePixelWidth: 400, viewport: { x: 1, y: 2, zoom: 3 } },
    gl: createGlProxy({ getUniformLocation: vi.fn((_program: unknown, name: string) => name) }),
  }) as unknown as TMaskRenderer & { gl: TGlProxy };

describe('drawTexturePass', () => {
  beforeEach(() => {
    textureProgramMock.mockReturnValue({ buffer: 'buffer', program: 'program' });
  });

  it('should draw the texture over the content clipped by the shape, with the node transform', () => {
    // mock
    const renderer = createRenderer(200);

    // before
    drawTexturePass(renderer, node, {} as TEffect, content, output, {
      hasUnderlay: true,
      isInputStraight: true,
      shape: { texture: 'shape' } as unknown as TRenderTarget,
    });

    // result
    expect(renderer.gl.bindTexture).toHaveBeenCalledWith('TEXTURE_2D', 'shape');
    expect(renderer.gl.uniform2f).toHaveBeenCalledWith('u_size', 80, 50);
    expect(renderer.gl.uniform2f).toHaveBeenCalledWith('u_center', 10, 5);
    expect(renderer.gl.uniform1f).toHaveBeenCalledWith('u_pixelRatio', 2);
    expect(renderer.gl.uniform1f).toHaveBeenCalledWith('u_rotation', Math.PI / 2);
    expect(renderer.gl.uniform1f).toHaveBeenCalledWith('u_cellSize', 7);
    expect(renderer.gl.uniform1i).toHaveBeenCalledWith('u_clip', 1);
    expect(renderer.gl.uniform1i).toHaveBeenCalledWith('u_underlay', 1);
    expect(renderer.gl.uniform1i).toHaveBeenCalledWith('u_inputStraight', 1);
    expect(renderer.gl.drawArrays).toHaveBeenCalledWith('TRIANGLES', 0, 6);
  });

  it('should use the content as its own shape, and default the ratio and rotation', () => {
    // mock
    const renderer = createRenderer(0);

    // before
    drawTexturePass(
      renderer,
      { height: 1, id: 'l', type: 'line', width: 1, x: 0, x1: 0, x2: 1, y: 0, y1: 0, y2: 1 } as unknown as TSceneNode,
      {} as TEffect,
      content,
      output,
      {
        hasUnderlay: false,
        isInputStraight: false,
        shape: null,
      },
    );

    // result
    expect(renderer.gl.bindTexture).toHaveBeenCalledWith('TEXTURE_2D', 'content');
    expect(renderer.gl.uniform1f).toHaveBeenCalledWith('u_pixelRatio', 1);
    expect(renderer.gl.uniform1f).toHaveBeenCalledWith('u_rotation', 0);
    expect(renderer.gl.uniform1i).toHaveBeenCalledWith('u_clip', 0);
    expect(renderer.gl.uniform1i).toHaveBeenCalledWith('u_underlay', 0);
  });

  it('should draw nothing when the texture program is unavailable', () => {
    // mock
    const renderer = createRenderer(200);
    textureProgramMock.mockReturnValue(null);

    // before
    drawTexturePass(renderer, node, {} as TEffect, content, output, { hasUnderlay: false, isInputStraight: false, shape: null });

    // result
    expect(renderer.gl.drawArrays).not.toHaveBeenCalled();
  });
});
