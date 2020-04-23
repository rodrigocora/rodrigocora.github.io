---
layout: post
title:  "Kill oracle sessions"
date:   2015-06-22 15:00:00 +0000
categories: oracle session
---

Check active sessions:

```
select sid, username, status from gv$session where status='ACTIVE';
```

Kill user's sessions:

```
SELECT 
    'ALTER SYSTEM KILL SESSION ' 
    || '''' 
    || SID 
    || ',' 
    || SERIAL# 
    || ',@'
    || inst_id 
    || '''' 
    || ' IMMEDIATE;' 
FROM 
    GV$SESSION 
WHERE 
    USERNAME LIKE '%USERNAME%';
```
Kill sessions running a specific query
```
SELECT 'alter system kill session '
  || ''''
  || se.sid
  || ','
  || se.serial#
  || ''''
  || ' immediate;'
FROM v$session se
JOIN v$sql sq
ON (se.sql_address= sq.address)
WHERE sq.sql_id   ='bf6j8rbyj2vwu';
```

Find OS PID based on session SID
```
col sid format 999999
col username format a20
col osuser format a15
select a.sid, a.serial#,a.username, a.osuser, b.spid
from gv$session a, gv$process b
where a.paddr= b.addr
and a.sid='&sid'
order by a.sid;
```

Kill OS Processes
```
ps -ef | grep oracle${ORACLE_SID} | wc -l
ps -ef | grep LOCAL=NO | awk '{print "kill -9 " $2}' > KillS.sh
chmod 755 KillS.sh
./KillS.sh
rm KillS.sh
```

Kill blocking sessions
```
SELECT username,
  machine,
  se.sql_id,
  'alter system kill session '''
  || bl.holding_session
  ||','
  ||se.serial#
  || ''' immediate;',
  sq.sql_text
FROM dba_blockers bl
JOIN v$session se
ON bl.holding_session = se.sid
JOIN v$sql sq
ON sq.sql_id=se.sql_id;
```

Rought procedure to kill all sessions (I don't really remeber why I wrote this)

```
DECLARE
    COUNTER_KILLED NUMBER;
    COUNTER_NOT_KILLED NUMBER;
BEGIN
FOR X IN (SELECT S.SID, SERIAL#, INST_ID
FROM
   GV$SESSION S
WHERE
   BLOCKING_SESSION IS NOT NULL
   AND USERNAME IS NOT NULL
   AND USERNAME NOT IN ('SYS'))
LOOP
    BEGIN
        EXECUTE IMMEDIATE 'ALTER SYSTEM KILL SESSION ''' || X.SID ||
        ',' || X.SERIAL# || ',@' || X.INST_ID || ''' IMMEDIATE';
        COUNTER_KILLED := COUNTER_KILLED + 1;
    EXCEPTION WHEN OTHERS THEN
        NULL;
        COUNTER_NOT_KILLED := COUNTER_NOT_KILLED + 1;
    END;
END LOOP;
DBMS_OUTPUT.PUT_LINE('KILLED : ' || COUNTER_KILLED);
DBMS_OUTPUT.PUT_LINE('NOT KILLED : ' || COUNTER_NOT_KILLED);
END;
/
```
