// toggle legacy styles
var showLegacy = document.querySelector('#showLegacy');
if (showLegacy) {
  showLegacy.addEventListener('click', function() {
    document.body.classList.toggle('js-ds-show-legacy');
    this.classList.toggle('is-active');
  });
}

var baseFontSize = parseFloat(
  window.getComputedStyle(document.documentElement).fontSize
);

function getSizes(el, prop) {
  var compStyles = window.getComputedStyle(el);
  var px = compStyles.getPropertyValue(prop);
  var rems = parseFloat(px) / baseFontSize;
  rems = parseFloat(rems.toFixed(3));
  rems = rems.toString();
  return `${prop}: ${rems}rem | ${px}`;
}

// inject t-size-<size> font-size
var textBlocks = document.querySelectorAll('.text-size-demo');
textBlocks.forEach(el => {
  var parentEl = el.parentNode.parentElement;
  var p = parentEl.querySelector('p');
  p.textContent = getSizes(el, 'font-size');
});

// inject l-container-<size> max-width
var containers = document.querySelectorAll('.container-demo');
containers.forEach(el => {
  el.querySelector('span').textContent = getSizes(el, 'max-width');
});

// inject has-<size>-btm-marg max-width
var marginHelpers = document.querySelectorAll('.margin-demo');
marginHelpers.forEach(el => {
  var parentEl = el.parentNode.parentNode.parentElement;
  var p = parentEl.querySelector('p');
  p.textContent = getSizes(el, 'margin-bottom');
});
