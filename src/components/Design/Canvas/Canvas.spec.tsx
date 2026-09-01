import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

// components
import Canvas from './Canvas';

// core
import ClassNamesProvider from '../core/ClassNamesProvider/ClassNamesProvider';

// pages
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

const renderCanvas = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <CanvasRefsProvider>
        <ClassNamesProvider>
          <Canvas />
        </ClassNamesProvider>
      </CanvasRefsProvider>
    </Provider>,
  );

describe('Canvas snapshots', () => {
  it('should render Canvas', () => {
    // before
    const { asFragment } = renderCanvas();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('Canvas context menu', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should open CanvasContextMenu when right-clicking empty canvas', async () => {
    // before
    const { container } = renderCanvas();

    // action
    fireEvent.contextMenu(container.firstChild as Element, { clientX: 900, clientY: 900 });

    // result
    await waitFor(() => expect(screen.getByText('Paste here')).toBeInTheDocument());
  });

  it('should open NodeContextMenu (the same panel the Layers tree uses) when right-clicking a node', async () => {
    // mock
    store.dispatch(
      addNode({
        fill: '#ff0000',
        height: 20,
        name: 'Rectangle',
        parentId: null,
        rotation: 0,
        type: NodeType.rectangle,
        width: 20,
        x: 0,
        y: 0,
      }),
    );

    // before
    const { container } = renderCanvas();
    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

    // action — inside the 0,0-20,20 rectangle
    fireEvent.contextMenu(container.firstChild as Element, { clientX: 10, clientY: 10 });

    // result — Copy is a NodeContextMenu-only item, absent from CanvasContextMenu
    await waitFor(() => expect(screen.getByText('Copy')).toBeInTheDocument());

    const { rootOrder, selectedIds } = selectActivePage(store.getState());
    expect(selectedIds).toEqual([rootOrder[0]]);
  });

  it('should toggle the hit node’s hidden flag via NodeContextMenu’s Show/Hide', async () => {
    // mock
    const user = userEvent.setup();
    store.dispatch(
      addNode({
        fill: '#ff0000',
        height: 20,
        name: 'Rectangle',
        parentId: null,
        rotation: 0,
        type: NodeType.rectangle,
        width: 20,
        x: 0,
        y: 0,
      }),
    );
    // the topmost (last-drawn) node at this point wins the hit-test — earlier tests in this file
    // leave their own rectangles behind at the same 0,0-20,20 spot, so pin down this one by id
    const nodeId = selectActivePage(store.getState()).rootOrder.slice(-1)[0];

    // before
    const { container } = renderCanvas();
    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

    fireEvent.contextMenu(container.firstChild as Element, { clientX: 10, clientY: 10 });
    await waitFor(() => expect(screen.getByText('Show/Hide')).toBeInTheDocument());

    // action
    await user.click(screen.getByText('Show/Hide'));

    // result
    expect(selectActivePage(store.getState()).nodes[nodeId].hidden).toBe(true);
  });

  it('should toggle the hit node’s locked flag via NodeContextMenu’s Lock/Unlock', async () => {
    // mock
    const user = userEvent.setup();
    store.dispatch(
      addNode({
        fill: '#ff0000',
        height: 20,
        name: 'Rectangle',
        parentId: null,
        rotation: 0,
        type: NodeType.rectangle,
        width: 20,
        x: 0,
        y: 0,
      }),
    );
    const nodeId = selectActivePage(store.getState()).rootOrder.slice(-1)[0];

    // before
    const { container } = renderCanvas();
    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

    fireEvent.contextMenu(container.firstChild as Element, { clientX: 10, clientY: 10 });
    await waitFor(() => expect(screen.getByText('Lock/Unlock')).toBeInTheDocument());

    // action
    await user.click(screen.getByText('Lock/Unlock'));

    // result
    expect(selectActivePage(store.getState()).nodes[nodeId].locked).toBe(true);
  });

  it('should dispatch toggleUiMinimized via CanvasContextMenu’s Show/Hide UI', async () => {
    // mock
    const user = userEvent.setup();
    const isUiMinimizedBefore = store.getState().design.isUiMinimized;

    // before
    const { container } = renderCanvas();

    fireEvent.contextMenu(container.firstChild as Element, { clientX: 900, clientY: 900 });
    await waitFor(() => expect(screen.getByText('Show/Hide UI')).toBeInTheDocument());

    // action
    await user.click(screen.getByText('Show/Hide UI'));

    // result
    expect(store.getState().design.isUiMinimized).toBe(!isUiMinimizedBefore);
  });

  it('should toggle isMask off via Remove mask on a masked hit node', async () => {
    // mock
    const user = userEvent.setup();
    store.dispatch(
      addNode({
        fill: '#ff0000',
        height: 20,
        isMask: true,
        name: 'Rectangle',
        parentId: null,
        rotation: 0,
        type: NodeType.rectangle,
        width: 20,
        x: 0,
        y: 0,
      }),
    );
    const nodeId = selectActivePage(store.getState()).rootOrder.slice(-1)[0];

    // before
    const { container } = renderCanvas();
    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

    fireEvent.contextMenu(container.firstChild as Element, { clientX: 10, clientY: 10 });
    await waitFor(() => expect(screen.getByText('Remove mask')).toBeInTheDocument());

    // action
    await user.click(screen.getByText('Remove mask'));

    // result
    expect(selectActivePage(store.getState()).nodes[nodeId].isMask).toBe(false);
  });
});
