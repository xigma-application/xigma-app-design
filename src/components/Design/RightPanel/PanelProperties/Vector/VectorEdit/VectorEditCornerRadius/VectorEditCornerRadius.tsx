import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import CornerRadiusInput from '../../../Common/AppearanceSection/CornerRadius/CornerRadiusInput';
import { UITools } from 'shared';

// hooks
import { useVectorEditCornerRadius } from '../hooks/useVectorEditCornerRadius';

// others
import { translationNameSpace } from '../../../Common/AppearanceSection/constants';

const VectorEditCornerRadius: FC = () => {
  const { t } = useTranslation();
  const { iconName, onCommit, onScrub, value, valueLabel } = useVectorEditCornerRadius();

  return (
    <UITools.SectionColumn gridColumnType={UITools.GridColumnType.twoInputs} labels={[t(`${translationNameSpace}.cornerRadius.ariaLabel`)]}>
      <CornerRadiusInput
        ariaLabel={t(`${translationNameSpace}.cornerRadius.ariaLabel`)}
        e2eValue="corner-radius"
        iconName={iconName}
        onCommit={onCommit}
        onScrub={onScrub}
        scrubValue={value}
        tooltip={t(`${translationNameSpace}.cornerRadius.tooltip`)}
        value={valueLabel}
      />
    </UITools.SectionColumn>
  );
};

export default VectorEditCornerRadius;
