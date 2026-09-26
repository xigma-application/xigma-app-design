import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { noop } from 'lodash';

// components
import { UITools } from 'shared';

// others
import { MIRRORING_OPTIONS, translationNameSpace } from '../constants';

const VectorEditMirroring: FC = () => {
  const { t } = useTranslation();

  return (
    <UITools.SectionColumn gridColumnType={UITools.GridColumnType.single} labels={[t(`${translationNameSpace}.mirroring.label`)]} withBottomMargin>
      <UITools.ToggleButtonGroup
        disabled
        e2eValue="mirroring"
        onChange={noop}
        toggleButtons={MIRRORING_OPTIONS.map(({ icon, labelKey, value }) => ({
          ariaLabel: t(labelKey),
          icon,
          tooltip: t(labelKey),
          value,
        }))}
        value=""
      />
    </UITools.SectionColumn>
  );
};

export default VectorEditMirroring;
