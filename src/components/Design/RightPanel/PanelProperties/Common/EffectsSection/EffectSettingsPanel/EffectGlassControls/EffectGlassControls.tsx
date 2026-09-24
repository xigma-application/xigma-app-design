import { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

// components
import EffectGlassLight from './EffectGlassLight/EffectGlassLight';
import EffectGlassNumberField from './EffectGlassNumberField/EffectGlassNumberField';
import { UITools } from 'shared';

// others
import { MIXED_LABEL } from 'components/Design/RightPanel/PanelProperties/Common/constants';
import { EFFECT_GLASS_SLIDERS, translationNameSpace } from '../../constants';

// styles
import styles from './effect-glass-controls.module.scss';

// types
import { TEffect } from 'types/design/types';

// utils
import { getEffectGlass } from 'utils/design/effects/getEffectGlass';

export type TEffectGlassControlsProps = {
  effect: TEffect;
  mixedKeys: Set<keyof TEffect>;
  onChange: TFunc<[Partial<TEffect>]>;
  onDragEnd?: TFunc;
  onDragStart?: TFunc;
};

export const EffectGlassControls: FC<TEffectGlassControlsProps> = ({ effect, mixedKeys, onChange, onDragEnd, onDragStart }) => {
  const { t } = useTranslation();
  const glass = getEffectGlass(effect);

  return (
    <Fragment>
      <div className={styles.EffectGlassControls__lightRow}>
        <span className={styles.EffectGlassControls__lightLabel}>{t(`${translationNameSpace}.settings.labels.light`)}</span>
        <div className={styles.EffectGlassControls__light}>
          <EffectGlassLight
            angle={glass.lightAngle}
            intensity={glass.lightIntensity}
            onChange={(lightAngle): void => onChange({ lightAngle })}
            onDragEnd={onDragEnd}
            onDragStart={onDragStart}
          />
          <div className={styles.EffectGlassControls__lightFields}>
            <EffectGlassNumberField
              ariaLabel={t(`${translationNameSpace}.settings.fields.lightAngle`)}
              e2eValue="effect-lightAngle"
              onDragEnd={onDragEnd}
              onDragStart={onDragStart}
              tooltip={t(`${translationNameSpace}.settings.labels.light`)}
              max={180}
              min={-180}
              onChange={(lightAngle): void => onChange({ lightAngle })}
              displayValue={mixedKeys.has('lightAngle') ? MIXED_LABEL : undefined}
              unit="°"
              value={glass.lightAngle}
            />
            <EffectGlassNumberField
              ariaLabel={t(`${translationNameSpace}.settings.fields.lightIntensity`)}
              e2eValue="effect-lightIntensity"
              onDragEnd={onDragEnd}
              onDragStart={onDragStart}
              tooltip={t(`${translationNameSpace}.settings.labels.light`)}
              max={100}
              min={0}
              onChange={(lightIntensity): void => onChange({ lightIntensity })}
              displayValue={mixedKeys.has('lightIntensity') ? MIXED_LABEL : undefined}
              unit="%"
              value={glass.lightIntensity}
            />
          </div>
        </div>
      </div>
      <div className={styles.EffectGlassControls__divider} />
      <div className={styles.EffectGlassControls__settings}>
        {EFFECT_GLASS_SLIDERS.map(({ key, max, min }) => (
          <UITools.Field
            Component={UITools.SliderInput}
            ariaLabel={t(`${translationNameSpace}.settings.fields.${key}`)}
            displayValue={mixedKeys.has(key) ? MIXED_LABEL : undefined}
            e2eValue={`effect-${key}`}
            key={key}
            label={t(`${translationNameSpace}.settings.labels.${key}`)}
            max={max}
            min={min}
            onChange={(value): void => onChange({ [key]: value })}
            onDragEnd={onDragEnd}
            onDragStart={onDragStart}
            tooltip={t(`${translationNameSpace}.settings.labels.${key}`)}
            value={glass[key]}
          />
        ))}
      </div>
    </Fragment>
  );
};

export default EffectGlassControls;
