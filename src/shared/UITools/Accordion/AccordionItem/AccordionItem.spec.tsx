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
});
