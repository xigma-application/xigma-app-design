import { fireEvent, render, screen } from '@testing-library/react';

// components
import ColorSampler from './ColorSampler';

// hooks
import { useColorSamplerEvents } from './hooks/useColorSamplerEvents';

// types
import type { Mock } from 'vitest';

vi.mock('./hooks/useColorSamplerEvents', () => ({
  useColorSamplerEvents: vi.fn(),
}));

const SAMPLED_COLORS = Array.from({ length: 49 }, () => ({ a: 255, b: 0, g: 0, r: 0 }));

describe('ColorSampler snapshots', () => {
  it('should render nothing until the pointer position is known', () => {
    // mock
    (useColorSamplerEvents as Mock).mockReturnValue({ colors: null, mousePosition: null });

    // before
    const { container } = render(<ColorSampler onClose={vi.fn()} onPick={vi.fn()} />);

    // result
    expect(container).toBeEmptyDOMElement();
  });

  it('should render nothing while the pointer is known but not over the canvas', () => {
    // mock
    (useColorSamplerEvents as Mock).mockReturnValue({ colors: null, mousePosition: { x: 10, y: 20 } });

    // before
    const { container } = render(<ColorSampler onClose={vi.fn()} onPick={vi.fn()} />);

    // result
    expect(container).toBeEmptyDOMElement();
  });

  it('should render the grid, result and prompt together once colors have been sampled', () => {
    // mock
    (useColorSamplerEvents as Mock).mockReturnValue({ colors: SAMPLED_COLORS, mousePosition: { x: 10, y: 20 } });

    // before
    const { asFragment } = render(<ColorSampler onClose={vi.fn()} onPick={vi.fn()} />);

    // result
    expect(asFragment()).toMatchSnapshot();
    expect(screen.getByText('Click to sample')).toBeInTheDocument();
  });
});

describe('ColorSampler behaviors', () => {
  it('should close on Escape', () => {
    // mock
    (useColorSamplerEvents as Mock).mockReturnValue({ colors: SAMPLED_COLORS, mousePosition: { x: 10, y: 20 } });
    const onClose = vi.fn();

    // before
    render(<ColorSampler onClose={onClose} onPick={vi.fn()} />);

    // action
    fireEvent.keyDown(window, { key: 'Escape' });

    // result
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
