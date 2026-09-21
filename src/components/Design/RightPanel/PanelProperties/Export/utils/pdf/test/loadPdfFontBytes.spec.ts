// utils
import { loadPdfFontBytes } from '../loadPdfFontBytes';

describe('loadPdfFontBytes', () => {
  it('should fetch the font once and reuse the same promise', async () => {
    // mock
    const bytes = new ArrayBuffer(8);
    const fetchMock = vi.fn().mockResolvedValue({ arrayBuffer: () => Promise.resolve(bytes) });

    vi.stubGlobal('fetch', fetchMock);

    // action
    const first = await loadPdfFontBytes();
    const second = await loadPdfFontBytes();

    // result
    expect(first).toBe(bytes);
    expect(second).toBe(bytes);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // after
    vi.unstubAllGlobals();
  });
});
