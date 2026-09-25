import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import OffsetVectorToolbar from './OffsetVectorToolbar';
import { TooltipProvider } from 'shared';

// store
import { addNode, setOffsetVector } from 'store/design/slice';
import { selectOffsetVector } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType, StrokeJoin } from 'types/design/enums';

const renderToolbar = (): void => {
  render(
    <Provider store={store}>
      <TooltipProvider>
        <OffsetVectorToolbar />
      </TooltipProvider>
    </Provider>,
  );
};

describe('OffsetVectorToolbar behaviors', () => {
  it('should render nothing outside the offset mode', () => {
    // mock
    store.dispatch(setOffsetVector(null));

    // before
    renderToolbar();

    // result
    expect(screen.queryByText('Offset')).not.toBeInTheDocument();
  });

  it('should show the offset distance and corner styles, and pick the round one', () => {
    // mock
    const { payload } = store.dispatch(
      addNode({ height: 0, name: 'Line', parentId: null, rotation: 0, strokes: [], type: NodeType.line, width: 50, x: 0, y: 0 }),
    );
    store.dispatch(setOffsetVector({ distance: 20, join: StrokeJoin.miter, nodeId: payload.id }));

    // before
    renderToolbar();

    // action
    fireEvent.click(screen.getByLabelText('Round'));

    // result
    expect(screen.getByText('Offset')).toBeInTheDocument();
    expect(screen.getByLabelText('Offset distance')).toHaveValue('20');
    expect(selectOffsetVector(store.getState())?.join).toBe(StrokeJoin.round);
  });
});
