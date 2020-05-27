---
layout: post
title:  "enq tx – row lock contention"
date:   2020-05-27 23:00:00 +0000
categories: oracle rac contention transaction
update: 2020-05-27 23:00:00 +0000
---



```
SELECT /*+ RULE */
    k.inst_id,
    ss.username,
    decode(request, 0, 'Holder: ', ' Waiter: ')
    || k.sid sess,
    ss.sql_id,
    k.id1,
    k.id2,
    k.lmode,
    k.request,
    k.type,
    ss.last_call_et,
    ss.seconds_in_wait,
    ss.serial#,
    ss.machine,
    ss.event,
    ss.status,
    p.spid,
    CASE
        WHEN request > 0 THEN
            chr(bitand(p1, - 16777216) / 16777215)
            || chr(bitand(p1, 16711680) / 65535)
        ELSE
            NULL
    END "Name",
    CASE
        WHEN request > 0 THEN
            ( bitand(p1, 65535) )
        ELSE
            NULL
    END "Mode"
FROM
    gv$lock     k,
    gv$session  ss,
    gv$process  p
WHERE
    ( k.id1,
      k.id2,
      k.type ) IN (
        SELECT
            ll.id1,
            ll.id2,
            ll.type
        FROM
            gv$lock ll
        WHERE
            request > 0
    )
    AND k.sid = ss.sid
    AND k.inst_id = ss.inst_id
    AND ss.paddr = p.addr
    AND ss.inst_id = p.inst_id
ORDER BY
    id1,
    request;

```
