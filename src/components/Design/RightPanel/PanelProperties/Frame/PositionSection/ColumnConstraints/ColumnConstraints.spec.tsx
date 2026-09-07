import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import ColumnConstraints from './ColumnConstraints';
import { TooltipProvider } from 'shared';

// store
import { addNode, moveNodes, setSelection, updateNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { AlignmentHorizontal, NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

const renderColumnConstraints = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <ColumnConstraints />
      </TooltipProvider>
    </Provider>,
  );

const addFrame = (): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#ff0000',
      height: 40,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 40,
      x: 0,
      y: 0,
    }),
  );

  return selectActivePage(store.getState()).rootOrder.at(-1) as string;
};

const nestSelectedChild = (): string => {
  const parentId = addFrame();
  const childId = addFrame();

  store.dispatch(moveNodes({ nodeIds: [childId], targetIndex: 0, targetParentId: parentId }));
  store.dispatch(setSelection([childId]));

  return childId;
};

const alignmentOf = (id: string): TFrameNode['alignment'] => (selectActivePage(store.getState()).nodes[id] as TFrameNode).alignment;

describe('ColumnConstraints', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should render a label and default both dropdowns to Left / Top', () => {
    nestSelectedChild();
    renderColumnConstraints();

    expect(screen.getByText('Constraints')).toBeInTheDocument();
    expect(screen.getByText('Left')).toBeInTheDocument();
    expect(screen.getByText('Top')).toBeInTheDocument();
  });

  it('should set the horizontal alignment when a horizontal option is picked', () => {
    const childId = nestSelectedChild();
    renderColumnConstraints();

    fireEvent.click(screen.getByText('Left')); // open the horizontal dropdown
    fireEvent.click(screen.getByText('Center'));

    expect(alignmentOf(childId)).toEqual({ horizontal: AlignmentHorizontal.center });
  });

  it('should set the vertical alignment from the second dropdown', () => {
    const childId = nestSelectedChild();
    renderColumnConstraints();

    fireEvent.click(screen.getByText('Top')); // open the vertical dropdown
    fireEvent.click(screen.getByText('Bottom'));

    expect(alignmentOf(childId)).toEqual({ vertical: 'bottom' });
  });

  it('should reflect the frame’s current alignment in the dropdown labels', () => {
    const childId = nestSelectedChild();

    store.dispatch(updateNode({ changes: { alignment: { horizontal: AlignmentHorizontal.right } }, id: childId }));
    renderColumnConstraints();

    expect(screen.getByText('Right')).toBeInTheDocument();
  });

  it('should switch directly between values with no intermediate "unset" step', () => {
    const childId = nestSelectedChild();
    renderColumnConstraints();

    fireEvent.click(screen.getByText('Left'));
    fireEvent.click(screen.getByText('Right'));
    expect(alignmentOf(childId)).toEqual({ horizontal: AlignmentHorizontal.right });

    fireEvent.click(screen.getByText('Right'));
    fireEvent.click(screen.getByText('Center'));
    expect(alignmentOf(childId)).toEqual({ horizontal: AlignmentHorizontal.center });
  });
});
