import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Icon } from 'shared';

// hooks
import { useToggleExpandClick } from './hooks/useToggleExpandClick';

// others
import { NODE_ROW_COLLAPSE_ARIA_LABEL_KEY, NODE_ROW_EXPAND_ARIA_LABEL_KEY } from 'components/Design/LeftPanel/File/Layers/constants';

// styles
import styles from '../tree-item.module.scss';

export type TTreeItemToggleProps = {
  isExpandable: boolean;
  isExpanded: boolean;
  onToggleExpand: TFunc;
};

const TreeItemToggle: FC<TTreeItemToggleProps> = ({ isExpandable, isExpanded, onToggleExpand }) => {
  const { t } = useTranslation();
  const handleToggleExpandClick = useToggleExpandClick(onToggleExpand);

  return (
    <div className={styles.TreeItem__toggle}>
      {isExpandable && (
        <button
          aria-label={t(isExpanded ? NODE_ROW_COLLAPSE_ARIA_LABEL_KEY : NODE_ROW_EXPAND_ARIA_LABEL_KEY)}
          className={styles.TreeItem__toggleButton}
          onClick={handleToggleExpandClick}
          type="button"
        >
          <Icon color="neutral2" name={isExpanded ? 'ChevronDown' : 'ChevronRight'} size={12} />
        </button>
      )}
    </div>
  );
};

export default TreeItemToggle;
