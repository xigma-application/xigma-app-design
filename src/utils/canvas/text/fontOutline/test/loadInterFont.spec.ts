const { parse } = vi.hoisted(() => ({ parse: vi.fn(() => ({ charToGlyph: vi.fn() })) }));

vi.mock('opentype.js', () => ({ parse }));

// utils
import { loadInterFont } from '../loadInterFont';

describe('loadInterFont', () => {
  it('should fetch and parse the bundled Inter TTF file into a Font', async () => {
    // mock
    const arrayBuffer = new ArrayBuffer(8);
    const fetchMock = vi.fn(
      async (): Promise<{ arrayBuffer: () => Promise<ArrayBuffer> }> => ({ arrayBuffer: async (): Promise<ArrayBuffer> => arrayBuffer }),
    );
    vi.stubGlobal('fetch', fetchMock);

    // action
    const font = await loadInterFont();

    // result
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(parse).toHaveBeenCalledWith(arrayBuffer);
    expect(font.charToGlyph).toBeDefined();

    // after
    vi.unstubAllGlobals();
  });

  it('should only fetch and parse once, caching the promise across calls', async () => {
    // mock
    const fetchMock = vi.fn(
      async (): Promise<{ arrayBuffer: () => Promise<ArrayBuffer> }> => ({ arrayBuffer: async (): Promise<ArrayBuffer> => new ArrayBuffer(8) }),
    );
    vi.stubGlobal('fetch', fetchMock);
    parse.mockClear();
    fetchMock.mockClear();

    // action
    await loadInterFont();
    await loadInterFont();

    // result — cached from the first call above, no new fetch/parse for either call here
    expect(fetchMock).not.toHaveBeenCalled();
    expect(parse).not.toHaveBeenCalled();

    // after
    vi.unstubAllGlobals();
  });
});
