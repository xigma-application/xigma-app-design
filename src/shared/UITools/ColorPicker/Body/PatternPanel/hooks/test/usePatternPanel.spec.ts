import { act, renderHook, RenderHookResult } from '@testing-library/react';

// hooks
import { TUsePatternPanelResult, usePatternPanel } from '../usePatternPanel';

// others
import { DEFAULT_PATTERN_PANEL_STATE } from '../../constants';

// types
import { TInitialPattern, TPatternPanelChange } from '../../types';

const SEEDED_PATTERN: TInitialPattern = {
  alignmentIndex: 5,
  direction: 'vertical',
  offsetX: 0,
  offsetY: 0,
  scale: 200,
  spacingX: 10,
  spacingY: 20,
  tileType: 'hexagonal',
};

type TProps = { initialPattern: TInitialPattern | undefined; resetKey: number | undefined };

const renderUsePatternPanel = (
  onChange: TFunc<[TPatternPanelChange]> | undefined,
  initialPattern: TInitialPattern | undefined,
  resetKey: number | undefined,
): RenderHookResult<TUsePatternPanelResult, TProps> =>
  renderHook(({ initialPattern: seed, resetKey: key }: TProps) => usePatternPanel(onChange, seed, key), {
    initialProps: { initialPattern, resetKey },
  });

describe('usePatternPanel', () => {
  it('should default to the rectangular tile type, 100% scale, no spacing, and the first alignment point when there is no initialPattern', () => {
    // before
    const { result } = renderUsePatternPanel(undefined, undefined, 1);

    // result
    expect(result.current).toMatchObject(DEFAULT_PATTERN_PANEL_STATE);
  });

  it('should seed from initialPattern when given', () => {
    // before
    const { result } = renderUsePatternPanel(undefined, SEEDED_PATTERN, 1);

    // result
    expect(result.current).toMatchObject(SEEDED_PATTERN);
  });

  it('should update local state and call onChange with the full state on every setter', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { result } = renderUsePatternPanel(onChange, undefined, 1);

    // action
    act(() => result.current.setScale(50));

    // result
    expect(result.current.scale).toBe(50);
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_PATTERN_PANEL_STATE, scale: 50 });
  });

  it('should update offsetX on setOffsetX()', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { result } = renderUsePatternPanel(onChange, undefined, 1);

    // action
    act(() => result.current.setOffsetX(15));

    // result
    expect(result.current.offsetX).toBe(15);
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_PATTERN_PANEL_STATE, offsetX: 15 });
  });

  it('should update offsetY on setOffsetY()', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { result } = renderUsePatternPanel(onChange, undefined, 1);

    // action
    act(() => result.current.setOffsetY(-25));

    // result
    expect(result.current.offsetY).toBe(-25);
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_PATTERN_PANEL_STATE, offsetY: -25 });
  });

  it('should update alignmentIndex on setAlignmentIndex()', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { result } = renderUsePatternPanel(onChange, undefined, 1);

    // action
    act(() => result.current.setAlignmentIndex(4));

    // result
    expect(result.current.alignmentIndex).toBe(4);
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_PATTERN_PANEL_STATE, alignmentIndex: 4 });
  });

  it('should update spacingX on setSpacingX()', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { result } = renderUsePatternPanel(onChange, undefined, 1);

    // action
    act(() => result.current.setSpacingX(30));

    // result
    expect(result.current.spacingX).toBe(30);
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_PATTERN_PANEL_STATE, spacingX: 30 });
  });

  it('should update spacingY on setSpacingY()', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { result } = renderUsePatternPanel(onChange, undefined, 1);

    // action
    act(() => result.current.setSpacingY(40));

    // result
    expect(result.current.spacingY).toBe(40);
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_PATTERN_PANEL_STATE, spacingY: 40 });
  });

  it('should update tileType on setTileType()', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { result } = renderUsePatternPanel(onChange, undefined, 1);

    // action
    act(() => result.current.setTileType('hexagonal'));

    // result
    expect(result.current.tileType).toBe('hexagonal');
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_PATTERN_PANEL_STATE, tileType: 'hexagonal' });
  });

  it('should update the direction on setDirection()', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { result } = renderUsePatternPanel(onChange, undefined, 1);

    // action
    act(() => result.current.setDirection('vertical'));

    // result
    expect(result.current.direction).toBe('vertical');
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_PATTERN_PANEL_STATE, direction: 'vertical' });
  });

  it('should reset to defaults on reset(), regardless of the seeded initialPattern', () => {
    // before
    const { result } = renderUsePatternPanel(undefined, SEEDED_PATTERN, 1);

    // action
    act(() => result.current.reset());

    // result
    expect(result.current).toMatchObject(DEFAULT_PATTERN_PANEL_STATE);
  });

  it('should do nothing on the first render, even when resetKey is already defined', () => {
    // before
    const { result } = renderUsePatternPanel(undefined, SEEDED_PATTERN, 1);

    // result — seeded from initialPattern on mount, not reset
    expect(result.current).toMatchObject(SEEDED_PATTERN);
  });

  it('should reseed from the (possibly new) initialPattern when resetKey changes', () => {
    // before
    const { rerender, result } = renderUsePatternPanel(undefined, undefined, 1);

    // action — the panel is edited locally, then the picker session changes (reopened on a different paint)
    act(() => result.current.setScale(75));
    act(() => rerender({ initialPattern: SEEDED_PATTERN, resetKey: 2 }));

    // result
    expect(result.current).toMatchObject(SEEDED_PATTERN);
  });

  it('should not reseed when resetKey stays the same across a rerender', () => {
    // before
    const { rerender, result } = renderUsePatternPanel(undefined, undefined, 1);

    // action
    act(() => result.current.setScale(75));
    act(() => rerender({ initialPattern: SEEDED_PATTERN, resetKey: 1 }));

    // result
    expect(result.current.scale).toBe(75);
  });
});
