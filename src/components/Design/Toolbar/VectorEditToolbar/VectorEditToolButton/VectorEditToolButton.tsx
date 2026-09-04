import cx from 'classnames';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Icon, Tooltip, UITools } from 'shared';

// hooks
import { useSelectVectorEditTool } from './hooks/useSelectVectorEditTool';

// others
import { ICON_SIZE, TVectorEditTool } from '../constants';

// styles
import styles from '../vector-edit-toolbar.module.scss';

export type TVectorEditToolButtonProps = {
  isActive: boolean;
  tool: TVectorEditTool;
};

const VectorEditToolButton: FC<TVectorEditToolButtonProps> = ({ isActive, tool }) => {
  const { t } = useTranslation();
  const handleClick = useSelectVectorEditTool(tool.toolName);

  return (
    <Tooltip
      content={
        <>
          {t(tool.labelKey)}
          {tool.shortcut && <span className={styles.VectorEditToolbar__shortcut}>{tool.shortcut.join('')}</span>}
        </>
      }
    >
      <UITools.Button active={isActive} className={styles['VectorEditToolbar__tool-button']} onClick={handleClick}>
        <Icon color={isActive ? 'onBlue1' : 'neutral1'} name={tool.icon} size={ICON_SIZE} />
        <span className={cx(styles.VectorEditToolbar__label, { [styles['VectorEditToolbar__label--active']]: isActive })}>
          {t(tool.labelKey)}
        </span>
      </UITools.Button>
    </Tooltip>
  );
};

export default VectorEditToolButton;
