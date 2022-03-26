---
layout: post
title:  "Tablespace space usage"
date:   2022-01-09 13:00:00 +0000
categories: oracle maintenance sql
---
### Query to check tablespace space usage 

```
set linesize 132 tab off trimspool on
set pagesize 105
set pause off
set echo off
set feedb on

column "TOTAL ALLOC (MB)" format 9,999,990.00
column "TOTAL PHYS ALLOC (MB)" format 9,999,990.00
column "USED (MB)" format 9,999,990.00
column "FREE (MB)" format 9,999,990.00
column "% USED" format 990.00

select a.tablespace_name,
round(a.bytes_alloc/(1024*1024*1024),2) "TOTAL ALLOC (GB)",
round(a.physical_bytes/(1024*1024*1024),2) "TOTAL PHYS ALLOC (GB)",
round(nvl(b.tot_used,0)/(1024*1024*1024),2) "USED (GB)",
round((nvl(b.tot_used,0)/a.bytes_alloc)*100,2) "% USED",
round(a.bytes_alloc/(1024*1024*1024)-nvl(b.tot_used,0)/(1024*1024*1024),2) "FREE (GB)"
from ( select tablespace_name,
sum(bytes) physical_bytes,
sum(decode(autoextensible,'NO',bytes,'YES',maxbytes)) bytes_alloc
from cdb_data_files
group by tablespace_name ) a,
( select tablespace_name, sum(bytes) tot_used
from cdb_segments
group by tablespace_name ) b
where a.tablespace_name = b.tablespace_name (+)
and a.tablespace_name not in (select distinct tablespace_name from cdb_temp_files)
and a.tablespace_name not like 'UNDO%'
order by "FREE (GB)", "TOTAL ALLOC (GB)" desc,"% USED" desc;
```

Obs: For non-cdb database replace cdb_ with dba_