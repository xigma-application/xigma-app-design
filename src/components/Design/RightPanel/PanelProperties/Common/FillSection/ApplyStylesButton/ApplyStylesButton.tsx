import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Tooltip, UITools } from 'shared';

// others
import { translationNameSpace } from '../constants';

export const ApplyStylesButton: FC = () => {
  const { t } = useTranslation();

  return (
    <Tooltip align="end" content={t(`${translationNameSpace}.applyStylesTooltip`)}>
      <UITools.ButtonIcon
        ariaLabel={t(`${translationNameSpace}.applyStylesAriaLabel`)}
        data-section-idle-hidden
        name="StylesAndVariables"
      />
    </Tooltip>
  );
};

export default ApplyStylesButton;
