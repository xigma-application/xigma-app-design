import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import AppearanceHeaderButtons from './AppearanceHeaderButtons/AppearanceHeaderButtons';
import ArcRow from './Arc/ArcRow';
import BlendModeRow from './BlendModeRow/BlendModeRow';
import CornerRadiusButtonIcons from './CornerRadius/CornerRadiusButtonIcons';
import CornerRadiusFieldList from './CornerRadius/CornerRadiusFieldList';
import CornerRadiusInput from './CornerRadius/CornerRadiusInput';
import CornerSmoothingButton from './CornerRadius/CornerSmoothingButton/CornerSmoothingButton';
import EllipseCornerRadiusInput from './CornerRadius/EllipseCornerRadiusInput';
import OpacityField from './Opacity/OpacityField';
import { UITools } from 'shared';

// hooks
import { useCornerRadius } from './CornerRadius/hooks/useCornerRadius/useCornerRadius';
import { useOpacity } from './Opacity/hooks/useOpacity';

// others
import { MIXED_LABEL } from 'components/Design/RightPanel/PanelProperties/Common/constants';
import { translationNameSpace } from './constants';

export type TAppearanceSectionProps = {
  withArc?: boolean;
  withCornerRadius?: boolean;
  withEllipseCornerRadius?: boolean;
};

const AppearanceSection: FC<TAppearanceSectionProps> = ({ withArc = false, withCornerRadius = true, withEllipseCornerRadius = false }) => {
  const { t } = useTranslation();
  const opacity = useOpacity();
  const cornerRadius = useCornerRadius();

  return (
    <UITools.Section component={<AppearanceHeaderButtons />} e2eValue="appearance" label={t(`${translationNameSpace}.label`)}>
      <UITools.SectionColumn
        buttonsIcon={withCornerRadius ? CornerRadiusButtonIcons(cornerRadius.isIndividual, cornerRadius.toggleIndividual, t) : undefined}
        gridColumnType={UITools.GridColumnType.twoInputs}
        labels={
          withCornerRadius || withEllipseCornerRadius
            ? [t(`${translationNameSpace}.opacity.ariaLabel`), t(`${translationNameSpace}.cornerRadius.ariaLabel`)]
            : [t(`${translationNameSpace}.opacity.ariaLabel`)]
        }
        withBottomMargin={(withCornerRadius && cornerRadius.isIndividual) || withArc}
      >
        <OpacityField displayValue={opacity.displayValue} onBlur={opacity.onBlur} onScrub={opacity.onScrub} value={opacity.value} />
        {withCornerRadius && (
          <CornerRadiusInput
            ariaLabel={t(`${translationNameSpace}.cornerRadius.ariaLabel`)}
            e2eValue="corner-radius"
            iconName="Corners"
            onCommit={cornerRadius.onMergedCommit}
            onScrub={cornerRadius.onMergedScrub}
            scrubValue={cornerRadius.mergedValue}
            tooltip={t(`${translationNameSpace}.cornerRadius.tooltip`)}
            value={cornerRadius.isMixed ? MIXED_LABEL : cornerRadius.mergedValue}
          />
        )}
        {withEllipseCornerRadius && <EllipseCornerRadiusInput />}
      </UITools.SectionColumn>
      {withCornerRadius && cornerRadius.isIndividual && (
        <UITools.SectionColumn
          buttonsIcon={[<CornerSmoothingButton key="corner-smoothing" />]}
          gridColumnType={UITools.GridColumnType.twoInputs}
          withBottomAlignedButtons
        >
          <CornerRadiusFieldList fields={cornerRadius.individualFields} />
        </UITools.SectionColumn>
      )}
      {withArc && <ArcRow />}
      <BlendModeRow />
    </UITools.Section>
  );
};

export default AppearanceSection;
