// types
import { SizingMode } from 'types/design/enums';

// utils
import { getSizeLabelText } from '../getSizeLabelText';

describe('getSizeLabelText', () => {
  it('should round both dimensions and join them with "x" when no sizing modes are given', () => {
    // before
    const text = getSizeLabelText(200.4, 99.6);

    // result
    expect(text).toBe('200 x 100');
  });

  it('should append "Hug" after a dimension whose sizing mode is hug', () => {
    // before
    const text = getSizeLabelText(355, 241, { width: SizingMode.hug });

    // result
    expect(text).toBe('355 Hug x 241');
  });

  it('should append "Fill" after a dimension whose sizing mode is fill', () => {
    // before
    const text = getSizeLabelText(107, 72, { width: SizingMode.fill });

    // result
    expect(text).toBe('107 Fill x 72');
  });

  it('should append a label to both dimensions when both have a hug/fill sizing mode', () => {
    // before
    const text = getSizeLabelText(355, 241, { height: SizingMode.fill, width: SizingMode.hug });

    // result
    expect(text).toBe('355 Hug x 241 Fill');
  });

  it('should not append a label for a fixed sizing mode', () => {
    // before
    const text = getSizeLabelText(355, 241, { height: SizingMode.fixed, width: SizingMode.fixed });

    // result
    expect(text).toBe('355 x 241');
  });
});
