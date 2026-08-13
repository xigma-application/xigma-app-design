import { configureStore, EnhancedStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { fireEvent, render } from '@testing-library/react';

// components
import TextEditOverlay from './TextEditOverlay';

// store
import designReducer, { startTextEdit } from 'store/design/slice';
import { TDesignState } from 'store/design/types';

const createTestStore = (): EnhancedStore<{ design: TDesignState }> => configureStore({ reducer: { design: designReducer } });

const renderWithStore = (store: EnhancedStore<{ design: TDesignState }>): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TextEditOverlay />
    </Provider>,
  );

describe('TextEditOverlay snapshots', () => {
  it('should render nothing when there is no text box being edited', () => {
    // before
    const { asFragment } = renderWithStore(createTestStore());

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('TextEditOverlay behaviors', () => {
  it('should render a focused, positioned editable box once a text box starts editing', () => {
    // mock
    const store = createTestStore();

    store.dispatch(startTextEdit({ box: { height: 20, width: 100, x: 10, y: 10 } }));

    // before
    const { container } = renderWithStore(store);

    // find
    const element = container.querySelector('[contenteditable="true"]');

    // result
    expect(element).toHaveStyle({ left: '10px', top: '10px', width: '100px' });
    expect(element).toHaveFocus();
  });

  it('should dispatch the live typed content while editing', () => {
    // mock
    const store = createTestStore();

    store.dispatch(startTextEdit({ box: { height: 20, width: 100, x: 10, y: 10 } }));

    const { container } = renderWithStore(store);
    const element = container.querySelector('[contenteditable="true"]') as HTMLDivElement;

    element.textContent = 'hi';

    // action
    fireEvent.input(element);

    // result
    expect(store.getState().design.editingTextContent).toBe('hi');
  });

  it('should stop keydown events from bubbling up to window-level shortcut listeners', () => {
    // mock
    const store = createTestStore();

    store.dispatch(startTextEdit({ box: { height: 20, width: 100, x: 10, y: 10 } }));

    const { container } = renderWithStore(store);
    const element = container.querySelector('[contenteditable="true"]') as HTMLDivElement;
    const windowKeyDown = vi.fn();

    window.addEventListener('keydown', windowKeyDown);

    // action
    fireEvent.keyDown(element, { code: 'KeyR' });

    // result
    expect(windowKeyDown).not.toHaveBeenCalled();

    // after
    window.removeEventListener('keydown', windowKeyDown);
  });

  it('should stop editing when the editable box loses focus', () => {
    // mock
    const store = createTestStore();

    store.dispatch(startTextEdit({ box: { height: 20, width: 100, x: 10, y: 10 } }));

    const { container } = renderWithStore(store);
    const element = container.querySelector('[contenteditable="true"]') as HTMLDivElement;

    element.textContent = 'hello world';

    // action
    fireEvent.blur(element);

    // result
    expect(store.getState().design.editingTextBox).toBeNull();
  });

  it('should pre-populate and select all the existing content when editing an existing node', () => {
    // mock
    const store = createTestStore();

    store.dispatch(startTextEdit({ box: { height: 20, width: 100, x: 10, y: 10 }, content: 'hello world', id: 'node-1' }));

    // before
    const { container } = renderWithStore(store);
    const element = container.querySelector('[contenteditable="true"]') as HTMLDivElement;

    // result
    expect(element.textContent).toBe('hello world');
    expect(window.getSelection()?.toString()).toBe('hello world');
  });

  it('should update the existing node in place on blur, instead of adding a new one', () => {
    // mock
    const store = createTestStore();

    store.dispatch(startTextEdit({ box: { height: 20, width: 100, x: 10, y: 10 }, content: 'hello', id: 'node-1' }));

    const { container } = renderWithStore(store);
    const element = container.querySelector('[contenteditable="true"]') as HTMLDivElement;

    element.textContent = 'goodbye';

    // action
    fireEvent.blur(element);

    // result
    expect(store.getState().design.rootOrder).toHaveLength(0);
    expect(store.getState().design.editingTextBox).toBeNull();
  });
});
