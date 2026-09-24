import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// @xigma
import { ScrubbableInput } from '@xigma/components';

// components
import StrokeSettingsWidthProfileField from '../StrokeSettingsWidthProfileField/StrokeSettingsWidthProfileField';
import { UITools } from 'shared';

// hooks
import { useStepNumbersOnKeyDown } from 'hooks';

// types
import { StrokeStyle } from 'types/design/enums';

// others
import { STROKE_DASH_MAX_LENGTH } from 'constant/strokeDash';
import { STROKE_MITER_ANGLE_MAX, STROKE_MITER_ANGLE_MIN } from 'constant/strokeMiterAngle';
import { STROKE_STYLE_ICONS, STROKE_STYLE_MENU_WIDTH_PX } from './constants';
import { getStrokeDashCapButtons } from './utils/getStrokeDashCapButtons';
import { getStrokeJoinButtons } from './utils/getStrokeJoinButtons';
import { getStrokeStyleOptions } from './utils/getStrokeStyleOptions';
import { useStrokeSettingsBasicTab } from './hooks/useStrokeSettingsBasicTab/useStrokeSettingsBasicTab';
import { translationNameSpace } from '../../../../constants';

// styles
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
    onDashScrub,
    onDashStep,
    onDashesBlur,
    onDashesScrub,
    onDashesStep,
    onGapBlur,
    onGapScrub,
    onGapStep,
    onJoinSelect,
    onMiterAngleBlur,
    onMiterAngleDragEnd,
    onMiterAngleDragStart,
    onMiterAngleScrub,
    onMiterAngleStep,
    onScrubDragEnd,
    onScrubDragStart,
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
      <UITools.Field
        Component={UITools.Dropdown<StrokeStyle>}
        controlWidth={128}
        label={t(`${namespace}.style.label`)}
        bypassGlobalShortcuts={false}
        icon={STROKE_STYLE_ICONS[style]}
        menuWidth={STROKE_STYLE_MENU_WIDTH_PX}
        onSelect={onStyleSelect}
        options={styleOptions}
        textAlign="left"
        value={style}
        variant="outline"
      />
      {isDashed && (
        <>
          <UITools.Field
            Component={UITools.TextField}
            controlWidth={128}
            label={t(`${namespace}.dash.label`)}
            aria-label={t(`${namespace}.dash.label`)}
            defaultValue={String(dash)}
            e2eValue="stroke-dash"
            keepMountedWhileFocused
            onBlur={onDashBlur}
            onKeyDown={onDashKeyDown}
            startAdornment={
              <UITools.ScrubbableEdge
                max={STROKE_DASH_MAX_LENGTH}
                min={0}
                onChange={onDashScrub}
                onDragEnd={onScrubDragEnd}
                onDragStart={onScrubDragStart}
                value={dash}
              />
            }
            type="text"
          />
          <UITools.Field
            Component={UITools.TextField}
            controlWidth={128}
            label={t(`${namespace}.gap.label`)}
            aria-label={t(`${namespace}.gap.label`)}
            defaultValue={String(gap)}
            e2eValue="stroke-gap"
            keepMountedWhileFocused
            onBlur={onGapBlur}
            onKeyDown={onGapKeyDown}
            startAdornment={
              <UITools.ScrubbableEdge
                max={STROKE_DASH_MAX_LENGTH}
                min={0}
                onChange={onGapScrub}
                onDragEnd={onScrubDragEnd}
                onDragStart={onScrubDragStart}
                value={gap}
              />
            }
            type="text"
          />
        </>
      )}
      {isCustom && (
        <UITools.Field
          Component={UITools.TextField}
          controlWidth={128}
          label={t(`${namespace}.dashes.label`)}
          aria-label={t(`${namespace}.dashes.label`)}
          defaultValue={dashes.join(', ')}
          e2eValue="stroke-dashes"
          keepMountedWhileFocused
          onBlur={onDashesBlur}
          onKeyDown={onDashesKeyDown}
          startAdornment={
            <UITools.ScrubbableEdge
              max={STROKE_DASH_MAX_LENGTH}
              min={0}
              onChange={onDashesScrub}
              onDragEnd={onScrubDragEnd}
              onDragStart={onScrubDragStart}
              value={dashes[0] ?? 0}
            />
          }
          type="text"
        />
      )}
      {hasDashes && (
        <>
          <UITools.Field
            Component={UITools.ToggleButtonGroup}
            controlWidth={128}
            label={t(`${namespace}.dashCap.label`)}
            onChange={onDashCapSelect}
            toggleButtons={dashCapButtons}
            value={dashCap}
          />
        </>
      )}
      <StrokeSettingsWidthProfileField disabled={hasDashes} />
      <UITools.Field
        Component={UITools.ToggleButtonGroup}
        controlWidth={128}
        label={t(`${namespace}.join.label`)}
        onChange={onJoinSelect}
        toggleButtons={joinButtons}
        value={join}
      />
      {isMiter && (
        <UITools.Field
          Component={UITools.TextField}
          controlWidth={128}
          label={t(`${namespace}.miterAngle.label`)}
          aria-label={t(`${namespace}.miterAngle.ariaLabel`)}
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
      )}
    </div>
  );
};

export default StrokeSettingsBasicTab;
