import { fireEvent, render, screen } from '@testing-library/react';

// components
import ArcField from './ArcField';
import { TooltipProvider } from 'shared';

// types
import { TArcField } from './types';

const makeField = (overrides: Partial<TArcField> = {}): TArcField => ({
  displayValue: '30°',
  key: 'start',
  max: 180,
  min: -180,
  onBlur: vi.fn(),
  onScrub: vi.fn(),
  value: 30,
  ...overrides,
});

describe('ArcField behaviors', () => {
  it('should show the value and commit it on blur', () => {
    // mock
    const field = makeField();

    // before
    render(
      <TooltipProvider>
        <ArcField ariaLabel="Start" field={field} withIcon />
      </TooltipProvider>,
    );

    // find
    const input = screen.getByRole('textbox', { name: 'Start' });

    // action
    fireEvent.blur(input);

    // result
    expect(input).toHaveValue('30°');
    expect(field.onBlur).toHaveBeenCalled();
  });

  it('should scrub from the field edge instead of the arc icon unless asked', () => {
    // before
    const { container } = render(
      <TooltipProvider>
        <ArcField ariaLabel="Ratio" field={makeField({ displayValue: '0%', key: 'ratio' })} />
      </TooltipProvider>,
    );

    // result
    expect(container.querySelector('svg')).toBeNull();
    expect(container.querySelector('[data-no-drag]')).toBeInTheDocument();
  });
});
