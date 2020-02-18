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
    'ALTER ' 
    || DECODE(OBJECT_TYPE, 
                'PACKAGE BODY',
                'PACKAGE', OBJECT_TYPE)
    || ' ' 
    || OWNER 
    || '.' 
    || OBJECT_NAME 
    || DECODE(OBJECT_TYPE, 
            ' PACKAGE BODY ', 
            ' COMPILE BODY; ',
            ' COMPILE; ') as cmd
FROM
	DBA_OBJECTS
WHERE
	STATUS != 'VALID'
	AND OWNER NOT IN ('SYS',
	'SYSTEM',
	'OLAPSYS');
```

Or

```
EXEC UTL_RECOMP.RECOMP_PARALLEL(<X>);
```
Where <X> is the degree of parallelism.