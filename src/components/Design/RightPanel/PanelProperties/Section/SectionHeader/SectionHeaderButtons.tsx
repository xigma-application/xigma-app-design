import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Tooltip, UITools } from 'shared';

// others
import { translationNameSpace } from './constants';

const SectionHeaderButtons: FC = () => {
  const { t } = useTranslation();

  return (
    <Tooltip align="end" content={t(`${translationNameSpace}.htmlTagTooltip`)}>
      <UITools.ButtonIcon ariaLabel={t(`${translationNameSpace}.htmlTagAriaLabel`)} name="HtmlTag" />
    </Tooltip>
  );
};

export default SectionHeaderButtons;
