import { fireEvent, render, screen } from '@testing-library/react';

// components
import ImageSourceButtons from './ImageSourceButtons';

describe('ImageSourceButtons snapshots', () => {
  it('should render ImageSourceButtons', () => {
    // before
    const { asFragment } = render(<ImageSourceButtons onSelectFile={vi.fn()} />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('ImageSourceButtons behaviors', () => {
  it('should render the upload-from-computer and make-an-image buttons', () => {
    // before
    render(<ImageSourceButtons onSelectFile={vi.fn()} />);

    // result
    expect(screen.getByRole('button', { name: 'Upload from computer' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Make an image' })).toBeInTheDocument();
  });

  it('should open the hidden file picker when Upload from computer is clicked', () => {
    // before
    const { container } = render(<ImageSourceButtons onSelectFile={vi.fn()} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    vi.spyOn(input, 'click');

    // action
    fireEvent.click(screen.getByRole('button', { name: 'Upload from computer' }));

    // result
    expect(input.click).toHaveBeenCalledTimes(1);
  });

  it('should call onSelectFile with the chosen file', () => {
    // mock
    const onSelectFile = vi.fn();
    const file = new File(['content'], 'photo.png', { type: 'image/png' });

    // before
    const { container } = render(<ImageSourceButtons onSelectFile={onSelectFile} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    // action
    fireEvent.change(input, { target: { files: [file] } });

    // result
    expect(onSelectFile).toHaveBeenCalledWith(file);
  });
});
