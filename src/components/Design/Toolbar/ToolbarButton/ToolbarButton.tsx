import cx from 'classnames';
import { FC, Fragment } from 'react';

// @xigma
import { TIconProps } from '@xigma/components';

// components
import { Icon, Tooltip, UITools } from 'shared';

// styles
import styles from './toolbar-button.module.scss';

const ICON_SIZE = 24;

export type TToolbarButtonProps = {
  icon: TIconProps['name'];
  isActive: boolean;
  label?: string;
  onClick?: TFunc;
  shortcut?: string;
  tooltip: string;
};

const ToolbarButton: FC<TToolbarButtonProps> = ({ icon, isActive, label, onClick, shortcut, tooltip }) => (
  <Tooltip
    content={
      <Fragment>
        {tooltip}
        {shortcut && <span className={styles.ToolbarButton__shortcut}>{shortcut}</span>}
      </Fragment>
    }
  >
    <UITools.Button
      active={isActive}
      ariaLabel={tooltip}
      className={cx(styles.ToolbarButton, { [styles['ToolbarButton--active']]: isActive })}
      onClick={onClick}
      variant="link"
    >
      <Icon color={isActive ? 'onBlue1' : 'neutral1'} name={icon} size={ICON_SIZE} />
      {label && <span className={cx(styles.ToolbarButton__label, { [styles['ToolbarButton__label--active']]: isActive })}>{label}</span>}
    </UITools.Button>
  </Tooltip>
);

export default ToolbarButton;
