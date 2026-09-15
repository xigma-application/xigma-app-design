import { act, fireEvent, render, screen } from '@testing-library/react';

// components
import ImagePanel from './ImagePanel';

describe('ImagePanel snapshots', () => {
  it('should render ImagePanel', () => {
    // before
    const { asFragment } = render(<ImagePanel />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('ImagePanel behaviors', () => {
  it('should render the fill-mode dropdown, the source preview, and the adjustment sliders', () => {
    // before
    render(<ImagePanel />);

    // result
    expect(screen.getByText('Fill')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Upload from computer' })).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: 'Exposure' })).toBeInTheDocument();
  });

  it('should switch the dropdown to the picked fill mode', () => {
    // before
    render(<ImagePanel />);

    // action
    fireEvent.click(screen.getByText('Fill'));
    fireEvent.click(screen.getByText('Tile'));

    // result
    expect(screen.getByText('Tile')).toBeInTheDocument();
  });

  it('should update a slider value locally when dragged', () => {
    // before
    render(<ImagePanel />);
    const track = screen.getByRole('slider', { name: 'Exposure' }) as HTMLDivElement;

    vi.spyOn(track, 'getBoundingClientRect').mockReturnValue({ height: 24, left: 0, top: 0, width: 100 } as DOMRect);

    // action — a quarter of the way across a [-100, 100] range lands on -50
    act(() => {
      track.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 25, clientY: 0, pointerId: 1 }));
    });

    // result
    expect(track).toHaveAttribute('aria-valuenow', '-50');
  });
});
