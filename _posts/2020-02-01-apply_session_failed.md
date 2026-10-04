---
layout: post
title:  "ApplySession failed but Oracle Home has not been modified.null"
date:   2020-02-01 08:10:00 +0000
categories: oracle patch upgrade
---

While applying patch 27006180 to a Grid Home, I faced this awfully generic error.

> UtilSession failed: ApplySession failed but Oracle Home has not been modified.null

This error message wasn't taking me anywhere. I checked everything I could think of.
Turns out the owner of the mount point where the patch is located cannot be different from the patch's owner — at least that's what Oracle support told me. In my case, `root` owned the mount point, so I moved the patch to `/home/oracle` and it worked.