import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Icon, Tooltip, UITools } from 'shared';

// hooks
import { useBooleanOperation } from './hooks/useBooleanOperation';

// others
import { BOOLEAN_OPERATION_ICON } from 'utils/design/booleanOperation/constants';
import { BOOLEAN_OPERATION_ITEMS, BOOLEAN_OPERATION_LABEL_KEY, translationNameSpace } from './constants';
import { KEYBOARD_SHORTCUTS } from 'components/Design/keys';

// styles
import styles from './panel-header.module.scss';

const { PopoverItem } = UITools.PopoverCompound;

export const PanelHeaderBooleanButton: FC = () => {
  const { t } = useTranslation();
  const { onApply, onFlatten, operation } = useBooleanOperation();

  return (
    <div className={styles.PanelHeader__split}>
      <Tooltip align="end" content={t(`${translationNameSpace}.booleanTooltip`)}>
        <UITools.ButtonIcon
          ariaLabel={t(`${translationNameSpace}.booleanAriaLabel`)}
          className={styles['PanelHeader__split-button']}
          name={BOOLEAN_OPERATION_ICON[operation]}
          onClick={onApply(operation)}
        />
      </Tooltip>
      <UITools.ButtonMenu
        align="end"
        className={styles['PanelHeader__split-options']}
        trigger={<Icon name="ChevronDown" size={24} />}
        triggerAriaLabel={t(`${translationNameSpace}.booleanMenuAriaLabel`)}
      >
        {BOOLEAN_OPERATION_ITEMS.map((item) => (
          <PopoverItem
            icon={BOOLEAN_OPERATION_ICON[item.operation]}
            key={item.operation}
            label={t(BOOLEAN_OPERATION_LABEL_KEY[item.operation])}
            onClick={onApply(item.operation)}
            shortcut={KEYBOARD_SHORTCUTS[item.shortcutKey].join('')}
            withCheck={false}
          />
        ))}
        <PopoverItem
          icon="Flatten"
          label={t(`${translationNameSpace}.flatten`)}
          onClick={onFlatten}
          shortcut={KEYBOARD_SHORTCUTS.flatten.join('')}
          withCheck={false}
        />
      </UITools.ButtonMenu>
    </div>
  );
};

export default PanelHeaderBooleanButton;
