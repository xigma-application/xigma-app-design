import { isArray, zip } from 'lodash';

// types
import { TE2EType, TE2EValue } from '../types';

// utils
import { getDataTestAttribute } from './getDataTestAttribute';

export const getAttributes = (
  type: TE2EType | TE2EType[],
  value: TE2EValue | TE2EValue[] | undefined,
): Record<string, TE2EValue | undefined> =>
  isArray(type) && isArray(value)
    ? zip(type, value).reduce<Record<string, TE2EValue | undefined>>(
        (attributes, [zippedType, zippedValue]) =>
          zippedType ? { ...attributes, [getDataTestAttribute(zippedType)]: zippedValue } : attributes,
        {},
      )
    : { [getDataTestAttribute(type as TE2EType)]: value as TE2EValue | undefined };
