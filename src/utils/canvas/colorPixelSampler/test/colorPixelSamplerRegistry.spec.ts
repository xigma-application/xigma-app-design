// utils
import { registerColorPixelSampler, sampleColorPixels } from '../colorPixelSamplerRegistry';

describe('colorPixelSamplerRegistry', () => {
  it('should resolve null when no sampler is registered', async () => {
    // action
    const result = await sampleColorPixels(10, 20);

    // result
    expect(result).toBeNull();
  });

  it('should forward the sample request to the registered sampler', async () => {
    // mock
    const sampler = vi.fn().mockResolvedValue([{ a: 255, b: 0, g: 0, r: 255 }]);

    // before
    const unregister = registerColorPixelSampler(sampler);

    // action
    const result = await sampleColorPixels(10, 20);

    // result
    expect(sampler).toHaveBeenCalledWith(10, 20);
    expect(result).toStrictEqual([{ a: 255, b: 0, g: 0, r: 255 }]);

    // after
    unregister();
  });

  it('should stop forwarding once unregistered', async () => {
    // mock
    const sampler = vi.fn().mockResolvedValue([{ a: 255, b: 0, g: 0, r: 255 }]);

    // before
    const unregister = registerColorPixelSampler(sampler);

    unregister();

    // action
    const result = await sampleColorPixels(10, 20);

    // result
    expect(sampler).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('should not unregister a newer sampler when an older unregister fn is called after being replaced', async () => {
    // mock
    const firstSampler = vi.fn().mockResolvedValue([]);
    const secondSampler = vi.fn().mockResolvedValue([{ a: 255, b: 0, g: 0, r: 255 }]);

    // before
    const unregisterFirst = registerColorPixelSampler(firstSampler);

    registerColorPixelSampler(secondSampler);
    unregisterFirst();

    // action
    const result = await sampleColorPixels(0, 0);

    // result
    expect(result).toStrictEqual([{ a: 255, b: 0, g: 0, r: 255 }]);
  });
});
