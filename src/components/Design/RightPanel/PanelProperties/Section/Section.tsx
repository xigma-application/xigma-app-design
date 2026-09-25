import { FC, Fragment } from 'react';

// components
import AppearanceSection from '../Common/AppearanceSection/AppearanceSection';
import Export from '../Export/Export';
import FillSection from '../Common/FillSection/FillSection';
import PositionSection from '../Common/PositionSection/PositionSection';
import SectionHeader from './SectionHeader/SectionHeader';
import SectionLayoutSection from './SectionLayoutSection/SectionLayoutSection';
import SelectionColorsSection from '../Common/SelectionColorsSection/SelectionColorsSection';
import StrokeSection from '../Common/StrokeSection/StrokeSection';

const Section: FC = () => (
  <Fragment>
    <SectionHeader />
    <PositionSection withRotation={false} />
    <SectionLayoutSection />
    <AppearanceSection />
    <FillSection />
    <StrokeSection />
    <SelectionColorsSection />
    <Export />
  </Fragment>
);

export default Section;
