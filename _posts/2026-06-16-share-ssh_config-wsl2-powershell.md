---
layout: post
title:  "Integrate ssh_config from wsl2 with powershell"
date:   2026-06-16 12:20:00 +0000
categories: windows wsl2 linux
update: 2026-06-16 12:20:00 +0000
---

### Use the `Include` directive on Windows (Recommended)

The OpenSSH client built into Windows supports the `Include` directive, including with network paths (UNC). This avoids permission issues on Windows.

1. Open PowerShell or Notepad on Windows.
2. Edit the Windows SSH configuration file:
   ```powershell
   # Open Windows SSH config in notepad
   notepad $env:USERPROFILE\.ssh\config
   ```
3. Add the following line at the top of the file (adjusting for your actual path):
   ```text
   # Include WSL2 SSH config as primary
   Include \\wsl.localhost\Ubuntu\home\<YourLinuxUser>\.ssh\config
   ```
4. Save and close the file.

