export const registerSvgGradientDef = (defs: string[], buildDef: (id: string) => string): string => {
  const id = `XigmaGradient${defs.length}`;
  defs.push(buildDef(id));

  return id;
};
