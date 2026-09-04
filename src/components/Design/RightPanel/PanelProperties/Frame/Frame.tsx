import { FC, Fragment } from 'react';

// components
import FrameHeader from './FrameHeader/FrameHeader';
import PositionSection from './PositionSection/PositionSection';

const Frame: FC = () => (
  <Fragment>
    <FrameHeader />
    <PositionSection />
  </Fragment>
);

export default Frame;
