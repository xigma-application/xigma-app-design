import { render, screen } from '@testing-library/react';

// components
import Section from './Section';

describe('Section snapshots', () => {
  it('should render Section with a label, a trailing component, and its children', () => {
    // before
    const { asFragment } = render(
      <Section component={<button type="button">＋</button>} e2eValue="background" label="Page">
        <span>body</span>
      </Section>,
    );

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('Section behaviors', () => {
  it('should render the label when one is given', () => {
    // before
    render(
      <Section label="Page">
        <span>body</span>
      </Section>,
    );

    // result
    expect(screen.getByText('Page')).toBeInTheDocument();
  });

  it('should render only its children when no label is given', () => {
    // before
    const { container } = render(
      <Section>
        <span>body</span>
      </Section>,
    );

    // result
    expect(container.querySelector('[class*="Section__header"]')).toBeNull();
    expect(screen.getByText('body')).toBeInTheDocument();
  });

  it('should not render the trailing component slot when no component is given', () => {
    // before
    const { container } = render(
      <Section label="Page">
        <span>body</span>
      </Section>,
    );

    // result
    expect(container.querySelector('[class*="Section__component"]')).toBeNull();
  });

  it('should expose the e2e value on the section wrapper', () => {
    // before
    const { container } = render(
      <Section e2eValue="background">
        <span>body</span>
      </Section>,
    );

    // result
    expect(container.querySelector('[data-test-section="background"]')).not.toBeNull();
  });
});
