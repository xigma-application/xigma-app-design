import { Provider } from 'react-redux';
import { render, screen } from '@testing-library/react';

// components
import SectionColumnLabels from './SectionColumnLabels';

// store
import { store } from 'store';

const renderSectionColumnLabels = (labels?: [string] | [string, string]): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <SectionColumnLabels labels={labels} width="100%" />
    </Provider>,
  );

describe('SectionColumnLabels snapshots', () => {
  it('should render one label', () => {
    // before
    const { asFragment } = renderSectionColumnLabels(['Alignment']);

    // result
    expect(asFragment()).toMatchSnapshot();
  });

  it('should render two labels', () => {
    // before
    const { asFragment } = renderSectionColumnLabels(['X', 'Y']);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('SectionColumnLabels behaviors', () => {
  it('should render every given label', () => {
    // before
    renderSectionColumnLabels(['X', 'Y']);

    // result
    expect(screen.getByText('X')).toBeInTheDocument();
    expect(screen.getByText('Y')).toBeInTheDocument();
  });

  it('should render nothing when no labels are given', () => {
    // before
    const { container } = renderSectionColumnLabels();

    // result
    expect(container.querySelectorAll('span')).toHaveLength(0);
  });
});
