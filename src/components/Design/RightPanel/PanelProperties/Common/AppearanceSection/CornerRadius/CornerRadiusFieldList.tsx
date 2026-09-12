import { FC, Fragment } from 'react';

// components
import CornerRadiusInput from './CornerRadiusInput';

// types
import { TCornerRadiusField } from './hooks/useCornerRadius/types';

export type TCornerRadiusFieldListProps = {
  fields: TCornerRadiusField[];
};

const CornerRadiusFieldList: FC<TCornerRadiusFieldListProps> = ({ fields }) => (
  <Fragment>
    {fields.map((field) => (
      <CornerRadiusInput
        ariaLabel={field.ariaLabel}
        e2eValue={field.e2eValue}
        iconName={field.iconName}
        key={field.e2eValue}
        onCommit={field.onCommit}
        onScrub={field.onScrub}
        scrubValue={field.value}
        tooltip={field.tooltip}
        value={field.value}
      />
    ))}
  </Fragment>
);

export default CornerRadiusFieldList;
