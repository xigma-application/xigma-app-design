import { render, screen } from '@testing-library/react';

// components
import SectionColumnContent from './SectionColumnContent';

// types
import { GridColumnType } from '../enums';

describe('SectionColumnContent snapshots', () => {
  it('should render its children in a single-column grid by default', () => {
    // before
    const { asFragment } = render(
      <SectionColumnContent width="100%">
        <span>body</span>
      </SectionColumnContent>,
    );

    // result
    expect(asFragment()).toMatchSnapshot();
  });

  it('should render its children in a two-input grid', () => {
    // before
    const { asFragment } = render(
      <SectionColumnContent gridColumnType={GridColumnType.twoInputs} width="100%">
        <span>first</span>
        <span>second</span>
      </SectionColumnContent>,
    );

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('SectionColumnContent behaviors', () => {
  it('should render its children', () => {
    // before
    render(
      <SectionColumnContent width="100%">
        <span>body</span>
      </SectionColumnContent>,
    );

    // result
    expect(screen.getByText('body')).toBeInTheDocument();
  });

  it('should apply the single-column modifier class by default', () => {
    // before
    const { container } = render(
      <SectionColumnContent width="100%">
        <span>body</span>
      </SectionColumnContent>,
    );

    // result
    expect(container.querySelector('[class*="SectionColumnContent--single"]')).not.toBeNull();
  });

  it('should apply the one-by-two modifier class when given', () => {
    // before
    const { container } = render(
      <SectionColumnContent gridColumnType={GridColumnType.oneByTwo} width="100%">
        <span>body</span>
      </SectionColumnContent>,
    );

    // result
    expect(container.querySelector('[class*="SectionColumnContent--one-by-two"]')).not.toBeNull();
  });
});
