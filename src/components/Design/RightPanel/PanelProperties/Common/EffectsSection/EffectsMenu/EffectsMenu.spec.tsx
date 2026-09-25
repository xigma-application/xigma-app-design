import { fireEvent, render, screen } from '@testing-library/react';

// components
import EffectsMenu from './EffectsMenu';
import { TooltipProvider } from 'shared';

// types
import { EffectType } from 'types/design/enums';

const renderMenu = (onSelect: TFunc<[EffectType]>): void => {
  render(
    <TooltipProvider>
      <EffectsMenu disabledTypes={[]} onSelect={onSelect} />
    </TooltipProvider>,
  );
};

describe('EffectsMenu behaviors', () => {
  it('should open the effect list from the add button and report a picked effect', () => {
    // mock
    const onSelect = vi.fn();

    // before
    renderMenu(onSelect);

    // action
    fireEvent.click(screen.getByLabelText('Add effect'));
    fireEvent.click(screen.getByText('Layer blur'));

    // result
    expect(onSelect).toHaveBeenCalledWith(EffectType.layerBlur);
  });

  it('should close without picking an effect', () => {
    // mock
    const onSelect = vi.fn();

    // before
    renderMenu(onSelect);

    // action
    fireEvent.click(screen.getByLabelText('Add effect'));
    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' });

    // result
    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.queryByText('Layer blur')).not.toBeInTheDocument();
  });
});
