import { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

// components
import AppearanceSection from '../Common/AppearanceSection/AppearanceSection';
import ColumnDimensions from '../Common/ColumnDimensions/ColumnDimensions';
import ColumnSpacing from '../Common/ColumnSpacing/ColumnSpacing';
import EffectsSection from '../Common/EffectsSection/EffectsSection';
import Export from '../Export/Export';
import FillSection from '../Common/FillSection/FillSection';
import LayoutGuideSection from '../Common/LayoutGuideSection/LayoutGuideSection';
import MixedHeader from './MixedHeader/MixedHeader';
import PositionSection from '../Common/PositionSection/PositionSection';
import ResizeToFitButton from '../Common/ResizeToFitButton/ResizeToFitButton';
import SelectionColorsSection from '../Common/SelectionColorsSection/SelectionColorsSection';
import StrokeSection from '../Common/StrokeSection/StrokeSection';
import { UITools } from 'shared';

// hooks
import { useMixedPanel } from './hooks/useMixedPanel';

// others
import { translationNameSpace } from '../Common/constants';

const Mixed: FC = () => {
  const { t } = useTranslation();
  const { count, hasSection, sections, withResizeToFit } = useMixedPanel();

  return (
    <Fragment>
      <MixedHeader count={count} withComponentButton={!hasSection} />
      {sections.includes('position') && <PositionSection withRotation={sections.includes('rotation')} />}
      {sections.includes('layout') && (
        <UITools.Section
          component={withResizeToFit ? <ResizeToFitButton /> : undefined}
          e2eValue="layout"
          label={t(`${translationNameSpace}.layoutSection.label`)}
        >
          <ColumnDimensions />
          <ColumnSpacing />
        </UITools.Section>
      )}
      {sections.includes('appearance') && <AppearanceSection withCornerRadius={sections.includes('cornerRadius')} />}
      {sections.includes('fill') && <FillSection />}
      {sections.includes('stroke') && <StrokeSection />}
      {sections.includes('effects') && <EffectsSection />}
      {sections.includes('selectionColors') && <SelectionColorsSection />}
      {sections.includes('layoutGuide') && <LayoutGuideSection />}
      {sections.includes('export') && <Export />}
    </Fragment>
  );
};

export default Mixed;
