import type { SVGProps } from "react";

const paths = {
  arrow: "M7 17 17 7M7 7h10v10",
  back: "M19 12H5m6-6-6 6 6 6",
  up: "M12 19V5m-6 6 6-6 6 6",
  chevron: "m6 9 6 6 6-6",
  mail: "M4 5h16v14H4z m0 1 8 7 8-7",
  sun: "M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
  moon: "M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z",
  search: "M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
  close: "m6 6 12 12M6 18 18 6",
  github: "M9 19c-4 1-4-2-6-2m12 5v-4c0-1 .1-1.5-.5-2 3-.3 6-1.5 6-6 0-1.4-.5-2.5-1.3-3.4.2-.9.2-2-.2-3.1-1.6 0-2.8.9-3.5 1.4a12 12 0 0 0-7 0C7.7 4.4 6.5 3.5 5 3.5c-.5 1.1-.5 2.2-.3 3.1C3.9 7.5 3.5 8.6 3.5 10c0 4.5 3 5.7 6 6-.6.5-.5 1-.5 2v4",
  linkedin: "M4 9v11M4 4v.01M9 20V9h4v2c2-3 7-2 7 2v7M13 11v9",
  instagram: "M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm9 9a4 4 0 1 1-8 0 4 4 0 0 1 8 0m1-5h.01",
} as const;

export function Icon({ name, ...props }: SVGProps<SVGSVGElement> & { name: keyof typeof paths }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><path d={paths[name]} /></svg>;
}
