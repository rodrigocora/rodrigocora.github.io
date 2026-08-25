---
layout: post
title:  "Share windows ssh-agent keys with wsl2 "
date:   2026-06-15 12:20:00 +0000
categories: windows ssh-agent linux wsl2 ssh
update: 2026-06-15 12:20:00 +0000
---

### 1. The Problem: SSH Agent Isolation
OpenSSH on Windows exposes the agent via a local pipe (`\\.\pipe\openssh-ssh-agent`). WSL2 expects a Unix socket (a `.sock` file). The solution is to bridge the two.

### 2. Step 1: Download npiperelay
`npiperelay` allows WSL to access Windows pipes.

1. On Windows, create a folder to store tools, for example: `C:\tools`
2. Download the latest version of `npiperelay.exe` from the official GitHub repository:
   [https://github.com/jstarks/npiperelay/releases](https://github.com/jstarks/npiperelay/releases)
3. Extract the zip file and place `npiperelay.exe` inside `C:\tools`.

### 3. Step 2: Install socat on WSL2
`socat` will redirect traffic from the Unix socket to the Windows executable.

Open a WSL2 terminal and run:
```bash
# Update package list and install socat
sudo apt-get update
sudo apt-get install socat -y
```

### 4. Step 3: Configure the Bridge in WSL2
Now we'll tell WSL2 to use this bridge every time you open a terminal.

1. In the WSL2 terminal, open your shell configuration file (usually `~/.bashrc` or `~/.zshrc`):
   ```bash
   # Open bashrc in nano editor
   vi ~/.bashrc
   ```

2. Add the following block at the end of the file:
   ```bash
   # Define the path to npiperelay.exe on the Windows side
   NPIPERELAY="/mnt/c/tools/npiperelay.exe"
   
   # Define where the Unix socket will be created
   export SSH_AUTH_SOCK=$HOME/.ssh/agent.sock
   
   # Check if socat is already bridging the socket, if not, start it
   if ! ps -x | grep -q "[s]ocat UNIX-LISTEN:$SSH_AUTH_SOCK"; then
       rm -f $SSH_AUTH_SOCK
       (setsid socat UNIX-LISTEN:$SSH_AUTH_SOCK,fork,umask=077 EXEC:"$NPIPERELAY -ei -s //./pipe/openssh-ssh-agent",pipes &) >/dev/null 2>&1
   fi
   ```

3. Save and exit.

4. Reload the configuration by running:
   ```bash
   # Reload bash configuration
   source ~/.bashrc
   ```

**Test:**
Now run the command below in WSL2. It should list the keys loaded by KeePassXC:
```bash
# List keys currently loaded in the SSH agent
ssh-add -l
```