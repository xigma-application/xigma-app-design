// store
import { updateNode, updateNodes } from 'store/design/slice';

// types
import { StrokeAlign } from 'types/design/enums';

// utils
import { commitFills } from '../commitFills';
import { makeSquareVector } from 'utils/canvas/vector/stroke/test/fixtures';

describe('commitFills', () => {
  it('should dispatch updateNode for a single target', () => {
    // mock
    const dispatch = vi.fn();
    const fills = [{ color: '#000000', opacity: 100, type: 'solid' as const }];

    // before
    commitFills(dispatch, [{ id: 'node-1' }], fills);

    // result
    expect(dispatch).toHaveBeenCalledWith(updateNode({ changes: { fills }, id: 'node-1' }));
  });

  it('should write a vector fill onto its filled areas', () => {
    // mock
    const dispatch = vi.fn();
    const fills = [{ color: '#000000', opacity: 100, type: 'solid' as const }];
    const vector = makeSquareVector({ fillByKey: { a: [] }, filledFaceKeys: ['a'] });

    // before
    commitFills(dispatch, [{ id: 'vector', vector }], fills);

    // result
    expect(dispatch).toHaveBeenCalledWith(updateNode({ changes: { defaultFill: fills, fillByKey: { a: fills } }, id: 'vector' }));
  });

  it('should not dispatch when there are no targets', () => {
    // mock
    const dispatch = vi.fn();

    // before
    commitFills(dispatch, [], []);

    // result
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should write strokes with the default inside alignment and 1px width the first time', () => {
    // mock
    const dispatch = vi.fn();
    const strokes = [{ color: '#000000', opacity: 100, type: 'solid' as const }];

    // before
    commitFills(dispatch, [{ id: 'node-1' }], strokes, 'strokes');

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
    commitFills(dispatch, [{ id: 'node-1', strokeAlign: StrokeAlign.center, strokeWidth: 4 }], strokes, 'strokes');

    // result
    expect(dispatch).toHaveBeenCalledWith(
      updateNode({ changes: { strokeAlign: StrokeAlign.center, strokeWidth: 4, strokes }, id: 'node-1' }),
    );
  });

  it('should write the same paints to every target in one updateNodes, keeping each stroke setting', () => {
    // mock
    const dispatch = vi.fn();
    const strokes = [{ color: '#000000', opacity: 100, type: 'solid' as const }];

    // before
    commitFills(dispatch, [{ id: 'node-1' }, { id: 'node-2', strokeAlign: StrokeAlign.center, strokeWidth: 4 }], strokes, 'strokes');

    // result
    expect(dispatch).toHaveBeenCalledWith(
      updateNodes([
        { changes: { strokeAlign: StrokeAlign.inside, strokeWidth: 1, strokes }, id: 'node-1' },
        { changes: { strokeAlign: StrokeAlign.center, strokeWidth: 4, strokes }, id: 'node-2' },
      ]),
    );
  });
});
