---
layout: post
title:  "Setup ssh-agent windows 10 and wsl1"
date:   2021-03-28 21:00:00 +0000
categories: keepass ssh-agent 
update: 2021-03-28 21:00:00 +0000
---
### Windows Configuration
#### Start Open-ssh service 
win + r
`services.msc`
Look for OpenSSH Authentication Agent, start the the service and set the Startup type to automatic

###### Issue1:

https://github.com/PowerShell/Win32-OpenSSH/issues/1234

tldr: Add a dummy sshd process  
Open windows terminal/powershell as administrator and execute:
`sc.exe create sshd binPath=C:\Windows\System32\OpenSSH\ssh.exe`

###### Issue 2:

Got `warning: agent returned different signature type ssh-rsa (expected rsa-sha2-512).` when running `ssh-add.exe -l` on windows terminal.
Found the fix in this issue: https://github.com/PowerShell/Win32-OpenSSH/issues/1263

tldr:
Download lastet Win32-OpenSSH release from here: https://github.com/PowerShell/Win32-OpenSSH/releases
Replace the content of the install-sshd.ps1 file for this https://gist.github.com/dbuades/156d03240e5272201e66e33b7d037fce

Allow script execution on powershell:
`Set-ExecutionPolicy -ExecutionPolicy Unrestricted -Scope CurrentUser`
#### To foward the agent to wsl1
Follow the stpes described here https://github.com/rupor-github/wsl-ssh-agent

tldr:
Download the latest version from https://github.com/rupor-github/wsl-ssh-agent/releases
Uncompress to anywhere you want, in my case c:\wsl-gpg-agent
Run the following to create the socket file in a known location, I've created a tasks the execute it after the login.
c:\wsl-gpg-agent\wsl-ssh-agent-gui.exe -socket C:\wsl-gpg-agent\ssh-agent.sock

In the wsl instance exeucte the following command as needed or set it on your .profile/.bash_profile/etc
`export SSH_AUTH_SOCK=/mnt/c/wsl-gpg-agent/ssh-agent.sock`

### KeepassXC Configuration

01 - Enable SSH Agent integration
Open settings

<image>

Go to SSH Agent and mark these two checkboxes

<image>

Add a new entry