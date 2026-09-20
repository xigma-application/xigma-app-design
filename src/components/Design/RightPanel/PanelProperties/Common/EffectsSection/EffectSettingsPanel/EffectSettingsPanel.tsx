import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// @xigma
import { ScrubbableInput } from '@xigma/components';

// components
import EffectSettingsField from './EffectSettingsField/EffectSettingsField';
import EffectSettingsHeader from './EffectSettingsHeader/EffectSettingsHeader';
import { UITools } from 'shared';

// hooks
import { useEffectSettingsPanel } from './hooks/useEffectSettingsPanel/useEffectSettingsPanel';

// others
import { EFFECT_NUMBER_FIELDS, EFFECT_SCRUB_LIMIT, translationNameSpace } from '../constants';

// styles
import fieldStyles from './EffectSettingsField/effect-settings-field.module.scss';
import styles from './effect-settings-panel.module.scss';

// types
import { BlendMode } from 'types/design/enums';
import { TEffect } from 'types/design/types';

export type TEffectSettingsPanelProps = {
  effect: TEffect;
  onChange: TFunc<[TEffect]>;
  onClose: TFunc;
  onDragEnd: TFunc;
  onDragStart: TFunc;
};

export const EffectSettingsPanel: FC<TEffectSettingsPanelProps> = ({ effect, onChange, onClose, onDragEnd, onDragStart }) => {
  const { t } = useTranslation();
  const { onBlur, onCommitAlpha, onCommitHex, onPickerChange, onScrub } = useEffectSettingsPanel(effect, onChange);

  return (
    <div className={styles.EffectSettingsPanel}>
      <EffectSettingsHeader
        blendMode={effect.blendMode ?? BlendMode.normal}
        onBlendModeChange={(blendMode): void => onChange({ ...effect, blendMode })}
        onClose={onClose}
        onTypeChange={(type): void => onChange({ ...effect, type })}
        type={effect.type}
      />
      <div className={styles.EffectSettingsPanel__body}>
        {EFFECT_NUMBER_FIELDS.map(({ adornmentLabel, icon, key, labelKey, min }) => (
          <EffectSettingsField key={key} label={labelKey && t(`${translationNameSpace}.settings.labels.${labelKey}`)}>
            <UITools.TextField
              aria-label={t(`${translationNameSpace}.settings.fields.${key}`)}
              className={fieldStyles.EffectSettingsField__input}
              defaultValue={`${effect[key]}`}
              e2eValue={`effect-${key}`}
              onBlur={onBlur(key, min)}
              startAdornment={
                <ScrubbableInput
                  max={EFFECT_SCRUB_LIMIT}
                  min={Math.max(min, -EFFECT_SCRUB_LIMIT)}
                  onChange={onScrub(key, min)}
                  onMouseDown={onDragStart}
                  onMouseUp={onDragEnd}
                  value={effect[key]}
                >
                  <UITools.InputAdornment icon={icon} label={adornmentLabel} />
                </ScrubbableInput>
              }
              stepNumbers={{ min }}
              type="text"
            />
          </EffectSettingsField>
        ))}
        <EffectSettingsField label={t(`${translationNameSpace}.settings.labels.color`)}>
          <UITools.ColorPickerInput
            align="start"
            alpha={effect.opacity}
            className={styles.EffectSettingsPanel__color}
            e2eValue="effect"
            hex={effect.color}
            onCommitAlpha={onCommitAlpha}
            onCommitHex={onCommitHex}
            onDragEnd={onDragEnd}
            onDragStart={onDragStart}
            onPickerChange={onPickerChange}
            side="left"
            simple
            triggerAriaLabel={t(`${translationNameSpace}.settings.colorTriggerAriaLabel`)}
          />
        </EffectSettingsField>
      </div>
    </div>
  );
};

export default EffectSettingsPanel;
