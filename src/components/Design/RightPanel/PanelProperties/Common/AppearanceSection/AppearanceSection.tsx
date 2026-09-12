import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import AppearanceHeaderButtons from './AppearanceHeaderButtons/AppearanceHeaderButtons';
import CornerRadiusButtonIcons from './CornerRadius/CornerRadiusButtonIcons';
import CornerRadiusFieldList from './CornerRadius/CornerRadiusFieldList';
import CornerRadiusInput from './CornerRadius/CornerRadiusInput';
import CornerSmoothingButton from './CornerRadius/CornerSmoothingButton/CornerSmoothingButton';
import OpacityField from './Opacity/OpacityField';
import { UITools } from 'shared';

// hooks
import { useCornerRadius } from './CornerRadius/hooks/useCornerRadius/useCornerRadius';
import { useOpacity } from './Opacity/hooks/useOpacity';

// others
import { translationNameSpace } from './constants';

const AppearanceSection: FC = () => {
  const { t } = useTranslation();
  const opacity = useOpacity();
  const cornerRadius = useCornerRadius();

  return (
    <UITools.Section component={<AppearanceHeaderButtons />} e2eValue="appearance" label={t(`${translationNameSpace}.label`)}>
      <UITools.SectionColumn
        buttonsIcon={CornerRadiusButtonIcons(cornerRadius.isIndividual, cornerRadius.toggleIndividual, t)}
        gridColumnType={UITools.GridColumnType.twoInputs}
        labels={[t(`${translationNameSpace}.opacity.ariaLabel`), t(`${translationNameSpace}.cornerRadius.ariaLabel`)]}
        withBottomMargin={cornerRadius.isIndividual}
      >
        <OpacityField onBlur={opacity.onBlur} onScrub={opacity.onScrub} value={opacity.value} />
        <CornerRadiusInput
          ariaLabel={t(`${translationNameSpace}.cornerRadius.ariaLabel`)}
          e2eValue="corner-radius"
          iconName="Corners"
          onCommit={cornerRadius.onMergedCommit}
          onScrub={cornerRadius.onMergedScrub}
          scrubValue={cornerRadius.mergedValue}
          tooltip={t(`${translationNameSpace}.cornerRadius.tooltip`)}
          value={cornerRadius.isMixed ? t(`${translationNameSpace}.cornerRadius.mixed`) : cornerRadius.mergedValue}
        />
      </UITools.SectionColumn>
      {cornerRadius.isIndividual && (
        <UITools.SectionColumn
          buttonsIcon={[<CornerSmoothingButton key="corner-smoothing" />]}
          gridColumnType={UITools.GridColumnType.twoInputs}
          withBottomAlignedButtons
        >
          <CornerRadiusFieldList fields={cornerRadius.individualFields} />
        </UITools.SectionColumn>
      )}
    </UITools.Section>
  );
};

export default AppearanceSection;
