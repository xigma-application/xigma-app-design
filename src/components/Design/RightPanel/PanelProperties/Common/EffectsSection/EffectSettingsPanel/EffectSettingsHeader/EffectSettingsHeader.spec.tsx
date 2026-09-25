import { fireEvent, render, screen } from '@testing-library/react';

// components
import EffectSettingsHeader from './EffectSettingsHeader';
import { TooltipProvider } from 'shared';

// types
import { BlendMode, EffectType } from 'types/design/enums';

const renderHeader = (hasBlendMode: boolean): Record<string, TFunc> => {
  const handlers = { onBlendModeChange: vi.fn(), onBlendModePreview: vi.fn(), onClose: vi.fn(), onTypeChange: vi.fn() };

  render(
    <TooltipProvider>
      <EffectSettingsHeader
        {...handlers}
        blendMode={BlendMode.normal}
        disabledTypes={[]}
        hasBlendMode={hasBlendMode}
        type={EffectType.dropShadow}
      />
    </TooltipProvider>,
  );

  return handlers;
};

describe('EffectSettingsHeader behaviors', () => {
  it('should change the effect type from its menu', () => {
    // before
    const { onTypeChange } = renderHeader(true);

    // find
    const trigger = screen.getByLabelText('Change effect type');

    // action
    fireEvent.click(trigger);
    fireEvent.click(screen.getByText('Inner shadow'));

    // result
    expect(onTypeChange).toHaveBeenCalledWith(EffectType.innerShadow);
    expect(screen.getByLabelText('Apply blend mode to effect')).toBeInTheDocument();
  });

  it('should close from its button and hide the blend mode without one', () => {
    // before
    const { onClose } = renderHeader(false);

    // action
    fireEvent.click(screen.getByLabelText('Close'));

    // result
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByLabelText('Apply blend mode to effect')).not.toBeInTheDocument();
  });
});
