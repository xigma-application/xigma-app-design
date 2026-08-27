import { Children, cloneElement, FC, ReactElement } from 'react';

// types
import { TE2EType, TE2EValue } from './types';

// utils
import { getAttributes } from './utils/getAttributes';

export type TE2EDataAttributeProps = {
  children: ReactElement<HTMLElement>;
  type: TE2EType | TE2EType[];
  value?: TE2EValue | TE2EValue[];
};

export const E2EDataAttribute: FC<TE2EDataAttributeProps> = ({ children, type, value = '' }) => {
  const child = Children.only(children);

  return cloneElement(child, getAttributes(type, value));
};

export default E2EDataAttribute;
