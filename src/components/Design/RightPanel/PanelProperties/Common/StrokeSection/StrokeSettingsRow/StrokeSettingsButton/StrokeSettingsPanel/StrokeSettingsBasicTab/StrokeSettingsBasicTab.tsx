import { FC } from 'react';
import { noop } from 'lodash';
import { useTranslation } from 'react-i18next';

// @xigma
import { Tooltip } from '@xigma/components';

// components
import StrokeSettingsField from './StrokeSettingsField';
import { UITools } from 'shared';

// others
import {
  DEFAULT_MITER_ANGLE,
  DEFAULT_STROKE_JOIN,
  DEFAULT_STROKE_PROFILE,
  DEFAULT_STROKE_STYLE,
  STROKE_STYLE_ICONS,
  STROKE_STYLE_MENU_WIDTH_PX,
} from './constants';
import { getStrokeJoinButtons } from './utils/getStrokeJoinButtons';
import { getStrokeProfileOptions } from './utils/getStrokeProfileOptions';
import { getStrokeStyleOptions } from './utils/getStrokeStyleOptions';
import { isStrokeProfileFlippable } from './utils/isStrokeProfileFlippable';
import { translationNameSpace } from '../../../../constants';

// styles
import styles from './stroke-settings-basic-tab.module.scss';

// types
import { StrokeProfile } from 'types/design/enums';

export const StrokeSettingsBasicTab: FC = () => {
  const { t } = useTranslation();
  const namespace = `${translationNameSpace}.settings`;
  const profile = DEFAULT_STROKE_PROFILE;
  const styleOptions = getStrokeStyleOptions((style) => t(`${namespace}.style.options.${style}`));
  const profileOptions = getStrokeProfileOptions((option) => t(`${namespace}.widthProfile.options.${option}`));
  const joinButtons = getStrokeJoinButtons((join) => t(`${namespace}.join.options.${join}`));

  return (
    <div className={styles.StrokeSettingsBasicTab}>
      <StrokeSettingsField label={t(`${namespace}.style.label`)}>
        <UITools.Dropdown
          bypassGlobalShortcuts={false}
          className={styles.StrokeSettingsBasicTab__input}
          icon={STROKE_STYLE_ICONS[DEFAULT_STROKE_STYLE]}
          menuWidth={STROKE_STYLE_MENU_WIDTH_PX}
          onSelect={noop}
          options={styleOptions}
          textAlign="left"
          value={DEFAULT_STROKE_STYLE}
          variant="outline"
        />
      </StrokeSettingsField>
      <StrokeSettingsField label={t(`${namespace}.widthProfile.label`)}>
        <UITools.Dropdown<StrokeProfile>
          bypassGlobalShortcuts={false}
          className={styles.StrokeSettingsBasicTab__input}
          onSelect={noop}
          options={profileOptions}
          textAlign="left"
          value={profile}
          variant="outline"
        />
        <Tooltip content={t(`${namespace}.widthProfile.flipTooltip`)}>
          <UITools.ButtonIcon
            ariaLabel={t(`${namespace}.widthProfile.flipAriaLabel`)}
            disabled={!isStrokeProfileFlippable(profile)}
            name="FlipHorizontal"
          />
        </Tooltip>
      </StrokeSettingsField>
      <StrokeSettingsField label={t(`${namespace}.join.label`)}>
        <UITools.ToggleButtonGroup
          className={styles.StrokeSettingsBasicTab__input}
          onChange={noop}
          toggleButtons={joinButtons}
          value={DEFAULT_STROKE_JOIN}
        />
      </StrokeSettingsField>
      <StrokeSettingsField label={t(`${namespace}.miterAngle.label`)}>
        <UITools.TextField
          aria-label={t(`${namespace}.miterAngle.ariaLabel`)}
          className={styles.StrokeSettingsBasicTab__input}
          defaultValue={DEFAULT_MITER_ANGLE}
          e2eValue="stroke-miter-angle"
          startAdornment={<UITools.InputAdornment icon="Protractor" />}
          type="text"
        />
      </StrokeSettingsField>
    </div>
  );
};

export default StrokeSettingsBasicTab;
