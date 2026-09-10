// utils
import { parseFillFieldInput } from '../parseFillFieldInput';

// types
import { SizingMode } from 'types/design/enums';

describe('parseFillFieldInput', () => {
  it('should keep the track on fill when the value is an exact "<number>fr"', () => {
    expect(parseFillFieldInput('2fr')).toEqual({ mode: SizingMode.fill, value: 2 });
    expect(parseFillFieldInput('0.75fr')).toEqual({ mode: SizingMode.fill, value: 0.75 });
  });

  it('should trim surrounding whitespace before matching the fill unit', () => {
    expect(parseFillFieldInput('  3fr  ')).toEqual({ mode: SizingMode.fill, value: 3 });
  });

  it('should switch to fixed when the unit was removed entirely', () => {
    expect(parseFillFieldInput('120')).toEqual({ mode: SizingMode.fixed, value: 120 });
  });

  it('should switch to fixed on any deviation from the exact unit', () => {
    expect(parseFillFieldInput('1f')).toEqual({ mode: SizingMode.fixed, value: 1 });
    expect(parseFillFieldInput('1 fr')).toEqual({ mode: SizingMode.fixed, value: 1 });
    expect(parseFillFieldInput('1frr')).toEqual({ mode: SizingMode.fixed, value: 1 });
    expect(parseFillFieldInput('1FR')).toEqual({ mode: SizingMode.fixed, value: 1 });
  });

  it('should reject a non-positive fill weight', () => {
    expect(parseFillFieldInput('0fr')).toEqual({ mode: null });
    expect(parseFillFieldInput('-1fr')).toEqual({ mode: null });
  });

  it('should return a null mode when there is no parsable number', () => {
    expect(parseFillFieldInput('')).toEqual({ mode: null });
    expect(parseFillFieldInput('abc')).toEqual({ mode: null });
  });
});
