import { FC, ReactNode } from 'react';

// components
import { Icon, UITools } from 'shared';

// styles
import styles from './panel-header.module.scss';

// types
import { TE2EValue } from 'shared/E2EDataAttributes/types';

export type TPanelHeaderProps = {
  buttons: ReactNode;
  e2eValue: TE2EValue;
  label: string;
  menu?: ReactNode;
  menuAriaLabel?: string;
};

export const PanelHeader: FC<TPanelHeaderProps> = ({ buttons, e2eValue, label, menu, menuAriaLabel }) => (
  <UITools.ComponentHeader buttons={buttons} e2eValue={e2eValue}>
    {menu ? (
      <UITools.ButtonMenu
        className={styles.PanelHeader__trigger}
        scrollable
        trigger={
          <span className={styles.PanelHeader__label}>
            {label}
            <Icon name="ChevronDown" size={16} />
          </span>
        }
        triggerAriaLabel={menuAriaLabel}
      >
        {menu}
      </UITools.ButtonMenu>
    ) : (
      <span className={styles.PanelHeader__label}>{label}</span>
    )}
  </UITools.ComponentHeader>
);

export default PanelHeader;
