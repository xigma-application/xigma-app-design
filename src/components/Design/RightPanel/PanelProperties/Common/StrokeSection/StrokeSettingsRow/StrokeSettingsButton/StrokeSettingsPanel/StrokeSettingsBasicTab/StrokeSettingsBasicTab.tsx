import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// @xigma
import { ScrubbableInput } from '@xigma/components';

// components
import StrokeSettingsField from '../StrokeSettingsField/StrokeSettingsField';
import StrokeSettingsWidthProfileField from '../StrokeSettingsWidthProfileField/StrokeSettingsWidthProfileField';
import { UITools } from 'shared';

// hooks
import { useStepNumbersOnKeyDown } from 'hooks';

// types
import { StrokeStyle } from 'types/design/enums';

// others
import { STROKE_MITER_ANGLE_MAX, STROKE_MITER_ANGLE_MIN } from 'constant/strokeMiterAngle';
import { STROKE_STYLE_ICONS, STROKE_STYLE_MENU_WIDTH_PX } from './constants';
import { getStrokeDashCapButtons } from './utils/getStrokeDashCapButtons';
import { getStrokeJoinButtons } from './utils/getStrokeJoinButtons';
import { getStrokeStyleOptions } from './utils/getStrokeStyleOptions';
import { useStrokeSettingsBasicTab } from './hooks/useStrokeSettingsBasicTab/useStrokeSettingsBasicTab';
import { translationNameSpace } from '../../../../constants';

// styles
import fieldStyles from '../StrokeSettingsField/stroke-settings-field.module.scss';
import styles from './stroke-settings-basic-tab.module.scss';

export const StrokeSettingsBasicTab: FC = () => {
  const { t } = useTranslation();
  const {
    dash,
    dashCap,
    dashes,
    gap,
    hasDashes,
    isCustom,
    isDashed,
    isMiter,
    join,
    miterAngle,
    onDashBlur,
    onDashCapSelect,
    onDashStep,
    onDashesBlur,
    onDashesStep,
    onGapBlur,
    onGapStep,
    onJoinSelect,
    onMiterAngleBlur,
    onMiterAngleDragEnd,
    onMiterAngleDragStart,
    onMiterAngleScrub,
    onMiterAngleStep,
    onStyleSelect,
    style,
  } = useStrokeSettingsBasicTab();
  const onDashKeyDown = useStepNumbersOnKeyDown({ min: 0, onStep: onDashStep });
  const onGapKeyDown = useStepNumbersOnKeyDown({ min: 0, onStep: onGapStep });
  const onMiterAngleKeyDown = useStepNumbersOnKeyDown({
    max: STROKE_MITER_ANGLE_MAX,
    min: STROKE_MITER_ANGLE_MIN,
    onStep: onMiterAngleStep,
  });
  const onDashesKeyDown = useStepNumbersOnKeyDown({ min: 0, onStep: onDashesStep });
  const namespace = `${translationNameSpace}.settings`;
  const styleOptions = getStrokeStyleOptions((style) => t(`${namespace}.style.options.${style}`));
  const dashCapButtons = getStrokeDashCapButtons((cap) => t(`${namespace}.dashCap.options.${cap}`));
  const joinButtons = getStrokeJoinButtons((join) => t(`${namespace}.join.options.${join}`));

  return (
    <div className={styles.StrokeSettingsBasicTab}>
      <StrokeSettingsField label={t(`${namespace}.style.label`)}>
        <UITools.Dropdown<StrokeStyle>
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
              defaultValue={String(dash)}
              e2eValue="stroke-dash"
              keepMountedWhileFocused
              onBlur={onDashBlur}
              onKeyDown={onDashKeyDown}
              type="text"
            />
          </StrokeSettingsField>
          <StrokeSettingsField label={t(`${namespace}.gap.label`)}>
            <UITools.TextField
              aria-label={t(`${namespace}.gap.label`)}
              className={fieldStyles.StrokeSettingsField__input}
              defaultValue={String(gap)}
              e2eValue="stroke-gap"
              keepMountedWhileFocused
              onBlur={onGapBlur}
              onKeyDown={onGapKeyDown}
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
            defaultValue={dashes.join(', ')}
            e2eValue="stroke-dashes"
            keepMountedWhileFocused
            onBlur={onDashesBlur}
            onKeyDown={onDashesKeyDown}
            type="text"
          />
        </StrokeSettingsField>
      )}
      {hasDashes && (
        <>
          <StrokeSettingsField label={t(`${namespace}.dashCap.label`)}>
            <UITools.ToggleButtonGroup
              className={fieldStyles.StrokeSettingsField__input}
              onChange={onDashCapSelect}
              toggleButtons={dashCapButtons}
              value={dashCap}
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
            keepMountedWhileFocused
            onBlur={onMiterAngleBlur}
            onKeyDown={onMiterAngleKeyDown}
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
