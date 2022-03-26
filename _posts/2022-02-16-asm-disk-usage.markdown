---
layout: post
title:  "Check ASM disk usage"
date:   2022-02-16 09:00:00 +0000
categories: oracle sql asm
---
### Query to check ASM disk usage
```
SELECT
    name,
    DECODE(type, 'NORMAL', 2, 'HIGH', 3, 'EXTERN', 1) redundancy,
    round(( total_mb / DECODE(type, 'NORMAL', 2, 'HIGH', 3, 'EXTERN', 1)/1024/1024 ),2) total_tb,
    round(( free_mb / DECODE(type, 'NORMAL', 2, 'HIGH', 3, 'EXTERN', 1) )/1024/1024,2) free_tb,
    round(((free_mb / DECODE(type, 'NORMAL', 2, 'HIGH', 3, 'EXTERN', 1)) /(total_mb / DECODE(TYPE, 'NORMAL', 2, 'HIGH', 3, 'EXTERN', 1))) * 100, 2
    ) "%Free"
FROM
    v$asm_diskgroup;
```