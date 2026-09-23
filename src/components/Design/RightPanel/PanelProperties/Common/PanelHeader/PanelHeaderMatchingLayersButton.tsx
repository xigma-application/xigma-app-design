import { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Tooltip, UITools } from 'shared';

// hooks
import { useSelectMatchingLayers } from './hooks/useSelectMatchingLayers';

// others
import { KEYBOARD_SHORTCUTS } from 'components/Design/keys';
import { translationNameSpace } from './constants';

// store
import { selectCanSelectMatchingLayers } from 'store/design/selectors';
import { useAppSelector } from 'store';

// styles
import styles from './panel-header.module.scss';

export const PanelHeaderMatchingLayersButton: FC = () => {
  const { t } = useTranslation();
  const canSelectMatchingLayers = useAppSelector(selectCanSelectMatchingLayers);
  const handleClick = useSelectMatchingLayers();

  if (canSelectMatchingLayers) {
    return (
      <Tooltip
        align="end"
        content={
          <Fragment>
            {t(`${translationNameSpace}.matchingLayersTooltip`)}
            <span className={styles.PanelHeader__shortcut}>{KEYBOARD_SHORTCUTS.selectMatchingLayers.join('')}</span>
          </Fragment>
        }
      >
        <UITools.ButtonIcon ariaLabel={t(`${translationNameSpace}.matchingLayersAriaLabel`)} name="MatchingLayers" onClick={handleClick} />
      </Tooltip>
    );
  }

  return null;
};

export default PanelHeaderMatchingLayersButton;
