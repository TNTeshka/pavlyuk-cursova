// apps/web/src/types/css-modules.d.ts

declare module "*.module.css" {
  const styles: Record<string, string>;
  export default styles;
}
