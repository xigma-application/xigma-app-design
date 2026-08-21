import { Provider } from 'react-redux';
import { render } from '@testing-library/react';

// components
import Canvas from './Canvas';

// core
import ClassNamesProvider from '../core/ClassNamesProvider/ClassNamesProvider';

// pages
import CanvasRefsProvider from 'pages/DesignPage/core/CanvasRefsProvider/CanvasRefsProvider';

// store
import { store } from 'store';

describe('Canvas snapshots', () => {
  it('should render Canvas', () => {
    // before
    const { asFragment } = render(
      <Provider store={store}>
        <CanvasRefsProvider>
          <ClassNamesProvider>
            <Canvas />
          </ClassNamesProvider>
        </CanvasRefsProvider>
      </Provider>,
    );

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});
