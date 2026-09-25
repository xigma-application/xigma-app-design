// store
import { AppDispatch } from 'store';

// utils
import { commitEllipseArcValue } from '../commitEllipseArcValue';
import { makeEllipse } from './fixtures';

describe('commitEllipseArcValue', () => {
  it('should update every ellipse with its own changes in one undo step', () => {
    // mock
    const dispatch = vi.fn() as unknown as AppDispatch;
    const nodes = [makeEllipse({ id: 'a' }), makeEllipse({ arcRatio: 0.5, id: 'b' })];

    // before
    commitEllipseArcValue(dispatch, nodes, 'ratio', (node) => (node.arcRatio ?? 0) * 100 + 10);

    // result
    expect(vi.mocked(dispatch).mock.calls.map(([action]) => action.type)).toEqual([
      'history/beginGesture',
      'design/updateNode',
      'design/updateNode',
      'history/endGesture',
    ]);
    expect(vi.mocked(dispatch).mock.calls[2][0]).toMatchObject({ payload: { changes: { arcRatio: 0.6 }, id: 'b' } });
  });
});
