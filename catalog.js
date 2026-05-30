document.addEventListener('DOMContentLoaded', function () {
    const pills = document.querySelectorAll('.pill');
    const cards = document.querySelectorAll('.pres-card');
    const emptyState = document.getElementById('emptyState');

    pills.forEach(pill => {
        pill.addEventListener('click', function () {
            // Update active pill
            pills.forEach(p => p.classList.remove('active'));
            this.classList.add('active');

            const lang = this.getAttribute('data-lang');
            let visible = 0;

            cards.forEach(card => {
                const cardLang = card.getAttribute('data-lang');
                const show = lang === 'all' || cardLang === lang;

                if (show) {
                    card.style.display = 'flex';
                    card.style.animation = 'fadeUp 0.4s ease forwards';
                    visible++;
                } else {
                    card.style.display = 'none';
                }
            });

            emptyState.style.display = visible === 0 ? 'block' : 'none';
        });
    });
});
