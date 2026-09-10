import { fireEvent, render, screen } from '@testing-library/react';

// components
import GridTrackHandle from './GridTrackHandle';

const handle = (): HTMLElement => screen.getByRole('button', { name: 'Reorder track' });

describe('GridTrackHandle', () => {
  it('should render the 1-based track number', () => {
    render(<GridTrackHandle index={2} isDragging={false} isSelected={false} onPointerDown={vi.fn()} />);

    expect(handle()).toHaveTextContent('3');
  });

  it('should start a drag on pointer down', () => {
    const onPointerDown = vi.fn();

    render(<GridTrackHandle index={0} isDragging={false} isSelected={false} onPointerDown={onPointerDown} />);
    fireEvent.pointerDown(handle());

    expect(onPointerDown).toHaveBeenCalled();
  });

  it('should carry a distinct class while dragging and while selected', () => {
    const { rerender } = render(<GridTrackHandle index={0} isDragging={false} isSelected={false} onPointerDown={vi.fn()} />);
    const base = handle().className;

    rerender(<GridTrackHandle index={0} isDragging isSelected={false} onPointerDown={vi.fn()} />);
    expect(handle().className).not.toBe(base);

    rerender(<GridTrackHandle index={0} isDragging={false} isSelected onPointerDown={vi.fn()} />);
    expect(handle().className).not.toBe(base);
  });
});
