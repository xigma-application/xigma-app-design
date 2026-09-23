import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import PanelHeaderComponentButton from '../../Common/PanelHeader/PanelHeaderComponentButton';
import PanelHeaderMatchingLayersButton from '../../Common/PanelHeader/PanelHeaderMatchingLayersButton';
import { Tooltip, UITools } from 'shared';

// others
import { translationNameSpace } from './constants';

// styles
import styles from './frame-header-buttons.module.scss';

const FrameHeaderButtons: FC = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.FrameHeaderButtons}>
      <PanelHeaderMatchingLayersButton />
      <Tooltip align="end" content={t(`${translationNameSpace}.htmlTagTooltip`)}>
        <UITools.ButtonIcon ariaLabel={t(`${translationNameSpace}.htmlTagAriaLabel`)} name="HtmlTag" />
      </Tooltip>
      <PanelHeaderComponentButton />
    </div>
  );
};

export default FrameHeaderButtons;
