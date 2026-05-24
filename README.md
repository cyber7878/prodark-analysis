how to run the analysis:

first:
node scripts\deobfuscate.js files\background.js outputs\background_deobfuscated.js

then:
node scripts\strip_dead.js outputs\background_deobfuscated.js outputs\background_clean1.js

lastly:
node scripts\clearup_malware.js outputs\background_clean1.js outputs\background_clear_final.js
