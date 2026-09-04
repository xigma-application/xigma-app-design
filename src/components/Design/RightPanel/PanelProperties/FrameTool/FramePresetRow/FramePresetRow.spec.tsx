import { fireEvent, render, screen } from '@testing-library/react';

// components
import FramePresetRow from './FramePresetRow';

describe('FramePresetRow snapshots', () => {
  it('should render its label and its dimensions', () => {
    // before
    const { asFragment } = render(<FramePresetRow preset={{ height: 874, label: 'iPhone 17', width: 402 }} />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('FramePresetRow behaviors', () => {
  it('should render the preset label', () => {
    // before
    render(<FramePresetRow preset={{ height: 874, label: 'iPhone 17', width: 402 }} />);

    // result
    expect(screen.getByText('iPhone 17')).toBeInTheDocument();
  });

  it('should render the preset dimensions as width×height', () => {
    // before
    render(<FramePresetRow preset={{ height: 874, label: 'iPhone 17', width: 402 }} />);

    // result
    expect(screen.getByText('402×874')).toBeInTheDocument();
  });

  it('should do nothing yet when clicked', () => {
    // before
    render(<FramePresetRow preset={{ height: 874, label: 'iPhone 17', width: 402 }} />);
    const button = screen.getByRole('button');

    // action
    fireEvent.click(button);

    // result
    expect(button).toBeInTheDocument();
  });
});
