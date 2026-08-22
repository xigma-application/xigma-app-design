import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Icon, Tooltip } from 'shared';

// hooks
import { useVectorEditToolbar } from './hooks/useVectorEditToolbar';

// others
import { ICON_SIZE, TOOLS, translationNameSpace } from './constants';

// styles
import styles from './vector-edit-toolbar.module.scss';

const VectorEditToolbar: FC = () => {
  const { t } = useTranslation();
  const { handleClose, renderTool, vectorEditingNodeIds } = useVectorEditToolbar();

  if (vectorEditingNodeIds.length === 0) {
    return null;
  }

  return (
    <div className={styles.VectorEditToolbar}>
      {TOOLS.slice(0, 2).map(renderTool)}
      <div className={styles.VectorEditToolbar__separator} />
      {TOOLS.slice(2).map(renderTool)}
      <div className={styles.VectorEditToolbar__separator} />
      <button className={styles.VectorEditToolbar__button} type="button">
        <div className={styles.VectorEditToolbar__more}>
          <span className={styles.VectorEditToolbar__label} style={{ padding: '0' }}>
            {t(`${translationNameSpace}.more`)}
          </span>
          <Icon name="ChevronDown" size={16} />
        </div>
      </button>
      <div className={styles.VectorEditToolbar__separator} />
      <Tooltip content={t('common.close')}>
        <button aria-label={t('common.close')} className={styles.VectorEditToolbar__button} onClick={handleClose} type="button">
          <Icon name="Close" size={ICON_SIZE} />
        </button>
      </Tooltip>
    </div>
  );
};

export default VectorEditToolbar;
