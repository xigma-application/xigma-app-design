import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import ToolbarButton from '../ToolbarButton/ToolbarButton';
import VectorEditMoreDropdown from './VectorEditMoreDropdown/VectorEditMoreDropdown';
import VectorEditPaintTool from './VectorEditPaintTool/VectorEditPaintTool';
import VectorEditToolButton from './VectorEditToolButton/VectorEditToolButton';

// hooks
import { getIsVectorEditToolActive, useVectorEditToolbar } from './hooks/useVectorEditToolbar';

// others
import { TOOLS } from './constants';

// styles
import styles from './vector-edit-toolbar.module.scss';

// types
import { ToolName } from 'types/design/enums';

const VectorEditToolbar: FC = () => {
  const { t } = useTranslation();
  const { activeTool, handleClose, isBendModifierHeld, vectorEditingNodeIds } = useVectorEditToolbar();

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
      {TOOLS.slice(2).map((tool) =>
        tool.toolName === ToolName.paint ? (
          <VectorEditPaintTool
            isActive={getIsVectorEditToolActive(tool.toolName, activeTool, isBendModifierHeld)}
            key={tool.labelKey}
            tool={tool}
          />
        ) : (
          <VectorEditToolButton
            isActive={getIsVectorEditToolActive(tool.toolName, activeTool, isBendModifierHeld)}
            key={tool.labelKey}
            tool={tool}
          />
        ),
      )}
      <div className={styles.VectorEditToolbar__separator} />
      <VectorEditMoreDropdown />
      <div className={styles.VectorEditToolbar__separator} />
      <ToolbarButton icon="Close" isActive={false} onClick={handleClose} tooltip={t('common.close')} />
    </div>
  );
};

export default VectorEditToolbar;
