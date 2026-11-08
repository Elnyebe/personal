(() => {
  'use strict';

  const one = (selector, root = document) => root.querySelector(selector);
  const all = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setupInitialPosition() {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    if (window.location.hash) {
      history.replaceState(history.state, '', `${window.location.pathname}${window.location.search}`);
    }
    window.scrollTo(0, 0);
    window.addEventListener('pageshow', () => window.scrollTo(0, 0), { once: true });
  }

  function setupMobileNavigation() {
    const toggle = one('.menu-toggle');
    const nav = one('.site-nav');
    if (!toggle || !nav) return;

    const close = () => {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
      nav.classList.remove('is-open');
    };

    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      toggle.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
      nav.classList.toggle('is-open', !open);
    });

    nav.addEventListener('click', (event) => {
      if (event.target.closest('a, .nav-tool')) close();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') close();
    });
  }

  function setupProjectFilters() {
    const filters = all('.filter-button');
    const cards = all('.project-card');
    filters.forEach((button) => {
      button.addEventListener('click', () => {
        const filter = button.dataset.filter;
        filters.forEach((item) => {
          const active = item === button;
          item.classList.toggle('is-active', active);
          item.setAttribute('aria-pressed', String(active));
        });
        cards.forEach((card) => {
          const categories = (card.dataset.category || '').split(/\s+/);
          card.hidden = filter !== 'all' && !categories.includes(filter);
        });
      });
    });
  }

  function setupEntranceAnimations() {
    if (reducedMotion || !('IntersectionObserver' in window)) return;

    const targets = all([
      '.hero-copy', '.profile-panel', '.scroll-cue', '.section-label',
      '.section-heading-row', '.project-filters', '.project-card',
      '.about-content', '.values-row', '.toolbox-grid article',
      '.contact > .eyebrow', '.contact > h2', '.contact-copy',
      '.contact-actions', '.footer-message', '.site-footer > .wordmark',
      '.site-footer .social-links', '.site-footer .footer-credit',
    ].join(', '));

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('is-visible', entry.isIntersecting);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });

    targets.forEach((target, index) => {
      target.classList.add('reveal');
      const siblingIndex = target.matches('.project-card')
        ? all('.project-card', target.parentElement).indexOf(target)
        : target.matches('.toolbox-grid article')
          ? all('.toolbox-grid article', target.parentElement).indexOf(target)
          : index % 3;
      let horizontalOffset = 30;
      if (target.matches('.hero-copy, .section-label, .about-content, .contact > .eyebrow, .contact > h2, .footer-message')) {
        horizontalOffset = -30;
      }
      if (target.matches('.project-card, .toolbox-grid article')) {
        horizontalOffset = siblingIndex % 2 === 0 ? -26 : 26;
      }
      target.style.setProperty('--reveal-x', `${horizontalOffset}px`);
      target.style.setProperty('--reveal-delay', `${Math.min(siblingIndex, 4) * 85}ms`);
      observer.observe(target);
    });
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[character]);
  }

  function buildResumeDocument() {
    const name = one('.hero-intro strong')?.textContent.trim()
      || one('.site-header .wordmark')?.getAttribute('aria-label')?.replace(/, home$/, '')
      || 'Your Name';
    const role = 'Full-stack Web Developer · Programmer · IT Support';
    const email = one('a[href^="mailto:"]')?.getAttribute('href')?.replace('mailto:', '') || '';
    const profile = all('.about-text p').map((paragraph) => paragraph.textContent.trim());
    const experience = all('.timeline-item').map((item) => ({
      date: one('.timeline-date', item)?.textContent.trim() || '',
      role: one('h3', item)?.textContent.trim() || '',
      organization: one('.timeline-org', item)?.textContent.trim() || '',
      details: one('.timeline-description', item)?.textContent.trim() || '',
      skills: all('.tag-row span', item).map((skill) => skill.textContent.trim()),
    }));
    const education = all('.education-list article').map((item) => ({
      date: one('.education-year', item)?.textContent.trim() || '',
      institution: one('h3', item)?.textContent.trim() || '',
      program: one('.education-program', item)?.textContent.trim() || '',
      location: one('.education-location', item)?.textContent.trim() || '',
    }));
    const projects = all('.project-card').map((item) => ({
      title: one('.project-info h3', item)?.textContent.trim() || '',
      description: one('.project-info p', item)?.textContent.trim() || '',
      skills: all('.tag-row span', item).map((skill) => skill.textContent.trim()),
    }));
    const skills = all('.skills-strip b').map((skill) => skill.textContent.trim());
    const skillGroups = [
      { label: 'Web development', items: ['Front-end Development', 'Back-end Development'] },
      { label: 'Programming', items: ['Python', 'Lua', 'C++'] },
      { label: 'IT support and networking', items: ['PC Assembly', 'Networking', 'OTDR Testing', 'Fiber-Optic Splicing'] },
      { label: 'Security', items: ['Cybersecurity', 'Red Teaming', 'Blue Teaming'] },
      { label: 'Tools', items: ['VS Code'] },
    ].map(({ label, items }) => {
      const matched = items.filter((skill) => skills.includes(skill));
      return matched.length
        ? `<div class="skill-group"><h3>${escapeHTML(label)}</h3><p>${matched.map(escapeHTML).join(' · ')}</p></div>`
        : '';
    }).join('');
    const contactLinks = [
      email ? `<a href="mailto:${escapeHTML(email)}">${escapeHTML(email)}</a>` : '',
      ...all('.site-footer .social-links a')
        .filter((link) => !link.href.startsWith('mailto:'))
        .map((link) => `<a href="${escapeHTML(link.href)}">${escapeHTML(link.textContent.replace(/↗/g, '').trim())}</a>`),
    ].filter(Boolean).join('');

    const experienceHTML = experience.map((item) => `
      <article>
        <div class="item-heading">
          <h3>${escapeHTML(item.role)}</h3>
          <span>${escapeHTML(item.date)}</span>
        </div>
        <p class="subline">${escapeHTML(item.organization)}</p>
        <p>${escapeHTML(item.details)}</p>
        ${item.skills.length
          ? `<p class="tags">${item.skills.map(escapeHTML).join(' \u00b7 ')}</p>`
          : ''}
      </article>`).join('');

    const projectsHTML = projects.map((item) => `
      <article>
        <h3>${escapeHTML(item.title)}</h3>
        <p>${escapeHTML(item.description)}</p>
        ${item.skills.length
          ? `<p class="tags">${item.skills.map(escapeHTML).join(' \u00b7 ')}</p>`
          : ''}
      </article>`).join('');

    const educationHTML = education.map((item) => `
      <article>
        <h3>${escapeHTML(item.institution)}</h3>
        ${item.program
          ? `<p class="education-program"><em>${escapeHTML(item.program)}</em></p>`
          : ''}
        ${item.location ? `<p class="subline">${escapeHTML(item.location)}</p>` : ''}
        ${item.date ? `<p class="education-date">${escapeHTML(item.date)}</p>` : ''}
      </article>`).join('');

    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHTML(name)} &mdash; Resume</title>
    <style>
      * {
        box-sizing: border-box;
      }

      body {
        max-width: 850px;
        margin: 0 auto;
        padding: 38px;
        color: #1c2f49;
        font: 10.5pt/1.55 Arial, Helvetica, sans-serif;
      }

      header {
        margin-bottom: 22px;
        padding-bottom: 18px;
        border-bottom: 2px solid #356fc0;
      }

      h1 {
        margin: 0 0 6px;
        font-size: 27pt;
        line-height: 1.1;
        letter-spacing: -.04em;
      }

      header p {
        margin: 0;
        color: #356fc0;
        font-size: 11pt;
      }

      header .contact {
        display: flex;
        flex-wrap: wrap;
        gap: 4px 14px;
        margin-top: 7px;
        color: #566981;
        font-size: 9pt;
      }

      header .contact a {
        color: inherit;
        text-decoration: none;
      }

      h2 {
        margin: 20px 0 10px;
        padding-bottom: 5px;
        border-bottom: 1px solid #d8e3f0;
        color: #356fc0;
        font-size: 10pt;
        letter-spacing: .09em;
        text-transform: uppercase;
      }

      h3 {
        margin: 0;
        font-size: 10.5pt;
      }

      .item-heading {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 20px;
      }

      .item-heading span {
        color: #60738a;
        font-size: 9pt;
        white-space: nowrap;
      }

      article {
        margin: 0 0 12px;
        break-inside: avoid;
      }

      article p {
        margin: 4px 0;
      }

      .subline,
      .education-date {
        color: #60738a;
        font-size: 9pt;
      }

      .education-program {
        font-style: italic;
      }

      .tags,
      .skill-group p {
        color: #536a84;
        font-size: 9pt;
      }

      .skill-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 7px 22px;
      }

      .skill-group {
        break-inside: avoid;
      }

      .skill-group h3 {
        margin: 0 0 2px;
        color: #29486c;
        font-size: 9pt;
      }

      .skill-group p {
        margin: 0;
      }

      .profile p {
        margin: 0 0 7px;
      }

      @page {
        size: letter;
        margin: .65in;
      }

      @media print {
        body {
          padding: 0;
        }
      }
    </style>
  </head>
  <body>
    <header>
      <h1>${escapeHTML(name)}</h1>
      <p>${escapeHTML(role)}</p>
      <div class="contact">${contactLinks}</div>
    </header>
    <main>
      <section class="profile">
        <h2>Profile</h2>
        ${profile.map((paragraph) => `<p>${escapeHTML(paragraph)}</p>`).join('')}
      </section>
      <section>
        <h2>Skills</h2>
        <div class="skill-grid">${skillGroups}</div>
      </section>
      <section>
        <h2>Experience</h2>
        ${experienceHTML}
      </section>
      <section>
        <h2>Selected Projects</h2>
        ${projectsHTML}
      </section>
      <section>
        <h2>Education</h2>
        ${educationHTML}
      </section>
    </main>
  </body>
