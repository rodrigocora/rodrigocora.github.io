---
layout: post
title:  "ApplySession failed but Oracle Home has not been modified.null"
date:   2020-02-01 08:10:00 +0000
categories: oracle patch upgrade
---

While applying the patch  27006180 to a Grid Home I've faced this awefuly generic error.

> UtilSession failed: ApplySession failed but Oracle Home has not been modified.null

This error message wasn't taking me anywhere. I checked everything I could think of.
Turns out the owner of the mount point where the patch is located cannot be different of the patch itself, at least that's what I've been told by oracle support. I my case `root` was the owner the mount point so, to solve this I moved to `/home/oracle` and it worked.