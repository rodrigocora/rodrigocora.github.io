---
layout: post
title:  "Generate trace file"
date:   2014-07-17 15:00:00 +0000
categories: oracle rac trace
update: 2014-07-17 15:00:00 +0000
---

Generate trace file to identify performance issues:  

Set an identifier to the session:

`ALTER SESSION SET TRACEFILE_IDENTIFIER='<SOMETHING>';`

Enable trace to the current session:

`ALTER SESSION SET SQL_TRACE = TRUE;`

Improve the file readability

`TKPROF <src_file.trc>  <output_file.txt>`

Disable trace to the current session:

`ALTER SESSION SET SQL_TRACE = FALSE;`

Enable trace to another user session:

`EXEC SYS.DBMS_SYSTEM.SET_SQL_TRACE_IN_SESSION( <O_SID> ,  <O_SERIAL#> ,TRUE);`

Disable trace to another user session:

`EXEC SYS.DBMS_SYSTEM.SET_SQL_TRACE_IN_SESSION( <O_SID> ,  <O_SERIAL#> ,FALSE);`

Disable trace to another user session with more details:

`EXEC SYS.DBMS_SYSTEM.SET_EV( <SID>, <SERIAL#>,10046,12, '');`

Find the trace file:

```
SELECT a.sid,  
    a.serial#,  
    a.username,  
    a.osuser,  
    b.spid,  
    b.TRACEFILE  
FROM v$session a,  
    gv$process b  
WHERE 
    a.paddr  = b.addr  
    AND a.username = '<USERNAME>'  
ORDER BY a.sid;  
```
