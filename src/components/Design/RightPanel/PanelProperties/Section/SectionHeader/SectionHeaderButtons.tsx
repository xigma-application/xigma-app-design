import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import PanelHeaderWrapInSectionButton from '../../Common/PanelHeader/PanelHeaderWrapInSectionButton';
import { Tooltip, UITools } from 'shared';

// others
import { translationNameSpace } from './constants';

// styles
import styles from './section-header-buttons.module.scss';

const SectionHeaderButtons: FC = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.SectionHeaderButtons}>
      <Tooltip align="end" content={t(`${translationNameSpace}.htmlTagTooltip`)}>
        <UITools.ButtonIcon ariaLabel={t(`${translationNameSpace}.htmlTagAriaLabel`)} name="HtmlTag" />
      </Tooltip>
      <PanelHeaderWrapInSectionButton />
    </div>
  );
};

export default SectionHeaderButtons;
