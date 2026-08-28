import cx from 'classnames';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import ColorPicker from 'shared/UITools/ColorPicker/ColorPicker';
import { Button, Color, Icon, Tooltip } from 'shared';

// hooks
import { usePaintColorPickerValue } from './hooks/usePaintColorPickerValue';
import { useSelectVectorEditTool } from '../VectorEditToolButton/hooks/useSelectVectorEditTool';

// others
import { ICON_SIZE, TVectorEditTool } from '../constants';

// styles
import toolbarStyles from '../vector-edit-toolbar.module.scss';
import styles from './vector-edit-paint-tool.module.scss';

export type TVectorEditPaintToolProps = {
  isActive: boolean;
  tool: TVectorEditTool;
};

const VectorEditPaintTool: FC<TVectorEditPaintToolProps> = ({ isActive, tool }) => {
  const { t } = useTranslation();
  const handleSelect = useSelectVectorEditTool(tool.toolName);
  const { onChange: handleChange, value } = usePaintColorPickerValue();
  const label = t(tool.labelKey);

  if (isActive) {
    return (
      <ColorPicker
        moveable
        onChange={handleChange}
        trigger={
          <>
            <div className={styles['VectorEditPaintTool__swatch-wrapper']}>
              <Color alpha={value.alpha} className={styles.VectorEditPaintTool__swatch} color={value.hex} />
            </div>
            <span className={cx(toolbarStyles.VectorEditToolbar__label, toolbarStyles['VectorEditToolbar__label--active'])}>{label}</span>
          </>
        }
        triggerAriaLabel={label}
        triggerClassName={styles.VectorEditPaintTool__trigger}
        value={value}
      />
    );
  }

  return (
    <Tooltip
      content={
        <>
          {label}
          {tool.shortcut && <span className={toolbarStyles.VectorEditToolbar__shortcut}>{tool.shortcut.join('')}</span>}
        </>
      }
    >
      <Button active={false} className={toolbarStyles['VectorEditToolbar__tool-button']} onClick={handleSelect}>
        <Icon color="neutral1" name={tool.icon} size={ICON_SIZE} />
        <span className={toolbarStyles.VectorEditToolbar__label}>{label}</span>
      </Button>
    </Tooltip>
  );
};

export default VectorEditPaintTool;
