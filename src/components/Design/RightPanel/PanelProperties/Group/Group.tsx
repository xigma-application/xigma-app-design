import { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

// components
import AppearanceSection from '../Common/AppearanceSection/AppearanceSection';
import ColumnDimensions from '../Common/ColumnDimensions/ColumnDimensions';
import ColumnSpacing from '../Common/ColumnSpacing/ColumnSpacing';
import EffectsSection from '../Common/EffectsSection/EffectsSection';
import Export from '../Export/Export';
import FillSection from '../Common/FillSection/FillSection';
import GroupFlow from './GroupFlow/GroupFlow';
import GroupHeader from './GroupHeader/GroupHeader';
import PositionSection from '../Common/PositionSection/PositionSection';
import SelectionColorsSection from '../Common/SelectionColorsSection/SelectionColorsSection';
import StrokeSection from '../Common/StrokeSection/StrokeSection';
import { UITools } from 'shared';

// hooks
import { useGroupPanel } from './hooks/useGroupPanel';

// others
import { translationNameSpace } from '../Common/constants';

const Group: FC = () => {
  const { t } = useTranslation();
  const sections = useGroupPanel();

  return (
    <Fragment>
      <GroupHeader />
      <PositionSection />
      <UITools.Section e2eValue="layout" label={t(`${translationNameSpace}.layoutSection.label`)}>
        <GroupFlow />
        <ColumnDimensions />
        <ColumnSpacing />
      </UITools.Section>
      {sections.includes('appearance') && <AppearanceSection withCornerRadius={sections.includes('cornerRadius')} />}
      {sections.includes('fill') && <FillSection />}
      {sections.includes('stroke') && <StrokeSection />}
      {sections.includes('effects') && <EffectsSection />}
      <SelectionColorsSection />
      <Export />
    </Fragment>
  );
};

export default Group;
