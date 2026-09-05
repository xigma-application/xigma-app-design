import { fireEvent, render, screen } from '@testing-library/react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { Provider } from 'react-redux';

// components
import ZoomMenu from './ZoomMenu';

// core
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';

// store
import { setViewport } from 'store/design/slice';
import { store } from 'store';

const renderZoomMenu = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <CanvasRefsProvider>
        <PopoverPrimitive.Root open>
          <ZoomMenu />
        </PopoverPrimitive.Root>
      </CanvasRefsProvider>
    </Provider>,
  );

describe('ZoomMenu behaviors', () => {
  beforeEach(() => {
    store.dispatch(setViewport({ x: 0, y: 0, zoom: 1 }));
  });

  it('should show the current zoom percentage in the input', () => {
    // before
    store.dispatch(setViewport({ x: 0, y: 0, zoom: 1.5 }));
    renderZoomMenu();

    // result
    expect(screen.getByRole('textbox')).toHaveValue('150');
  });

  it('should mark the preset matching the current zoom as selected, and no other preset', () => {
    // before
    renderZoomMenu();
    const selectedItem = screen.getByText('100%').closest('div')!.parentElement!;
    const otherItem = screen.getByText('50%').closest('div')!.parentElement!;

    // result — PopoverItem renders a Check icon with opacity 1 when selected, 0 otherwise
    expect(selectedItem.querySelector('span[style*="opacity: 1"]')).not.toBeNull();
    expect(otherItem.querySelector('span[style*="opacity: 1"]')).toBeNull();
  });

  it('should commit a typed percentage on Enter', () => {
    // before
    renderZoomMenu();
    const input = screen.getByRole('textbox');

    // action
    fireEvent.change(input, { target: { value: '250' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    // result
    expect(screen.getByRole('textbox')).toHaveValue('250');
  });
});
