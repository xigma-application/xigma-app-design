// store
import { setVectorEditingNodeId } from 'store/design/slice';
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';

// utils
import { getDefaultMoveTool } from '../getDefaultMoveTool';

describe('getDefaultMoveTool', () => {
  afterEach(() => {
    store.dispatch(setVectorEditingNodeId(null));
  });

  it('should return the Vector Edit Move tool when a node is currently being vector-edited', () => {
    // mock
    store.dispatch(setVectorEditingNodeId('node-1'));

    // result
    expect(getDefaultMoveTool()).toBe(ToolName.move);
  });

  it('should return the plain default tool when no node is being vector-edited', () => {
    // result
    expect(getDefaultMoveTool()).toBe(ToolName.default);
  });
});
