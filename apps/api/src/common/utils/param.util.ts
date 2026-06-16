export function getParamAsString(
  value: string | string[] | undefined
): string {
  if (!value) {
    throw new Error('Route parameter is missing');
  }

  return Array.isArray(value) ? value[0] : value;
}