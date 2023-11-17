import config from "../../svelte.config.js"
import * as fs from 'fs'



const base = config.kit?.paths?.base
fs.writeFileSync("./src/globalstyle/vars/base.scss", `$base: '${base}'`)
console.log(`  scssbase.ts: wrote base path to vars/base.scss`)