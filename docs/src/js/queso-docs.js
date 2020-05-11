/* eslint-disable */

const lastPosition = () => {
  const scrollEl = document.getElementById('sideNav');
  const lsKey = 'quesoScrollPos';
  if (typeof Storage !== 'undefined') {
    // See if there is a scroll pos and go there.
    const lastYPos = +localStorage.getItem(lsKey);
    if (lastYPos) {
      scrollEl.scrollTo(0, lastYPos);
    }
    // On navigating away first save the position.
    const anchors = document.querySelectorAll('#sideNav a');

    const onNavClick = function () {
      localStorage.setItem(lsKey, scrollEl.scrollTop);
    };

    anchors.forEach((anchor) => {
      anchor.addEventListener('click', onNavClick);
    });
  }
};

const toggleView = () => {
    const toggleBtn = document.querySelectorAll('.js-toggle-btn');

    toggleBtn.forEach((el) => {
      el.addEventListener('click', (e) => {
        const current = el.getAttribute('id');
        const active = document.getElementById(current + '-pane');
        const container = active.parentNode.getAttribute('id');
        const panes = document.querySelectorAll('#' + container + ' .js-pane');
        panes.forEach((pane) => {
          pane.classList.remove('active');
        });
        const buttons = document.querySelectorAll(
          '#' + container + ' .js-toggle-btn'
        );
        buttons.forEach((button) => {
          button.classList.remove('is-info');
        });
        el.classList.add('is-info');
        active.classList.add('active');
      });
    });
}

const navBar = () => {
    const navbarToggle = document.getElementById('navbarToggle');
    const navbarTarget = document.getElementById('navbarTarget');
    navbarToggle.addEventListener('click', (e) => {
      e.target.classList.toggle('is-active');
      navbarTarget.classList.toggle('is-active');
    });
}
// search autocomplete go to page
function onInput() {
  const val = document.getElementById('default').value;
  const opts = document.getElementById('terms').childNodes;
  for (var i = 0; i < opts.length; i++) {
    if (opts[i].value === val) {
      window.location.replace(opts[i].dataset.link);
      break;
    }
  }
}
document.addEventListener('DOMContentLoaded', () => {
  // scroll sidebar to active item
  lastPosition();

  // init frames
  window.newswireFrames.autoInitFrames();
  window.newswireFrames.sendFrameHeight();

  // preview, code view, etc. switcher
  toggleView();

  // toggle navbar on mobile
  navBar();
});
