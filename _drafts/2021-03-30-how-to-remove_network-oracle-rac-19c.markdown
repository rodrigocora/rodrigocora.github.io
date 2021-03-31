---
layout: post
title:  "How to remove a network oracle rac 19c"
date:   2021-03-30 11:00:00 +0000
categories: oracle rac 
update: 2021-03-30 11:00:00 +0000
---
### How to remove a network oracle rac 19c
In this tutorial we're going to remove network 2 configuration from an Oracle RAC cluster.

#### Get network info that you want to remove
```
srvctl config scan -netnum 2
srvctl config listener -all
```

#### Stop all network services that we're going to remove
```
srvctl stop scan -force -netnum 2 
srvctl stop listener -listener LISTENER_SRV
srvctl stop scan_listener -netnum 2
srvctl stop vip -vip sig-db-01-vip.srv.prd.met
srvctl stop vip -vip sig-db-02-vip.srv.prd.met
```
#### Remove the services
```
srvctl remove listener -listener LISTENER_SRV
srvctl remove scan_listener -netnum 2
sudo /app/grid/19.3.0/bin/srvctl remove scan -netnum 2 -force
sudo /app/grid/19.3.0/bin/srvctl remove network -netnum 2 -force
sudo /app/grid/19.3.0/bin/srvctl remove vip -vip sig-db-01-vip.srv.prd.met
sudo /app/grid/19.3.0/bin/srvctl remove vip -vip sig-db-02-vip.srv.prd.met
```