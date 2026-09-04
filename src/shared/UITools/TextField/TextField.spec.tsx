import { render, screen } from '@testing-library/react';

// components
import TextField from './TextField';

describe('TextField snapshots', () => {
  it('should render a labelled field wrapping its input', () => {
    // before
    const { asFragment } = render(<TextField className="caller-class" e2eValue="color" label="Hex" value="ffffff" />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('TextField behaviors', () => {
  it('should render the label alongside the input', () => {
    // before
    render(<TextField label="Hex" value="ffffff" />);

    // result
    expect(screen.getByText('Hex')).toBeInTheDocument();
    expect(screen.getByDisplayValue('ffffff')).toBeInTheDocument();
  });

  it('should merge a caller className with its base class', () => {
    // before
    const { container } = render(<TextField className="caller-class" value="ffffff" />);

    // result
    expect((container.firstChild as HTMLElement).className).toContain('caller-class');
    expect((container.firstChild as HTMLElement).className).toContain('TextField');
  });

  it('should render without a label or caller className', () => {
    // before
    const { container } = render(<TextField value="ffffff" />);

    // result
    expect(container.querySelector('[class*="TextFieldLabel"]')).toBeNull();
  });
});
