import { fireEvent, render, screen } from '@testing-library/react';

// components
import ImageFillModeRow from './ImageFillModeRow';

describe('ImageFillModeRow snapshots', () => {
  it('should render ImageFillModeRow', () => {
    // before
    const { asFragment } = render(<ImageFillModeRow fillMode="fill" setFillMode={vi.fn()} />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('ImageFillModeRow behaviors', () => {
  it('should show the current fill mode as the dropdown value', () => {
    // before
    render(<ImageFillModeRow fillMode="crop" setFillMode={vi.fn()} />);

    // result
    expect(screen.getByText('Crop')).toBeInTheDocument();
  });

  it('should render the rotate button', () => {
    // before
    render(<ImageFillModeRow fillMode="fill" setFillMode={vi.fn()} />);

    // result
    expect(screen.getByRole('button', { name: 'Rotate image' })).toBeInTheDocument();
  });

  it('should call setFillMode with the picked option when a different fill mode is chosen', () => {
    // mock
    const setFillMode = vi.fn();

    // before
    render(<ImageFillModeRow fillMode="fill" setFillMode={setFillMode} />);

    // action
    fireEvent.click(screen.getByText('Fill'));
    fireEvent.click(screen.getByText('Tile'));

    // result
    expect(setFillMode).toHaveBeenCalledWith('tile');
  });
});
