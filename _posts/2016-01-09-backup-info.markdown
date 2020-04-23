---
layout: post
title:  "Queries to get info about rman backups"
date:   2016-01-09 15:00:00 +0000
categories: oracle rman
---

There's nothing much to explain, it's just the queries I use to check to backup for whatever reason I need to.

####  Backup status
```
set lines 300
set pages 500
col STATUS format a24
col OUTPUT_BYTES_DISPLAY format a15
col time_taken_display format a8
SELECT
    session_key,
    input_type,
    status,
    TO_CHAR(start_time, 'yyyy-mm-dd hh24:mi') start_time,
    TO_CHAR(end_time, 'yyyy-mm-dd hh24:mi') end_time,
    output_bytes_display,
    time_taken_display
FROM
    v$rman_backup_job_details
ORDER BY
    session_key DESC;
```

#### Check backup log
```
SELECT * FROM GV$RMAN_OUTPUT WHERE SESSION_KEY = 44755;
```

#### Backup size

```
SELECT
    ctime   "Date",
    DECODE(backup_type, 'L', 'Archive Log', 
                        'D', 'Full', 
                        'Incremental') backup_type,
    bsize   "Size MB"
FROM
    (
        SELECT
            trunc(bp.completion_time) ctime,
            backup_type,
            round(SUM(bp.bytes /1024 / 1024), 2) bsize
        FROM
            v$backup_set     bs,
            v$backup_piece   bp
        WHERE
            bs.set_stamp = bp.set_stamp
            AND bs.set_count = bp.set_count
            AND bp.status = 'A'
        GROUP BY
            trunc(bp.completion_time),
            backup_type
    )
ORDER BY
    1, 2;
```

#### Backup throughput
```
select s.client_info,
         l.sid,
         l.serial#,
         l.sofar,
         l.totalwork,
         ROUND (l.sofar / l.totalwork * 100, 2) "Pct_Complete",
         aio.mb_per_s,
         aio.long_wait_pct
 FROM v$session_longops l,
         v$session s,
        (SELECT 
            sid,
            serial,
            round(100 * sum (long_waits) sum(io_count),2) as "LONG_WAIT_PCT",
            round(sum (effective_bytes_per_second)/1024/1024,2) as "MB_PER_S"
        FROM 
            v$backup_async_io
        GROUP BY 
                sid, serial) aio
   WHERE     aio.sid = s.sid
         AND aio.serial = s.serial#
         AND l.opname LIKE 'RMAN%'
         AND l.opname NOT LIKE '%aggregate%'
         AND l.totalwork != 0
         AND l.sofar <> l.totalwork
         AND s.sid = l.sid
         AND s.serial# = l.serial# order BY 1;
```