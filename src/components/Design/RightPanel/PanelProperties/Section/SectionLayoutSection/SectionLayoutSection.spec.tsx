import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';
import SectionLayoutSection from './SectionLayoutSection';
import { TooltipProvider } from 'shared';

// store
import { addNodes, setSelection } from 'store/design/slice';
import { selectNodes } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode, TSectionNode } from 'types/design/types';

// utils
import { getDefaultSectionStyle } from 'utils/design/section/getDefaultSectionStyle';

const makeSection = (id: string, childIds: string[]): TSectionNode => ({
  ...getDefaultSectionStyle(),
  childIds,
  height: 400,
  id,
  name: 'Section 1',
  parentId: null,
  rotation: 0,
  type: NodeType.section,
  width: 400,
  x: 0,
  y: 0,
});

const makeRectangle = (id: string, parentId: string, x: number): TRectangleNode => ({
  fills: [{ color: '#D9D9D9', opacity: 100, type: 'solid' }],
  height: 40,
  id,
  name: id,
  parentId,
  rotation: 0,
  type: NodeType.rectangle,
  width: 40,
  x,
  y: 50,
});

const renderComponent = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <CanvasRefsProvider>
        <TooltipProvider>
          <SectionLayoutSection />
        </TooltipProvider>
      </CanvasRefsProvider>
    </Provider>,
  );

describe('SectionLayoutSection behaviors', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should show the dimensions of the selected section', () => {
    // mock
    store.dispatch(addNodes({ nodes: [makeSection('layoutDimensions', [])], rootIds: ['layoutDimensions'] }));
    store.dispatch(setSelection(['layoutDimensions']));

    // before
    renderComponent();

    // result
    expect(screen.getByText('Dimensions')).toBeInTheDocument();
  });

  it('should resize the section to fit its children from the Resize to fit button', () => {
    // mock
    store.dispatch(
      addNodes({
        nodes: [
          makeSection('layoutFit', ['layoutFitA', 'layoutFitB']),
          makeRectangle('layoutFitA', 'layoutFit', 30),
          makeRectangle('layoutFitB', 'layoutFit', 130),
        ],
        rootIds: ['layoutFit'],
      }),
    );
    store.dispatch(setSelection(['layoutFit']));

    // before
    renderComponent();

    // action
    fireEvent.click(screen.getByLabelText('Resize to fit'));

    // result
    expect(selectNodes(store.getState()).layoutFit).toMatchObject({ height: 40, width: 140, x: 30, y: 50 });
  });

  it('should disable Resize to fit when no selected section has children', () => {
    // mock
    store.dispatch(
      addNodes({ nodes: [makeSection('layoutEmptyA', []), makeSection('layoutEmptyB', [])], rootIds: ['layoutEmptyA', 'layoutEmptyB'] }),
    );
    store.dispatch(setSelection(['layoutEmptyA', 'layoutEmptyB']));

    // before
    renderComponent();

    // result
    expect(screen.getByLabelText('Resize to fit')).toBeDisabled();
  });

  it('should resize every selected section to fit its own children', () => {
    // mock
    store.dispatch(
      addNodes({
        nodes: [
          makeSection('layoutMultiA', ['layoutMultiChildA']),
          makeSection('layoutMultiB', ['layoutMultiChildB']),
          makeRectangle('layoutMultiChildA', 'layoutMultiA', 30),
          makeRectangle('layoutMultiChildB', 'layoutMultiB', 200),
        ],
        rootIds: ['layoutMultiA', 'layoutMultiB'],
      }),
    );
    store.dispatch(setSelection(['layoutMultiA', 'layoutMultiB']));

    // before
    renderComponent();

    // action
    fireEvent.click(screen.getByLabelText('Resize to fit'));

    // result
    expect(selectNodes(store.getState()).layoutMultiA).toMatchObject({ height: 40, width: 40, x: 30, y: 50 });
    expect(selectNodes(store.getState()).layoutMultiB).toMatchObject({ height: 40, width: 40, x: 200, y: 50 });
  });
});
