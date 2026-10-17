declare module "bd-divisions-to-unions" {
  export type DivisionOption = {
    value: string | number;
    title: string;
  };

  export function getAllDistrict(): Record<string, DivisionOption[]>;
  export function getAllUpazila(): Record<string, DivisionOption[]>;
  export function getAllUnion(): Record<string, DivisionOption[]>;
}