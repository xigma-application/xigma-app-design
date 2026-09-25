import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Icon, UITools } from 'shared';

// hooks
import { useEditObject } from '../../../Common/PanelHeader/hooks/useEditObject';

// others
import { translationNameSpace } from '../constants';
import { translationNameSpace as commonNameSpace } from '../../../Common/PanelHeader/constants';

const { PopoverItem, PopoverSeparator } = UITools.PopoverCompound;

export const LineMoreActionsButton: FC = () => {
  const { t } = useTranslation();
  const handleEditObject = useEditObject();

  return (
    <UITools.ButtonMenu
      align="end"
      trigger={<Icon name="MoreOptions" size={24} />}
      triggerAriaLabel={t(`${commonNameSpace}.moreActions`)}
      triggerTooltip={t(`${commonNameSpace}.moreActions`)}
    >
      <PopoverItem icon="EditObject" label={t(`${commonNameSpace}.editObjectTooltip`)} onClick={handleEditObject} withCheck={false} />
      <PopoverSeparator />
      <PopoverItem disabled icon="OffsetVector" label={t(`${translationNameSpace}.offsetVector`)} withCheck={false} />
    </UITools.ButtonMenu>
  );
};

export default LineMoreActionsButton;
