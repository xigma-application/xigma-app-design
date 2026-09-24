import { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

// components
import PanelHeaderComponentMenuItems from './PanelHeaderComponentMenuItems';
import { Icon, UITools } from 'shared';

// hooks
import { useEditObject } from './hooks/useEditObject';
import { useIsSelectionFromOneParent } from './hooks/useIsSelectionFromOneParent';

// others
import { KEYBOARD_SHORTCUTS } from 'components/Design/keys';
import { translationNameSpace } from './constants';

const { PopoverItem, PopoverSeparator } = UITools.PopoverCompound;

export type TPanelHeaderMoreActionsButtonProps = {
  withEditObjects?: boolean;
};

export const PanelHeaderMoreActionsButton: FC<TPanelHeaderMoreActionsButtonProps> = ({ withEditObjects = true }) => {
  const { t } = useTranslation();
  const handleEditObjects = useEditObject();
  const isFromOneParent = useIsSelectionFromOneParent();

  return (
    <UITools.ButtonMenu
      align="end"
      trigger={<Icon name="MoreOptions" size={24} />}
      triggerAriaLabel={t(`${translationNameSpace}.moreActions`)}
      triggerTooltip={t(`${translationNameSpace}.moreActions`)}
    >
      <PanelHeaderComponentMenuItems />
      {isFromOneParent && (
        <Fragment>
          <PopoverSeparator />
          {withEditObjects && (
            <PopoverItem icon="EditObject" label={t(`${translationNameSpace}.editObjects`)} onClick={handleEditObjects} withCheck={false} />
          )}
          <PopoverItem
            icon="SectionTool"
            label={t(`${translationNameSpace}.wrapInSectionTooltip`)}
            shortcut={KEYBOARD_SHORTCUTS.wrapInNewSection.join('')}
            withCheck={false}
          />
        </Fragment>
      )}
    </UITools.ButtonMenu>
  );
};

export default PanelHeaderMoreActionsButton;
