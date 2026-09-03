import { render } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import ScrollbarsLayer from './ScrollbarsLayer';

// core
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';

// store
import { addNode } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

const renderScrollbarsLayer = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <CanvasRefsProvider>
        <ScrollbarsLayer />
      </CanvasRefsProvider>
    </Provider>,
  );

describe('ScrollbarsLayer', () => {
  it('should render nothing while the page has no nodes', () => {
    // before
    const { container } = renderScrollbarsLayer();

    // result
    expect(container.querySelector('[class*="horizontal-track"]')).not.toBeInTheDocument();
    expect(container.querySelector('[class*="vertical-track"]')).not.toBeInTheDocument();
  });

  it('should mount a track and a thumb for both the horizontal and vertical bar once the page has a node', () => {
    // mock
    store.dispatch(
      addNode({
        childIds: [],
        clipContent: true,
        fill: '#ff0000',
        height: 100,
        name: 'Frame',
        parentId: null,
        rotation: 0,
        type: NodeType.frame,
        width: 100,
        x: 0,
        y: 0,
      }),
    );

    // before
    const { container } = renderScrollbarsLayer();

    // result
    expect(container.querySelector('[class*="horizontal-track"]')).toBeInTheDocument();
    expect(container.querySelector('[class*="horizontal-thumb"]')).toBeInTheDocument();
    expect(container.querySelector('[class*="vertical-track"]')).toBeInTheDocument();
    expect(container.querySelector('[class*="vertical-thumb"]')).toBeInTheDocument();
  });
});
