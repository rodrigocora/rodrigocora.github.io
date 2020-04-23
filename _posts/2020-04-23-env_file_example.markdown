---
layout: post
title:  "Env file example"
date:   2020-04-23 12:20:00 +0000
categories: oracle rac
update: 2020-04-23 12:20:00 +0000
---

We use files with content like this to load the environment variables needed to work in a local instance of oracle database.


```
export ORACLE_SID=ORCL1
export ORACLE_UNQNAME=ORCL
export ORACLE_BASE=/u01/app/oracle
export ORACLE_HOME=$ORACLE_BASE/product/19.0.0/dbhome_1
export PATH=$ORACLE_HOME/bin:$ORACLE_HOME/OPatch:$PATH

export CRS_HOME=/u01/app/19.0.0/grid
export NLS_LANG=American_America.AL32UTF8

ORACLE_UNQNAME_LOWER=`echo $ORACLE_UNQNAME | tr '[:upper:]' '[:lower:]'`
alias bdump='cd /u01/app/oracle/diag/rdbms/$ORACLE_UNQNAME_LOWER/'$ORACLE_SID'/trace'
alias alert='tail -100f /u01/app/oracle/diag/rdbms/$ORACLE_UNQNAME_LOWER/'$ORACLE_SID'/trace/alert_'$ORACLE_SID'.log'
```