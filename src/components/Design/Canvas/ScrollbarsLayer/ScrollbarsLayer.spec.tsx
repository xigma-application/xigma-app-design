import { render } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import ScrollbarsLayer from './ScrollbarsLayer';

// core
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';

// store
import { store } from 'store';

const renderScrollbarsLayer = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <CanvasRefsProvider>
        <ScrollbarsLayer />
      </CanvasRefsProvider>
    </Provider>,
  );

describe('ScrollbarsLayer', () => {
  it('should mount a track and a thumb for both the horizontal and vertical bar (visibility is toggled by the render loop)', () => {
    // before
    const { container } = renderScrollbarsLayer();

    // result
    expect(container.querySelector('[class*="horizontal-track"]')).toBeInTheDocument();
    expect(container.querySelector('[class*="horizontal-thumb"]')).toBeInTheDocument();
    expect(container.querySelector('[class*="vertical-track"]')).toBeInTheDocument();
    expect(container.querySelector('[class*="vertical-thumb"]')).toBeInTheDocument();
  });
});
