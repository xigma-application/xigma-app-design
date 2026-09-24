import { RefObject } from 'react';

// store
import { updateNode } from 'store/design/slice';

// types
import { TPaddingTarget } from '../../types';
import { TRightPanelPaddingGuideState } from 'types/design/canvas/types';

// utils
import { sideField } from '../sideField';

vi.mock('store/design/slice', async () => {
  const actual = await vi.importActual<typeof import('store/design/slice')>('store/design/slice');

  return { ...actual, updateNode: vi.fn(actual.updateNode) };
});

const createPaddingGuideRef = (): RefObject<TRightPanelPaddingGuideState | null> => ({ current: null });

const target = (key: 'paddingBottom' | 'paddingLeft' | 'paddingRight' | 'paddingTop', value: number): TPaddingTarget => ({
  id: 'frame-1',
  values: Object.assign({ paddingBottom: 0, paddingLeft: 0, paddingRight: 0, paddingTop: 0 }, { [key]: value }),
});

describe('sideField', () => {
  it('should build a field carrying the given label, icon, e2e value and value', () => {
    // mock
    const dispatch = vi.fn();

    // action
    const field = sideField(
      dispatch,
      [target('paddingLeft', 12)],
      'left',
      'padding-left',
      'PaddingL',
      'paddingLeft',
      createPaddingGuideRef(),
      'left',
    );

    // result
    expect(field).toMatchObject({ e2eValue: 'padding-left', iconName: 'PaddingL', labelKey: 'left', scrubValue: 12, value: 12 });
  });

  it('should commit the clamped parsed number on commit', () => {
    // mock
    const dispatch = vi.fn();
    const field = sideField(
      dispatch,
      [target('paddingLeft', 12)],
      'left',
      'padding-left',
      'PaddingL',
      'paddingLeft',
      createPaddingGuideRef(),
      'left',
    );

    // action
    field.onCommit('8px');

    // result
    expect(updateNode).toHaveBeenCalledWith({ changes: { paddingLeft: 8 }, id: 'frame-1' });
  });

  it('should not commit when the parsed value is not a number', () => {
    // mock
    const dispatch = vi.fn();
    const field = sideField(
      dispatch,
      [target('paddingLeft', 12)],
      'left',
      'padding-left',
      'PaddingL',
      'paddingLeft',
      createPaddingGuideRef(),
      'left',
    );

    // action
    field.onCommit('abc');

    // result
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should commit the clamped next value on scrub', () => {
    // mock
    const dispatch = vi.fn();
    const field = sideField(
      dispatch,
      [target('paddingLeft', 12)],
      'left',
      'padding-left',
      'PaddingL',
      'paddingLeft',
      createPaddingGuideRef(),
      'left',
    );

    // action
    field.onScrub(20);

    // result
    expect(updateNode).toHaveBeenCalledWith({ changes: { paddingLeft: 20 }, id: 'frame-1' });
  });

  it('should stash the frame id and single side in the padding guide ref on hover start', () => {
    // mock
    const dispatch = vi.fn();
    const paddingGuideRef = createPaddingGuideRef();
    const field = sideField(dispatch, [target('paddingTop', 12)], 'top', 'padding-top', 'PaddingT', 'paddingTop', paddingGuideRef, 'top');

    // action
    field.onHoverStart();

    // result
    expect(paddingGuideRef.current).toEqual({ frameId: 'frame-1', sides: ['top'] });
  });

  it('should clear the padding guide ref on hover end', () => {
    // mock
    const dispatch = vi.fn();
    const paddingGuideRef = createPaddingGuideRef();
    const field = sideField(dispatch, [target('paddingTop', 12)], 'top', 'padding-top', 'PaddingT', 'paddingTop', paddingGuideRef, 'top');

    paddingGuideRef.current = { frameId: 'frame-1', sides: ['top'] };

    // action
    field.onHoverEnd();

    // result
    expect(paddingGuideRef.current).toBeNull();
  });
});
