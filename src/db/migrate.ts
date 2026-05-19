import { applySchema, closeDb, libsqlConfig } from "./index.ts";

await applySchema();
console.log(`Schema applied via libsql to ${libsqlConfig().url}`);
closeDb();
