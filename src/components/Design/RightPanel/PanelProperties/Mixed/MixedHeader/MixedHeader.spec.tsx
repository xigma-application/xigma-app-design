import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import MixedHeader from './MixedHeader';
import { TooltipProvider } from 'shared';

// core
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';

// store
import { store } from 'store';

// types
import { TPanelHeaderButton } from '../types';

const renderMixedHeader = (buttons: TPanelHeaderButton[]): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <CanvasRefsProvider>
        <TooltipProvider>
          <MixedHeader buttons={buttons} count={2} />
        </TooltipProvider>
      </CanvasRefsProvider>
    </Provider>,
  );

describe('MixedHeader snapshots', () => {
  it('should render the selected count label with every header button', () => {
    // before
    const { asFragment } = renderMixedHeader(['matchingLayers', 'component', 'mask', 'boolean', 'editObject', 'wrapInSection']);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('MixedHeader behaviors', () => {
  it('should render the selected count label', () => {
    // before
    renderMixedHeader([]);

    // result
    expect(screen.getByText('2 selected')).toBeInTheDocument();
  });

  it('should render only the given buttons', () => {
    // before
    renderMixedHeader(['component', 'boolean']);

    // result
    expect(screen.getByLabelText('Create component')).toBeInTheDocument();
    expect(screen.getByLabelText('Boolean operations')).toBeInTheDocument();
    expect(screen.queryByLabelText('Wrap in new section')).not.toBeInTheDocument();
  });
});
