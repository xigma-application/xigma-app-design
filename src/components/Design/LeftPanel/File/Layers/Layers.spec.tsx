import { fireEvent, render, screen } from '@testing-library/react';

// components
import Layers from './Layers';

describe('Layers', () => {
  it('should render collapsed by default with the "Layers" title', () => {
    // before
    render(<Layers />);

    // result
    expect(screen.getByText('Layers')).toBeInTheDocument();
    expect(screen.getByRole('button', { expanded: false })).toBeInTheDocument();
  });

  it('should expand when the header is clicked', () => {
    // before
    render(<Layers />);

    // action
    fireEvent.click(screen.getByRole('button', { expanded: false }));

    // result
    expect(screen.getByRole('button', { expanded: true })).toBeInTheDocument();
  });

  it('should collapse again when the header is clicked a second time', () => {
    // before
    render(<Layers />);
    fireEvent.click(screen.getByRole('button', { expanded: false }));

    // action
    fireEvent.click(screen.getByRole('button', { expanded: true }));

    // result
    expect(screen.getByRole('button', { expanded: false })).toBeInTheDocument();
  });
});
