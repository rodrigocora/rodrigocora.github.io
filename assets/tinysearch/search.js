(function () {
  "use strict";

  var WASM_SRC = window.TINYSEARCH_WASM_SRC || "/assets/tinysearch/tinysearch_engine.wasm";
  var MAX_RESULTS = 8;
  var DEBOUNCE_MS = 120;

  var input = document.getElementById("ts-search");
  var results = document.getElementById("ts-search-results");
  var box = document.getElementById("ts-search-box");
  if (!input || !results || !box) return;

  var exports = null;
  var mem = null;
  var heapBase = 0;
  var state = "idle"; // idle | loading | ready | failed
  var active = -1;
  var debounceTimer = null;

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function metaText(meta) {
    if (!meta) return "";
    try {
      var o = JSON.parse(meta);
      if (o.description) return o.description;
      var keys = Object.keys(o);
      if (!keys.length) return "";
      return keys.map(function (k) { return k + ": " + o[k]; }).join(" \u00b7 ");
    } catch (e) {
      return "";
    }
  }

  function loadWasm() {
    if (state === "loading" || state === "ready") return;
    state = "loading";
    fetch(WASM_SRC, { mode: "cors" })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.arrayBuffer();
      })
      .then(function (bytes) { return WebAssembly.instantiate(bytes); })
      .then(function (mod) {
        exports = mod.instance.exports;
        mem = exports.memory;
        heapBase = exports.__heap_base ? exports.__heap_base.value : 0;
        state = "ready";
        onInput();
      })
      .catch(function () {
        state = "failed";
        showStatus("Search unavailable");
      });
  }

  function toWasmPtr(str) {
    var bytes = new TextEncoder().encode(str + "\u0000");
    var needed = heapBase + bytes.length;
    if (needed > mem.buffer.byteLength) {
      mem.grow(Math.ceil((needed - mem.buffer.byteLength) / 65536));
    }
    new Uint8Array(mem.buffer, heapBase, bytes.length).set(bytes);
    return heapBase;
  }

  function fromWasmStr(ptr) {
    var u = new Uint8Array(mem.buffer);
    var e = ptr;
    while (e < u.length && u[e] !== 0) e++;
    return new TextDecoder().decode(u.subarray(ptr, e));
  }

  function run(query) {
    var ptr = toWasmPtr(query);
    var rptr = exports.search(ptr, MAX_RESULTS);
    var json = rptr ? fromWasmStr(rptr) : null;
    if (rptr) exports.free_search_result(rptr);
    var list = [];
    if (json) {
      try { list = JSON.parse(json); } catch (e) { list = []; }
    }
    render(list);
  }

  function render(list) {
    active = -1;
    if (!list.length) {
      showStatus("No results found");
      return;
    }
    results.innerHTML = list.map(function (item) {
      var meta = metaText(item.meta);
      return '<li role="option">' +
        '<a href="' + esc(item.url) + '">' +
          '<span class="ts-title">' + esc(item.title) + "</span>" +
          (meta ? '<span class="ts-meta">' + esc(meta) + "</span>" : "") +
        "</a></li>";
    }).join("");
    results.hidden = false;
  }

  function showStatus(msg) {
    active = -1;
    results.innerHTML = '<li class="ts-status">' + esc(msg) + "</li>";
    results.hidden = false;
  }

  function open() {
    input.setAttribute("aria-expanded", "true");
  }

  function close() {
    results.hidden = true;
    active = -1;
    input.setAttribute("aria-expanded", "false");
  }

  function onInput() {
    var q = input.value.trim();
    if (!q) {
      close();
      return;
    }
    if (state !== "ready") {
      loadWasm();
      return;
    }
    results.hidden = false;
    open();
    run(q);
  }

  function setHighlight(i) {
    var items = results.querySelectorAll("li:not(.ts-status)");
    for (var k = 0; k < items.length; k++) items[k].classList.remove("ts-active");
    if (items[i]) {
      items[i].classList.add("ts-active");
      items[i].scrollIntoView({ block: "nearest" });
    }
    active = i;
  }

  input.addEventListener("focus", function () {
    if (state === "idle" && input.value.trim()) onInput();
    else if (state === "idle") loadWasm();
  });

  input.addEventListener("input", function () {
    if (state === "idle") loadWasm();
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(onInput, DEBOUNCE_MS);
  });

  input.addEventListener("keydown", function (e) {
    var items = results.querySelectorAll("li:not(.ts-status)");
    if (e.key === "ArrowDown") {
      if (items.length) {
        e.preventDefault();
        setHighlight(active < items.length - 1 ? active + 1 : 0);
      }
    } else if (e.key === "ArrowUp") {
      if (items.length) {
        e.preventDefault();
        setHighlight(active > 0 ? active - 1 : items.length - 1);
      }
    } else if (e.key === "Enter") {
      if (active >= 0 && items[active]) {
        e.preventDefault();
        var a = items[active].querySelector("a");
        if (a) window.location.href = a.href;
      }
    } else if (e.key === "Escape") {
      close();
      input.blur();
    }
  });

  input.addEventListener("blur", function () {
    setTimeout(close, 150);
  });

  document.addEventListener("click", function (e) {
    if (!box.contains(e.target)) close();
  });
})();
