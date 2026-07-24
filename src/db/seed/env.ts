// Loads .env.local for the seed scripts.
//
// This exists to fix an ordering hazard, not to save a line. Every seed used
// to open with:
//
//   import { config } from 'dotenv'
//   config({ path: '.env.local' })
//
//   import { db } from '@/db'
//
// which reads as "load the env, then connect" and is not what runs. ES modules
// evaluate all of a module's imports before any statement in its body, so
// '@/db' is initialised first and config() runs afterwards - the connection
// string is read before it has been loaded. It works today only because tsx
// transpiles these scripts to CommonJS, where require() follows statement
// order. Under native ESM it breaks, and it breaks as an unset DATABASE_URL
// several frames away from the cause.
//
// Importing a module for its side effect is ordered by the spec: imports are
// evaluated in source order, so `import './env'` placed first is guaranteed to
// run before '@/db' is initialised, in both module systems.
//
// The same reasoning is why dotenv lives in drizzle.config.ts and not in
// db/index.ts - see the Edge Runtime note there.
import { config } from 'dotenv'

config({ path: '.env.local' })
