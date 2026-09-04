import { render, screen } from '@testing-library/react';

// components
import Accordion from './Accordion';

describe('Accordion snapshots', () => {
  it('should render one item per entry', () => {
    // before
    const { asFragment } = render(
      <Accordion
        items={[
          { content: <span>iPhone 17</span>, defaultExpanded: true, label: 'Phone' },
          { content: <span>iPad</span>, label: 'Tablet' },
        ]}
      />,
    );

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('Accordion behaviors', () => {
  it('should render every item label', () => {
    // before
    render(
      <Accordion
        items={[
          { content: <span>iPhone 17</span>, label: 'Phone' },
          { content: <span>iPad</span>, label: 'Tablet' },
        ]}
      />,
    );

    // result
    expect(screen.getByText('Phone')).toBeInTheDocument();
    expect(screen.getByText('Tablet')).toBeInTheDocument();
  });

  it('should expose the e2e value on the accordion wrapper', () => {
    // before
    const { container } = render(<Accordion e2eValue="frame-presets" items={[{ content: <span>iPhone 17</span>, label: 'Phone' }]} />);

    // result
    expect(container.querySelector('[data-test-accordion="frame-presets"]')).not.toBeNull();
  });
});
