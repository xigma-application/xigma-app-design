import { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Tooltip, UITools } from 'shared';

// others
import { KEYBOARD_SHORTCUTS } from 'components/Design/keys';
import { translationNameSpace } from './constants';

// store
import { selectSelectedIds } from 'store/design/selectors';
import { useAppSelector } from 'store';

// styles
import styles from './panel-header.module.scss';

export const PanelHeaderWrapInSectionButton: FC = () => {
  const { t } = useTranslation();
  const selectedIds = useAppSelector(selectSelectedIds);

  if (selectedIds.length > 1) {
    return (
      <Tooltip
        align="end"
        content={
          <Fragment>
            {t(`${translationNameSpace}.wrapInSectionTooltip`)}
            <span className={styles.PanelHeader__shortcut}>{KEYBOARD_SHORTCUTS.wrapInNewSection.join('')}</span>
          </Fragment>
        }
      >
        <UITools.ButtonIcon ariaLabel={t(`${translationNameSpace}.wrapInSectionAriaLabel`)} name="SectionTool" />
      </Tooltip>
    );
  }

  return null;
};

export default PanelHeaderWrapInSectionButton;
