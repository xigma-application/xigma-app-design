import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import SliceHeader from './SliceHeader';
import { TooltipProvider } from 'shared';

// store
import { addNodes, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

describe('SliceHeader behaviors', () => {
  it('should render the Slice label with the component button and no type menu', () => {
    // before
    render(
      <Provider store={store}>
        <TooltipProvider>
          <SliceHeader />
        </TooltipProvider>
      </Provider>,
    );

    // result
    expect(screen.getByText('Slice')).toBeInTheDocument();
    expect(screen.getByLabelText('Create component')).toBeInTheDocument();
    expect(screen.queryByLabelText('Element type')).not.toBeInTheDocument();
  });

  it('should show the component split button for several slices', () => {
    // mock
    store.dispatch(
      addNodes({
        nodes: ['headerSliceA', 'headerSliceB'].map((id) => ({
          height: 10,
          id,
          name: id,
          parentId: null,
          rotation: 0,
          type: NodeType.slice,
          width: 10,
          x: 0,
          y: 0,
        })),
        rootIds: ['headerSliceA', 'headerSliceB'],
      }),
    );
    store.dispatch(setSelection(['headerSliceA', 'headerSliceB']));

    // before
    render(
      <Provider store={store}>
        <TooltipProvider>
          <SliceHeader />
        </TooltipProvider>
      </Provider>,
    );

    // result
    expect(screen.getByLabelText('Component options')).toBeInTheDocument();
    store.dispatch(setSelection([]));
  });
});
