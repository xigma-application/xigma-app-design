import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// @xigma
import { Icon } from '@xigma/components';

// components
import { UITools } from 'shared';

// hooks
import { useDistributeMenu } from './hooks/useDistributeMenu';

// others
import { DISTRIBUTE_OPTIONS, translationNameSpace } from '../constants';
import { KEYBOARD_SHORTCUTS } from 'components/Design/keys';

const { PopoverItem } = UITools.PopoverCompound;

export const DistributeMenu: FC = () => {
  const { t } = useTranslation();
  const { canDistribute, onDistribute } = useDistributeMenu();

  return (
    <UITools.ButtonMenu
      align="end"
      trigger={<Icon name="DistributeVerticalSpacing" size={24} />}
      triggerAriaLabel={t(`${translationNameSpace}.moreActions`)}
      triggerTooltip={t(`${translationNameSpace}.moreActions`)}
    >
      {DISTRIBUTE_OPTIONS.map(({ axis, labelKey, name, shortcutKey }) => (
        <PopoverItem
          disabled={axis === undefined || !canDistribute}
          icon={name}
          iconSize={24}
          key={labelKey}
          label={t(labelKey)}
          onClick={axis ? (): void => onDistribute(axis) : undefined}
          shortcut={KEYBOARD_SHORTCUTS[shortcutKey].join('')}
          withCheck={false}
        />
      ))}
    </UITools.ButtonMenu>
  );
};

export default DistributeMenu;
