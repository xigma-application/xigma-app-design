// store
import { updateNode } from 'store/design/slice';

// utils
import { pairField } from '../pairField';

vi.mock('store/design/slice', async () => {
  const actual = await vi.importActual<typeof import('store/design/slice')>('store/design/slice');

  return { ...actual, updateNode: vi.fn(actual.updateNode) };
});

describe('pairField', () => {
  it('should build a field showing a single value when both sides match', () => {
    // mock
    const dispatch = vi.fn();

    // action
    const field = pairField(dispatch, 'frame-1', 'horizontal', 'padding-horizontal', 'PaddingLR', 'paddingLeft', 10, 'paddingRight', 10);

    // result
    expect(field).toMatchObject({
      e2eValue: 'padding-horizontal',
      iconName: 'PaddingLR',
      labelKey: 'horizontal',
      scrubValue: 10,
      value: '10',
    });
  });

  it('should build a field showing both values when the sides differ', () => {
    // mock
    const dispatch = vi.fn();

    // action
    const field = pairField(dispatch, 'frame-1', 'horizontal', 'padding-horizontal', 'PaddingLR', 'paddingLeft', 10, 'paddingRight', 20);

    // result
    expect(field.value).toBe('10, 20');
  });

  it('should commit both clamped sides parsed from a single value on commit', () => {
    // mock
    const dispatch = vi.fn();
    const field = pairField(dispatch, 'frame-1', 'horizontal', 'padding-horizontal', 'PaddingLR', 'paddingLeft', 10, 'paddingRight', 20);

    // action
    field.onCommit('12');

    // result
    expect(updateNode).toHaveBeenCalledWith({ changes: { paddingLeft: 12, paddingRight: 12 }, id: 'frame-1' });
  });

  it('should commit both clamped sides parsed from a "first, second" value on commit', () => {
    // mock
    const dispatch = vi.fn();
    const field = pairField(dispatch, 'frame-1', 'horizontal', 'padding-horizontal', 'PaddingLR', 'paddingLeft', 10, 'paddingRight', 20);

    // action
    field.onCommit('12, 24');

    // result
    expect(updateNode).toHaveBeenCalledWith({ changes: { paddingLeft: 12, paddingRight: 24 }, id: 'frame-1' });
  });

  it('should carry the scrub delta from the first side onto the second side on scrub', () => {
    // mock
    const dispatch = vi.fn();
    const field = pairField(dispatch, 'frame-1', 'horizontal', 'padding-horizontal', 'PaddingLR', 'paddingLeft', 10, 'paddingRight', 20);

    // action — first side moves from 10 to 15, a delta of +5
    field.onScrub(15);

    // result
    expect(updateNode).toHaveBeenCalledWith({ changes: { paddingLeft: 15, paddingRight: 25 }, id: 'frame-1' });
  });
});
