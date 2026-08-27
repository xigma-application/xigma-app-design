// others
import { DATA_TEST_PREFIX } from '../constants';

// types
import { TE2EType } from '../types';

export const getDataTestAttribute = (type: TE2EType): string => `${DATA_TEST_PREFIX}-${type}`;
