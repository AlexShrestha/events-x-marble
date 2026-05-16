import { applySchema, closeDb } from "./index.ts";
import { sqlitePath } from "../env.ts";

applySchema();
console.log(`Schema applied to ${sqlitePath()}`);
closeDb();
