// Minimal ambient type declarations to satisfy TypeScript for d3 modules used

declare module 'd3-format' {
  export function format(
    specifier: string
  ): (value: number | { valueOf(): number }) => string;
  export function formatPrefix(
    specifier: string,
    value: number
  ): (value: number | { valueOf(): number }) => string;
}

declare module 'd3-time-format' {
  export function timeFormat(specifier: string): (date: Date) => string;
}


