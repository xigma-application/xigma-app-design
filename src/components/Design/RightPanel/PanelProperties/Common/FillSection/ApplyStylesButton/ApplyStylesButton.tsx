import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Icon, Tooltip, UITools } from 'shared';

// others
import { translationNameSpace } from '../constants';

export const ApplyStylesButton: FC = () => {
  const { t } = useTranslation();

  return (
    <Tooltip align="end" content={t(`${translationNameSpace}.applyStylesTooltip`)}>
      <UITools.Button ariaLabel={t(`${translationNameSpace}.applyStylesAriaLabel`)} style={{ padding: 0 }}>
        <Icon name="StylesAndVariables" size={24} />
      </UITools.Button>
    </Tooltip>
  );
};

export default ApplyStylesButton;
