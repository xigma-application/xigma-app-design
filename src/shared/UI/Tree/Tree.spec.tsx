import { Provider } from 'react-redux';
import { fireEvent, render, screen } from '@testing-library/react';

// components
import Tree from './Tree';

// others
import { TREE_DEFAULT_HEIGHT, TREE_MIN_HEIGHT } from './constants';

// store
import { addNode, deleteNode } from 'store/design/slice';
import { selectNodes } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { getMaxTreeHeight } from './utils/getMaxTreeHeight';
import { stubVirtualizerViewport } from 'test/stubVirtualizerViewport';

const renderTree = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <Tree />
    </Provider>,
  );

describe('Tree', () => {
  let nodeId: string;

  beforeEach(() => {
    stubVirtualizerViewport();
    store.dispatch(
      addNode({
        fill: '#ff0000',
        height: 10,
        name: 'My Frame',
        parentId: null,
        rotation: 0,
        type: NodeType.frame,
        width: 10,
        x: 0,
        y: 0,
      }),
    );
    nodeId = Object.keys(selectNodes(store.getState())).at(-1) as string;
  });

  afterEach(() => {
    store.dispatch(deleteNode(nodeId));
    vi.restoreAllMocks();
  });

  it('should render one row per node in the active page', () => {
    // before
    renderTree();

    // result
    expect(screen.getByText('My Frame')).toBeInTheDocument();
  });

  it('should render at its default height', () => {
    // before
    const { container } = renderTree();

    // result
    expect((container.firstChild as HTMLElement).style.height).toBe(`${TREE_DEFAULT_HEIGHT}px`);
  });

  it('should grow when the resize handle is dragged down', () => {
    // before
    const { container } = renderTree();
    const list = container.firstChild as HTMLElement;
    const handle = list.querySelector('[class*="resize-handle"]')!;

    vi.spyOn(list, 'getBoundingClientRect').mockReturnValue({ top: 100 } as DOMRect);

    // action
    fireEvent.mouseDown(handle, { button: 0 });
    fireEvent.mouseMove(document, { clientY: 250 });
    fireEvent.mouseUp(document);

    // result
    expect(list.style.height).toBe('150px');
  });

  it('should clamp to the min height when dragged past it', () => {
    // before
    const { container } = renderTree();
    const list = container.firstChild as HTMLElement;
    const handle = list.querySelector('[class*="resize-handle"]')!;

    vi.spyOn(list, 'getBoundingClientRect').mockReturnValue({ top: 100 } as DOMRect);

    // action
    fireEvent.mouseDown(handle, { button: 0 });
    fireEvent.mouseMove(document, { clientY: 100 });
    fireEvent.mouseUp(document);

    // result
    expect(list.style.height).toBe(`${TREE_MIN_HEIGHT}px`);
  });

  it('should clamp to the viewport-based max height when dragged past it', () => {
    // before
    const { container } = renderTree();
    const list = container.firstChild as HTMLElement;
    const handle = list.querySelector('[class*="resize-handle"]')!;

    vi.spyOn(list, 'getBoundingClientRect').mockReturnValue({ top: 100 } as DOMRect);

    // action
    fireEvent.mouseDown(handle, { button: 0 });
    fireEvent.mouseMove(document, { clientY: 100000 });
    fireEvent.mouseUp(document);

    // result
    expect(list.style.height).toBe(`${getMaxTreeHeight()}px`);
  });
});
