// Add a simple sidebar toggle
var container = document.querySelector('#content');
var button = document.querySelector('#sidebarToggle');
button.addEventListener('click', function() {
  container.classList.toggle('ds-hide-sidebar');
});
// Add simple dropdown for Bulma dropdown component
document.addEventListener('DOMContentLoaded', function() {
  // Dropdowns
  var $dropdowns = getAll('.dropdown:not(.is-hoverable)');
  if ($dropdowns.length > 0) {
    $dropdowns.forEach(function($el) {
      $el.addEventListener('click', function(event) {
        event.stopPropagation();
        $el.classList.toggle('is-active');
      });
    });
  }
  function closeDropdowns() {
    $dropdowns.forEach(function($el) {
      $el.classList.remove('is-active');
    });
  }
  // Close dropdowns if ESC pressed
  document.addEventListener('keydown', function(event) {
    var e = event || window.event;
    if (e.keyCode === 27) {
      closeDropdowns();
    }
  });
  // Functions
  function getAll(selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector), 0);
  }
});

var buttonLegacy = document.querySelector('#buttonLegacy');
buttonLegacy.addEventListener('click', function() {
  this.disabled = true;
  document.getElementById('buttonV2').disabled = false;
  changeCSS('base-v2', 'base');
});
var buttonV2 = document.querySelector('#buttonV2');
buttonV2.addEventListener('click', function() {
  this.disabled = true;
  document.getElementById('buttonLegacy').disabled = false;
  changeCSS('base', 'base-v2');
});
var addLink = function(id) {
  var link = document.createElement('link');
  link.href = id + '.min.css';
  link.id = id;
  link.rel = 'stylesheet';
  link.type = 'text/css'; // no need for HTML5
  document.getElementsByTagName('head')[0].appendChild(link);
};
function changeCSS(cssFileOut, cssFileIn) {
  var outEl = document.querySelector('#' + cssFileOut);
  var inEl = document.querySelector('#' + cssFileIn);
  if (outEl.parentNode) {
    outEl.parentNode.removeChild(outEl);
    document.getElementById('buttonToggle').textContent =
      'Viewing ' + cssFileIn + '.css ONLY.';
  }
  if (!inEl) {
    addLink(cssFileIn);
  }
}
