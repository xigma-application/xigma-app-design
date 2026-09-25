import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import ColumnMinMaxDimensionsField from './ColumnMinMaxDimensionsField';
import { TooltipProvider } from 'shared';

// store
import { store } from 'store';

const renderField = (props: Partial<Parameters<typeof ColumnMinMaxDimensionsField>[0]> = {}): Record<string, TFunc> => {
  const handlers = { onBlur: vi.fn(), onDragEnd: vi.fn(), onDragStart: vi.fn(), onScrub: vi.fn() };

  render(
    <Provider store={store}>
      <TooltipProvider>
        <ColumnMinMaxDimensionsField
          ariaLabel="Min width"
          e2eValue={'min-width' as never}
          hintField={'minWidth' as never}
          icon="MinWidth"
          value={40}
          {...handlers}
          {...props}
        />
      </TooltipProvider>
    </Provider>,
  );

  return handlers;
};

describe('ColumnMinMaxDimensionsField behaviors', () => {
  it('should focus a numeric field holding the bound and commit it on blur', () => {
    // before
    const { onBlur } = renderField();

    // find
    const input = screen.getByLabelText('Min width');

    // action
    fireEvent.blur(input);

    // result
    expect(input).toHaveFocus();
    expect(input).toHaveValue(40);
    expect(onBlur).toHaveBeenCalled();
  });

  it('should show a text display value such as Mixed, disabled', () => {
    // before
    renderField({ disabled: true, displayValue: 'Mixed', value: undefined });

    // result
    expect(screen.getByLabelText('Min width')).toHaveValue('Mixed');
    expect(screen.getByLabelText('Min width')).toBeDisabled();
  });

  it('should start from an empty field without a bound', () => {
    // before
    renderField({ value: undefined });

    // result
    expect(screen.getByLabelText('Min width')).toHaveValue(null);
  });
});
