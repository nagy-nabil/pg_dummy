# pg_dummy

simple cli to load pg database schema and save all of the tables content as `csv`/`json` files in a folder.

i had use case where i needed some tool to backup postgres db tables to files, this does that in a simple way.

> NOTE, THIS IS NOT INTENDED AS PRODUCTION BACKUP TOOL, ONLY FOR SIMPLE FILE EXPORTS.

i should mention @LORENZO ALBERTON article it was very helpful in extracting db schema check it out here [EXTRACTING META INFORMATION FROM POSTGRESQL (INFORMATION_SCHEMA)](https://www.alberton.info/postgresql_meta_info.html)

for more information check postgres docs.

if you need production backup tool use [pg_dump](https://www.postgresql.org/docs/current/app-pgdump.html)  instead, **but i would recommend using your db provider backup functionality**. 
