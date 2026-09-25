// The document stays readable without JavaScript. These handlers enhance navigation,
// architecture tabs and actual project screenshots without a rendering framework.

document.querySelectorAll<HTMLElement>('[data-tabs]').forEach((group) => {
  const tabs = [...group.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  function selectTab(selected: HTMLButtonElement, focus = false) {
    tabs.forEach((tab) => {
      const active = tab === selected;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      const panel = document.getElementById(tab.getAttribute('aria-controls') ?? '');
      if (panel) panel.hidden = !active;
    });
    if (focus) selected.focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', (event) => {
      let target: number;
      if (event.key === 'ArrowRight') target = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') target = (index + tabs.length - 1) % tabs.length;
      else if (event.key === 'Home') target = 0;
      else if (event.key === 'End') target = tabs.length - 1;
      else return;
      event.preventDefault();
      selectTab(tabs[target], true);
    });
  });
});

const dialog = document.querySelector<HTMLDialogElement>('#image-dialog');
const dialogImage = document.querySelector<HTMLImageElement>('#dialog-image');
const caption = document.querySelector<HTMLElement>('#image-caption');
let returnFocus: HTMLElement | null = null;

if (dialog && dialogImage && caption) {
  document.querySelectorAll<HTMLAnchorElement>('[data-lightbox]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      returnFocus = link;
      dialogImage.src = link.href;
      dialogImage.alt =
        link.querySelector('img')?.alt ?? link.dataset.caption ?? 'Project application screenshot';
      caption.textContent = link.dataset.caption ?? '';
      dialog.showModal();
      document.body.classList.add('dialog-open');
    });
  });
  dialog.querySelector('.dialog-close')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    const bounds = dialog.getBoundingClientRect();
    if (
      event.target === dialog &&
      (event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom)
    )
      dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
    returnFocus?.focus({ preventScroll: true });
  });
}

function openHashTarget() {
  let id: string;
  try {
    id = decodeURIComponent(window.location.hash.slice(1));
  } catch {
    return;
  }
  const target = document.getElementById(id);
  if (!target) return;
  const details = target.closest('details');
  if (details) {
    details.open = true;
    requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
  }
}
window.addEventListener('hashchange', openHashTarget);
document.querySelectorAll<HTMLAnchorElement>('a[href$="-case-study"]').forEach((link) => {
  link.addEventListener('click', () => {
    if (link.hash === window.location.hash) openHashTarget();
  });
});
openHashTarget();

const navigation = [...document.querySelectorAll<HTMLAnchorElement>('.navigation a')];
const sections = navigation
  .map((link) => document.getElementById(link.hash.slice(1)))
  .filter((section): section is HTMLElement => section !== null);
let queued = false;
function updateNavigation() {
  const nearBottom =
    window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 20;
  let active: string | undefined = sections[0]?.id;
  sections.forEach((section) => {
    if (section.getBoundingClientRect().top <= 170) active = section.id;
  });
  if (nearBottom) active = sections.at(-1)?.id;
  navigation.forEach((link) => {
    if (link.hash === `#${active}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  queued = false;
}
window.addEventListener(
  'scroll',
  () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(updateNavigation);
    }
  },
  { passive: true },
);
updateNavigation();

// Keep the visitor's playback choice local to one project at a time.
const demos = [...document.querySelectorAll<HTMLVideoElement>('.project video')];
demos.forEach((video) => {
  video.addEventListener('play', () => {
    demos.forEach((other) => {
      if (other !== video) other.pause();
    });
  });
});
