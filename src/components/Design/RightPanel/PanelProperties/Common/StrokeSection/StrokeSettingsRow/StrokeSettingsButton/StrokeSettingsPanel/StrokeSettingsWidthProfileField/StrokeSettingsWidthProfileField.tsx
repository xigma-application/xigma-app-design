import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import StrokeSettingsWidthProfileControl from './StrokeSettingsWidthProfileControl/StrokeSettingsWidthProfileControl';
import { UITools } from 'shared';

// others
import { translationNameSpace } from '../../../../constants';

export type TStrokeSettingsWidthProfileFieldProps = {
  disabled?: boolean;
};

export const StrokeSettingsWidthProfileField: FC<TStrokeSettingsWidthProfileFieldProps> = ({ disabled = false }) => {
  const { t } = useTranslation();

  return (
    <UITools.Field
      Component={StrokeSettingsWidthProfileControl}
      controlWidth={128}
      disabled={disabled}
      label={t(`${translationNameSpace}.settings.widthProfile.label`)}
    />
  );
};

export default StrokeSettingsWidthProfileField;
