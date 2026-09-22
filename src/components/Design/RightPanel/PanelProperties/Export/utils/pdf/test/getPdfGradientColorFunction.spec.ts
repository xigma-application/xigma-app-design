// utils
import { getPdfGradientColorFunction } from '../getPdfGradientColorFunction';

describe('getPdfGradientColorFunction', () => {
  it('should build an RGB Type 2 function from the stop colors', () => {
    // before
    const obj = vi.fn((value: unknown) => value);
    const register = vi.fn((value: unknown) => value);
    const context = { obj, register } as never;

    // action
    getPdfGradientColorFunction(context, [
      { color: '#ff0000', opacity: 100, position: 0 },
      { color: '#0000ff', opacity: 100, position: 1 },
    ]);

    // result
    expect(obj).toHaveBeenCalledWith({ C0: [1, 0, 0], C1: [0, 0, 1], Domain: [0, 1], FunctionType: 2, N: 1 });
  });
});
