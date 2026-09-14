import { fireEvent, render, screen } from '@testing-library/react';

// components
import PatternSourcePreview from './PatternSourcePreview';

// types
import { TUsePatternSourcePickingResult } from '../../../hooks/usePatternSourcePicking';

const buildPatternSourcePicking = (overrides: Partial<TUsePatternSourcePickingResult> = {}): TUsePatternSourcePickingResult => ({
  close: vi.fn(),
  isActive: false,
  open: vi.fn(),
  ...overrides,
});

describe('PatternSourcePreview snapshots', () => {
  it('should render PatternSourcePreview', () => {
    // before
    const { asFragment } = render(<PatternSourcePreview patternSourcePicking={buildPatternSourcePicking()} />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('PatternSourcePreview behaviors', () => {
  it('should render the select-source button with its label', () => {
    // before
    render(<PatternSourcePreview patternSourcePicking={buildPatternSourcePicking()} />);

    // result
    expect(screen.getByRole('button', { name: 'Select source...' })).toBeInTheDocument();
  });

  it('should look secondary/outline while inactive', () => {
    // before
    render(<PatternSourcePreview patternSourcePicking={buildPatternSourcePicking({ isActive: false })} />);
    const button = screen.getByRole('button', { name: 'Select source...' });

    // result
    expect(button.className).toContain('Button--secondary');
    expect(button.className).toContain('Button--outline');
  });

  it('should look active/primary/solid while active', () => {
    // before
    render(<PatternSourcePreview patternSourcePicking={buildPatternSourcePicking({ isActive: true })} />);
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
    render(<PatternSourcePreview patternSourcePicking={buildPatternSourcePicking({ isActive: false, open })} />);

    // action
    fireEvent.click(screen.getByRole('button', { name: 'Select source...' }));

    // result
    expect(open).toHaveBeenCalledTimes(1);
  });

  it('should call close() when clicked while active', () => {
    // mock
    const close = vi.fn();

    // before
    render(<PatternSourcePreview patternSourcePicking={buildPatternSourcePicking({ close, isActive: true })} />);

    // action
    fireEvent.click(screen.getByRole('button', { name: 'Select source...' }));

    // result
    expect(close).toHaveBeenCalledTimes(1);
  });
});
