import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { act, fireEvent, render, screen } from '@testing-library/react';

// components
import ViewMenu from './ViewMenu';

// core
import { CanvasRefsContext } from 'components/App/core/CanvasRefsProvider/context';

// hooks
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';

// others
import { ZOOM_ANIMATION_DURATION_MS } from 'components/Design/Canvas/constants';

// store
import { addNode, deleteNode, setSelection, setViewport, toggleAdditionalLabels, toggleRulers } from 'store/design/slice';
import { selectActivePage, selectAreAdditionalLabelsVisible, selectAreRulersVisible, selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

const renderInMenu = (children: ReactNode): ReturnType<typeof render> => {
  const canvas = document.createElement('canvas');
  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ height: 600, width: 1000 } as DOMRect);
  const refs = createCanvasRefs({ canvasRef: { current: canvas } });

  return render(
    <Provider store={store}>
      <CanvasRefsContext.Provider value={refs}>
        <DropdownMenuPrimitive.Root open>
          <DropdownMenuPrimitive.Portal>
            <DropdownMenuPrimitive.Content>{children}</DropdownMenuPrimitive.Content>
          </DropdownMenuPrimitive.Portal>
        </DropdownMenuPrimitive.Root>
      </CanvasRefsContext.Provider>
    </Provider>,
  );
};

describe('ViewMenu', () => {
  beforeEach(() => {
    if (selectAreRulersVisible(store.getState())) {
      store.dispatch(toggleRulers());
    }

    if (!selectAreAdditionalLabelsVisible(store.getState())) {
      store.dispatch(toggleAdditionalLabels());
    }

    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
    store.dispatch(setSelection([]));
    store.dispatch(setViewport({ x: 0, y: 0, zoom: 1 }));
  });

  it('should render every row with its label', () => {
    // before
    renderInMenu(<ViewMenu />);

    // result
    [
      'Pixel grid',
      'Layout guides',
      'Rulers',
      'Show slices',
      'Comments',
      'Annotations',
      'Outlines',
      'Pixel preview',
      'Mask outlines',
      'Frame outlines',
      'Memory usage',
      'Additional labels',
      'Minimize UI',
      'Show/Hide UI',
      'Multiplayer cursors',
      'Switch to Draw',
      'Switch to Dev Mode',
      'Panels',
      'Zoom in',
      'Zoom out',
      'Zoom to 100%',
      'Zoom to fit',
      'Zoom to selection',
      'Zoom to...',
      'Previous page',
      'Next page',
      'Zoom to previous frame',
      'Zoom to next frame',
      'Find previous frame',
      'Find next frame',
    ].forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('should show the globe-icon shortcuts for the page navigation rows verbatim, since they have no key-modifier equivalent', () => {
    // before
    renderInMenu(<ViewMenu />);

    // result
    expect(screen.getByText('🌐↑')).toBeInTheDocument();
    expect(screen.getByText('🌐↓')).toBeInTheDocument();
  });

  it('should keep the Outlines, Panels and Zoom to... submenus, the Rulers/Additional labels rows, and the always-available zoom rows enabled while every other flat row stays disabled', () => {
    // before
    renderInMenu(<ViewMenu />);

    // result
    expect(screen.getByText('Pixel grid').closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
    expect(screen.getByText('Outlines').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
    expect(screen.getByText('Panels').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
    expect(screen.getByText('Zoom to...').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
    expect(screen.getByText('Rulers').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
    expect(screen.getByText('Additional labels').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
    expect(screen.getByText('Zoom in').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
    expect(screen.getByText('Zoom out').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
    expect(screen.getByText('Zoom to 100%').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
    expect(screen.getByText('Zoom to fit').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
  });

  it('should toggle rulers visibility when the Rulers row is selected', () => {
    // before
    renderInMenu(<ViewMenu />);
    expect(selectAreRulersVisible(store.getState())).toBe(false);

    // action
    fireEvent.click(screen.getByText('Rulers'));

    // result
    expect(selectAreRulersVisible(store.getState())).toBe(true);
  });

  it('should default to visible and toggle off when the Additional labels row is selected', () => {
    // before
    renderInMenu(<ViewMenu />);
    expect(selectAreAdditionalLabelsVisible(store.getState())).toBe(true);

    // action
    fireEvent.click(screen.getByText('Additional labels'));

    // result
    expect(selectAreAdditionalLabelsVisible(store.getState())).toBe(false);
  });

  it('should disable Zoom to selection when nothing is selected, and enable it once something is', () => {
    // before
    renderInMenu(<ViewMenu />);

    // result
    expect(screen.getByText('Zoom to selection').closest('[role="menuitem"]')).toHaveAttribute('data-disabled');

    // action
    act(() => {
      store.dispatch(
        addNode({
          childIds: [],
          clipContent: true,
          fill: '#ff0000',
          height: 20,
          name: 'Frame',
          parentId: null,
          rotation: 0,
          type: NodeType.frame,
          width: 20,
          x: 0,
          y: 0,
        }),
      );
      const { rootOrder } = selectActivePage(store.getState());
      store.dispatch(setSelection([rootOrder[rootOrder.length - 1]]));
    });

    // result
    expect(screen.getByText('Zoom to selection').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
  });

  it('should disable the previous/next frame rows with fewer than two frames', () => {
    // before
    renderInMenu(<ViewMenu />);

    // result
    expect(screen.getByText('Zoom to previous frame').closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
    expect(screen.getByText('Zoom to next frame').closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
  });

  it('should step the zoom in when the Zoom in row is clicked', () => {
    // before
    renderInMenu(<ViewMenu />);

    // action
    fireEvent.click(screen.getByText('Zoom in'));

    // result
    expect(selectViewport(store.getState()).zoom).toBe(1.5);
  });

  it('should step the zoom out when the Zoom out row is clicked', () => {
    // before
    renderInMenu(<ViewMenu />);

    // action
    fireEvent.click(screen.getByText('Zoom out'));

    // result
    expect(selectViewport(store.getState()).zoom).toBe(0.75);
  });

  it('should reset the zoom to 100% when the Zoom to 100% row is clicked', () => {
    // mock
    store.dispatch(setViewport({ x: 50, y: 50, zoom: 4 }));

    // before
    renderInMenu(<ViewMenu />);

    // action
    fireEvent.click(screen.getByText('Zoom to 100%'));

    // result
    expect(selectViewport(store.getState()).zoom).toBe(1);
  });

  it('should fit all content when the Zoom to fit row is clicked with nothing selected', () => {
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
    renderInMenu(<ViewMenu />);
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'performance'] });

    // action
    fireEvent.click(screen.getByText('Zoom to fit'));
    vi.advanceTimersByTime(ZOOM_ANIMATION_DURATION_MS);

    // result
    expect(selectViewport(store.getState()).zoom).not.toBe(1);

    // cleanup
    vi.useRealTimers();
  });
});
