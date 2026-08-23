import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import VectorEditToolButton from './VectorEditToolButton/VectorEditToolButton';
import { Icon, Popover, PopoverCompound, Tooltip } from 'shared';

// hooks
import { getIsVectorEditToolActive, useVectorEditToolbar } from './hooks/useVectorEditToolbar';

// others
import { ICON_SIZE, MORE_TOOLS, TOOLS, translationNameSpace } from './constants';

// styles
import styles from './vector-edit-toolbar.module.scss';

const { PopoverItem } = PopoverCompound;

const VectorEditToolbar: FC = () => {
  const { t } = useTranslation();
  const { activeTool, handleClose, handleMoreOpenChange, isBendModifierHeld, isMoreOpen, vectorEditingNodeIds } = useVectorEditToolbar();

  if (vectorEditingNodeIds.length === 0) {
    return null;
  }

  return (
    <div className={styles.VectorEditToolbar}>
      {TOOLS.slice(0, 2).map((tool) => (
        <VectorEditToolButton
          isActive={getIsVectorEditToolActive(tool.toolName, activeTool, isBendModifierHeld)}
          key={tool.labelKey}
          tool={tool}
        />
      ))}
      <div className={styles.VectorEditToolbar__separator} />
      {TOOLS.slice(2).map((tool) => (
        <VectorEditToolButton
          isActive={getIsVectorEditToolActive(tool.toolName, activeTool, isBendModifierHeld)}
          key={tool.labelKey}
          tool={tool}
        />
      ))}
      <div className={styles.VectorEditToolbar__separator} />
      <Popover
        onOpenChange={handleMoreOpenChange}
        side="top"
        trigger={
          <div className={styles.VectorEditToolbar__more}>
            <span className={styles.VectorEditToolbar__label} style={{ padding: '0' }}>
              {t(`${translationNameSpace}.more`)}
            </span>
            <Icon color={isMoreOpen ? 'blue1' : 'neutral1'} name="ChevronDown" size={16} />
          </div>
        }
        triggerAriaLabel={t(`${translationNameSpace}.more`)}
        triggerClassName={styles['VectorEditToolbar__more--trigger']}
      >
        {MORE_TOOLS.map((tool) => (
          <PopoverItem icon={tool.icon} iconSize={24} key={tool.labelKey} label={t(tool.labelKey)} shortcut={tool.shortcut} />
        ))}
      </Popover>
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
