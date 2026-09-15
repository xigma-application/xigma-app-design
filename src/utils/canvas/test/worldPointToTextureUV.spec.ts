// utils
import { worldPointToTextureUV } from '../worldPointToTextureUV';

describe('worldPointToTextureUV', () => {
  it('should map the canvas top-left world origin to the texture UV bottom-left, at an identity viewport', () => {
    // before
    const uv = worldPointToTextureUV({ x: 0, y: 0 }, { x: 0, y: 0, zoom: 1 }, 200, 100);

    // result
    expect(uv).toEqual({ x: 0, y: 1 });
  });

  it('should map the canvas bottom-right corner to the texture UV top-right', () => {
    // before
    const uv = worldPointToTextureUV({ x: 200, y: 100 }, { x: 0, y: 0, zoom: 1 }, 200, 100);

    // result
    expect(uv).toEqual({ x: 1, y: 0 });
  });

  it('should apply the viewport pan offset before normalizing', () => {
    // before
    const uv = worldPointToTextureUV({ x: 0, y: 0 }, { x: 50, y: 0, zoom: 1 }, 200, 100);

    // result
    expect(uv.x).toBeCloseTo(0.25);
  });

  it('should apply the viewport zoom before normalizing', () => {
    // before
    const uv = worldPointToTextureUV({ x: 100, y: 0 }, { x: 0, y: 0, zoom: 2 }, 200, 100);

    // result — 100 world units at 2x zoom fills the whole 200px-wide canvas
    expect(uv.x).toBeCloseTo(1);
  });
});
