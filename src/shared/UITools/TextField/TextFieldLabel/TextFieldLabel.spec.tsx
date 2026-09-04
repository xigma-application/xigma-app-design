import { render, screen } from '@testing-library/react';

// components
import TextFieldLabel from './TextFieldLabel';

describe('TextFieldLabel snapshots', () => {
  it('should render the label text', () => {
    // before
    const { asFragment } = render(<TextFieldLabel label="Hex" />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('TextFieldLabel behaviors', () => {
  it('should render the given label', () => {
    // before
    render(<TextFieldLabel label="Hex" />);

    // result
    expect(screen.getByText('Hex')).toBeInTheDocument();
  });

  it('should render nothing when no label is given', () => {
    // before
    const { container } = render(<TextFieldLabel />);

    // result
    expect(container).toBeEmptyDOMElement();
  });
});
