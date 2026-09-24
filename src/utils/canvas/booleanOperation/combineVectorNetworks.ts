// types
import { TVectorNode } from 'types/design/types';
import { TVectorNetworkGeometry, snapVectorNetworkJunctions } from './snapVectorNetworkJunctions';

// utils
import { persistVectorNetworkCrossings } from '../vectorNetwork/planarizeVectorNetwork/persistVectorNetworkCrossings';

export const combineVectorNetworks = (operands: TVectorNode[]): TVectorNetworkGeometry => {
  const snapped = snapVectorNetworkJunctions(
    Object.assign({}, ...operands.map((operand) => operand.segments)),
    Object.assign({}, ...operands.map((operand) => operand.vertices)),
  );

  return persistVectorNetworkCrossings(snapped.segments, snapped.vertices);
};
