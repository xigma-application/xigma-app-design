// utils
import { getSelectionAnchorId, setSelectionAnchorId } from '../selectionAnchor';

describe('selectionAnchor', () => {
  afterEach(() => {
    setSelectionAnchorId(null);
  });

  it('should return null before anything was ever set', () => {
    // result
    expect(getSelectionAnchorId()).toBeNull();
  });

  it('should return whatever id was last set', () => {
    // action
    setSelectionAnchorId('node-1');

    // result
    expect(getSelectionAnchorId()).toBe('node-1');
  });

  it('should be clearable back to null', () => {
    // action
    setSelectionAnchorId('node-1');
    setSelectionAnchorId(null);

    // result
    expect(getSelectionAnchorId()).toBeNull();
  });
});
