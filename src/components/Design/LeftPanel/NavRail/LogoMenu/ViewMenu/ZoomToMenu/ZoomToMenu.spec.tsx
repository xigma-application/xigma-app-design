import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ReactNode } from 'react';

// components
import ZoomToMenu from './ZoomToMenu';

// core
import { CanvasRefsContext } from 'components/App/core/CanvasRefsProvider/context';

// hooks
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';

// store
import { setViewport } from 'store/design/slice';
import { selectViewport } from 'store/design/selectors';
import { store } from 'store';

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

describe('ZoomToMenu', () => {
  beforeEach(() => {
    store.dispatch(setViewport({ x: 0, y: 0, zoom: 1 }));
  });

  it('should render a row for every zoom percentage preset', () => {
    // before
    renderInMenu(<ZoomToMenu />);

    // result
    ['50%', '100%', '200%', '400%', '800%'].forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('should set the zoom to the clicked percentage', () => {
    // before
    renderInMenu(<ZoomToMenu />);

    // action
    fireEvent.click(screen.getByText('200%'));

    // result
    expect(selectViewport(store.getState()).zoom).toBe(2);
  });
});
