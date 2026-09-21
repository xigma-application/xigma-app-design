import { FC, Fragment } from 'react';

// components
import AppearanceSection from '../Common/AppearanceSection/AppearanceSection';
import EffectsSection from '../Common/EffectsSection/EffectsSection';
import FillSection from '../Common/FillSection/FillSection';
import FrameHeader from './FrameHeader/FrameHeader';
import LayoutGuideSection from '../Common/LayoutGuideSection/LayoutGuideSection';
import LayoutSection from './LayoutSection/LayoutSection';
import PositionSection from '../Common/PositionSection/PositionSection';
import SelectionColorsSection from '../Common/SelectionColorsSection/SelectionColorsSection';
import StrokeSection from '../Common/StrokeSection/StrokeSection';

const Frame: FC = () => (
  <Fragment>
    <FrameHeader />
    <PositionSection />
    <LayoutSection />
    <AppearanceSection />
    <FillSection />
    <StrokeSection />
    <EffectsSection />
    <SelectionColorsSection />
    <LayoutGuideSection />
  </Fragment>
);

export default Frame;
