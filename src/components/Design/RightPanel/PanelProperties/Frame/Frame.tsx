import { FC, Fragment } from 'react';

// components
import FrameHeader from './FrameHeader/FrameHeader';
import LayoutSection from './LayoutSection/LayoutSection';
import PositionSection from './PositionSection/PositionSection';

const Frame: FC = () => (
  <Fragment>
    <FrameHeader />
    <PositionSection />
    <LayoutSection />
  </Fragment>
);

export default Frame;
