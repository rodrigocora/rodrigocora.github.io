---
layout: post
title:  "ORA-28040: No matching authentication protocol"
date:   2020-02-29 10:00:00 +0000
categories: oracle session jdbc
---


I order to prevent the error `ORA-28040: No matching authentication protocol` that I've faced after upgrading some databases I've looked around and found [here](http://marcel.vandewaters.nl/oracle/database-oracle/determine-versions-of-connected-oracle-clients) a query to identify the version of the client connected to the database. I've created a view as follows to facilate the access to this information.



```
CREATE OR REPLACE VIEW XKSUSECON
AS
    SELECT * FROM SYS.x$ksusecon;

GRANT SELECT ON XKSUSECON TO <SCHEMA_NAME>;

GRANT SELECT ON GV_$SESSION TO <SCHEMA_NAME>;

CREATE OR REPLACE VIEW <SCHEMA_NAME>.CONN_JDBC_VERSION
AS
    WITH
        x
        AS
            (SELECT DISTINCT
                    ksusenum                                          sid,
                    ksuseclvsn,
                    TRIM (TO_CHAR (ksuseclvsn, 'xxxxxxxxxxxxxx'))     to_c,
                    TO_CHAR (ksuseclvsn, 'xxxxxxxxxxxxxx')            v
               FROM sys.xksusecon)
    SELECT s.inst_id,
           x.sid,
           s.serial#,
           DECODE (
               to_c,
               '0', 'Unknown',
                  TO_NUMBER (SUBSTR (v, 8, 2), 'xx')
               || '.'
               ||                                                   -- maj_rel
                  SUBSTR (v, 10, 1)
               || '.'
               ||                                                   -- mnt_rel
                  SUBSTR (v, 11, 2)
               || '.'
               ||                                                   -- ias_rel
                  SUBSTR (v, 13, 1)
               || '.'
               ||                                                   -- ptc_set
                  SUBSTR (v, 14, 2))    client_version,            -- port_mnt
           username,
           program,
           module,
           s.machine
      FROM x, gv$session s
     WHERE x.sid LIKE s.sid AND TYPE != 'BACKGROUND';
```

 My goal is to avoid setting the `sqlnet.allowed_logon_version_server` parameter to a lower version value.