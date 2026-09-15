import { render, screen } from '@testing-library/react';

// components
import InputAdornment from './InputAdornment';

describe('InputAdornment snapshots', () => {
  it('should render with a label', () => {
    // before
    const { asFragment } = render(<InputAdornment label="px" />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });

  it('should render with an icon', () => {
    // before
    const { asFragment } = render(<InputAdornment icon="Close" />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('InputAdornment behaviors', () => {
  it('should render the given label', () => {
    // before
    render(<InputAdornment label="px" />);

    // result
    expect(screen.getByText('px')).toBeInTheDocument();
  });

  it('should render the given icon instead of the label when both are provided', () => {
    // before
    render(<InputAdornment icon="Close" label="px" />);

    // result
    expect(screen.queryByText('px')).not.toBeInTheDocument();
  });
});
