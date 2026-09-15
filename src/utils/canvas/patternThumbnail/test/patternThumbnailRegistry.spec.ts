// utils
import { registerPatternThumbnailSampler, samplePatternThumbnail } from '../patternThumbnailRegistry';

describe('patternThumbnailRegistry', () => {
  it('should resolve null when no sampler is registered', async () => {
    // action
    const result = await samplePatternThumbnail('node-a', 256);

    // result
    expect(result).toBeNull();
  });

  it('should forward the sample request to the registered sampler', async () => {
    // mock
    const sampler = vi.fn().mockResolvedValue('data:image/png;base64,abc');

    // before
    const unregister = registerPatternThumbnailSampler(sampler);

    // action
    const result = await samplePatternThumbnail('node-a', 256);

    // result
    expect(sampler).toHaveBeenCalledWith('node-a', 256);
    expect(result).toBe('data:image/png;base64,abc');

    // after
    unregister();
  });

  it('should stop forwarding once unregistered', async () => {
    // mock
    const sampler = vi.fn().mockResolvedValue('data:image/png;base64,abc');

    // before
    const unregister = registerPatternThumbnailSampler(sampler);

    unregister();

    // action
    const result = await samplePatternThumbnail('node-a', 256);

    // result
    expect(sampler).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('should not unregister a newer sampler when an older unregister fn is called after being replaced', async () => {
    // mock
    const firstSampler = vi.fn().mockResolvedValue(null);
    const secondSampler = vi.fn().mockResolvedValue('data:image/png;base64,abc');

    // before
    const unregisterFirst = registerPatternThumbnailSampler(firstSampler);

    registerPatternThumbnailSampler(secondSampler);
    unregisterFirst();

    // action
    const result = await samplePatternThumbnail('node-a', 256);

    // result
    expect(result).toBe('data:image/png;base64,abc');
  });
});
