/**
 * Portfólio Casimiro Custódio Gundja
 * Scripts de navegação, acessibilidade e interatividade nativa
 */

(() => {
  const header = document.querySelector('header');
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('nav');
  const links = [...nav.querySelectorAll('a')];
  const sections = links
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);
  const back = document.querySelector('.back-top');
  const mobile = matchMedia('(max-width: 767px)');
  const main = document.querySelector('main');
  const footer = document.querySelector('footer');
  const veil = document.querySelector('.veil');
  let menuScrollY = 0;

  // Controle de menu mobile acessível
  function menu(open, restore = true) {
    if (!toggle) return;
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    if (open === isOpen) return;

    if (open) {
      menuScrollY = window.scrollY;
      document.body.style.setProperty('--menu-scroll-offset', `-${menuScrollY}px`);
    }

    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');

    if (main) main.inert = open;
    if (footer) footer.inert = open;
    if (back) back.inert = open;

    if (open) {
      if (links.length) links[0].focus({ preventScroll: true });
    } else {
      document.body.style.removeProperty('--menu-scroll-offset');
      window.scrollTo({ top: menuScrollY, left: 0, behavior: 'instant' });
      if (restore) toggle.focus({ preventScroll: true });
      updateScroll();
    }
  }

  if (toggle) {
    toggle.addEventListener('click', () => {
      menu(toggle.getAttribute('aria-expanded') !== 'true');
    });
  }

  if (veil) {
    veil.addEventListener('click', () => menu(false));
  }

  links.forEach(link => {
    link.addEventListener('click', () => {
      if (toggle && toggle.getAttribute('aria-expanded') === 'true') {
        menu(false, false);
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
          target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
        }
      }
    });
  });

  document.addEventListener('keydown', event => {
    if (!toggle || toggle.getAttribute('aria-expanded') !== 'true') return;
    if (event.key === 'Escape') menu(false);
    if (event.key === 'Tab') {
      const items = [...links, toggle];
      const index = items.indexOf(document.activeElement);
      event.preventDefault();
      items[(index + (event.shiftKey ? -1 : 1) + items.length) % items.length].focus();
    }
  });

  mobile.addEventListener('change', () => {
    if (!mobile.matches && toggle) menu(false, false);
  });

  // Atualização de rolagem (header, indicador de link ativo e voltar ao topo)
  let scheduled = false;
  function updateScroll() {
    if (toggle && toggle.getAttribute('aria-expanded') === 'true') {
      scheduled = false;
      return;
    }

    const currentScrollY = window.scrollY;
    if (header) header.classList.toggle('scrolled', currentScrollY > 20);
    if (back) back.classList.toggle('visible', currentScrollY > 500);

    if (sections.length) {
      let active = sections[0];
      const triggerTop = window.innerHeight * 0.35;

      for (let i = 0; i < sections.length; i++) {
        const rect = sections[i].getBoundingClientRect();
        if (rect.top <= triggerTop) {
          active = sections[i];
        }
      }

      if (window.innerHeight + currentScrollY >= document.documentElement.scrollHeight - 6) {
        active = sections[sections.length - 1];
      }

      links.forEach(link => {
        if (link.getAttribute('href') === `#${active.id}`) {
          link.setAttribute('aria-current', 'page');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    }

    scheduled = false;
  }

  window.addEventListener(
    'scroll',
    () => {
      if (!scheduled) {
        scheduled = true;
        requestAnimationFrame(updateScroll);
      }
    },
    { passive: true }
  );

  window.addEventListener('resize', updateScroll);
  updateScroll();

  // Ano atual no rodapé
  const yearEl = document.querySelector('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Idade dinâmica (Data de nascimento: 02/08/1999)
  const ageEl = document.querySelector('#dynamic-age');
  if (ageEl) {
    const birthDate = new Date(1999, 7, 2);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    ageEl.textContent = age;
  }

  // Animação reveal com IntersectionObserver
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.remove('pending');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );

    document.querySelectorAll('.reveal').forEach(section => {
      if (section.getBoundingClientRect().top > window.innerHeight) {
        section.classList.add('pending');
      }
      observer.observe(section);
    });
  }

  // Galerias e Carrosséis de Projetos com Rolagem Automática (KLASSE)
  document.querySelectorAll('.gallery-slider').forEach(slider => {
    const parent = slider.closest('.project-visual');
    if (!parent) return;

    const slides = slider.querySelectorAll('.gallery-slide');
    const totalSlides = slides.length;
    if (totalSlides <= 1) return;

    const prevBtn = parent.querySelector('.gallery-btn.prev');
    const nextBtn = parent.querySelector('.gallery-btn.next');
    const dots = parent.querySelectorAll('.gallery-dot');
    let autoInterval = null;

    function getIndex() {
      return Math.round(slider.scrollLeft / slider.clientWidth);
    }

    function goToSlide(idx) {
      let target = idx;
      if (target >= totalSlides) target = 0;
      if (target < 0) target = totalSlides - 1;
      slider.scrollTo({ left: target * slider.clientWidth, behavior: 'smooth' });
    }

    function updateActiveState() {
      const idx = getIndex();
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === idx);
      });
    }

    function nextSlide() {
      const current = getIndex();
      goToSlide(current + 1);
    }

    function startAutoScroll() {
      stopAutoScroll();
      autoInterval = setInterval(nextSlide, 3500);
    }

    function stopAutoScroll() {
      if (autoInterval) {
        clearInterval(autoInterval);
        autoInterval = null;
      }
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        stopAutoScroll();
        const current = getIndex();
        goToSlide(current - 1);
        startAutoScroll();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        stopAutoScroll();
        nextSlide();
        startAutoScroll();
      });
    }

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        stopAutoScroll();
        goToSlide(i);
        startAutoScroll();
      });
    });

    slider.addEventListener('scroll', updateActiveState, { passive: true });

    // Pausa quando o cursor estiver em cima ou ao interagir no mobile
    parent.addEventListener('mouseenter', stopAutoScroll);
    parent.addEventListener('mouseleave', startAutoScroll);
    slider.addEventListener('touchstart', stopAutoScroll, { passive: true });
    slider.addEventListener('touchend', startAutoScroll, { passive: true });

    // Inicia a rolagem automática inicial
    startAutoScroll();
  });

  // Easter egg para Tech Recruiters e Engenheiros no DevTools
  try {
    console.log(
      '%c Olá, Tech Recruiter ou Engenheiro(a)! 👋 ',
      'background: #1683ff; color: #ffffff; font-size: 14px; font-weight: bold; padding: 4px 8px; border-radius: 4px;'
    );
    console.log(
      '%cProcurando um Desenvolvedor Full Stack focado em código limpo, performance e entrega de valor real?',
      'color: #cbd5e1; font-size: 13px; font-weight: 500; padding: 4px 0;'
    );
    console.log(
      '%cVamos conversar:\n✉️ casimirogundja@outlook.com\n💼 linkedin.com/in/casimiro-custodio-101770106/\n🐙 github.com/casigundja\n📱 +55 (19) 95324-8420',
      'color: #38bdf8; font-size: 12px; line-height: 1.6;'
    );
  } catch (e) {}

  // Toast e Cópia Inteligente para Recrutadores
  function showToast(message) {
    let toast = document.querySelector('.toast-notification');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast-notification';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    toast.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 6L9 17l-5-5"/>
      </svg>
      <span>${message}</span>
    `;
    toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }

  // Interceptar cliques em links de e-mail para copiar automaticamente
  document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
    link.addEventListener('click', () => {
      const email = link.getAttribute('href').replace('mailto:', '');
      if (navigator.clipboard) {
        navigator.clipboard.writeText(email).then(() => {
          showToast(`E-mail ${email} copiado para a área de transferência!`);
        });
      }
    });
  });
})();
