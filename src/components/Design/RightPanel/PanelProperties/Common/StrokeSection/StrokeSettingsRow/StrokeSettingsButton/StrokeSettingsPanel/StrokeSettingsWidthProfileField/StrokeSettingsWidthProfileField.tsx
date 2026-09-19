import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// @xigma
import { Tooltip } from '@xigma/components';

// components
import StrokeSettingsField from '../StrokeSettingsField/StrokeSettingsField';
import { UITools } from 'shared';

// hooks
import { useStrokeSettingsWidthProfileField } from './hooks/useStrokeSettingsWidthProfileField';

// others
import { getStrokeProfileOptions } from '../StrokeSettingsBasicTab/utils/getStrokeProfileOptions';
import { isStrokeProfileFlippable } from '../StrokeSettingsBasicTab/utils/isStrokeProfileFlippable';
import { translationNameSpace } from '../../../../constants';

// styles
import fieldStyles from '../StrokeSettingsField/stroke-settings-field.module.scss';
import styles from './stroke-settings-width-profile-field.module.scss';

// types
import { StrokeProfile } from 'types/design/enums';

export type TStrokeSettingsWidthProfileFieldProps = {
  disabled?: boolean;
};

export const StrokeSettingsWidthProfileField: FC<TStrokeSettingsWidthProfileFieldProps> = ({ disabled = false }) => {
  const { t } = useTranslation();
  const { flipped, onFlipToggle, onProfileSelect, profile } = useStrokeSettingsWidthProfileField();
  const namespace = `${translationNameSpace}.settings`;
  const profileOptions = getStrokeProfileOptions((option) => t(`${namespace}.widthProfile.options.${option}`));

  return (
    <StrokeSettingsField label={t(`${namespace}.widthProfile.label`)}>
      <Tooltip content={disabled ? t(`${namespace}.widthProfile.dashedDisabledTooltip`) : undefined}>
        <span className={styles.StrokeSettingsWidthProfileField__tooltipTarget}>
          <UITools.Dropdown<StrokeProfile>
            bypassGlobalShortcuts={false}
            className={fieldStyles.StrokeSettingsField__input}
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
    </StrokeSettingsField>
  );
};

export default StrokeSettingsWidthProfileField;
