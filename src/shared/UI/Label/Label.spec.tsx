import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import Label from './Label';

// store
import { toggleAdditionalLabels } from 'store/design/slice';
import { selectAreAdditionalLabelsVisible } from 'store/design/selectors';
import { store } from 'store';

describe('Label', () => {
  beforeEach(() => {
    if (!selectAreAdditionalLabelsVisible(store.getState())) {
      store.dispatch(toggleAdditionalLabels());
    }
  });

  it('should render its children when additional labels are visible', () => {
    // before
    render(
      <Provider store={store}>
        <Label>File</Label>
      </Provider>,
    );

    // result
    expect(screen.getByText('File')).toBeInTheDocument();
  });

  it('should render nothing when additional labels are hidden', () => {
    // mock
    store.dispatch(toggleAdditionalLabels());

    // before
    render(
      <Provider store={store}>
        <Label>File</Label>
      </Provider>,
    );

    // result
    expect(screen.queryByText('File')).not.toBeInTheDocument();
  });

  it('should apply the given fontSize', () => {
    // before
    render(
      <Provider store={store}>
        <Label fontSize={9}>File</Label>
      </Provider>,
    );

    // result
    expect(screen.getByText('File')).toHaveStyle({ fontSize: '9px' });
  });

  it('should merge a caller-supplied className with its own base class', () => {
    // before
    render(
      <Provider store={store}>
        <Label className="caller-class">File</Label>
      </Provider>,
    );

    // result
    expect(screen.getByText('File')).toHaveClass('caller-class');
  });

  it('should not apply the secondary color class by default', () => {
    // before
    render(
      <Provider store={store}>
        <Label>File</Label>
      </Provider>,
    );

    // result
    expect(screen.getByText('File').className).not.toMatch(/--secondary/);
  });

  it('should apply the secondary color class when color is secondary', () => {
    // before
    render(
      <Provider store={store}>
        <Label color="secondary">File</Label>
      </Provider>,
    );

    // result
    expect(screen.getByText('File').className).toMatch(/--secondary/);
  });
});
