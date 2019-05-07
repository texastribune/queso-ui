var showLegacy = document.querySelector('#showLegacy');
showLegacy.addEventListener('click', function() {
  document.body.classList.toggle('js-ds-show-legacy');
  this.classList.toggle('is-active');
});
