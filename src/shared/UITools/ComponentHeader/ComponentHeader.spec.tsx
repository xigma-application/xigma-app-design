import { render, screen } from '@testing-library/react';

// components
import ComponentHeader from './ComponentHeader';

describe('ComponentHeader snapshots', () => {
  it('should render ComponentHeader with children and trailing buttons', () => {
    // before
    const { asFragment } = render(
      <ComponentHeader buttons={<button type="button">＋</button>} e2eValue="frame">
        Frame
      </ComponentHeader>,
    );

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('ComponentHeader behaviors', () => {
  it('should render its children', () => {
    // before
    render(<ComponentHeader>Frame</ComponentHeader>);

    // result
    expect(screen.getByText('Frame')).toBeInTheDocument();
  });

  it('should not render the trailing buttons slot when no buttons are given', () => {
    // before
    const { container } = render(<ComponentHeader>Frame</ComponentHeader>);

    // result
    expect(container.querySelector('[class*="ComponentHeader__buttons"]')).toBeNull();
  });

  it('should render the trailing buttons slot when buttons are given', () => {
    // before
    const { container } = render(<ComponentHeader buttons={<button type="button">＋</button>}>Frame</ComponentHeader>);

    // result
    expect(container.querySelector('[class*="ComponentHeader__buttons"]')).not.toBeNull();
  });

  it('should expose the e2e value on the wrapper', () => {
    // before
    const { container } = render(<ComponentHeader e2eValue="frame">Frame</ComponentHeader>);

    // result
    expect(container.querySelector('[data-test-component-header="frame"]')).not.toBeNull();
  });
});
