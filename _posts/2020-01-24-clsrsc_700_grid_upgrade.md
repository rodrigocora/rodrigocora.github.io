---
layout: post
title:  "CLSRSC-700: Disk group 'facility=0x3622c88' contains invalid characters in its name"
date:   2020-01-24 16:40:00 +0000
categories: oracle upgrade
---

I was upgrading Grid Infrastructure. Everything was fine with the pre-checks. But during the upgrade itself, when I was asked to run rootupgrade.sh, I faced this error:

> `CLSRSC-700: Disk group 'facility=0x3622c88' contains invalid characters in its name.`

We have no disk group with this name, nor anything remotely close to it (these characters aren't even allowed in a name)

It's odd because I've run every pre-check I could remember, checked every permission. 

to be continued...