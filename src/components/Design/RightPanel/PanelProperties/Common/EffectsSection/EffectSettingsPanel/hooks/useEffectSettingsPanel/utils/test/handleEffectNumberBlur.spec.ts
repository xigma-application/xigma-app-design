import { FocusEvent } from 'react';

// types
import { EffectType } from 'types/design/enums';

// utils
import { createEffect } from 'utils/design/effects/createEffect';
import { handleEffectNumberBlur } from '../handleEffectNumberBlur';

const createEvent = (value: string): FocusEvent<HTMLInputElement> => ({ target: { value } }) as FocusEvent<HTMLInputElement>;

describe('handleEffectNumberBlur', () => {
  it('should commit a changed number and normalize the input', () => {
    // Step 1: Prepare
    const effect = createEffect(EffectType.innerShadow);
    const onChange = vi.fn();
    const event = createEvent(' 8.256 ');

    // Step 2: Blur with a new value
    handleEffectNumberBlur(event, 'blur', 0, effect.blur, onChange);

    // Step 3: Assert
    expect(onChange).toHaveBeenCalledWith({ blur: 8.26 });
    expect(event.target.value).toBe('8.26');
  });

  it('should clamp to the field minimum', () => {
    // Step 1: Prepare
    const effect = createEffect(EffectType.innerShadow);
    const onChange = vi.fn();

    // Step 2: Blur with a negative blur
    handleEffectNumberBlur(createEvent('-3'), 'blur', 0, effect.blur, onChange);

    // Step 3: Assert
    expect(onChange).toHaveBeenCalledWith({ blur: 0 });
  });

  it('should allow negative values for fields without a minimum', () => {
    // Step 1: Prepare
    const effect = createEffect(EffectType.innerShadow);
    const onChange = vi.fn();

    // Step 2: Blur with a negative offset
    handleEffectNumberBlur(createEvent('-6'), 'x', Number.NEGATIVE_INFINITY, effect.x, onChange);

    // Step 3: Assert
    expect(onChange).toHaveBeenCalledWith({ x: -6 });
  });

  it('should not commit an unchanged value and should restore the input on invalid text', () => {
    // Step 1: Prepare
    const effect = createEffect(EffectType.innerShadow);
    const onChange = vi.fn();
    const invalid = createEvent('abc');

    // Step 2: Blur unchanged then invalid
    handleEffectNumberBlur(createEvent('4'), 'y', Number.NEGATIVE_INFINITY, effect.y, onChange);
    handleEffectNumberBlur(invalid, 'y', Number.NEGATIVE_INFINITY, effect.y, onChange);

    // Step 3: Assert
    expect(onChange).not.toHaveBeenCalled();
    expect(invalid.target.value).toBe('4');
  });

  it('should restore Mixed on invalid text for a mixed field', () => {
    // mock
    const invalid = createEvent('abc');

    // action
    handleEffectNumberBlur(invalid, 'y', Number.NEGATIVE_INFINITY, undefined, vi.fn());

    // result
    expect(invalid.target.value).toBe('Mixed');
  });
});
