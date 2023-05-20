function findPrefix(d: Document): string {
  const availablePrefixes: string[] = ['webkit', 'ms', 'o', 'moz', 'khtml'];
  const prefix = availablePrefixes.find(p => p + 'Hidden' in d);
  return prefix ?? '';
}

export {findPrefix};
