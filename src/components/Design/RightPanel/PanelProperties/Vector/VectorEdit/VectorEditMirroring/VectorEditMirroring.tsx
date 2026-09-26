import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { UITools } from 'shared';

// hooks
import { useVectorEditMirroring } from '../hooks/useVectorEditMirroring';

// others
import { MIRRORING_OPTIONS, translationNameSpace } from '../constants';

const VectorEditMirroring: FC = () => {
  const { t } = useTranslation();
  const { disabled, onChange, value } = useVectorEditMirroring();

  return (
    <UITools.SectionColumn gridColumnType={UITools.GridColumnType.single} labels={[t(`${translationNameSpace}.mirroring.label`)]} withBottomMargin>
      <UITools.ToggleButtonGroup
        disabled={disabled}
        e2eValue="mirroring"
        onChange={onChange}
        toggleButtons={MIRRORING_OPTIONS.map(({ icon, labelKey, value: optionValue }) => ({
          ariaLabel: t(labelKey),
          icon,
          tooltip: t(labelKey),
          value: optionValue,
        }))}
        value={value}
      />
    </UITools.SectionColumn>
  );
};

export default VectorEditMirroring;
