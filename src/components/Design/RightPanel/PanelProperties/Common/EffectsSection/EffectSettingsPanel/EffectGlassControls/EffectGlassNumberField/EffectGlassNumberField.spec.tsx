import { fireEvent, render, screen } from '@testing-library/react';

// components
import EffectGlassNumberField from './EffectGlassNumberField';
import { TooltipProvider } from 'shared';

const renderField = (displayValue?: string): TFunc<[number]> => {
  const onChange = vi.fn();

  render(
    <TooltipProvider>
      <EffectGlassNumberField
        ariaLabel="Refraction"
        displayValue={displayValue}
        e2eValue="glass-refraction"
        max={100}
        min={0}
        onChange={onChange}
        tooltip="Refraction"
        unit="%"
        value={40}
      />
    </TooltipProvider>,
  );

  return onChange;
};

describe('EffectGlassNumberField behaviors', () => {
  it('should show the value with its unit and commit a typed value on blur', () => {
    // before
    const onChange = renderField();

    // find
    const input = screen.getByLabelText('Refraction');

    // action
    fireEvent.change(input, { target: { value: '60' } });
    fireEvent.blur(input);

    // result
    expect(onChange).toHaveBeenCalledWith(60);
    expect(input).toHaveValue('60%');
  });

  it('should show a display value such as Mixed and commit even the shown value', () => {
    // before
    const onChange = renderField('Mixed');

    // find
    const input = screen.getByLabelText('Refraction');

    // action
    fireEvent.change(input, { target: { value: '40' } });
    fireEvent.blur(input);

    // result
    expect(onChange).toHaveBeenCalledWith(40);
  });
});
