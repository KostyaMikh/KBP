// Loading screen controller
(function () {
    const loader = document.getElementById('loader');
    const bar = document.getElementById('loaderBar');

    if (!loader || !bar) return;

    // Animate the progress bar
    let progress = 0;
    const interval = setInterval(function () {
        // Fast at first, slows near the end
        const step = progress < 70 ? 4 : progress < 90 ? 1.5 : 0.5;
        progress = Math.min(progress + step, 98);
        bar.style.width = progress + '%';
    }, 30);

    // Hide loader once page is fully loaded
    window.addEventListener('load', function () {
        clearInterval(interval);
        bar.style.width = '100%';
        bar.style.transition = 'width 0.2s ease';

        setTimeout(function () {
            loader.classList.add('loader-hidden');
        }, 300);

        // Remove from DOM after animation
        setTimeout(function () {
            loader.remove();
        }, 1100);
    });
})();

// ── Mobile block ──────────────────────────────────────────────────────────────
// Phone = screen width < 768px AND not a tablet UA
// Tablets (iPad, Android tablet) get through fine.
(function () {
    // Only run on small screens
    if (window.innerWidth >= 768) return;

    // Check if it looks like a tablet despite small width (rare but possible)
    var ua = navigator.userAgent || '';
    var isTablet = /iPad/i.test(ua) ||
                   (/Android/i.test(ua) && !/Mobile/i.test(ua)) ||
                   /Tablet/i.test(ua);
    if (isTablet) return;

    // It's a phone — inject the overlay
    var style = document.createElement('style');
    style.textContent = [
        '#kbpMobileBlock{',
        '  position:fixed;inset:0;z-index:99999;',
        '  background:#080810;',
        '  display:flex;flex-direction:column;align-items:center;',
        '  justify-content:center;padding:32px 24px;text-align:center;',
        '  font-family:"Inter",sans-serif;',
        '}',
        '#kbpMobileBlock .mb-emoji{font-size:3.5rem;margin-bottom:20px;}',
        '#kbpMobileBlock .mb-title{',
        '  font-family:"Orbitron",sans-serif;font-size:1.3rem;font-weight:900;',
        '  background:linear-gradient(135deg,#ff8c42,#e63000);',
        '  -webkit-background-clip:text;-webkit-text-fill-color:transparent;',
        '  background-clip:text;margin-bottom:16px;letter-spacing:.04em;',
        '}',
        '#kbpMobileBlock .mb-text{',
        '  font-size:.95rem;color:rgba(240,240,245,.5);line-height:1.7;',
        '  max-width:300px;margin-bottom:28px;',
        '}',
        '#kbpMobileBlock .mb-badge{',
        '  display:inline-flex;align-items:center;gap:8px;',
        '  padding:10px 20px;border-radius:50px;',
        '  background:rgba(255,94,26,.08);',
        '  border:1px solid rgba(255,94,26,.25);',
        '  font-size:.78rem;font-weight:600;color:rgba(240,240,245,.4);',
        '  letter-spacing:.06em;text-transform:uppercase;',
        '}',
        '#kbpMobileBlock .mb-badge span{font-size:1rem;}',
    ].join('');
    document.head.appendChild(style);

    var div = document.createElement('div');
    div.id = 'kbpMobileBlock';
    div.innerHTML = [
        '<div class="mb-emoji">🖥️</div>',
        '<p class="mb-title">Desktop Only — For Now</p>',
        '<p class="mb-text">',
        '  KBP Presentations is currently optimised for PC and Mac.<br>',
        '  Mobile support is coming soon.',
        '</p>',
        '<div class="mb-badge"><span>💻</span> Open on a computer for the best experience</div>',
    ].join('');

    // Insert as first child of body so it appears immediately
    document.body.insertBefore(div, document.body.firstChild);
})();
