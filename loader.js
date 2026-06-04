// Loading screen controller
(function () {
    // Block mobile devices
    if (window.matchMedia('(max-width: 768px)').matches ||
        window.matchMedia('(pointer: coarse)').matches) {
        document.body.classList.add('mobile-blocked');
    }

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
