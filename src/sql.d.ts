/**
 * Type declaration for `.sql` text imports — used by db/index.ts to embed
 * schema.sql at build time via esbuild loader / Bun's bunfig text loader.
 */
declare module "*.sql" {
  const content: string;
  export default content;
}
