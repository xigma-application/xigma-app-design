import { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

// components
import PanelHeaderComponentButton from '../../Common/PanelHeader/PanelHeaderComponentButton';
import PanelHeaderComponentSplitButton from '../../Common/PanelHeader/PanelHeaderComponentSplitButton';
import PanelHeaderMaskButton from '../../Common/PanelHeader/PanelHeaderMaskButton';
import PanelHeaderMatchingLayersButton from '../../Common/PanelHeader/PanelHeaderMatchingLayersButton';
import PanelHeaderWrapInSectionButton from '../../Common/PanelHeader/PanelHeaderWrapInSectionButton';
import { Tooltip, UITools } from 'shared';

// others
import { translationNameSpace } from './constants';

// store
import { selectSelectedIds } from 'store/design/selectors';
import { useAppSelector } from 'store';

// styles
import styles from './frame-header-buttons.module.scss';

const FrameHeaderButtons: FC = () => {
  const { t } = useTranslation();
  const isMultiple = useAppSelector(selectSelectedIds).length > 1;
  const htmlTagButton = (
    <Tooltip align="end" content={t(`${translationNameSpace}.htmlTagTooltip`)}>
      <UITools.ButtonIcon ariaLabel={t(`${translationNameSpace}.htmlTagAriaLabel`)} name="HtmlTag" />
    </Tooltip>
  );

  return (
    <div className={styles.FrameHeaderButtons}>
      {isMultiple ? (
        <Fragment>
          {htmlTagButton}
          <PanelHeaderComponentSplitButton />
          <PanelHeaderMaskButton />
          <PanelHeaderWrapInSectionButton />
        </Fragment>
      ) : (
        <Fragment>
          <PanelHeaderMatchingLayersButton />
          {htmlTagButton}
          <PanelHeaderComponentButton />
        </Fragment>
      )}
    </div>
  );
};

export default FrameHeaderButtons;
