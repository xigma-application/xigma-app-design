import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Tooltip, UITools } from 'shared';

// others
import { translationNameSpace } from './constants';

export type TContrastCheckerButtonProps = { isActive: boolean; onToggle?: TFunc };

export const ContrastCheckerButton: FC<TContrastCheckerButtonProps> = ({ isActive, onToggle }) => {
  const { t } = useTranslation();
  const label = t(`${translationNameSpace}.toggleAriaLabel`);

  return (
    <Tooltip content={label}>
      <UITools.ButtonIcon ariaLabel={label} name="Contrast" onClick={onToggle} selected={isActive} />
    </Tooltip>
  );
};

export default ContrastCheckerButton;
