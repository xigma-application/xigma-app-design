import { PDFContext } from 'pdf-lib';

// types
import { TGradientStop } from 'types/design/paint/types';

// utils
import { getPdfGradientStitchingFunction } from '../getPdfGradientStitchingFunction';

const createContext = (): { context: PDFContext; obj: ReturnType<typeof vi.fn> } => {
  let refIndex = 0;
  const obj = vi.fn((value: unknown) => value);
  const register = vi.fn(() => `ref${refIndex++}`);

  return { context: { obj, register } as never, obj };
};

const stop = (position: number, opacity: number): TGradientStop => ({ color: '#000000', opacity, position });

const getValues = (value: TGradientStop): number[] => [value.opacity];

describe('getPdfGradientStitchingFunction', () => {
  it('should return a single Type 2 function directly when the stops already span the full domain', () => {
    // before
    const { context, obj } = createContext();
    const stops = [stop(0, 0), stop(1, 1)];

    // action
    const ref = getPdfGradientStitchingFunction(context, stops, getValues);

    // result
    expect(ref).toBe('ref0');
    expect(obj).toHaveBeenCalledTimes(1);
    expect(obj).toHaveBeenCalledWith({ C0: [0], C1: [1], Domain: [0, 1], FunctionType: 2, N: 1 });
  });

  it('should add flat leading/trailing segments and stitch everything together when stops do not span the full domain', () => {
    // before
    const { context, obj } = createContext();
    const stops = [stop(0.2, 0), stop(0.8, 1)];

    // action
    const ref = getPdfGradientStitchingFunction(context, stops, getValues);

    // result
    expect(obj).toHaveBeenNthCalledWith(1, { C0: [0], C1: [0], Domain: [0, 1], FunctionType: 2, N: 1 });
    expect(obj).toHaveBeenNthCalledWith(2, { C0: [0], C1: [1], Domain: [0, 1], FunctionType: 2, N: 1 });
    expect(obj).toHaveBeenNthCalledWith(3, { C0: [1], C1: [1], Domain: [0, 1], FunctionType: 2, N: 1 });
    expect(obj).toHaveBeenNthCalledWith(4, {
      Bounds: [0.2, 0.8],
      Domain: [0, 1],
      Encode: [0, 1, 0, 1, 0, 1],
      FunctionType: 3,
      Functions: ['ref0', 'ref1', 'ref2'],
    });
    expect(ref).toBe('ref3');
  });

  it('should sort out-of-order stops by position before building segments', () => {
    // before
    const { context, obj } = createContext();
    const stops = [stop(1, 1), stop(0, 0)];

    // action
    getPdfGradientStitchingFunction(context, stops, getValues);

    // result
    expect(obj).toHaveBeenCalledWith({ C0: [0], C1: [1], Domain: [0, 1], FunctionType: 2, N: 1 });
  });

  it('should stitch middle segments for three or more stops', () => {
    // before
    const { context, obj } = createContext();
    const stops = [stop(0, 0), stop(0.5, 1), stop(1, 2)];

    // action
    getPdfGradientStitchingFunction(context, stops, getValues);

    // result
    expect(obj).toHaveBeenNthCalledWith(3, {
      Bounds: [0.5],
      Domain: [0, 1],
      Encode: [0, 1, 0, 1],
      FunctionType: 3,
      Functions: ['ref0', 'ref1'],
    });
  });
});
