import cx from 'classnames';
import { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

// components
import FaceBlendModeButton from './FaceBlendModeButton/FaceBlendModeButton';
import ToolbarButton from '../../ToolbarButton/ToolbarButton';
import { UITools } from 'shared';

// hooks
import { usePaintColorPickerValue } from './hooks/usePaintColorPickerValue';
import { usePaintFillThumbnail } from './hooks/usePaintFillThumbnail';
import { useSelectVectorEditTool } from '../VectorEditToolButton/hooks/useSelectVectorEditTool';

// others
import { ColorPickerTab } from 'shared/UITools/ColorPicker/enums';
import { TVectorEditTool } from '../constants';

// store
import { selectPaintFill } from 'store/design/selectors';
import { useAppSelector } from 'store';

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
  const paintFill = useAppSelector(selectPaintFill);
  const thumbnailUrl = usePaintFillThumbnail(paintFill);

  if (isActive) {
    return (
      <UITools.ColorPicker
        align="center"
        freezePositionOnGrow
        headerExtra={<FaceBlendModeButton />}
        initialActiveTab={paintFill ? ColorPickerTab.none : undefined}
        moveable
        onChange={handleChange}
        onDragEnd={onDragEnd}
        onDragStart={onDragStart}
        onGradientChange={onGradientChange}
        side="top"
        trigger={(preview): ReactNode => (
          <>
            <div className={styles['VectorEditPaintTool__swatch-wrapper']}>
              {preview.type === 'gradient' ? (
                <div className={styles.VectorEditPaintTool__swatch} style={preview.style} />
              ) : (
                <UITools.Color
                  alpha={preview.value.alpha}
                  className={styles.VectorEditPaintTool__swatch}
                  color={preview.value.hex}
                  thumbnailUrl={paintFill ? thumbnailUrl : null}
                />
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
