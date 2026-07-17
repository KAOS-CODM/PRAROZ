const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const target = entry.target;
        const variant = target.getAttribute('data-reveal') || 'up';

        const classesToRemove = {
            up: ['opacity-0', 'translate-y-8'],
            left: ['opacity-0', '-translate-x-8'],
            right: ['opacity-0', 'translate-x-8'],
            scale: ['opacity-0', 'scale-95']
        };

        target.classList.remove(...(classesToRemove[variant] || classesToRemove.up));
        target.classList.add('opacity-100', 'translate-y-0', 'translate-x-0', 'scale-100');
        revealObserver.unobserve(target);
    });
}, { threshold: 0.15 });

document.querySelectorAll('[data-reveal]').forEach((element) => {
    const variant = element.getAttribute('data-reveal') || 'up';
    const classesToAdd = {
        up: ['opacity-0', 'translate-y-8', 'transition-all', 'duration-700', 'ease-out'],
        left: ['opacity-0', '-translate-x-8', 'transition-all', 'duration-700', 'ease-out'],
        right: ['opacity-0', 'translate-x-8', 'transition-all', 'duration-700', 'ease-out'],
        scale: ['opacity-0', 'scale-95', 'transition-all', 'duration-700', 'ease-out']
    };

    element.classList.add(...(classesToAdd[variant] || classesToAdd.up));
    revealObserver.observe(element);
});