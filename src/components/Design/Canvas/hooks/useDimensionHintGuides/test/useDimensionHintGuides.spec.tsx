import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { FC } from 'react';

// hooks
import { useDimensionHintGuides } from '../useDimensionHintGuides';

// store
import { addNode, setHoveredDimensionField, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { createCanvasRefs } from '../../useCanvasRefs/createCanvasRefs';

const renderWithHook = (refs: TCanvasRefs): void => {
  const Harness: FC = () => {
    useDimensionHintGuides(refs);

    return null;
  };

  render(
    <Provider store={store}>
      <Harness />
    </Provider>,
  );
};

const addFrame = (): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#ff0000',
      height: 80,
      layoutMode: LayoutMode.horizontal,
      maxWidth: 400,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 200,
      x: 10,
      y: 20,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('useDimensionHintGuides', () => {
  afterEach(() => {
    store.dispatch(setHoveredDimensionField(null));
    store.dispatch(setSelection([]));
  });

  it('should leave the guides ref null while no dimension field is hovered', () => {
    const refs = createCanvasRefs();
    const frameId = addFrame();

    store.dispatch(setSelection([frameId]));
    renderWithHook(refs);

    expect(refs.transform.dimensionHintGuidesRef.current).toBeNull();
  });

  it('should publish guides for the selected frame while a field is hovered', () => {
    const refs = createCanvasRefs();
    const frameId = addFrame();

    store.dispatch(setSelection([frameId]));
    store.dispatch(setHoveredDimensionField('maxWidth'));
    renderWithHook(refs);

    expect(refs.transform.dimensionHintGuidesRef.current?.labels[0].text).toBe('Max W 400');
  });

  it('should keep the guides ref null when the selection is not a single frame', () => {
    const refs = createCanvasRefs();

    store.dispatch(setHoveredDimensionField('width'));
    renderWithHook(refs);

    expect(refs.transform.dimensionHintGuidesRef.current).toBeNull();
  });
});
