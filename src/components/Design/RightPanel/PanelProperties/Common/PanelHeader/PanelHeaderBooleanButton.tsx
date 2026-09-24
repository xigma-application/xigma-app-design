import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Icon, Tooltip, UITools } from 'shared';

// others
import { KEYBOARD_SHORTCUTS } from 'components/Design/keys';
import { BOOLEAN_OPERATION_ITEMS, translationNameSpace } from './constants';

// styles
import styles from './panel-header.module.scss';

const { PopoverItem } = UITools.PopoverCompound;

export const PanelHeaderBooleanButton: FC = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.PanelHeader__boolean}>
      <Tooltip align="end" content={t(`${translationNameSpace}.booleanTooltip`)}>
        <UITools.ButtonIcon
          ariaLabel={t(`${translationNameSpace}.booleanAriaLabel`)}
          className={styles['PanelHeader__boolean-button']}
          name="BooleanUnion"
        />
      </Tooltip>
      <UITools.ButtonMenu
        align="end"
        className={styles['PanelHeader__boolean-options']}
        trigger={<Icon name="ChevronDown" size={24} />}
        triggerAriaLabel={t(`${translationNameSpace}.booleanMenuAriaLabel`)}
      >
        {BOOLEAN_OPERATION_ITEMS.map((item) => (
          <PopoverItem
            icon={item.icon}
            key={item.shortcutKey}
            label={t(item.labelKey)}
            shortcut={KEYBOARD_SHORTCUTS[item.shortcutKey].join('')}
            withCheck={false}
          />
        ))}
      </UITools.ButtonMenu>
    </div>
  );
};

export default PanelHeaderBooleanButton;
