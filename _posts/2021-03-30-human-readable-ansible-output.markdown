---
layout: post
title:  "Human readable ansible output"
date:   2021-03-30 12:00:00 +0000
categories: oracle rac 
update: 2021-03-30 12:00:00 +0000
---

### Human readable ansible output 

In the current session execute the command below or add it to your .bash_profile/.profile  
`export ANSIBLE_STDOUT_CALLBACK=debug`

Alternatively adding the line below to your `ansible.cfg` (default `/etc/ansible/ansible.cfg`) also works:  
`stdout_callback = debug`
