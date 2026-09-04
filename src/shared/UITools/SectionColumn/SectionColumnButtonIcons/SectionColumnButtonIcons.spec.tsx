import { render, screen } from '@testing-library/react';

// components
import SectionColumnButtonIcons from './SectionColumnButtonIcons';

describe('SectionColumnButtonIcons snapshots', () => {
  it('should render the given buttonsIcon', () => {
    // before
    const { asFragment } = render(<SectionColumnButtonIcons buttonsIcon={[<button key="wrap">wrap</button>]} />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('SectionColumnButtonIcons behaviors', () => {
  it('should render every given buttonIcon', () => {
    // before
    render(<SectionColumnButtonIcons buttonsIcon={[<button key="a">a</button>, <button key="b">b</button>]} />);

    // result
    expect(screen.getByText('a')).toBeInTheDocument();
    expect(screen.getByText('b')).toBeInTheDocument();
  });

  it('should render nothing when no buttonsIcon are given', () => {
    // before
    const { container } = render(<SectionColumnButtonIcons />);

    // result
    expect(container.querySelector('[class*="SectionColumnButtonIcons"]')).toBeEmptyDOMElement();
  });
});
