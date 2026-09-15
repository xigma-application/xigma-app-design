import { fireEvent, render, screen } from '@testing-library/react';

// components
import PatternSourceButton from './PatternSourceButton';

// types
import { TUsePatternSourcePickingResult } from '../../../../hooks/usePatternSourcePicking';

const buildPatternSourcePicking = (overrides: Partial<TUsePatternSourcePickingResult> = {}): TUsePatternSourcePickingResult => ({
  close: vi.fn(),
  isActive: false,
  open: vi.fn(),
  ...overrides,
});

describe('PatternSourceButton snapshots', () => {
  it('should render PatternSourceButton', () => {
    // before
    const { asFragment } = render(<PatternSourceButton patternSourcePicking={buildPatternSourcePicking()} />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('PatternSourceButton behaviors', () => {
  it('should render the select-source button with its label', () => {
    // before
    render(<PatternSourceButton patternSourcePicking={buildPatternSourcePicking()} />);

    // result
    expect(screen.getByRole('button', { name: 'Select source...' })).toBeInTheDocument();
  });

  it('should look secondary/outline while inactive', () => {
    // before
    render(<PatternSourceButton patternSourcePicking={buildPatternSourcePicking({ isActive: false })} />);
    const button = screen.getByRole('button', { name: 'Select source...' });

    // result
    expect(button.className).toContain('Button--secondary');
    expect(button.className).toContain('Button--outline');
  });

  it('should look active/primary/solid while active', () => {
    // before
    render(<PatternSourceButton patternSourcePicking={buildPatternSourcePicking({ isActive: true })} />);
    const button = screen.getByRole('button', { name: 'Select source...' });

    // result
    expect(button.className).toContain('Button--active');
    expect(button.className).not.toContain('Button--secondary');
    expect(button.className).not.toContain('Button--outline');
  });

  it('should call open() when clicked while inactive', () => {
    // mock
    const open = vi.fn();

    // before
    render(<PatternSourceButton patternSourcePicking={buildPatternSourcePicking({ isActive: false, open })} />);

    // action
    fireEvent.click(screen.getByRole('button', { name: 'Select source...' }));

    // result
    expect(open).toHaveBeenCalledTimes(1);
  });

  it('should call close() when clicked while active', () => {
    // mock
    const close = vi.fn();

    // before
    render(<PatternSourceButton patternSourcePicking={buildPatternSourcePicking({ close, isActive: true })} />);

    // action
    fireEvent.click(screen.getByRole('button', { name: 'Select source...' }));

    // result
    expect(close).toHaveBeenCalledTimes(1);
  });
});
