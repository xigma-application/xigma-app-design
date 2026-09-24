import { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Tooltip, UITools } from 'shared';

// hooks
import { useWrapSelectionInSection } from 'components/Design/Menu/hooks/useWrapSelectionInSection';

// others
import { KEYBOARD_SHORTCUTS } from 'components/Design/keys';
import { translationNameSpace } from './constants';

// store
import { selectCanWrapInSection, selectSelectedIds } from 'store/design/selectors';
import { useAppSelector } from 'store';

// styles
import styles from './panel-header.module.scss';

export const PanelHeaderWrapInSectionButton: FC = () => {
  const { t } = useTranslation();
  const selectedIds = useAppSelector(selectSelectedIds);
  const canWrapInSection = useAppSelector(selectCanWrapInSection);
  const handleWrapInSection = useWrapSelectionInSection();

  if (selectedIds.length > 1 && canWrapInSection) {
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
        <UITools.ButtonIcon
          ariaLabel={t(`${translationNameSpace}.wrapInSectionAriaLabel`)}
          name="SectionTool"
          onClick={handleWrapInSection}
        />
      </Tooltip>
    );
  }

  return null;
};

export default PanelHeaderWrapInSectionButton;
