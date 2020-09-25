---
layout: post
title:  "Import full to pdb with different features installed (Oracle Spatial)"
date:   2020-09-24 16:00:00 +0000
categories: oracle multitenant 
update: 2020-09-24 16:00:00 +0000
---


We had a situation where a new pdb(19.6.0.0) was created to receive a import from another database(11.2.0.1) that had Oracle Spatial installed and the target database didn't.
Weirdly executing a full import to the pdb "installed" a flawed version of the Spatial feature in the CDB. It appeared in the dba_registry and cdb_registry views, but it was invalid.

[![](/assets/2020-09-24-import-full-to-pdb-oracle-spatial-problems_spatial_invalid.jpeg)](/assets/2020-09-24-import-full-to-pdb-oracle-spatial-problems_spatial_invalid.jpeg)

After a database restart the PDBs opened in restricted session mode, even PDB$SEED.

[![](/assets/2020-09-24-import-full-to-pdb-oracle-spatial-problems_pdb_restricted_yes.jpeg)](/assets/2020-09-24-import-full-to-pdb-oracle-spatial-problems_pdb_restricted_yes.jpeg)

In the PDB_PLUG_IN_VIOLATIONS view the message was that the 19.6 [30557433] was wrongly applied, which wasn't true.

[![](/assets/2020-09-24-import-full-to-pdb-oracle-spatial-problems_patches_errors.jpeg)](/assets/2020-09-24-import-full-to-pdb-oracle-spatial-problems_patches_errors.jpeg)


|24/09/2020 12:25:32.720328000 PM	|DEV2_PDB	|SQL Patch	|ERROR	|0	|1	|19.6.0.0.0 Release_Update 1912171550: APPLY with status WITH ERRORS in the CDB	   |RESOLVED   |Call datapatch to install in the PDB or the CDB	|3|
 
 And also this one in a new PDB we created to test the solution:

 |24/09/2020 14:48:14.779786000 PM	|DEV2_PLUG	|OPTION	|ERROR	|0	|1	|Database option SDO mismatch: PDB installed version 19.0.0.0.0. CDB installed version NULL.	|RESOLVED	|Fix the database option in the PDB or the CDB	|2|

These are the steps a I took to solve this problem:  
Remove Spatial from CDB then PDBs (the order matters)

```
sqlplus / as sysdba

SHUTDOWN IMMEDIATE;
STARTUP UPGRADE;

@?/md/admin/mddins.sql
ALTER SESSION SET "_oracle_script"=true;
DROP USER MDSYS CASCADE;
DROP USER MDDATA CASCADE;

SET PAGESIZE 0
SET FEED OFF
SPOOL dropsyn.sql
SELECT 'DROP PUBLIC SYNONYM "' || SYNONYM_NAME || '";' 
FROM DBA_SYNONYMS 
WHERE TABLE_OWNER='MDSYS';
SPOOL OFF;
@dropsyn.sql

EXEC UTL_RECOMP.RECOMP_PARALLEL(10);
SELECT count(*) FROM DBA_OBJECTS WHERE STATUS != 'VALID';

SHUTDOWN IMMEDIATE;
STARTUP;
exit
```

And now from the PDB (the same commands worked for the PDB$SEED pdb as well)

```
sqlplus / as sysdba
ALTER PLUGGABLE DATABASE DEV2_PDB CLOSE IMMEDIATE;
ALTER PLUGGABLE DATABASE DEV2_PDB OPEN RESTRICTED;

ALTER SESSION SET CONTAINER=DEV2_PDB;
@?/md/admin/mddins.sql
ALTER SESSION SET "_oracle_script"=true;
DROP USER MDSYS CASCADE;
DROP USER MDDATA CASCADE;

SET PAGESIZE 0
SET FEED OFF
SPOOL dropsyn.sql
SELECT 'DROP PUBLIC SYNONYM "' || SYNONYM_NAME || '";', OWNER 
FROM DBA_SYNONYMS 
WHERE TABLE_OWNER='MDSYS';
SPOOL OFF;
@dropsyn.sql

EXEC UTL_RECOMP.RECOMP_PARALLEL(8);
SELECT COUNT(*) FROM DBA_OBJECTS WHERE STATUS != 'VALID';

ALTER PLUGGABLE DATABASE DEV2_PDB CLOSE IMMEDIATE;
ALTER PLUGGABLE DATABASE DEV2_PDB OPEN UPGRADE;
exit
```

`$ datapatch -verbose -pdbs DEV2_PDB`

```
sqlplus / as sysdba
ALTER PLUGGABLE DATABASE DEV2_PDB CLOSE IMMEDIATE;
ALTER PLUGGABLE DATABASE DEV2_PDB OPEN;
```

[![](/assets/2020-09-24-import-full-to-pdb-oracle-spatial-problems_pdbs_ok_v1.jpeg)](/assets/2020-09-24-import-full-to-pdb-oracle-spatial-problems_pdbs_ok_v1.jpeg)


