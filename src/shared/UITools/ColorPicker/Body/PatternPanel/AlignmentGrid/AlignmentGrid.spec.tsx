import { fireEvent, render, screen } from '@testing-library/react';

// components
import AlignmentGrid from './AlignmentGrid';

describe('AlignmentGrid behaviors', () => {
  it('should render nine alignment points', () => {
    // before
    render(<AlignmentGrid onChange={vi.fn()} selectedIndex={0} />);

    // result
    expect(screen.getAllByRole('button')).toHaveLength(9);
  });

  it('should mark only the selected point as pressed', () => {
    // before
    render(<AlignmentGrid onChange={vi.fn()} selectedIndex={4} />);

    // result
    const buttons = screen.getAllByRole('button');

    expect(buttons[4]).toHaveAttribute('aria-pressed', 'true');
    expect(buttons.filter((button) => button.getAttribute('aria-pressed') === 'true')).toHaveLength(1);
  });

  it('should call onChange with the clicked point index', () => {
    // mock
    const onChange = vi.fn();

    // before
    render(<AlignmentGrid onChange={onChange} selectedIndex={0} />);

    // action
    fireEvent.click(screen.getAllByRole('button')[7]);

    // result
    expect(onChange).toHaveBeenCalledWith(7);
  });
});
