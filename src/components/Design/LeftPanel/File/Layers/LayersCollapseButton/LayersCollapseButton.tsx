import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Icon, Tooltip } from 'shared';

// hooks
import { useCollapseButtonClick } from './hooks/useCollapseButtonClick';

// others
import { KEYBOARD_SHORTCUTS } from 'components/Design/keys';
import { LAYERS_COLLAPSE_ALL_ARIA_LABEL_KEY } from '../constants';

// styles
import styles from './layers-collapse-button.module.scss';

export type TLayersCollapseButtonProps = {
  onCollapseAll: TFunc;
};

const LayersCollapseButton: FC<TLayersCollapseButtonProps> = ({ onCollapseAll }) => {
  const { t } = useTranslation();
  const handleClick = useCollapseButtonClick(onCollapseAll);
  const label = t(LAYERS_COLLAPSE_ALL_ARIA_LABEL_KEY);
  const shortcut = KEYBOARD_SHORTCUTS.collapseLayers.join('');

  return (
    <Tooltip
      content={
        <>
          {label}
          <span className={styles.LayersCollapseButton__shortcut}>{shortcut}</span>
        </>
      }
    >
      <button aria-label={label} className={styles.LayersCollapseButton} onClick={handleClick} type="button">
        <Icon color="neutral1" name="CollapseLayers" size={24} />
      </button>
    </Tooltip>
  );
};

export default LayersCollapseButton;
