---
layout: post
title:  "Oracle APEX HTTPS Configuration Guide"
date:   2026-03-13 10:00:00 +0000
categories: oracle wallet https apex
---

### Oracle APEX HTTPS Configuration Guide (Google Services)

#### 1. Infrastructure & OS Level Validation (Linux Shell)

```bash
# 1. Validate if the server has egress access to the URL (Network/DNS/Firewall check)
curl -v https://accounts.google.com/.well-known/openid-configuration

# 2. Download certificates
openssl s_client -showcerts -connect accounts.google.com:443 </dev/null 2>/dev/null | awk '/BEGIN CERTIFICATE/{f=1; i++} f{print > ("/tmp/google-" i ".pem")} /END CERTIFICATE/{f=0; close("/tmp/google-" i ".pem")}'

# 3. Create Oracle Wallet if it doesn't exist
orapki wallet create -wallet $ORACLE_HOME/wallet/https_wallet -auto_login -pwd MyPassword

# 4. Ensure correct file system permissions
chmod 600 $ORACLE_HOME/wallet/https_wallet/*

# 5. Import certificates into the wallet
orapki wallet add -wallet $ORACLE_HOME/wallet/https_wallet -trusted_cert -cert /tmp/google-1.pem -pwd MyPassword
orapki wallet add -wallet $ORACLE_HOME/wallet/https_wallet -trusted_cert -cert /tmp/google-2.pem -pwd MyPassword
orapki wallet add -wallet $ORACLE_HOME/wallet/https_wallet -trusted_cert -cert /tmp/google-3.pem -pwd MyPassword

# 6. Verify imported certificates
orapki wallet display -wallet $ORACLE_HOME/wallet/https_wallet -pwd "MyPassword" -complete

# 7. Extract Serial Number without ":" (Optional)
orapki wallet display -wallet $ORACLE_HOME/wallet/https_wallet -pwd "MyPassword" -complete | grep Serial | tr -d ':'

# 8. Remove incorrect entry from wallet (Optional)
# If using the serial number, remember to remove the ":" characters
orapki wallet remove -wallet $ORACLE_HOME/wallet/https_wallet -trusted_cert -pwd "MyPassword" -dn "CN=accounts.google.com"

# 9. RAC/Cluster Note:
# Copy the wallet to all cluster nodes, maintaining the exact same path and permissions.
```

---

#### 2. Database & APEX Configuration (SQL/PLSQL)

