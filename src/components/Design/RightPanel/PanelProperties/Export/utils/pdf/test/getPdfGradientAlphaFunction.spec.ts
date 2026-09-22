// utils
import { getPdfGradientAlphaFunction } from '../getPdfGradientAlphaFunction';

describe('getPdfGradientAlphaFunction', () => {
  it('should build a single-channel Type 2 function from the stop opacities', () => {
    // before
    const obj = vi.fn((value: unknown) => value);
    const register = vi.fn((value: unknown) => value);
    const context = { obj, register } as never;

    // action
    getPdfGradientAlphaFunction(context, [
      { color: '#ff0000', opacity: 100, position: 0 },
      { color: '#0000ff', opacity: 50, position: 1 },
    ]);

    // result
    expect(obj).toHaveBeenCalledWith({ C0: [1], C1: [0.5], Domain: [0, 1], FunctionType: 2, N: 1 });
  });
});
