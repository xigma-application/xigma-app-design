import { fireEvent, render, screen } from '@testing-library/react';

// components
import EffectTypeItems from './EffectTypeItems';
import { TooltipProvider, UITools } from 'shared';

// types
import { EffectType } from 'types/design/enums';

const renderItems = (props: Partial<Parameters<typeof EffectTypeItems>[0]> = {}): TFunc => {
  const onSelect = vi.fn();

  render(
    <TooltipProvider>
      <UITools.Popover open trigger={<button type="button">open</button>}>
        <EffectTypeItems onSelect={onSelect} {...props} />
      </UITools.Popover>
    </TooltipProvider>,
  );

  return onSelect;
};

const isItemDisabled = (label: string): boolean => screen.getByText(label).closest('[class*="PopoverItem--disabled"]') !== null;

describe('EffectTypeItems behaviors', () => {
  it('should list every effect type and report a picked one', () => {
    // before
    const onSelect = renderItems();

    // action
    fireEvent.click(screen.getByText('Drop shadow'));

    // result
    expect(onSelect).toHaveBeenCalledWith(EffectType.dropShadow);
    expect(screen.getByText('Glass')).toBeInTheDocument();
    expect(screen.getByText('Shader')).toBeInTheDocument();
  });

  it('should disable unsupported and explicitly disabled types', () => {
    // before
    renderItems({ disabledTypes: [EffectType.noise], selectedType: EffectType.glass, withCheck: true });

    // result
    expect(isItemDisabled('Shader')).toBe(true);
    expect(isItemDisabled('Noise')).toBe(true);
    expect(isItemDisabled('Glass')).toBe(false);
  });
});
