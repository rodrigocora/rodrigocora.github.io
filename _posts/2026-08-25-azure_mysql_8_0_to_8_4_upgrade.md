---
displayName: Azure MySQL 8.0 to 8.4 Upgrade
layout: post
title: Upgrade MySQL 8.0 to 8.4 on Azure Flexible Server
date: 2026-08-25
categories: [mysql, azure]
---

# Upgrade MySQL 8.0 → 8.4 on Azure

## 1. Alter users cipher to `caching_sha2_password`

```sql
ALTER USER 'user'@'%' IDENTIFIED WITH caching_sha2_password BY 'SAME_PASSWORD/NEW_PASSWORD';
```

## 2. Check if the alter took effect

```sql
SELECT user, host, plugin FROM mysql.user WHERE plugin = 'mysql_native_password';
```

### Check logs

```bash
az mysql flexible-server server-logs list -g <RESOURCE_GROUP> --server-name <SERVER_NAME> -o table
```

## 3. Show state and version

```bash
az mysql flexible-server show -g <RESOURCE_GROUP> --name <SERVER_NAME> \
  --query "{state:state,version:version}" -o table
```

## 4. Remove `hypergraph_optimizer` from `optimizer_switch`

### Show current value

```bash
az mysql flexible-server parameter show -g <RESOURCE_GROUP> --server-name <SERVER_NAME> \
  --name optimizer_switch -o table
```

### Apply new value

```bash
az mysql flexible-server parameter set -g <RESOURCE_GROUP> --server-name <SERVER_NAME> \
  --name optimizer_switch \
  --value "index_merge=on,index_merge_union=on,index_merge_sort_union=on,index_merge_intersection=on,engine_condition_pushdown=on,index_condition_pushdown=on,mrr=on,mrr_cost_based=on,block_nested_loop=on,batched_key_access=off,materialization=on,semijoin=on,loosescan=on,firstmatch=on,duplicateweedout=on,subquery_materialization_cost_based=on,use_index_extensions=on,condition_fanout_filter=on,derived_merge=on,use_invisible_indexes=off,skip_scan=on,hash_join=on,subquery_to_derived=off,prefer_ordering_index=on,derived_condition_pushdown=on"
```

## 5. Restart instance (might take several minutes)

```bash
az mysql flexible-server restart -g <RESOURCE_GROUP> --name <SERVER_NAME>
```

## 6. Upgrade server

```bash
az mysql flexible-server upgrade -g <RESOURCE_GROUP> --name <SERVER_NAME> --version 8.4 --yes
```
