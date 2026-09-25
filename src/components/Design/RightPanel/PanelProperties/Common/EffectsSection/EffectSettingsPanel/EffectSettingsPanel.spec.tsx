import { render } from '@testing-library/react';

// components
import EffectSettingsPanel from './EffectSettingsPanel';
import { fieldProps } from 'test/FieldMock';

// others
import { MIXED_LABEL } from 'components/Design/RightPanel/PanelProperties/Common/constants';

// types
import { BlendMode, EffectBlurType, EffectType } from 'types/design/enums';
import { TEffect } from 'types/design/types';
import { TEffectPanelLayout } from './utils/getEffectPanelLayout';

// utils
import { createEffect } from 'utils/design/effects/createEffect';

const { childProps, panelHandlers, recordAs } = vi.hoisted(() => {
  const recorded: Record<string, Record<string, unknown>[]> = {};

  return {
    childProps: recorded,
    panelHandlers: {
      onBlur: vi.fn(() => vi.fn()),
      onCommitAlpha: vi.fn(),
      onCommitHex: vi.fn(),
      onCommitSecondaryAlpha: vi.fn(),
      onCommitSecondaryHex: vi.fn(),
      onPickerChange: vi.fn(),
      onScrub: vi.fn(() => vi.fn()),
      onSecondaryPickerChange: vi.fn(),
    },
    recordAs:
      (name: string) =>
      (props: Record<string, unknown>): null => {
        recorded[name] = [...(recorded[name] ?? []), props];
        return null;
      },
  };
});

vi.mock('shared', async (importOriginal) => {
  const original = await importOriginal<{ UITools: object }>();
  const { FieldMock } = await import('test/FieldMock');

  return { ...original, UITools: { ...original.UITools, Field: FieldMock } };
});
vi.mock('./hooks/useEffectSettingsPanel/useEffectSettingsPanel', () => ({ useEffectSettingsPanel: (): unknown => panelHandlers }));
vi.mock('./EffectSettingsHeader/EffectSettingsHeader', () => ({ default: recordAs('header') }));
vi.mock('./EffectBlurModeToggle/EffectBlurModeToggle', () => ({ default: recordAs('blur') }));
vi.mock('./EffectNoiseTypeToggle/EffectNoiseTypeToggle', () => ({ default: recordAs('noise') }));
vi.mock('./EffectColorField/EffectColorField', () => ({ default: recordAs('color') }));
vi.mock('./EffectGlassControls/EffectGlassControls', () => ({ default: recordAs('glass') }));
vi.mock('./EffectClipToShapeField/EffectClipToShapeField', () => ({ default: recordAs('clip') }));

const FULL_LAYOUT: TEffectPanelLayout = {
  fields: [
    { adornmentLabel: 'X', ariaKey: 'x', key: 'x', labelKey: 'position', min: Number.NEGATIVE_INFINITY },
    { icon: 'Opacity', isReadOnly: true, key: 'opacity', min: 0, unit: '%' },
  ],
  hasBlendMode: true,
  hasBlurModeToggle: true,
  hasClipToShape: true,
  hasColor: true,
  hasGlassControls: true,
  hasNoiseTypeToggle: true,
  hasSecondaryColor: true,
};

const renderPanel = (effect: TEffect, mixedKeys: (keyof TEffect)[], layout = FULL_LAYOUT): Record<string, TFunc> => {
  const handlers = {
    onBlendModePreview: vi.fn(),
    onChange: vi.fn(),
    onClose: vi.fn(),
    onDragEnd: vi.fn(),
    onDragStart: vi.fn(),
    onFieldScrub: vi.fn(),
  };

  render(<EffectSettingsPanel {...handlers} disabledTypes={[]} effect={effect} layout={layout} mixedKeys={new Set(mixedKeys)} />);

  return handlers;
};

const lastProps = (name: string, fromEnd = 1): Record<string, unknown> => childProps[name].at(-fromEnd) as Record<string, unknown>;

