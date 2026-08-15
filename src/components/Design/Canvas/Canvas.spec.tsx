import { Provider } from 'react-redux';
import { render } from '@testing-library/react';

// components
import Canvas from './Canvas';
import ClassNamesProvider from '../core/ClassNamesProvider/ClassNamesProvider';

// store
import { store } from 'store';

describe('Canvas snapshots', () => {
  it('should render Canvas', () => {
    // before
    const { asFragment } = render(
      <Provider store={store}>
        <ClassNamesProvider>
          <Canvas />
        </ClassNamesProvider>
      </Provider>,
    );

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});
