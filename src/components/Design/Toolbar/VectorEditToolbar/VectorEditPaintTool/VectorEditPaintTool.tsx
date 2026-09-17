import cx from 'classnames';
import { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

// components
import FaceBlendModeButton from './FaceBlendModeButton/FaceBlendModeButton';
import ToolbarButton from '../../ToolbarButton/ToolbarButton';
import { UITools } from 'shared';

// hooks
import { usePaintColorPickerValue } from './hooks/usePaintColorPickerValue';
import { useSelectVectorEditTool } from '../VectorEditToolButton/hooks/useSelectVectorEditTool';

// others
import { TVectorEditTool } from '../constants';

// styles
import toolbarButtonStyles from '../../ToolbarButton/toolbar-button.module.scss';
import styles from './vector-edit-paint-tool.module.scss';

export type TVectorEditPaintToolProps = {
  isActive: boolean;
  tool: TVectorEditTool;
};

const VectorEditPaintTool: FC<TVectorEditPaintToolProps> = ({ isActive, tool }) => {
  const { t } = useTranslation();
  const handleSelect = useSelectVectorEditTool(tool.toolName);
  const { onChange: handleChange, onDragEnd, onDragStart, onGradientChange, value } = usePaintColorPickerValue();
  const label = t(tool.labelKey);

  if (isActive) {
    return (
      <UITools.ColorPicker
        freezePositionOnGrow
        headerExtra={<FaceBlendModeButton />}
        moveable
        onChange={handleChange}
        onDragEnd={onDragEnd}
        onDragStart={onDragStart}
        onGradientChange={onGradientChange}
        trigger={(preview): ReactNode => (
          <>
            <div className={styles['VectorEditPaintTool__swatch-wrapper']}>
              {preview.type === 'gradient' ? (
                <div className={styles.VectorEditPaintTool__swatch} style={preview.style} />
              ) : (
                <UITools.Color alpha={preview.value.alpha} className={styles.VectorEditPaintTool__swatch} color={preview.value.hex} />
              )}
            </div>
            <span className={cx(toolbarButtonStyles.ToolbarButton__label, toolbarButtonStyles['ToolbarButton__label--active'])}>
              {label}
            </span>
          </>
        )}
        triggerAriaLabel={label}
        triggerClassName={styles.VectorEditPaintTool__trigger}
        value={value}
      />
    );
  }

  return (
    <ToolbarButton
      icon={tool.icon}
      isActive={false}
      label={label}
      onClick={handleSelect}
      shortcut={tool.shortcut?.join('')}
      tooltip={label}
    />
  );
};

export default VectorEditPaintTool;
