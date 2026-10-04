---
layout: post
title:  "How to remove an Oracle RAC 19c network"
date:   2021-03-30 11:00:00 +0000
categories: oracle rac 
update: 2021-03-30 11:00:00 +0000
---
### How to remove an Oracle RAC 19c network
In this tutorial, we're going to remove the second network from an Oracle RAC cluster.

#### Get info about the network you want to remove
```
srvctl config network -netnum 2
srvctl config scan -netnum 2
srvctl config scan_listener -all
srvctl config listener -listener LISTENER_SRV
srvctl config vip -node db-01
```

#### Stop the network services we're going to remove
```
srvctl stop scan -force -netnum 2 
srvctl stop listener -listener LISTENER_SRV
srvctl stop scan_listener -netnum 2
srvctl stop vip -vip db-01-vip.srv
srvctl stop vip -vip db-02-vip.srv
```
#### Remove the services
```
srvctl remove scan_listener -netnum 2
srvctl remove scan -netnum 2
srvctl remove listener -listener LISTENER_SRV
sudo /app/grid/19.3.0/bin/srvctl remove scan -netnum 2 -force
sudo /app/grid/19.3.0/bin/srvctl remove network -netnum 2 -force
sudo /app/grid/19.3.0/bin/srvctl remove vip -vip db-01-vip.srv
sudo /app/grid/19.3.0/bin/srvctl remove vip -vip db-02-vip.srv
```