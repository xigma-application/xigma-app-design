import { FC, Fragment } from 'react';

// components
import AppearanceSection from '../Common/AppearanceSection/AppearanceSection';
import FillSection from '../Common/FillSection/FillSection';
import FrameHeader from './FrameHeader/FrameHeader';
import LayoutSection from './LayoutSection/LayoutSection';
import PositionSection from '../Common/PositionSection/PositionSection';
import StrokeSection from '../Common/StrokeSection/StrokeSection';

const Frame: FC = () => (
  <Fragment>
    <FrameHeader />
    <PositionSection />
    <LayoutSection />
    <AppearanceSection />
    <FillSection />
    <StrokeSection />
  </Fragment>
);

export default Frame;
