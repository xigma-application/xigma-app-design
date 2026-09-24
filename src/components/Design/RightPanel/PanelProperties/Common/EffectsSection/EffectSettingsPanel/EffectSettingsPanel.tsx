import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// @xigma
import { ScrubbableInput } from '@xigma/components';

// components
import EffectGlassControls from './EffectGlassControls/EffectGlassControls';
import EffectClipToShapeField from './EffectClipToShapeField/EffectClipToShapeField';
import EffectColorField from './EffectColorField/EffectColorField';
import EffectNoiseTypeToggle from './EffectNoiseTypeToggle/EffectNoiseTypeToggle';
import EffectBlurModeToggle from './EffectBlurModeToggle/EffectBlurModeToggle';
import EffectSettingsHeader from './EffectSettingsHeader/EffectSettingsHeader';
import { UITools } from 'shared';

// hooks
import { useEffectSettingsPanel } from './hooks/useEffectSettingsPanel/useEffectSettingsPanel';

// others
import { EFFECT_FIELD_MAX, EFFECT_SCRUB_LIMIT, translationNameSpace } from '../constants';
import { MIXED_LABEL } from 'components/Design/RightPanel/PanelProperties/Common/constants';

// styles
import styles from './effect-settings-panel.module.scss';

// utils
import { getEffectNoise } from 'utils/design/effects/getEffectNoise';
import { getEffectTexture } from 'utils/design/effects/getEffectTexture';
import { getEffectFieldValue } from 'utils/design/effects/getEffectFieldValue';

// types
import { BlendMode, EffectBlurType, EffectType } from 'types/design/enums';
import { TEffect } from 'types/design/types';
import { TEffectNumberField } from '../types';
import { TEffectPanelLayout } from './utils/getEffectPanelLayout';

export type TEffectSettingsPanelProps = {
  disabledTypes: EffectType[];
  effect: TEffect;
  layout: TEffectPanelLayout;
  mixedKeys: Set<keyof TEffect>;
  onBlendModePreview: TFunc<[BlendMode | null]>;
  onChange: TFunc<[Partial<TEffect>]>;
  onClose: TFunc;
  onDragEnd: TFunc;
  onDragStart: TFunc;
  onFieldScrub: TFunc<[TEffectNumberField, number, number]>;
};

