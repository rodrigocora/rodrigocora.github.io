---
layout: post
title:  "Tuning adivisor procedure"
date:   2022-03-26 18:00:00 +0000
categories: oracle performance sql
---
### Procedure to run the Tuning Advisor on a given sql_id
```
SET SERVEROUTPUT ON
DECLARE
  l_sql_tune_task_id  VARCHAR2(100);
  v_sql_id VARCHAR2(100) := 'dra848n63d1ts';
  v_tuning_results  clob;
BEGIN
  BEGIN
    l_sql_tune_task_id := DBMS_SQLTUNE.create_tuning_task (
                            sql_id      => v_sql_id,
                            scope       => DBMS_SQLTUNE.scope_comprehensive,
                            time_limit  => 500,
                            task_name   => v_sql_id || '_tuning',
                            description => 'Tuning task1 for statement ' || v_sql_id);
  END;
  BEGIN
    DBMS_SQLTUNE.execute_tuning_task(task_name => v_sql_id || '_tuning');
    select dbms_sqltune.report_tuning_task(v_sql_id || '_tuning') into v_tuning_results from dual;
    DBMS_OUTPUT.put_line(v_tuning_results);
    dbms_sqltune.drop_tuning_task(v_sql_id || '_tuning');
  END;
END;
/
```

### Get execution plan of a given sql_id
```
select plan_table_output from table(dbms_xplan.display_cursor('d5x9ujtv1rn6b'));
```

### Get execution plan of a given sql_id with variable values
```
select * from table(dbms_xplan.display_cursor(sql_id=>'d5x9ujtv1rn6b', format=>'TYPICAL +peeked_binds'));
```