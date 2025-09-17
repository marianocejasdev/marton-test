/* main.js — unificado */

// Pulse sutil WhatsApp
setInterval(() => document.querySelector('.whatsapp-button')?.classList.toggle('attn'), 12000);

// Debounce util
function debounce(fn, wait = 150) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn.apply(null, args), wait); };
}

document.addEventListener('DOMContentLoaded', () => {
    /* ========== 1) CSS var: --scroll-padding ========== */
    const navEl = document.querySelector('.nav');
    const setScrollPadding = () => {
        if (!navEl) return;
        const h = navEl.offsetHeight || 0;
        document.documentElement.style.setProperty('--scroll-padding', `${h}px`);
    };
    setScrollPadding();
    window.addEventListener('resize', debounce(setScrollPadding, 200));
    if ('ResizeObserver' in window && navEl) new ResizeObserver(() => setScrollPadding()).observe(navEl);

    /* ========== 2) NAV móvil accesible (hidden + inert SOLO en mobile) ========== */
    const MENU = document.getElementById('nav-menu');
    const BTN_TOGGLE = document.getElementById('nav__toggle');
    const BTN_CLOSE = document.getElementById('nav__close'); // puede no existir
    const BACKDROP = document.querySelector('.nav__backdrop'); // opcional
    const MENU_LINKS = MENU ? MENU.querySelectorAll('a[href^="#"]') : [];

    const mqDesktop = window.matchMedia('(min-width: 1200px)');
    const isMobileView = () => !mqDesktop.matches;

    const lockScroll = (on) => { document.documentElement.style.overflow = on ? 'hidden' : ''; };

    const openMenu = () => {
        if (!MENU || !isMobileView()) return; // no abrir en desktop
        MENU.hidden = false;
        MENU.inert = false;
        MENU.classList.add('is-active');
        BTN_TOGGLE?.setAttribute('aria-expanded', 'true');
        BTN_CLOSE?.classList.remove('hidden');
        BACKDROP?.classList.add('active');
        lockScroll(true);
        MENU.querySelector('a')?.focus();
    };

    const closeMenu = () => {
        if (!MENU || !isMobileView()) return; // no cerrar (ni tocar inert) en desktop
        MENU.classList.remove('is-active');
        MENU.hidden = true;
        MENU.inert = true;
        BTN_TOGGLE?.setAttribute('aria-expanded', 'false');
        BTN_CLOSE?.classList.add('hidden');
        BACKDROP?.classList.remove('active');
        lockScroll(false);
        BTN_TOGGLE?.focus();
    };

    // Estado correcto al cargar (según viewport)
    const applyInitialMenuState = () => {
        if (!MENU) return;
        if (isMobileView()) {
            MENU.hidden = true;
            MENU.inert = true;
            MENU.classList.remove('is-active');
            BACKDROP?.classList.remove('active');
            BTN_TOGGLE?.setAttribute('aria-expanded', 'false');
            lockScroll(false);
        } else {
            MENU.hidden = false;
            MENU.inert = false;
            MENU.classList.remove('is-active');
            BACKDROP?.classList.remove('active');
            BTN_TOGGLE?.setAttribute('aria-expanded', 'false');
            lockScroll(false);
        }
    };
    applyInitialMenuState();
    mqDesktop.addEventListener('change', applyInitialMenuState);

    // Toggle solo afecta mobile
    BTN_TOGGLE?.addEventListener('click', () => {
        const isOpen = MENU && !MENU.hidden;
        isOpen ? closeMenu() : openMenu();
    });
    BTN_CLOSE?.addEventListener('click', closeMenu);
    BACKDROP?.addEventListener('click', closeMenu);

    // Cerrar al navegar dentro del menú (mobile solamente)
    MENU_LINKS.forEach((a) => a.addEventListener('click', () => { if (isMobileView()) closeMenu(); }));

    // Cerrar si cambia el hash (solo mobile)
    window.addEventListener('hashchange', () => { if (isMobileView() && MENU && !MENU.hidden) closeMenu(); });

    /* ========== 3) Inicializador genérico de tabs ========== */
    function initTabs({ buttonSelector, cardsSelector, activeBtnClass, cardsActivePrefix, displayWhenActive = 'flex' }) {
        const btns = document.querySelectorAll(buttonSelector);
        const allCards = document.querySelectorAll(cardsSelector);
        if (!btns.length || !allCards.length) return;

        const applyVisibility = (target) => {
            allCards.forEach((cards) => {
                const match = target && cards.classList.contains(`${cardsActivePrefix}${target}`);
                cards.style.display = match ? displayWhenActive : 'none';
            });
        };

        const activeBtn = document.querySelector(`${buttonSelector}.${activeBtnClass}`);
        if (activeBtn) {
            const target = activeBtn.dataset.target;
            applyVisibility(target);
            btns.forEach((btn) => {
                const isActive = btn === activeBtn;
                btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
                const img = btn.querySelector('img');
                if (img) {
                    if (isActive && btn.dataset.iconActive) img.src = btn.dataset.iconActive;
                    if (!isActive && btn.dataset.iconDefault) img.src = btn.dataset.iconDefault;
                }
            });
        }

        btns.forEach((button) => {
            button.addEventListener('click', () => {
                const target = button.dataset.target;
                // desactivar todos
                btns.forEach((btn) => {
                    btn.classList.remove(activeBtnClass);
                    btn.setAttribute('aria-selected', 'false');
                    const img = btn.querySelector('img');
                    if (img && btn.dataset.iconDefault) img.src = btn.dataset.iconDefault;
                });
                // activar actual
                button.classList.add(activeBtnClass);
                button.setAttribute('aria-selected', 'true');
                const img = button.querySelector('img');
                if (img && button.dataset.iconActive) img.src = btn.dataset.iconActive;
                // mostrar cards
                applyVisibility(target);
            });
        });
    }

    // Tabs de Rutinas
    initTabs({
        buttonSelector: '.rutinas__selector-btn',
        cardsSelector: '.rutinas__cards',
        activeBtnClass: 'rutinas__selector-btn--active',
        cardsActivePrefix: 'rutinas__cards--',
        displayWhenActive: 'flex'
    });

    /* ========== 4) Footer: año automático ========== */
    const timeEl = document.querySelector('.footer time');
    if (timeEl) {
        const year = String(new Date().getFullYear());
        timeEl.textContent = year;
        timeEl.setAttribute('datetime', year);
    }

    /* ========== 5) Smooth scroll (opcional) ========== */
    // document.documentElement.style.scrollBehavior = 'smooth';

    /* ========== 6) Escape para cerrar (solo mobile) ========== */
    document.addEventListener('keydown', (e) => {
        if ((e.key === 'Escape' || e.key === 'Esc') && isMobileView()) {
            if (MENU && !MENU.hidden) closeMenu();
        }
    });
});