---
layout: post
title:  "Get database services add command"
date:   2020-03-18 22:00:00 +0000
categories: oracle rac
---

Just a simple script o extract the add service command from a working cluster. I needed this because of a request to add the same services to a new cluster in a similar environment.


```
ORACLE_UNQNAME=<db_unique_name>

for service_name in `srvctl status service -d ${ORACLE_UNQNAME} | cut -d' ' -f2`; do 
    srvctl config service -d ${ORACLE_UNQNAME} -s $service_name  | grep -E 'Preferred|Available|Service name' | cut -d' ' -f3 | paste -sd ' ' | while read -r srv_name preferred available; do
        echo srvctl add service -d ${ORACLE_UNQNAME} -s $srv_name
        echo srvctl start service -d ${ORACLE_UNQNAME} -s $srv_name
    done
done
```