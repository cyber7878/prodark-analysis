**How to run the analysis:**

**First:**
node scripts\deobfuscate.js files\background.js outputs\background_deobfuscated.js

**Then:**
node scripts\strip_dead.js outputs\background_deobfuscated.js outputs\background_clean1.js

**Lastly:**
node scripts\clearup_malware.js outputs\background_clean1.js outputs\background_clear_final.js


The file with comments is the actual final version.
The goal it to be able to analyze the file more easily. 
