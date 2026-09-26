import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import VectorEditAlignment from './VectorEditAlignment';
import { TooltipProvider } from 'shared';

// core
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';

// store
import { store } from 'store';

const renderVectorEditAlignment = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <CanvasRefsProvider>
        <TooltipProvider>
          <VectorEditAlignment />
        </TooltipProvider>
      </CanvasRefsProvider>
    </Provider>,
  );

describe('VectorEditAlignment snapshots', () => {
  it('should render the alignment buttons and the more actions button', () => {
    // before
    const { asFragment } = renderVectorEditAlignment();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('VectorEditAlignment behaviors', () => {
  it('should disable every alignment button and keep the more actions menu while no points are selected', () => {
    // before
    renderVectorEditAlignment();

    // find
    const moreActions = screen.getByRole('button', { name: 'More actions' });

    // result
    expect(screen.getAllByRole('button').filter((button) => button !== moreActions)).toHaveLength(6);
    screen
      .getAllByRole('button')
      .filter((button) => button !== moreActions)
      .forEach((button) => expect(button).toBeDisabled());
    expect(moreActions).toBeEnabled();
  });
});
