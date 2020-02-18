---
layout: post
title:  "Dblink utilities"
date:   2020-02-08 20:00:00 +0000
categories: oracle dblink
---

#### Find dblinks being used in materialized views

```
DECLARE
    TEXT_LOB CLOB;
BEGIN
    FOR X IN (
        SELECT
            OWNER,
            MVIEW_NAME,
            QUERY
        FROM
            DBA_MVIEWS
    ) LOOP
        TEXT_LOB := X.QUERY;
        TEXT_LOB := REPLACE(REGEXP_SUBSTR(TEXT_LOB, '@(")?\w+(\.\w+\.\w+(")?)?'), '"');
        IF TEXT_LOB IS NOT NULL THEN
            DBMS_OUTPUT.PUT_LINE(X.OWNER
                                 || '.'
                                 || X.MVIEW_NAME
                                 || ' - '
                                 || TEXT_LOB);
        END IF;

    END LOOP;
END;
/
```

#### Find dblinks being used in others objects 

```
SET LINES 200
SET PAGES 0
COL OWNER FORMAT A20
COL NAME FORMAT A40
COL OBJECT_DBLINK FORMAT A50

SELECT DISTINCT
    OWNER,
    NAME,
    REGEXP_SUBSTR(TEXT, '\w+@\w+(\.TIMWE\.COM)?') AS "OBJECT_DBLINK"
FROM
    DBA_SOURCE
WHERE
    TEXT LIKE '%@%'
ORDER BY
    "OBJECT_DBLINK";
```