import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { UITools } from 'shared';

// hooks
import { useConvertGroup } from '../hooks/useConvertGroup';

// others
import { FLOW_OPTIONS, translationNameSpace } from '../../Frame/LayoutSection/ColumnFlow/constants';

// types
import { LayoutMode } from 'types/design/enums';

const GroupFlow: FC = () => {
  const { t } = useTranslation();
  const { onConvertToFlow } = useConvertGroup();

  return (
    <UITools.SectionColumn gridColumnType={UITools.GridColumnType.single} labels={[t(`${translationNameSpace}.label`)]} withBottomMargin>
      <UITools.ToggleButtonGroup
        e2eValue="flow"
        onChange={onConvertToFlow}
        toggleButtons={FLOW_OPTIONS.map(({ icon, labelKey, value }) => ({
          ariaLabel: t(`${translationNameSpace}.${labelKey}`),
          icon,
          tooltip: t(`${translationNameSpace}.${labelKey}`),
          value,
        }))}
        value={LayoutMode.freeForm}
      />
    </UITools.SectionColumn>
  );
};

export default GroupFlow;
