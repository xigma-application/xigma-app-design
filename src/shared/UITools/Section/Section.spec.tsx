import { fireEvent, render, screen } from '@testing-library/react';
import { ReactElement } from 'react';

// components
import Section from './Section';
import { TooltipProvider } from 'shared';

const renderSection = (ui: ReactElement): ReturnType<typeof render> => render(<TooltipProvider>{ui}</TooltipProvider>);

describe('Section snapshots', () => {
  it('should render Section with a label, a trailing component, and its children', () => {
    // before
    const { asFragment } = renderSection(
      <Section component={<button type="button">＋</button>} e2eValue="background" label="Page">
        <span>body</span>
      </Section>,
    );

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('Section behaviors', () => {
  it('should mute an empty section only when mutedWhenEmpty is set', () => {
    // before
    const { container, rerender } = renderSection(<Section label="Export" />);

    expect(container.querySelector('[class*="Section--muted"]')).toBeNull();

    // action
    rerender(
      <TooltipProvider>
        <Section label="Export" mutedWhenEmpty />
      </TooltipProvider>,
    );

    // result
    expect(container.querySelector('[class*="Section--muted"]')).not.toBeNull();
  });

  it('should not mute a section that has content, even with mutedWhenEmpty', () => {
    // before
    const { container } = renderSection(
      <Section label="Fill" mutedWhenEmpty>
        <span>row</span>
      </Section>,
    );

    // result
    expect(container.querySelector('[class*="Section--muted"]')).toBeNull();
  });

  it('should render the label when one is given', () => {
    // before
    renderSection(
      <Section label="Page">
        <span>body</span>
      </Section>,
    );

    // result
    expect(screen.getByText('Page')).toBeInTheDocument();
  });

  it('should render only its children when no label is given', () => {
    // before
    const { container } = renderSection(
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
    const { container } = renderSection(
      <Section label="Page">
        <span>body</span>
      </Section>,
    );

    // result
    expect(container.querySelector('[class*="Section__component"]')).toBeNull();
  });

  it('should expose the e2e value on the section wrapper', () => {
    // before
    const { container } = renderSection(
      <Section e2eValue="background">
        <span>body</span>
      </Section>,
    );

    // result
    expect(container.querySelector('[data-test-section="background"]')).not.toBeNull();
  });

  it('should render each item via a function child when items is an array', () => {
    // before
    renderSection(
      <Section<string> items={['fill', 'stroke']} label="Styles">
        {(name) => <span key={name}>{name}</span>}
      </Section>,
    );

    // result
    expect(screen.getByText('fill')).toBeInTheDocument();
    expect(screen.getByText('stroke')).toBeInTheDocument();
  });

  it('should render nothing below the header when items is an empty array', () => {
    // before
    const { container } = renderSection(
      <Section<string> items={[]} label="Styles">
        {(name) => <span>{name}</span>}
      </Section>,
    );

    // result
    expect(container.querySelectorAll('span:not([class*="Section__label"])')).toHaveLength(0);
  });

  it('should fall back to rendering children as-is when items is an array but children is not a function', () => {
    // before
    renderSection(
      <Section<string> items={['fill']} label="Styles">
        <span>static body</span>
      </Section>,
    );

    // result
    expect(screen.getByText('static body')).toBeInTheDocument();
  });

  it('should render an add button that calls onAdd when clicked', () => {
    // mock
    const onAdd = vi.fn();

    // before
    renderSection(
      <Section addAriaLabel="Add style" label="Styles" onAdd={onAdd}>
        <span>body</span>
      </Section>,
    );

    // action
    fireEvent.click(screen.getByLabelText('Add style'));

    // result
    expect(onAdd).toHaveBeenCalled();
  });

  it('should render the trailing slot for onAdd alone, without a component', () => {
    // before
    const { container } = renderSection(
      <Section label="Styles" onAdd={() => {}}>
        <span>body</span>
      </Section>,
    );

    // result
    expect(container.querySelector('[class*="Section__component"]')).not.toBeNull();
  });

  it('should show the bottom border by default', () => {
    // before
    const { container } = renderSection(
      <Section label="Page">
        <span>body</span>
      </Section>,
    );

    // result
    expect(container.querySelector('[class*="Section--noSeparator"]')).toBeNull();
  });

  it('should hide the bottom border when separator is false', () => {
    // before
    const { container } = renderSection(
      <Section label="Page" separator={false}>
        <span>body</span>
      </Section>,
    );

    // result
    expect(container.querySelector('[class*="Section--noSeparator"]')).not.toBeNull();
  });

  it('should treat itself as empty when hasContent={false} is given, even though children is truthy', () => {
    // before — a wrapper div that always renders regardless of an underlying list being empty
    // (e.g. FillSection's rows container) can't be detected by the default Boolean(children) check
    const { container } = renderSection(
      <Section hasContent={false} label="Fill">
        <div>always rendered</div>
      </Section>,
    );

    // result
    expect(container.querySelector('[class*="Section--empty"]')).not.toBeNull();
  });

  it('should treat itself as non-empty when hasContent={true} is given, even though items is empty', () => {
    // before
    const { container } = renderSection(
      <Section<string> hasContent items={[]} label="Fill">
        {(name) => <span>{name}</span>}
      </Section>,
    );

    // result
    expect(container.querySelector('[class*="Section--empty"]')).toBeNull();
  });

  it('should call onAdd when clicking anywhere in an empty section container', () => {
    // mock
    const onAdd = vi.fn();

    // before
    const { container } = renderSection(<Section hasContent={false} label="Fill" onAdd={onAdd} />);

    // action
    fireEvent.click(container.querySelector('[class*="Section"]') as Element);

    // result
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it('should not call onAdd twice when clicking the add button inside an empty section', () => {
    // mock
    const onAdd = vi.fn();

    // before
    renderSection(<Section addAriaLabel="Add fill" hasContent={false} label="Fill" onAdd={onAdd} />);

    // action
    fireEvent.click(screen.getByLabelText('Add fill'));

    // result
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it('should not call onAdd when clicking the trailing component in an empty section', () => {
    // mock
    const onAdd = vi.fn();

    // before
    const { getByLabelText } = renderSection(
      <Section
        component={
          <button aria-label="Styles and variables" type="button">
            styles
          </button>
        }
        hasContent={false}
        label="Fill"
        onAdd={onAdd}
      />,
    );

    // action
    fireEvent.click(getByLabelText('Styles and variables'));

    // result
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('should not call onAdd when clicking a non-empty section without onAdd wired to the container', () => {
    // mock
    const onAdd = vi.fn();

    // before
    const { container } = renderSection(
      <Section label="Fill" onAdd={onAdd}>
        <span>row</span>
      </Section>,
    );

    // action
    fireEvent.click(container.querySelector('[class*="Section"]') as Element);

    // result
    expect(onAdd).not.toHaveBeenCalled();
  });
});
