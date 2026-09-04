import { Provider } from 'react-redux';
import { render, screen } from '@testing-library/react';

// components
import SectionColumn from './SectionColumn';

// store
import { store } from 'store';

const renderSectionColumn = (labels?: [string] | [string, string]): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <SectionColumn labels={labels}>
        <span>body</span>
      </SectionColumn>
    </Provider>,
  );

describe('SectionColumn snapshots', () => {
  it('should render its labels and its children', () => {
    // before
    const { asFragment } = renderSectionColumn(['Alignment']);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('SectionColumn behaviors', () => {
  it('should render its label', () => {
    // before
    renderSectionColumn(['Alignment']);

    // result
    expect(screen.getByText('Alignment')).toBeInTheDocument();
  });

  it('should render its children', () => {
    // before
    renderSectionColumn(['Alignment']);

    // result
    expect(screen.getByText('body')).toBeInTheDocument();
  });

  it('should expose the section e2e attribute', () => {
    // before
    const { container } = renderSectionColumn(['Alignment']);

    // result
    expect(container.querySelector('[data-test-section]')).not.toBeNull();
  });

  it('should apply the bottom margin modifier class when given', () => {
    // before
    const { container } = render(
      <Provider store={store}>
        <SectionColumn withBottomMargin>
          <span>body</span>
        </SectionColumn>
      </Provider>,
    );

    // result
    expect(container.querySelector('[class*="SectionColumn--with-bottom-margin"]')).not.toBeNull();
  });

  it('should apply the top margin modifier class when given', () => {
    // before
    const { container } = render(
      <Provider store={store}>
        <SectionColumn withTopMargin>
          <span>body</span>
        </SectionColumn>
      </Provider>,
    );

    // result
    expect(container.querySelector('[class*="SectionColumn--with-top-margin"]')).not.toBeNull();
  });

  it('should render the given buttonsIcon', () => {
    // before
    const { container } = render(
      <Provider store={store}>
        <SectionColumn buttonsIcon={[<button key="wrap">wrap</button>]}>
          <span>body</span>
        </SectionColumn>
      </Provider>,
    );

    // result
    expect(screen.getByText('wrap')).toBeInTheDocument();
    expect(container.querySelector('[class*="SectionColumnButtonIcons"]')).not.toBeNull();
  });

  it('should render an empty buttonsIcon wrapper when no buttonsIcon are given', () => {
    // before
    const { container } = renderSectionColumn(['Alignment']);

    // result
    expect(container.querySelector('[class*="SectionColumnButtonIcons"]')).toBeEmptyDOMElement();
  });
});