</html>`;
  }

  function setupResumeDownload() {
    one('#download-resume')?.addEventListener('click', () => {
      const resumeWindow = window.open('', '_blank');
      if (!resumeWindow) {
        window.alert('Allow pop-ups to open your print-ready resume.');
        return;
      }
      resumeWindow.document.open();
      resumeWindow.document.write(buildResumeDocument());
      resumeWindow.document.close();
      window.setTimeout(() => {
        if (!resumeWindow.closed) resumeWindow.print();
      }, 250);
    });
  }

  function setupEmailCopy() {
    const button = one('#copy-email');
    const status = one('#copy-status');
    const email = one('a[href^="mailto:"]')?.getAttribute('href')?.replace('mailto:', '');
    if (!button || !status || !email) return;

    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(email);
        status.textContent = 'Email copied to clipboard.';
        button.textContent = 'Copied!';
      } catch {
        status.textContent = `Copy failed. Email: ${email}`;
      }
      window.setTimeout(() => {
        button.textContent = 'Copy email';
        status.textContent = '';
      }, 2600);
    });
  }

  function setupProjectPlanner() {
    const dialog = one('#project-flow');
    if (!dialog) return;

    const steps = all('[data-flow-step]', dialog);
    const progress = all('.flow-progress span', dialog);
    const count = one('#flow-step-count', dialog);
    const next = one('[data-flow-next]', dialog);
    const back = one('[data-flow-back]', dialog);
    const send = one('#flow-send', dialog);
    const description = one('#project-description', dialog);
    const timeline = one('#project-timeline', dialog);
    const validation = one('#flow-validation', dialog);
    let currentStep = 0;

    const chosenType = () => one('input[name="project-type"]:checked', dialog)?.value || '';
    const update = () => {
      steps.forEach((step, index) => { step.hidden = index !== currentStep; });
      progress.forEach((segment, index) => segment.classList.toggle('is-current', index <= currentStep));
      if (count) count.textContent = `Step ${currentStep + 1} of ${steps.length}`;
      if (back) back.hidden = currentStep === 0;
      if (next) {
        next.hidden = currentStep === steps.length - 1;
        next.disabled = currentStep === 0
          ? !chosenType()
          : (description.value.trim().length < 12);
      }
      if (send) send.hidden = currentStep !== steps.length - 1;
      if (validation) {
        const length = description?.value.trim().length || 0;
        validation.textContent = currentStep === 1 && length > 0 && length < 12
          ? 'Add a little more detail so Johndrey has a useful starting point.'
          : '';
      }

      if (currentStep !== 2) return;
      const type = chosenType();
      const details = description.value.trim();
      const schedule = timeline.value || 'Flexible';
      one('#flow-review-type', dialog).textContent = type;
      one('#flow-review-description', dialog).textContent = details;
      one('#flow-review-timeline', dialog).textContent = schedule;
      const subject = encodeURIComponent(`Project inquiry: ${type}`);
      const body = encodeURIComponent(`Hi Johndrey,\n\nI am looking for help with: ${type}\n\nProject details:\n${details}\n\nTimeline: ${schedule}\n\nThanks!`);
      send.href = `mailto:johndreyjester@gmail.com?subject=${subject}&body=${body}`;
    };

    all('[data-flow-open]').forEach((trigger) => {
      trigger.addEventListener('click', (event) => {
        event.preventDefault();
        if (!dialog.open) dialog.showModal();
        update();
      });
    });
    all('[data-flow-close]', dialog).forEach((button) => button.addEventListener('click', () => dialog.close()));
    all('input[name="project-type"]', dialog).forEach((input) => input.addEventListener('change', update));
    description.addEventListener('input', update);
    timeline.addEventListener('change', update);

    next.addEventListener('click', () => {
      if ((currentStep === 0 && !chosenType()) || (currentStep === 1 && description.value.trim().length < 12)) return;
      currentStep = Math.min(currentStep + 1, steps.length - 1);
      update();
      if (currentStep === 1) description.focus();
      if (currentStep === 2) send.focus();
    });
    back.addEventListener('click', () => {
      currentStep = Math.max(currentStep - 1, 0);
      update();
      if (currentStep === 0) one('input[name="project-type"]', dialog)?.focus();
      if (currentStep === 1) description.focus();
    });
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', () => {
      currentStep = 0;
      all('input[name="project-type"]', dialog).forEach((input) => { input.checked = false; });
      description.value = '';
      timeline.value = 'Flexible';
      update();
    });
  }

  function adaptHeaderToPage(page) {
    const header = one('.site-header');
    if (!header || !page) return;

    const parseColor = (value) => {
      const channels = value.match(/[\d.]+/g)?.map(Number) || [];
      if (channels.length < 3) return [11, 20, 34];
      const alpha = channels.length > 3 ? channels[3] : 1;
      return channels.slice(0, 3).map((channel, index) => {
        const base = [11, 20, 34][index];
        return Math.round(channel * alpha + base * (1 - alpha));
      });
    };
    const background = parseColor(getComputedStyle(page).backgroundColor);
    const luminance = (color) => color.map((channel) => {
      const value = channel / 255;
      return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
    }).reduce((total, channel, index) => total + channel * [.2126, .7152, .0722][index], 0);
    const contrast = (first, second) => {
      const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
      return (values[0] + .05) / (values[1] + .05);
    };
    const lightText = [243, 247, 252];
    const darkText = [8, 16, 28];
    const foreground = contrast(background, lightText) >= contrast(background, darkText) ? lightText : darkText;
    const rgb = (color) => color.join(', ');

    header.style.setProperty('--header-background', `rgba(${rgb(background)}, .97)`);
    header.style.setProperty('--header-ink', `rgb(${rgb(foreground)})`);
    header.style.setProperty('--header-muted', `rgba(${rgb(foreground)}, .74)`);
    header.style.setProperty('--header-accent', `rgb(${rgb(foreground)})`);
    header.style.setProperty('--header-border', `rgba(${rgb(foreground)}, .22)`);
  }

  function setupScrollView() {
    const pages = all('.slide-page');
    if (!pages.length) return;

    if ('IntersectionObserver' in window) {
      const ratios = new Map(pages.map((page) => [page, 0]));
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => ratios.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0));
        const current = [...ratios.entries()].sort((left, right) => right[1] - left[1])[0];
        if (!current || current[1] < 0.08) return;

        pages.forEach((page) => page.classList.toggle('is-current', page === current[0]));
        adaptHeaderToPage(current[0]);
      }, { threshold: [0, 0.08, 0.2, 0.4, 0.65, 0.85] });
      pages.forEach((page) => observer.observe(page));
    }
  }

  function setupPresentationTools() {
    const overview = one('#overview-dialog');
    const overviewGrid = one('#overview-grid');
    const overviewButton = one('#overview-open');
    const fullscreenButton = one('#fullscreen-toggle');

    if (overview && overviewGrid) {
      const pages = all('.slide-page');
      pages.forEach((page, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'overview-card';

        const number = document.createElement('span');
        number.className = 'overview-number';
        number.textContent = String(index + 1).padStart(2, '0');

        const title = document.createElement('strong');
        title.className = 'overview-card-title';
        title.textContent = page.querySelector('h1, h2')?.textContent.replace(/\s+/g, ' ').trim()
          || page.id.replaceAll('-', ' ');

        const summary = document.createElement('span');
        summary.className = 'overview-card-summary';
        summary.textContent = page.querySelector('.section-deck, .contact-copy, .hero-intro, .footer-message, .profile-caption')?.textContent.replace(/\s+/g, ' ').trim()
          || 'Explore this part of the portfolio.';

        button.append(number, title, summary);
        button.addEventListener('click', () => {
          overview.close();
          page.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
        });
        overviewGrid.append(button);
      });

      overviewButton?.addEventListener('click', () => overview.showModal());
      all('[data-overview-close]', overview).forEach((button) => button.addEventListener('click', () => overview.close()));
      overview.addEventListener('click', (event) => {
        if (event.target === overview) overview.close();
      });
      document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape' || document.querySelector('dialog[open]')) return;
        if (one('.menu-toggle')?.getAttribute('aria-expanded') === 'true') return;
        overview.showModal();
      });
    }

    const imageDialog = one('#image-lightbox');
    const enlargedImage = one('#lightbox-image');
    const caption = one('#lightbox-caption');
    if (imageDialog && enlargedImage && caption) {
      const openImage = (image) => {
        enlargedImage.src = image.currentSrc || image.src;
        enlargedImage.alt = image.alt;
        caption.textContent = image.closest('.project-card')?.querySelector('.project-info h3')?.textContent.trim() || image.alt;
        imageDialog.showModal();
      };

      all('.project-visual').forEach((image) => {
        image.addEventListener('click', () => openImage(image));
        image.addEventListener('keydown', (event) => {
          if (event.key !== 'Enter' && event.key !== ' ') return;
          event.preventDefault();
          openImage(image);
        });
      });
      all('[data-lightbox-close]', imageDialog).forEach((button) => button.addEventListener('click', () => imageDialog.close()));
      imageDialog.addEventListener('click', (event) => {
        if (event.target === imageDialog) imageDialog.close();
      });
    }

    if (fullscreenButton) {
      const syncFullscreenButton = () => {
        const active = Boolean(document.fullscreenElement);
        fullscreenButton.setAttribute('aria-pressed', String(active));
        fullscreenButton.textContent = active ? 'Exit fullscreen' : 'Fullscreen';
      };
      fullscreenButton.addEventListener('click', async () => {
        try {
          if (document.fullscreenElement) await document.exitFullscreen();
          else await document.documentElement.requestFullscreen();
        } catch {
          fullscreenButton.textContent = 'Fullscreen unavailable';
          window.setTimeout(syncFullscreenButton, 1600);
        }
      });
      document.addEventListener('fullscreenchange', syncFullscreenButton);
      document.addEventListener('keydown', (event) => {
        if (event.key.toLowerCase() !== 'f' || event.altKey || event.ctrlKey || event.metaKey) return;
        if (document.querySelector('dialog[open]')) return;
        if (event.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)) return;
        event.preventDefault();
        fullscreenButton.click();
      });
    }
  }

  function setupYear() {
    const year = one('#year');
    if (year) year.textContent = new Date().getFullYear();
  }

  setupInitialPosition();
  setupMobileNavigation();
  setupProjectFilters();
  setupEntranceAnimations();
  setupResumeDownload();
  setupEmailCopy();
  setupProjectPlanner();
  setupScrollView();
  setupPresentationTools();
  setupYear();
})();
