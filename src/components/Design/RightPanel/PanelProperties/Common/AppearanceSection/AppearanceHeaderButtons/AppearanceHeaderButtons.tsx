import { FC, Fragment } from 'react';

// components
import BlendModeButton from './BlendModeButton/BlendModeButton';
import VisibilityToggle from './VisibilityToggle';

export type TAppearanceHeaderButtonsProps = { withBlendMode?: boolean };

const AppearanceHeaderButtons: FC<TAppearanceHeaderButtonsProps> = ({ withBlendMode = true }) => (
  <Fragment>
    <VisibilityToggle />
    {withBlendMode && <BlendModeButton />}
  </Fragment>
);

export default AppearanceHeaderButtons;
