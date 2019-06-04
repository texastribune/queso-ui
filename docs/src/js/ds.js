// toggle legacy styles
var showLegacy = document.querySelector('#showLegacy');
showLegacy.addEventListener('click', function() {
  document.body.classList.toggle('js-ds-show-legacy');
  this.classList.toggle('is-active');
});

// inject t-size-<size> font-size
var textBlocks = document.querySelectorAll('.text-size-demo');
textBlocks.forEach(textBlock => {
  var compStyles = window.getComputedStyle(textBlock);
  var calcSize = compStyles.getPropertyValue('font-size');
  var fontSetting =
    parseFloat(calcSize) /
    parseFloat(window.getComputedStyle(document.documentElement).fontSize);
  var parentTextBlock = textBlock.parentNode.parentNode;
  if (typeof parentTextBlock !== 'undefined') {
    var div = parentTextBlock.querySelector('p');
    var remVal = parseFloat(fontSetting.toFixed(3));
    remVal = remVal.toString();
    div.textContent = `font-size: ${remVal}rem | ${calcSize}`;
  }
});

// inject l-container-<size> max-width
var containers = document.querySelectorAll('.l-container');
containers.forEach(container => {
  var compStyles = window.getComputedStyle(container);
  var maxWidth = compStyles.getPropertyValue('max-width');
  var maxWidthSetting =
    parseFloat(maxWidth) /
    parseFloat(window.getComputedStyle(document.documentElement).fontSize);
  container.querySelector(
    'span'
  ).textContent = `~ max-width: ${maxWidthSetting.toPrecision(
    3
  )}rem | ${maxWidth}`;
});
