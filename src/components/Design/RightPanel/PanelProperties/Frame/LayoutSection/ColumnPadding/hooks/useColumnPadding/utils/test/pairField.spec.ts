import { RefObject } from 'react';

// store
import { updateNode } from 'store/design/slice';

// types
import { TRightPanelPaddingGuideState } from 'types/design/canvas/types';

// utils
import { pairField } from '../pairField';

vi.mock('store/design/slice', async () => {
  const actual = await vi.importActual<typeof import('store/design/slice')>('store/design/slice');

  return { ...actual, updateNode: vi.fn(actual.updateNode) };
});

const createPaddingGuideRef = (): RefObject<TRightPanelPaddingGuideState | null> => ({ current: null });

const build = (firstValue: number, secondValue: number, paddingGuideRef = createPaddingGuideRef()): ReturnType<typeof pairField> =>
  pairField(
    vi.fn(),
    'frame-1',
    'horizontal',
    'padding-horizontal',
    'PaddingLR',
    'paddingLeft',
    firstValue,
    'paddingRight',
    secondValue,
    paddingGuideRef,
    ['left', 'right'],
  );

describe('pairField', () => {
  it('should build a field showing a single value when both sides match', () => {
    // action
    const field = build(10, 10);

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
    // action
    const field = build(10, 20);

    // result
    expect(field.value).toBe('10, 20');
  });

  it('should commit both clamped sides parsed from a single value on commit', () => {
    // mock
    const field = build(10, 20);

    // action
    field.onCommit('12');

    // result
    expect(updateNode).toHaveBeenCalledWith({ changes: { paddingLeft: 12, paddingRight: 12 }, id: 'frame-1' });
  });

  it('should commit both clamped sides parsed from a "first, second" value on commit', () => {
    // mock
    const field = build(10, 20);

    // action
    field.onCommit('12, 24');

    // result
    expect(updateNode).toHaveBeenCalledWith({ changes: { paddingLeft: 12, paddingRight: 24 }, id: 'frame-1' });
  });

  it('should carry the scrub delta from the first side onto the second side on scrub', () => {
    // mock
    const field = build(10, 20);

    // action — first side moves from 10 to 15, a delta of +5
    field.onScrub(15);

    // result
    expect(updateNode).toHaveBeenCalledWith({ changes: { paddingLeft: 15, paddingRight: 25 }, id: 'frame-1' });
  });

  it('should stash the frame id and both sides in the padding guide ref on hover start', () => {
    // mock
    const paddingGuideRef = createPaddingGuideRef();
    const field = build(10, 20, paddingGuideRef);

    // action
    field.onHoverStart();

    // result
    expect(paddingGuideRef.current).toEqual({ frameId: 'frame-1', sides: ['left', 'right'] });
  });

  it('should clear the padding guide ref on hover end', () => {
    // mock
    const paddingGuideRef = createPaddingGuideRef();
    const field = build(10, 20, paddingGuideRef);

    paddingGuideRef.current = { frameId: 'frame-1', sides: ['left', 'right'] };

    // action
    field.onHoverEnd();

    // result
    expect(paddingGuideRef.current).toBeNull();
  });
});
