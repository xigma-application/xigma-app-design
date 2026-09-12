import { FC, Fragment } from 'react';

// components
import AppearanceSection from '../Common/AppearanceSection/AppearanceSection';
import FrameHeader from './FrameHeader/FrameHeader';
import LayoutSection from './LayoutSection/LayoutSection';
import PositionSection from '../Common/PositionSection/PositionSection';

const Frame: FC = () => (
  <Fragment>
    <FrameHeader />
    <PositionSection />
    <LayoutSection />
    <AppearanceSection />
  </Fragment>
);

export default Frame;