describe('EffectSettingsPanel behaviors', () => {
  it('should show every section of a full layout with the effect values and route their changes', () => {
    // mock
    const effect = { ...createEffect(EffectType.noise), blendMode: undefined, blurType: undefined, x: 4 };

    // before
    const { onChange } = renderPanel(effect, []);

    // action
    (lastProps('header').onBlendModeChange as TFunc<[BlendMode]>)(BlendMode.darken);
    (lastProps('header').onTypeChange as TFunc<[EffectType]>)(EffectType.glass);
    (lastProps('blur').onChange as TFunc<[EffectBlurType]>)(EffectBlurType.progressive);
    (lastProps('noise').onChange as TFunc<[string]>)('duo');
    (lastProps('clip').onChange as TFunc<[boolean]>)(true);

    // result
    expect(vi.mocked(onChange as TFunc<[Partial<TEffect>]>).mock.calls.map(([patch]) => patch)).toEqual([
      { blendMode: BlendMode.darken },
      { type: EffectType.glass },
      { blurType: EffectBlurType.progressive },
      { noiseType: 'duo' },
      { clipToShape: true },
    ]);
    expect(lastProps('header')).toMatchObject({ blendMode: BlendMode.normal, hasBlendMode: true });
    expect(lastProps('blur').blurType).toBe(EffectBlurType.uniform);
    expect(lastProps('noise').noiseType).toBeDefined();
    expect(lastProps('clip').value).toBe(false);
    expect(lastProps('color', 2)).toMatchObject({ alphaDisplayValue: undefined, hexDisplayValue: undefined, label: 'Colors' });
    expect(lastProps('color')).toMatchObject({ alphaDisplayValue: undefined, hexDisplayValue: undefined });
    expect(lastProps('glass').effect).toBe(effect);
    expect(fieldProps.at(-2)).toMatchObject({ 'aria-label': 'Effect X offset', defaultValue: '4', label: 'Position' });
    expect(fieldProps.at(-1)).toMatchObject({ defaultValue: `${effect.opacity}%`, disabled: true, label: undefined });
  });

  it('should show Mixed for every differing value', () => {
    // mock
    const effect = createEffect(EffectType.noise);

    // before
    renderPanel(effect, [
      'blendMode',
      'blurType',
      'noiseType',
      'x',
      'opacity',
      'color',
      'clipToShape',
      'secondaryOpacity',
      'secondaryColor',
    ]);

    // result
    expect(lastProps('header').blendMode).toBeUndefined();
    expect(lastProps('blur').blurType).toBeUndefined();
    expect(lastProps('noise').noiseType).toBeUndefined();
    expect(lastProps('clip').value).toBe(false);
    expect(lastProps('color', 2)).toMatchObject({ alphaDisplayValue: MIXED_LABEL, hexDisplayValue: MIXED_LABEL });
    expect(lastProps('color')).toMatchObject({ alphaDisplayValue: MIXED_LABEL, hexDisplayValue: MIXED_LABEL });
    expect(fieldProps.at(-2)?.defaultValue).toBe(MIXED_LABEL);
  });

  it('should show only the header and a single color for a minimal layout', () => {
    // mock
    const effect = { ...createEffect(EffectType.dropShadow), blendMode: BlendMode.multiply, blurType: EffectBlurType.progressive };
    const counts = Object.fromEntries(Object.entries(childProps).map(([name, list]) => [name, list.length]));

    // before
    renderPanel(effect, [], {
      ...FULL_LAYOUT,
      fields: [],
      hasBlurModeToggle: false,
      hasClipToShape: false,
      hasGlassControls: false,
      hasNoiseTypeToggle: false,
      hasSecondaryColor: false,
    });

    // result
    expect(lastProps('header').blendMode).toBe(BlendMode.multiply);
    expect(lastProps('color')).toMatchObject({ e2eValue: 'effect', label: 'Color' });
    expect(childProps.color.length).toBe(counts.color + 1);
    expect(childProps.blur.length).toBe(counts.blur);
    expect(childProps.glass.length).toBe(counts.glass);
  });
});
