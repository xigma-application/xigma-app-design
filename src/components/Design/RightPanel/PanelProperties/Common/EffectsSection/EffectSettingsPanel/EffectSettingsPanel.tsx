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
import EffectSettingsField from './EffectSettingsField/EffectSettingsField';
import EffectSettingsHeader from './EffectSettingsHeader/EffectSettingsHeader';
import { UITools } from 'shared';

// hooks
import { useEffectSettingsPanel } from './hooks/useEffectSettingsPanel/useEffectSettingsPanel';

// others
import { EFFECT_FIELD_MAX, EFFECT_SCRUB_LIMIT, translationNameSpace } from '../constants';

// styles
import fieldStyles from './EffectSettingsField/effect-settings-field.module.scss';
import styles from './effect-settings-panel.module.scss';

// utils
import { getEffectNoise } from 'utils/design/effects/getEffectNoise';
import { getEffectTexture } from 'utils/design/effects/getEffectTexture';
import { getEffectFieldValue } from 'utils/design/effects/getEffectFieldValue';
import { getEffectPanelLayout } from './utils/getEffectPanelLayout';

// types
import { BlendMode, EffectType } from 'types/design/enums';
import { TEffect } from 'types/design/types';

export type TEffectSettingsPanelProps = {
  disabledTypes: EffectType[];
  effect: TEffect;
  onBlendModePreview: TFunc<[BlendMode | null]>;
  onChange: TFunc<[TEffect]>;
  onClose: TFunc;
  onDragEnd: TFunc;
  onDragStart: TFunc;
};

export const EffectSettingsPanel: FC<TEffectSettingsPanelProps> = ({
  disabledTypes,
  effect,
  onBlendModePreview,
  onChange,
  onClose,
  onDragEnd,
  onDragStart,
}) => {
  const { t } = useTranslation();
  const noise = getEffectNoise(effect);

  const { fields, hasBlendMode, hasBlurModeToggle, hasClipToShape, hasColor, hasGlassControls, hasNoiseTypeToggle, hasSecondaryColor } =
    getEffectPanelLayout(effect);

  const {
    onBlur,
    onCommitAlpha,
    onCommitHex,
    onCommitSecondaryAlpha,
    onCommitSecondaryHex,
    onPickerChange,
    onScrub,
    onSecondaryPickerChange,
  } = useEffectSettingsPanel(effect, onChange);

  return (
    <div className={styles.EffectSettingsPanel}>
      <EffectSettingsHeader
        blendMode={effect.blendMode ?? BlendMode.normal}
        disabledTypes={disabledTypes}
        hasBlendMode={hasBlendMode}
        onBlendModeChange={(blendMode): void => onChange({ ...effect, blendMode })}
        onBlendModePreview={onBlendModePreview}
        onClose={onClose}
        onTypeChange={(type): void => onChange({ ...effect, type })}
        type={effect.type}
      />
      <div className={styles.EffectSettingsPanel__body}>
        {hasBlurModeToggle && (
          <EffectBlurModeToggle blurType={effect.blurType} onChange={(blurType): void => onChange({ ...effect, blurType })} />
        )}
        {hasNoiseTypeToggle && (
          <EffectNoiseTypeToggle noiseType={effect.noiseType} onChange={(noiseType): void => onChange({ ...effect, noiseType })} />
        )}
        {fields.map(({ adornmentLabel, ariaKey, icon, isReadOnly, key, labelKey, min, unit }) => (
          <EffectSettingsField
            key={`${key}-${adornmentLabel ?? ''}`}
            label={labelKey && t(`${translationNameSpace}.settings.labels.${labelKey}`)}
          >
            <UITools.TextField
              aria-label={t(`${translationNameSpace}.settings.fields.${ariaKey ?? key}`)}
              className={fieldStyles.EffectSettingsField__input}
              defaultValue={`${getEffectFieldValue(effect, key)}${unit ?? ''}`}
              disabled={isReadOnly}
              e2eValue={`effect-${key}`}
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
          </EffectSettingsField>
        ))}
        {hasColor && (
          <EffectColorField
            alpha={effect.opacity}
            e2eValue="effect"
            hex={effect.color}
            label={t(`${translationNameSpace}.settings.labels.${hasSecondaryColor ? 'colors' : 'color'}`)}
            onCommitAlpha={onCommitAlpha}
            onCommitHex={onCommitHex}
            onDragEnd={onDragEnd}
            onDragStart={onDragStart}
            onPickerChange={onPickerChange}
            triggerAriaLabel={t(`${translationNameSpace}.settings.colorTriggerAriaLabel`)}
          />
        )}
        {hasGlassControls && <EffectGlassControls effect={effect} onChange={onChange} onDragEnd={onDragEnd} onDragStart={onDragStart} />}
        {hasClipToShape && (
          <EffectClipToShapeField
            onChange={(clipToShape): void => onChange({ ...effect, clipToShape })}
            value={getEffectTexture(effect).clipToShape}
          />
        )}
        {hasSecondaryColor && (
          <EffectColorField
            alpha={noise.secondaryOpacity}
            e2eValue="effect-secondary"
            hex={noise.secondaryColor}
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
