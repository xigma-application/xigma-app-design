import cx from 'classnames';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// @xigma
import { Tooltip } from '@xigma/components';

// components
import { UITools } from 'shared';

// hooks
import { useStrokeSettingsWidthProfileField } from '../hooks/useStrokeSettingsWidthProfileField';

// others
import { getStrokeProfileOptions } from '../../StrokeSettingsBasicTab/utils/getStrokeProfileOptions';
import { isStrokeProfileFlippable } from '../../StrokeSettingsBasicTab/utils/isStrokeProfileFlippable';
import { translationNameSpace } from '../../../../../constants';

// styles
import styles from './stroke-settings-width-profile-control.module.scss';

// types
import { StrokeProfile } from 'types/design/enums';

export type TStrokeSettingsWidthProfileControlProps = {
  className?: string;
  disabled?: boolean;
};

export const StrokeSettingsWidthProfileControl: FC<TStrokeSettingsWidthProfileControlProps> = ({ className, disabled = false }) => {
  const { t } = useTranslation();
  const { flipped, onFlipToggle, onProfileSelect, profile } = useStrokeSettingsWidthProfileField();
  const namespace = `${translationNameSpace}.settings`;
  const profileOptions = getStrokeProfileOptions((option) => t(`${namespace}.widthProfile.options.${option}`));

  return (
    <div className={cx(styles.StrokeSettingsWidthProfileControl, className)}>
      <Tooltip content={disabled ? t(`${namespace}.widthProfile.dashedDisabledTooltip`) : undefined}>
        <span className={styles.StrokeSettingsWidthProfileControl__tooltipTarget}>
          <UITools.Dropdown<StrokeProfile>
            bypassGlobalShortcuts={false}
            className={styles.StrokeSettingsWidthProfileControl__dropdown}
            disabled={disabled}
            onSelect={onProfileSelect}
            options={profileOptions}
            textAlign="left"
            value={profile}
            variant="outline"
          />
        </span>
      </Tooltip>
      <Tooltip content={t(`${namespace}.widthProfile.flipTooltip`)}>
        <UITools.ButtonIcon
          ariaLabel={t(`${namespace}.widthProfile.flipAriaLabel`)}
          disabled={disabled || !isStrokeProfileFlippable(profile)}
          name="FlipHorizontal"
          onClick={onFlipToggle}
          selected={flipped}
        />
      </Tooltip>
    </div>
  );
};

export default StrokeSettingsWidthProfileControl;
