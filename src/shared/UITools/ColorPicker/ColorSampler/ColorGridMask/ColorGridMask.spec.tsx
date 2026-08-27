import { fireEvent, render } from '@testing-library/react';

// components
import ColorGridMask from './ColorGridMask';

// others
import { SAMPLE_GRID_MIDDLE_INDEX } from '../constants';

describe('ColorGridMask snapshots', () => {
  it('should render ColorGridMask', () => {
    // before
    const { asFragment } = render(<ColorGridMask colors={[]} onPick={vi.fn()} />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('ColorGridMask behaviors', () => {
  it('should call onPick with the sampled center color hex on click', () => {
    // mock
    const onPick = vi.fn();
    const colors = Array.from({ length: 49 }, () => ({ a: 255, b: 0, g: 0, r: 0 }));

    colors[SAMPLE_GRID_MIDDLE_INDEX] = { a: 255, b: 0, g: 255, r: 0 };

    // before
    const { container } = render(<ColorGridMask colors={colors} onPick={onPick} />);

    // action
    fireEvent.click(container.firstChild as HTMLElement);

    // result
    expect(onPick).toHaveBeenCalledWith('#00ff00');
  });
});
