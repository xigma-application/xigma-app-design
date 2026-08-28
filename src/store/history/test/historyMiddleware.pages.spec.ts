// store
import { addPage, deletePage, renamePage, setActivePage } from 'store/design/slice';
import { redo, undo } from '../actions';
import { store } from 'store';

describe('historyMiddleware — pages', () => {
  const initialActivePageId = store.getState().design.activePageId;

  it('should undo and redo switching the active page', () => {
    // mock
    store.dispatch(addPage());
    const secondPageId = store.getState().design.activePageId;
    store.dispatch(setActivePage(initialActivePageId));

    // before
    expect(store.getState().design.activePageId).toBe(initialActivePageId);

    // action
    store.dispatch(undo());

    // result — back to the page that was active before the switch
    expect(store.getState().design.activePageId).toBe(secondPageId);

    // action
    store.dispatch(redo());

    // result
    expect(store.getState().design.activePageId).toBe(initialActivePageId);
  });

  it('should undo and redo renaming a page', () => {
    // mock
    const id = store.getState().design.activePageId;
    const originalName = store.getState().design.pages[id].name;
    store.dispatch(renamePage({ id, name: 'Renamed' }));

    // action
    store.dispatch(undo());

    // result
    expect(store.getState().design.pages[id].name).toBe(originalName);

    // action
    store.dispatch(redo());

    // result
    expect(store.getState().design.pages[id].name).toBe('Renamed');
  });

  it('should undo an added page by removing it again, then redo it back', () => {
    // mock
    const countBefore = Object.keys(store.getState().design.pages).length;
    store.dispatch(addPage());
    const addedId = store.getState().design.activePageId;

    // action
    store.dispatch(undo());

    // result
    expect(Object.keys(store.getState().design.pages)).toHaveLength(countBefore);
    expect(store.getState().design.pages[addedId]).toBeUndefined();

    // action
    store.dispatch(redo());

    // result
    expect(store.getState().design.pages[addedId]).toBeDefined();
    expect(store.getState().design.activePageId).toBe(addedId);
  });

  it('should undo a deleted page by restoring it with its content', () => {
    // mock
    store.dispatch(addPage());
    const deletedId = store.getState().design.activePageId;
    store.dispatch(renamePage({ id: deletedId, name: 'To be deleted' }));
    store.dispatch(deletePage(deletedId));

    // before
    expect(store.getState().design.pages[deletedId]).toBeUndefined();

    // action
    store.dispatch(undo());

    // result
    expect(store.getState().design.pages[deletedId]?.name).toBe('To be deleted');

    // action
    store.dispatch(redo());

    // result
    expect(store.getState().design.pages[deletedId]).toBeUndefined();
  });
});
