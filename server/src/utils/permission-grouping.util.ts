// Simplified group expansion logic. 
// A real app might expand "Employee.*" into "Employee.Read", "Employee.Write", etc.
export const expandGroupedPermissionMap = (
  source: Record<string, boolean>
): Record<string, boolean> => {
  return source;
};

export const flattenObject = (
  ob: any,
  prefix = "",
  result: Record<string, boolean> = {}
): Record<string, boolean> => {
  for (const i in ob) {
    if (typeof ob[i] === "object" && ob[i] !== null && !Array.isArray(ob[i])) {
      flattenObject(ob[i], prefix + i + ".", result);
    } else {
      result[prefix + i] = Boolean(ob[i]);
    }
  }
  return result;
};
