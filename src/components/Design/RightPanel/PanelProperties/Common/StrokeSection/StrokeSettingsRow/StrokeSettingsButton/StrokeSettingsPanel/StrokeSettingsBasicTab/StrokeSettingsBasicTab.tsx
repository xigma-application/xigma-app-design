import { FC } from 'react';
import { noop } from 'lodash';
import { useTranslation } from 'react-i18next';

// @xigma
import { ScrubbableInput } from '@xigma/components';

// components
import StrokeSettingsField from '../StrokeSettingsField/StrokeSettingsField';
import StrokeSettingsWidthProfileField from '../StrokeSettingsWidthProfileField/StrokeSettingsWidthProfileField';
import { UITools } from 'shared';

// others
import { STROKE_MITER_ANGLE_MAX, STROKE_MITER_ANGLE_MIN } from 'constant/strokeMiterAngle';
import {
  DEFAULT_STROKE_DASH,
  DEFAULT_STROKE_DASHES,
  DEFAULT_STROKE_DASH_CAP,
  DEFAULT_STROKE_GAP,
  STROKE_STYLE_ICONS,
  STROKE_STYLE_MENU_WIDTH_PX,
  TStrokeStyle,
} from './constants';
import { getStrokeDashCapButtons } from './utils/getStrokeDashCapButtons';
import { getStrokeJoinButtons } from './utils/getStrokeJoinButtons';
import { getStrokeStyleOptions } from './utils/getStrokeStyleOptions';
import { useStrokeSettingsBasicTab } from './hooks/useStrokeSettingsBasicTab';
import { translationNameSpace } from '../../../../constants';

// styles
import fieldStyles from '../StrokeSettingsField/stroke-settings-field.module.scss';
import styles from './stroke-settings-basic-tab.module.scss';

export const StrokeSettingsBasicTab: FC = () => {
  const { t } = useTranslation();
  const { hasDashes, isCustom, isDashed, isMiter, join, miterAngle, onJoinSelect, onMiterAngleBlur, onMiterAngleDragEnd, onMiterAngleDragStart, onMiterAngleScrub, onStyleSelect, style } = useStrokeSettingsBasicTab();
  const namespace = `${translationNameSpace}.settings`;
  const styleOptions = getStrokeStyleOptions((style) => t(`${namespace}.style.options.${style}`));
  const dashCapButtons = getStrokeDashCapButtons((cap) => t(`${namespace}.dashCap.options.${cap}`));
  const joinButtons = getStrokeJoinButtons((join) => t(`${namespace}.join.options.${join}`));

  return (
    <div className={styles.StrokeSettingsBasicTab}>
      <StrokeSettingsField label={t(`${namespace}.style.label`)}>
        <UITools.Dropdown<TStrokeStyle>
          bypassGlobalShortcuts={false}
          className={fieldStyles.StrokeSettingsField__input}
          icon={STROKE_STYLE_ICONS[style]}
          menuWidth={STROKE_STYLE_MENU_WIDTH_PX}
          onSelect={onStyleSelect}
          options={styleOptions}
          textAlign="left"
          value={style}
          variant="outline"
        />
      </StrokeSettingsField>
      {isDashed && (
        <>
          <StrokeSettingsField label={t(`${namespace}.dash.label`)}>
            <UITools.TextField
              aria-label={t(`${namespace}.dash.label`)}
              className={fieldStyles.StrokeSettingsField__input}
              defaultValue={DEFAULT_STROKE_DASH}
              e2eValue="stroke-dash"
              type="text"
            />
          </StrokeSettingsField>
          <StrokeSettingsField label={t(`${namespace}.gap.label`)}>
            <UITools.TextField
              aria-label={t(`${namespace}.gap.label`)}
              className={fieldStyles.StrokeSettingsField__input}
              defaultValue={DEFAULT_STROKE_GAP}
              disabled
              e2eValue="stroke-gap"
              type="text"
            />
          </StrokeSettingsField>
        </>
      )}
      {isCustom && (
        <StrokeSettingsField label={t(`${namespace}.dashes.label`)}>
          <UITools.TextField
            aria-label={t(`${namespace}.dashes.label`)}
            className={fieldStyles.StrokeSettingsField__input}
            defaultValue={DEFAULT_STROKE_DASHES}
            e2eValue="stroke-dashes"
            type="text"
          />
        </StrokeSettingsField>
      )}
      {hasDashes && (
        <>
          <StrokeSettingsField label={t(`${namespace}.dashCap.label`)}>
            <UITools.ToggleButtonGroup
              className={fieldStyles.StrokeSettingsField__input}
              onChange={noop}
              toggleButtons={dashCapButtons}
              value={DEFAULT_STROKE_DASH_CAP}
            />
          </StrokeSettingsField>
        </>
      )}
      <StrokeSettingsWidthProfileField disabled={hasDashes} />
      <StrokeSettingsField label={t(`${namespace}.join.label`)}>
        <UITools.ToggleButtonGroup
          className={fieldStyles.StrokeSettingsField__input}
          onChange={onJoinSelect}
          toggleButtons={joinButtons}
          value={join}
        />
      </StrokeSettingsField>
      {isMiter && (
        <StrokeSettingsField label={t(`${namespace}.miterAngle.label`)}>
          <UITools.TextField
            aria-label={t(`${namespace}.miterAngle.ariaLabel`)}
            className={fieldStyles.StrokeSettingsField__input}
            defaultValue={`${miterAngle}°`}
            e2eValue="stroke-miter-angle"
            onBlur={onMiterAngleBlur}
            startAdornment={
              <ScrubbableInput
                max={STROKE_MITER_ANGLE_MAX}
                min={STROKE_MITER_ANGLE_MIN}
                onChange={onMiterAngleScrub}
                onMouseDown={onMiterAngleDragStart}
                onMouseUp={onMiterAngleDragEnd}
                value={miterAngle}
              >
                <UITools.InputAdornment icon="Protractor" />
              </ScrubbableInput>
            }
            type="text"
          />
        </StrokeSettingsField>
      )}
    </div>
  );
};

export default StrokeSettingsBasicTab;
