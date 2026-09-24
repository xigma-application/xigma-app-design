import { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { UITools } from 'shared';

// others
import { KEYBOARD_SHORTCUTS } from 'components/Design/keys';
import { translationNameSpace } from './constants';

const { PopoverItem } = UITools.PopoverCompound;

export const PanelHeaderComponentMenuItems: FC = () => {
  const { t } = useTranslation();

  return (
    <Fragment>
      <PopoverItem
        icon="Component"
        label={t(`${translationNameSpace}.componentTooltip`)}
        shortcut={KEYBOARD_SHORTCUTS.createComponent.join('')}
        withCheck={false}
      />
      <PopoverItem icon="ComponentMultiple" label={t(`${translationNameSpace}.createMultipleComponents`)} withCheck={false} />
      <PopoverItem icon="ComponentSet" label={t(`${translationNameSpace}.createComponentSet`)} withCheck={false} />
    </Fragment>
  );
};

export default PanelHeaderComponentMenuItems;
