---
layout: post
title:  "CLSRSC-700: Disk group 'facility=0x3622c88' contains invalid characters in its name"
date:   2020-01-24 16:40:00 +0000
categories: oracle upgrade
---

I's upgrading a GRID Infrastructure. Everything was ok with the pre-checks. But during the upgrade itself, when I's asked to run the rootupgrade.sh I faced this error:

> `CLSRSC-700: Disk group 'facility=0x3622c88' contains invalid characters in its name.`

We've no diskgroup with this name nor anything remotly close to this (this characters are not even allowed in the creation)

It's odd because I've run every pre-check I could remember, checked every permission. 

to be continued...