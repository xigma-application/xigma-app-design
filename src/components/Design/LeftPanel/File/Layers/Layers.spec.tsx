import { Provider } from 'react-redux';
import { act, fireEvent, render, screen } from '@testing-library/react';

// components
import Layers from './Layers';
import { TooltipProvider } from 'shared';

// store
import { addNode, deleteNode, groupNodes, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { stubVirtualizerViewport } from 'test/stubVirtualizerViewport';

const renderLayers = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <Layers />
      </TooltipProvider>
    </Provider>,
  );

const buildGroupWithChildren = (): string => {
  store.dispatch(
    addNode({ fill: '#ff0000', height: 10, name: 'Frame A', parentId: null, rotation: 0, type: NodeType.frame, width: 10, x: 0, y: 0 }),
  );
  store.dispatch(
    addNode({ fill: '#ff0000', height: 10, name: 'Frame B', parentId: null, rotation: 0, type: NodeType.frame, width: 10, x: 0, y: 0 }),
  );
  const [idA, idB] = selectActivePage(store.getState()).rootOrder.slice(-2);
  act(() => store.dispatch(setSelection([idA, idB])));
  store.dispatch(groupNodes());

  return selectActivePage(store.getState()).selectedIds[0];
};

describe('Layers', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    act(() => store.dispatch(setSelection([])));
  });

  it('should render expanded by default with the "Layers" title and node list', () => {
    // before
    renderLayers();

    // result
    expect(screen.getByText('Layers')).toBeInTheDocument();
    expect(screen.getByRole('button', { expanded: true })).toBeInTheDocument();
    expect(document.querySelector('[class*="LayersTree"]')).toBeInTheDocument();
  });

  it('should collapse when the header is clicked', () => {
    // before
    renderLayers();

    // action
    fireEvent.click(screen.getByRole('button', { expanded: true }));

    // result
    expect(screen.getByRole('button', { expanded: false })).toBeInTheDocument();
    expect(document.querySelector('[class*="LayersTree"]')).not.toBeInTheDocument();
  });

  it('should expand again when the header is clicked a second time', () => {
    // before
    renderLayers();
    fireEvent.click(screen.getByRole('button', { expanded: true }));

    // action
    fireEvent.click(screen.getByRole('button', { expanded: false }));

    // result
    expect(screen.getByRole('button', { expanded: true })).toBeInTheDocument();
    expect(document.querySelector('[class*="LayersTree"]')).toBeInTheDocument();
  });

  it('should not show the collapse-all button while nothing in the tree is expanded', () => {
    // before
    stubVirtualizerViewport(5000);
    const groupId = buildGroupWithChildren();
    renderLayers();

    // result
    expect(screen.queryByRole('button', { name: 'Collapse layers' })).not.toBeInTheDocument();

    // after
    store.dispatch(deleteNode(groupId));
  });

  it('should reveal the collapse-all button once a group row is expanded, and hide it again after it collapses everything', () => {
    // before
    stubVirtualizerViewport(5000);
    const groupId = buildGroupWithChildren();
    renderLayers();

    // action — expand the group row
    fireEvent.click(screen.getByRole('button', { name: 'Expand layer' }));

    // result — the collapse-all button now shows
    const collapseButton = screen.getByRole('button', { name: 'Collapse layers' });
    expect(collapseButton).toBeInTheDocument();

    // action — click it
    fireEvent.click(collapseButton);

    // result — the group collapsed and the button is gone again
    expect(screen.queryByText('Frame A')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Collapse layers' })).not.toBeInTheDocument();

    // after
    store.dispatch(deleteNode(groupId));
  });

  it('should collapse everything on Alt+L while the Layers panel is hovered', () => {
    // before
    stubVirtualizerViewport(5000);
    const groupId = buildGroupWithChildren();
    const { container } = renderLayers();
    fireEvent.click(screen.getByRole('button', { name: 'Expand layer' }));
    expect(screen.getByText('Frame A')).toBeInTheDocument();

    // action — hover the panel, then press the shortcut
    fireEvent.mouseEnter(container.querySelector('[class*="Layers"]')!);
    fireEvent.keyDown(window, { altKey: true, code: 'KeyL' });

    // result
    expect(screen.queryByText('Frame A')).not.toBeInTheDocument();

    // after
    store.dispatch(deleteNode(groupId));
  });

  it('should ignore Alt+L while the Layers panel is not hovered', () => {
    // before
    stubVirtualizerViewport(5000);
    const groupId = buildGroupWithChildren();
    renderLayers();
    fireEvent.click(screen.getByRole('button', { name: 'Expand layer' }));

    // action — no hover
    fireEvent.keyDown(window, { altKey: true, code: 'KeyL' });

    // result — still expanded
    expect(screen.getByText('Frame A')).toBeInTheDocument();

    // after
    store.dispatch(deleteNode(groupId));
  });
});
