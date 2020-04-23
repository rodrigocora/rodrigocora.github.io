---
layout: post
title:  "Check and recompile invalid objects"
date:   2015-09-15 11:00:00 +0000
categories: oracle invalid_objects
author: Rodrigo Correia
---

Check invalid objects

```
COLUMN object_name FORMAT A30
SELECT owner,
       object_type,
       object_name,
       status
FROM   dba_objects
WHERE  status != 'VALID'
ORDER BY owner, object_type, object_name;
```

Check and recompile invalid objects

```
SET PAGESIZE 300
SET LINESIZE 300

SELECT
    'ALTER ' || 
    CASE
        WHEN OBJECT_TYPE LIKE '%BODY' 
            THEN TRIM(REGEXP_SUBSTR(OBJECT_TYPE, '.*\s'))
        WHEN OBJECT_TYPE = 'SYNONYM' AND OWNER = 'PUBLIC' 
            THEN 'PUBLIC ' || OBJECT_TYPE
    ELSE
        OBJECT_TYPE
    END   
     || ' ' ||
    CASE 
        WHEN OWNER != 'PUBLIC' THEN '"' || OWNER || '".'
    ELSE
        ''
    END
    || '"' || OBJECT_NAME || '"' || 
    CASE
        WHEN OBJECT_TYPE LIKE '%BODY' THEN ' COMPILE BODY'
    ELSE
        ' COMPILE'
    END || ';'
FROM
	DBA_OBJECTS
WHERE
	STATUS != 'VALID'
ORDER BY OBJECT_TYPE;
```

Or

```
EXEC UTL_RECOMP.RECOMP_PARALLEL(<X>);
```
Where <X> is the degree of parallelism.