// store
import { AppDispatch } from 'store';

// types
import { TVectorDivideResult } from './types';

// utils
import { commitVectorCutComponents } from './commitVectorCutComponents';
import { finishDividedComponent } from './finishDividedComponent';

export const applyDivideResults = (dispatch: AppDispatch, divideResults: TVectorDivideResult[]): string[] =>
  divideResults.flatMap(({ components, crossings, node, vertexLineT }) =>
    commitVectorCutComponents(dispatch, node, components, (component) => finishDividedComponent(node, vertexLineT, crossings, component)),
  );
