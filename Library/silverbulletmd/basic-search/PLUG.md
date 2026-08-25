---
name: Library/silverbulletmd/basic-search/PLUG
tags: meta/library
files:
- search.plug.js
share.uri: "https://github.com/silverbulletmd/basic-search/blob/main/PLUG.md"
share.hash: 59d1e9ad
share.mode: pull
---
# Basic Full Text Search
Formerly a built-in plug for SilverBullet, now installable separately for those who don’t want to (for whatever reason) use the far superior [Silversearch](https://github.com/MrMugame/silversearch) instead. Seriously, use Silversearch instead of this.

No? Alright then.

## Initial index
Perform a `Space: Reindex` after installing this plug.

## Commands
* `Search Space` (`Cmd-Shift-f`/`Ctrl-Shift-f`): performs a full text search across your space.

# Implementation
(part Lua, part Plug)

```space-lua
-- priority: 5
command.define {
  name = "Search Space",
  key = "Ctrl-Shift-f",
  mac = "Cmd-Shift-f",
  run = function()
    local phrase = editor.prompt "Search for:"
    if phrase then
      editor.navigate("search:" .. phrase)
    end
  end
}

virtualPage.define {
  pattern = "search:(.+)",
  run = function(phrase)
    -- These are implemented in the plug code
    local results = search.ftsSearch(phrase)
    local pageText = "# Search results for '" .. phrase .. "'\n"
    for r in each(results) do
      pageText = pageText .. spacelua.interpolate("* [[${r.id}|${r.id}]] (score ${r.score})\n", {r=r})
    end
    return pageText
  end
}
```
