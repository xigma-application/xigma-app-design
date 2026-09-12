import { FC, Fragment } from 'react';

// components
import BlendModeButton from './BlendModeButton/BlendModeButton';
import VisibilityToggle from './VisibilityToggle';

const AppearanceHeaderButtons: FC = () => (
  <Fragment>
    <VisibilityToggle />
    <BlendModeButton />
  </Fragment>
);

export default AppearanceHeaderButtons;
