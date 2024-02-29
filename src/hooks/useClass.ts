import { useMemo } from "react";

export const useClass = <T, A extends any[]>(
  needClass: new (...args: A) => T,
  ...args: A
) => {
  return useMemo(() => new needClass(...args), []);
};