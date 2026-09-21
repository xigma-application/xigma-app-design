import { PDFName } from 'pdf-lib';

// utils
import { getPdfGraphicsState } from '../getPdfGraphicsState';

const createPage = (): {
  context: { obj: ReturnType<typeof vi.fn>; register: ReturnType<typeof vi.fn> };
  page: never;
  setExtGState: ReturnType<typeof vi.fn>;
} => {
  const context = { obj: vi.fn((value: unknown) => value), register: vi.fn(() => 'ref') };
  const setExtGState = vi.fn();

  return { context, page: { doc: { context }, node: { setExtGState } } as never, setExtGState };
};

describe('getPdfGraphicsState', () => {
  it('should register a new opacity graphics state on the page', () => {
    // before
    const { context, page, setExtGState } = createPage();
    const cache = new Map<number, PDFName>();

    // action
    const name = getPdfGraphicsState(page, 0.5, cache);

    // result
    expect(name.asString()).toBe('/XigmaOpacity0');
    expect(context.obj).toHaveBeenCalledWith({ CA: 0.5, Type: 'ExtGState', ca: 0.5 });
    expect(setExtGState).toHaveBeenCalledWith(name, 'ref');
    expect(cache.get(0.5)).toBe(name);
  });

  it('should reuse the cached state for the same opacity and number new ones', () => {
    // before
    const { page, setExtGState } = createPage();
    const cache = new Map<number, PDFName>();

    // action
    const first = getPdfGraphicsState(page, 0.5, cache);
    const again = getPdfGraphicsState(page, 0.5, cache);
    const other = getPdfGraphicsState(page, 1, cache);

    // result
    expect(again).toBe(first);
    expect(other.asString()).toBe('/XigmaOpacity1');
    expect(setExtGState).toHaveBeenCalledTimes(2);
  });
});
