import { fireEvent, render, screen } from '@testing-library/react';

// components
import AccordionItem from './AccordionItem';

describe('AccordionItem snapshots', () => {
  it('should render its header collapsed by default', () => {
    // before
    const { asFragment } = render(<AccordionItem item={{ content: <span>body</span>, label: 'Phone' }} />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });

  it('should render its content expanded when defaultExpanded is true', () => {
    // before
    const { asFragment } = render(<AccordionItem item={{ content: <span>body</span>, defaultExpanded: true, label: 'Phone' }} />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('AccordionItem behaviors', () => {
  it('should render the label', () => {
    // before
    render(<AccordionItem item={{ content: <span>body</span>, label: 'Phone' }} />);

    // result
    expect(screen.getByText('Phone')).toBeInTheDocument();
  });

  it('should not render its content while collapsed', () => {
    // before
    render(<AccordionItem item={{ content: <span>body</span>, label: 'Phone' }} />);

    // result
    expect(screen.queryByText('body')).not.toBeInTheDocument();
  });

  it('should render its content when defaultExpanded is true', () => {
    // before
    render(<AccordionItem item={{ content: <span>body</span>, defaultExpanded: true, label: 'Phone' }} />);

    // result
    expect(screen.getByText('body')).toBeInTheDocument();
  });

  it('should expose aria-expanded matching its expanded state', () => {
    // before
    render(<AccordionItem item={{ content: <span>body</span>, label: 'Phone' }} />);

    // result
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
  });

  it('should reveal its content when the header is clicked', () => {
    // before
    render(<AccordionItem item={{ content: <span>body</span>, label: 'Phone' }} />);

    // action
    fireEvent.click(screen.getByRole('button'));

    // result
    expect(screen.getByText('body')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
  });

  it('should hide its content again when the header is clicked twice', () => {
    // before
    render(<AccordionItem item={{ content: <span>body</span>, label: 'Phone' }} />);
    const button = screen.getByRole('button');

    // action
    fireEvent.click(button);
    fireEvent.click(button);

    // result
    expect(screen.queryByText('body')).not.toBeInTheDocument();
  });

  it('should expose the e2e value on the item wrapper', () => {
    // before
    const { container } = render(<AccordionItem e2eValue="phone" item={{ content: <span>body</span>, label: 'Phone' }} />);

    // result
    expect(container.querySelector('[data-test-accordion-item="phone"]')).not.toBeNull();
  });

  it('should default to the Triangle icon rotated -90deg while collapsed and 0deg while expanded', () => {
    // before
    const { container } = render(<AccordionItem item={{ content: <span>body</span>, label: 'Phone' }} />);
    const icon = container.querySelector('[class*="AccordionItem__icon"]') as HTMLElement;

    // result
    expect(icon).toHaveStyle({ transform: 'rotate(-90deg)' });

    // action
    fireEvent.click(screen.getByRole('button'));

    // result
    expect(icon).toHaveStyle({ transform: 'rotate(0deg)' });
  });

  it('should use a custom icon and rotation range when given one', () => {
    // before
    const { container } = render(
      <AccordionItem
        item={{ content: <span>body</span>, icon: 'ChevronRight', iconRotation: { collapsed: 0, expanded: 90 }, label: 'Phone' }}
      />,
    );
    const icon = container.querySelector('[class*="AccordionItem__icon"]') as HTMLElement;

    // result
    expect(icon).toHaveStyle({ transform: 'rotate(0deg)' });

    // action
    fireEvent.click(screen.getByRole('button'));

    // result
    expect(icon).toHaveStyle({ transform: 'rotate(90deg)' });
  });

  it('should merge a custom className onto the header', () => {
    // before
    render(<AccordionItem item={{ className: 'custom-header', content: <span>body</span>, label: 'Phone' }} />);

    // result
    expect(screen.getByRole('button').className).toContain('custom-header');
  });

  it('should default the icon size to 6px', () => {
    // before
    render(<AccordionItem item={{ content: <span>body</span>, label: 'Phone' }} />);

    // result
    expect(screen.getByRole('button').querySelector('svg')).toHaveAttribute('height', '6');
  });

  it('should use a custom icon size when given one', () => {
    // before
    render(<AccordionItem item={{ content: <span>body</span>, iconSize: 24, label: 'Phone' }} />);

    // result
    expect(screen.getByRole('button').querySelector('svg')).toHaveAttribute('height', '24');
  });
});
