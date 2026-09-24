import { render, screen } from '@testing-library/react';

// components
import SectionHint from './SectionHint';

describe('SectionHint snapshots', () => {
  it('should render the label', () => {
    // before
    const { asFragment } = render(<SectionHint label="Click + to replace mixed content" />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('SectionHint behaviors', () => {
  it('should show the given label', () => {
    // before
    render(<SectionHint label="Click + to replace mixed content" />);

    // result
    expect(screen.getByText('Click + to replace mixed content')).toBeInTheDocument();
  });
});
