export const DEPARTMENTS = [
  {
    name: "Assessment Team 749 'Mom's Spaghetti'",
    key: "AT749",
  },
] as const;

export type DepartmentKey = (typeof DEPARTMENTS)[number]["key"];

export function getDepartmentName(key: string) {
  return DEPARTMENTS.find(dept => dept.key === key)?.name ?? key;
}