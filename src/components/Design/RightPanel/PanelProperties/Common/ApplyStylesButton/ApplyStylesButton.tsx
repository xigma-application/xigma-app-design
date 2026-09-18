import { FC } from 'react';

// components
import { Tooltip, UITools } from 'shared';

export type TApplyStylesButtonProps = { ariaLabel: string; tooltip: string };

export const ApplyStylesButton: FC<TApplyStylesButtonProps> = ({ ariaLabel, tooltip }) => (
  <Tooltip align="end" content={tooltip}>
    <UITools.ButtonIcon ariaLabel={ariaLabel} data-section-idle-hidden name="StylesAndVariables" />
  </Tooltip>
);

export default ApplyStylesButton;