export const EffectSettingsPanel: FC<TEffectSettingsPanelProps> = ({
  disabledTypes,
  effect,
  layout,
  mixedKeys,
  onBlendModePreview,
  onChange,
  onClose,
  onDragEnd,
  onDragStart,
  onFieldScrub,
}) => {
  const { t } = useTranslation();
  const noise = getEffectNoise(effect);

  const { fields, hasBlendMode, hasBlurModeToggle, hasClipToShape, hasColor, hasGlassControls, hasNoiseTypeToggle, hasSecondaryColor } =
    layout;

  const {
    onBlur,
    onCommitAlpha,
    onCommitHex,
    onCommitSecondaryAlpha,
    onCommitSecondaryHex,
    onPickerChange,
    onScrub,
    onSecondaryPickerChange,
  } = useEffectSettingsPanel(effect, mixedKeys, onChange, onFieldScrub);

  return (
    <div className={styles.EffectSettingsPanel}>
      <EffectSettingsHeader
        blendMode={mixedKeys.has('blendMode') ? undefined : (effect.blendMode ?? BlendMode.normal)}
        disabledTypes={disabledTypes}
        hasBlendMode={hasBlendMode}
        onBlendModeChange={(blendMode): void => onChange({ blendMode })}
        onBlendModePreview={onBlendModePreview}
        onClose={onClose}
        onTypeChange={(type): void => onChange({ type })}
        type={effect.type}
      />
      <div className={styles.EffectSettingsPanel__body}>
        {hasBlurModeToggle && (
          <EffectBlurModeToggle
            blurType={mixedKeys.has('blurType') ? undefined : (effect.blurType ?? EffectBlurType.uniform)}
            onChange={(blurType): void => onChange({ blurType })}
          />
        )}
        {hasNoiseTypeToggle && (
          <EffectNoiseTypeToggle
            noiseType={mixedKeys.has('noiseType') ? undefined : noise.noiseType}
            onChange={(noiseType): void => onChange({ noiseType })}
          />
        )}
        {fields.map(({ adornmentLabel, ariaKey, icon, isReadOnly, key, labelKey, min, unit }) => (
          <UITools.Field
            Component={UITools.TextField}
            aria-label={t(`${translationNameSpace}.settings.fields.${ariaKey ?? key}`)}
            defaultValue={mixedKeys.has(key) ? MIXED_LABEL : `${getEffectFieldValue(effect, key)}${unit ?? ''}`}
            disabled={isReadOnly}
            e2eValue={`effect-${key}`}
            key={`${key}-${adornmentLabel ?? ''}`}
            label={labelKey && t(`${translationNameSpace}.settings.labels.${labelKey}`)}
            onBlur={onBlur(key, min, unit)}
            startAdornment={
              <ScrubbableInput
                max={Math.min(EFFECT_FIELD_MAX[key] ?? EFFECT_SCRUB_LIMIT, EFFECT_SCRUB_LIMIT)}
                min={Math.max(min, -EFFECT_SCRUB_LIMIT)}
                onChange={onScrub(key, min)}
                onMouseDown={onDragStart}
                onMouseUp={onDragEnd}
                value={getEffectFieldValue(effect, key)}
              >
                <UITools.InputAdornment icon={icon} label={adornmentLabel} />
              </ScrubbableInput>
            }
            stepNumbers={{ max: EFFECT_FIELD_MAX[key], min }}
            type="text"
          />
        ))}
        {hasColor && (
          <EffectColorField
            alpha={effect.opacity}
            alphaDisplayValue={mixedKeys.has('opacity') ? MIXED_LABEL : undefined}
            e2eValue="effect"
            hex={effect.color}
            hexDisplayValue={mixedKeys.has('color') ? MIXED_LABEL : undefined}
            label={t(`${translationNameSpace}.settings.labels.${hasSecondaryColor ? 'colors' : 'color'}`)}
            onCommitAlpha={onCommitAlpha}
            onCommitHex={onCommitHex}
            onDragEnd={onDragEnd}
            onDragStart={onDragStart}
            onPickerChange={onPickerChange}
            triggerAriaLabel={t(`${translationNameSpace}.settings.colorTriggerAriaLabel`)}
          />
        )}
        {hasGlassControls && (
          <EffectGlassControls effect={effect} mixedKeys={mixedKeys} onChange={onChange} onDragEnd={onDragEnd} onDragStart={onDragStart} />
        )}
        {hasClipToShape && (
          <EffectClipToShapeField
            onChange={(clipToShape): void => onChange({ clipToShape })}
            value={!mixedKeys.has('clipToShape') && getEffectTexture(effect).clipToShape}
          />
        )}
        {hasSecondaryColor && (
          <EffectColorField
            alpha={noise.secondaryOpacity}
            alphaDisplayValue={mixedKeys.has('secondaryOpacity') ? MIXED_LABEL : undefined}
            e2eValue="effect-secondary"
            hex={noise.secondaryColor}
            hexDisplayValue={mixedKeys.has('secondaryColor') ? MIXED_LABEL : undefined}
            onCommitAlpha={onCommitSecondaryAlpha}
            onCommitHex={onCommitSecondaryHex}
            onDragEnd={onDragEnd}
            onDragStart={onDragStart}
            onPickerChange={onSecondaryPickerChange}
            triggerAriaLabel={t(`${translationNameSpace}.settings.secondaryColorTriggerAriaLabel`)}
          />
        )}
      </div>
    </div>
  );
};

export default EffectSettingsPanel;