```sql
-- 1. Check current APEX version (Multiple versions might be installed)
SELECT comp_id, comp_name, version, status 
FROM dba_registry 
WHERE comp_id = 'APEX';

-- Note: The principal_name (e.g., APEX_220200) must match the version returned above.
SET SERVEROUT ON;

-- 2. Clean up existing ACEs to avoid conflicts
BEGIN
  DBMS_NETWORK_ACL_ADMIN.REMOVE_HOST_ACE(
    host       => 'accounts.google.com',
    ace        => xs$ace_type(privilege_list => xs$name_list('resolve'),
                             principal_name => 'APEX_220200',
                             principal_type => xs_acl.ptype_db));
  
  DBMS_NETWORK_ACL_ADMIN.REMOVE_HOST_ACE(
    host       => 'accounts.google.com',
    lower_port => 443,
    upper_port => 443,
    ace        => xs$ace_type(privilege_list => xs$name_list('connect'),
                             principal_name => 'APEX_220200',
                             principal_type => xs_acl.ptype_db));                             
END;
/
COMMIT;

-- 3. Configure Network ACLs
BEGIN
    DBMS_NETWORK_ACL_ADMIN.APPEND_HOST_ACE(
        host       => '*.gstatic.com',
        ace        => xs$ace_type(privilege_list => xs$name_list('resolve'),
                                 principal_name => 'APEX_220200',
                                 principal_type => xs_acl.ptype_db));
    DBMS_NETWORK_ACL_ADMIN.APPEND_HOST_ACE(
        host       => '*.google.com',
        ace        => xs$ace_type(privilege_list => xs$name_list('resolve'),
                                 principal_name => 'APEX_220200',
                                 principal_type => xs_acl.ptype_db));
    DBMS_NETWORK_ACL_ADMIN.APPEND_HOST_ACE(
        host       => '*.googleapis.com',
        ace        => xs$ace_type(privilege_list => xs$name_list('resolve'),
                                 principal_name => 'APEX_220200',
                                 principal_type => xs_acl.ptype_db));                             
    DBMS_NETWORK_ACL_ADMIN.APPEND_HOST_ACE(
        host       => '*.google.com',
        lower_port => 443,
        upper_port => 443,
        ace        => xs$ace_type(privilege_list => xs$name_list('connect'),
                                principal_name => 'APEX_220200',
                                principal_type => xs_acl.ptype_db));
    DBMS_NETWORK_ACL_ADMIN.APPEND_HOST_ACE(
        host       => '*.googleapis.com',
        lower_port => 443,
        upper_port => 443,
        ace        => xs$ace_type(privilege_list => xs$name_list('connect'),
                                 principal_name => 'APEX_220200',
                                 principal_type => xs_acl.ptype_db));
    DBMS_NETWORK_ACL_ADMIN.APPEND_HOST_ACE(
        host       => '*.gstatic.com',
        lower_port => 443,
        upper_port => 443,
        ace        => xs$ace_type(privilege_list => xs$name_list('connect'),
                                 principal_name => 'APEX_220200',
                                 principal_type => xs_acl.ptype_db));
  
  -- 4. Grant Wallet permissions (Adjust path to absolute path)
  DBMS_NETWORK_ACL_ADMIN.APPEND_WALLET_ACE(
    wallet_path => 'file:/u01/app/oracle/product/version/dbhome_1/wallet/https_wallet',
    ace         => xs$ace_type(privilege_list => xs$name_list('use_client_certificates'),
                             principal_name => 'APEX_220200',
                             principal_type => xs_acl.ptype_db));
END;
/
COMMIT;

-- 5. Session-level Test
DECLARE
    l_response CLOB;
BEGIN
    apex_web_service.g_request_headers(1).name := 'Content-Type';
    apex_web_service.g_request_headers(1).value := 'application/json';
  
    l_response := apex_web_service.make_rest_request(
        p_url         => 'https://accounts.google.com/.well-known/openid-configuration',
        p_http_method => 'GET',
        p_wallet_path => 'file:/u01/app/oracle/product/version/dbhome_1/wallet/https_wallet',
        p_wallet_pwd  => 'MyPassword'
    );
  
    dbms_output.put_line(dbms_lob.substr(l_response, 1000, 1));
END;
/

-- 6. Define Global Instance Wallet Parameters
BEGIN
    -- APEX_INSTANCE_ADMIN.SET_PARAMETER('HTTP_PROXY', 'ProxyHost:Port'); -- If proxy is required
    APEX_INSTANCE_ADMIN.SET_PARAMETER('WALLET_PATH', 'file:/u01/app/oracle/product/version/dbhome_1/wallet/https_wallet');
    APEX_INSTANCE_ADMIN.SET_PARAMETER('WALLET_PWD', 'MyPassword');
    COMMIT;
END;
/

-- 7. Final Test using Global Instance Settings
DECLARE
    l_response CLOB;
BEGIN
    apex_web_service.g_request_headers(1).name := 'Content-Type';
    apex_web_service.g_request_headers(1).value := 'application/json';
  
    l_response := apex_web_service.make_rest_request(
        p_url         => 'https://accounts.google.com/.well-known/openid-configuration',
        p_http_method => 'GET'
    );
  
    dbms_output.put_line(dbms_lob.substr(l_response, 1000, 1));
END;
/
```