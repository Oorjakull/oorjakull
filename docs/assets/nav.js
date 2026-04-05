const NAV = [
  { label: 'Overview',       href: 'index.html' },
  { section: 'Setup' },
  { label: 'Getting Started', href: 'getting-started.html', sub: true },
  { section: 'Architecture' },
  { label: 'System Architecture', href: 'architecture.html', sub: true },
  { section: 'Codebase' },
  { label: 'Frontend',       href: 'frontend.html',    sub: true },
  { label: 'Backend',        href: 'backend.html',     sub: true },
  { label: 'AI & LLM',       href: 'ai-llm.html',      sub: true },
  { label: 'Database',       href: 'database.html',    sub: true },
  { section: 'Product' },
  { label: 'Session Flow',   href: 'session-flow.html', sub: true },
  { section: 'Operations' },
  { label: 'Deployment',     href: 'deployment.html',  sub: true },
  { label: 'Contributing',   href: 'contributing.html', sub: true },
];

function buildNav() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  const current = window.location.pathname.split('/').pop() || 'index.html';

  let html = `<a class="sidebar-logo" href="index.html">Oorja<span>Kull</span> <small style="font-size:.6rem;color:var(--text-muted);display:block;font-family:'DM Sans',sans-serif;letter-spacing:.1em;text-transform:uppercase">Docs</small></a>`;

  NAV.forEach(item => {
    if (item.section) {
      html += `<div class="sidebar-section">${item.section}</div>`;
    } else {
      const active = current === item.href ? ' active' : '';
      const sub    = item.sub ? ' sub' : '';
      html += `<a href="${item.href}" class="${(active + sub).trim()}">${item.label}</a>`;
    }
  });

  sidebar.innerHTML = html;
}

function buildCopyButtons() {
  document.querySelectorAll('pre').forEach(pre => {
    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.textContent = 'Copy';
    btn.onclick = () => {
      const code = pre.querySelector('code');
      navigator.clipboard.writeText(code ? code.textContent : pre.textContent).then(() => {
        btn.textContent = 'Copied';
        setTimeout(() => btn.textContent = 'Copy', 2000);
      });
    };
    pre.appendChild(btn);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  buildNav();
  buildCopyButtons();
  // Mobile hamburger
  const ham = document.querySelector('.hamburger');
  const sb  = document.getElementById('sidebar');
  if (ham && sb) ham.addEventListener('click', () => sb.classList.toggle('open'));
});
