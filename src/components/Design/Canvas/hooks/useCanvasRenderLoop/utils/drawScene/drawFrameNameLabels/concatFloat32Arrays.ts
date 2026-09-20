export const concatFloat32Arrays = (arrays: Float32Array[]): Float32Array => {
  const result = new Float32Array(arrays.reduce((total, array) => total + array.length, 0));
  let offset = 0;

  arrays.forEach((array) => {
    result.set(array, offset);
    offset += array.length;
  });

  return result;
};
