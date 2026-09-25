import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Icon, UITools } from 'shared';

// hooks
import { useEditObject } from '../../../Common/PanelHeader/hooks/useEditObject';
import { useStartOffsetVector } from './hooks/useStartOffsetVector';

// others
import { translationNameSpace } from '../constants';
import { translationNameSpace as commonNameSpace } from '../../../Common/PanelHeader/constants';

const { PopoverItem, PopoverSeparator } = UITools.PopoverCompound;

export const LineMoreActionsButton: FC = () => {
  const { t } = useTranslation();
  const handleEditObject = useEditObject();
  const { canStart, onStart } = useStartOffsetVector();

  return (
    <UITools.ButtonMenu
      align="end"
      trigger={<Icon name="MoreOptions" size={24} />}
      triggerAriaLabel={t(`${commonNameSpace}.moreActions`)}
      triggerTooltip={t(`${commonNameSpace}.moreActions`)}
    >
      <PopoverItem icon="EditObject" label={t(`${commonNameSpace}.editObjectTooltip`)} onClick={handleEditObject} withCheck={false} />
      <PopoverSeparator />
      <PopoverItem
        disabled={!canStart}
        icon="OffsetVector"
        label={t(`${translationNameSpace}.offsetVector`)}
        onClick={onStart}
        withCheck={false}
      />
    </UITools.ButtonMenu>
  );
};

export default LineMoreActionsButton;
