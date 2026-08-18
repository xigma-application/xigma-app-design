import { configureStore, EnhancedStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { fireEvent, render } from '@testing-library/react';

// components
import CommentDraftFooter from './CommentDraftFooter';

// store
import designReducer, { startCommentDraft } from 'store/design/slice';
import { TDesignState } from 'store/design/types';

const createTestStore = (): EnhancedStore<{ design: TDesignState }> => configureStore({ reducer: { design: designReducer } });

const renderWithStore = (store: EnhancedStore<{ design: TDesignState }>, value: string): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <CommentDraftFooter value={value} />
    </Provider>,
  );

describe('CommentDraftFooter behaviors', () => {
  it('should not be active while the value is empty', () => {
    // before
    const { container } = renderWithStore(createTestStore(), '');
    const button = container.querySelector('button') as HTMLButtonElement;

    // result
    expect(button.className).not.toMatch(/__button--active/);
  });

  it('should be active once the value is non-empty', () => {
    // before
    const { container } = renderWithStore(createTestStore(), 'hello');
    const button = container.querySelector('button') as HTMLButtonElement;

    // result
    expect(button.className).toMatch(/__button--active/);
  });

  it('should submit the comment at the draft position when clicked', () => {
    // mock
    const store = createTestStore();

    store.dispatch(startCommentDraft({ x: 10, y: 20 }));

    // before
    const { container } = renderWithStore(store, 'hello');
    const button = container.querySelector('button') as HTMLButtonElement;

    // action
    fireEvent.click(button);

    // result
    expect(Object.values(store.getState().design.comments)).toHaveLength(1);
  });

  it('should prevent the default mousedown action so the button does not steal focus', () => {
    // before
    const { container } = renderWithStore(createTestStore(), 'hello');
    const button = container.querySelector('button') as HTMLButtonElement;
    const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true });

    // action
    button.dispatchEvent(event);

    // result
    expect(event.defaultPrevented).toBe(true);
  });
});
