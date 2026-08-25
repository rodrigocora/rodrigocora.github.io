---
# Project Rules for Ansible Roles

## FQCN / Module Names

- Always use **short module names** (`command`, `template`, `copy`, `file`, etc.) instead of FQCN (`ansible.builtin.command`, etc.) when working with builtin modules.
- The `.ansible-lint` config ignores `fqcn` and `fqcn[lookup]` rules — follow that convention.

## SPDX License Header

- Remove any line matching `#SPDX-License-Identifier: MIT-0` or `# SPDX-License-Identifier: MIT-0` from YAML files.
- Do not re-introduce these headers.

## Code Style

- Do not overcomment the code. Remove any unnecessary comments. If something really needs explanation, it should be in the README.
