import cx from 'classnames';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Icon, Tooltip } from 'shared';

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
      <button
        aria-pressed={isActive}
        className={cx(styles.VectorEditToolbar__button, { [styles['VectorEditToolbar__button--active']]: isActive })}
        onClick={handleClick}
        type="button"
      >
        <Icon color={isActive ? 'onBlue1' : 'neutral1'} name={tool.icon} size={ICON_SIZE} />
        <span className={cx(styles.VectorEditToolbar__label, { [styles['VectorEditToolbar__label--active']]: isActive })}>
          {t(tool.labelKey)}
        </span>
      </button>
    </Tooltip>
  );
};

export default VectorEditToolButton;
