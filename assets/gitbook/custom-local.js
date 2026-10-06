document.querySelectorAll('pre code').forEach(function (el) {
  if (/\blang(?:uage)?-[\w-]+\b/.test(el.className)) hljs.highlightElement(el);
});
