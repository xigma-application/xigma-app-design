// store
import { updateNode } from 'store/design/slice';

// types
import { StrokeAlign } from 'types/design/enums';

// utils
import { commitFills } from '../commitFills';

describe('commitFills', () => {
  it('should dispatch updateNode when a nodeId is present', () => {
    // mock
    const dispatch = vi.fn();
    const fills = [{ color: '#000000', opacity: 100, type: 'solid' as const }];

    // before
    commitFills(dispatch, 'node-1', fills);

    // result
    expect(dispatch).toHaveBeenCalledWith(updateNode({ changes: { fills }, id: 'node-1' }));
  });

  it('should not dispatch when there is no nodeId', () => {
    // mock
    const dispatch = vi.fn();

    // before
    commitFills(dispatch, undefined, []);

    // result
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should write strokes with the default inside alignment and 1px width the first time', () => {
    // mock
    const dispatch = vi.fn();
    const strokes = [{ color: '#000000', opacity: 100, type: 'solid' as const }];

    // before
    commitFills(dispatch, 'node-1', strokes, 'strokes');

    // result
    expect(dispatch).toHaveBeenCalledWith(
      updateNode({ changes: { strokeAlign: StrokeAlign.inside, strokeWidth: 1, strokes }, id: 'node-1' }),
    );
  });

  it('should keep an existing stroke alignment and width when writing strokes', () => {
    // mock
    const dispatch = vi.fn();
    const strokes = [{ color: '#000000', opacity: 100, type: 'solid' as const }];

    // before
    commitFills(dispatch, 'node-1', strokes, 'strokes', { strokeAlign: StrokeAlign.center, strokeWidth: 4 });

    // result
    expect(dispatch).toHaveBeenCalledWith(
      updateNode({ changes: { strokeAlign: StrokeAlign.center, strokeWidth: 4, strokes }, id: 'node-1' }),
    );
  });
});
