#!/bin/bash

ansible-playbook  ansible-playbook.yml

PATH=/usr/local/bin:/usr/bin:/bin
bundle exec jekyll serve --livereload
