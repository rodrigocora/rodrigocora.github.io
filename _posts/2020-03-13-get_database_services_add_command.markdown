---
layout: post
title:  "Cluster services scripts"
date:   2020-03-18 22:00:00 +0000
categories: oracle rac
update: 2020-04-06 12:20:00 +0000
---

Just a simple script o extract the add service command from a working cluster. I needed this because of a request to add the same services to a new cluster in a similar environment.
I'll have more requests that I'll use this script as base. I'll add them here as soon as they're done.


```
ORACLE_UNQNAME=<db_unique_name>

for service_name in `srvctl status service -d ${ORACLE_UNQNAME} | cut -d' ' -f2`; do 
    srvctl config service -d ${ORACLE_UNQNAME} -s $service_name  | grep -E 'Preferred|Available|Service name' | cut -d' ' -f3 | paste -sd ' ' | while read -r srv_name preferred available; do
        echo srvctl add service -d ${ORACLE_UNQNAME} -s $srv_name -r ${preferred} -a ${available}
        echo srvctl start service -d ${ORACLE_UNQNAME} -s $srv_name
    done
done
```

Relocate services to the first preferred instance

```
ORACLE_UNQNAME=<db_unique_name>

echo > /tmp/services_list.tmp
for service_name in `srvctl status service -d ${ORACLE_UNQNAME} | cut -d' ' -f2`; do 
    srvctl config service -d ${ORACLE_UNQNAME} -s ${service_name}  | grep -E 'Preferred|Available|Service name' | cut -d' ' -f3 | paste -sd ' ' | while read -r srv_name preferred available; do
        echo srvctl relocate service -d ${ORACLE_UNQNAME} -s $srv_name -i ${preferred} -t `echo ${available} | cut -d, -f1` -f >> /tmp/services_list.tmp
    done
done
cat /tmp/services_list.tmp | sort -k 9
```