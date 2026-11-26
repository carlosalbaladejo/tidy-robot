const button = document.querySelector('#fullscreen');
const labels = {
    en: ['Full screen', 'Exit full screen'],
    es: ['Pantalla completa', 'Salir de pantalla completa'],
    de: ['Vollbild', 'Vollbild verlassen'],
};

function updateButton() {
    const language = document.documentElement.lang.split('-')[0];
    const label = (labels[language] || labels.en)[document.fullscreenElement ? 1 : 0];
    button.setAttribute('aria-label', label);
    button.title = label;
}

if (document.fullscreenEnabled) {
    updateButton();
    button.hidden = false;
    document.addEventListener('fullscreenchange', updateButton);
    new MutationObserver(updateButton).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['lang'],
    });
    for (const eventName of ['keydown', 'keyup']) {
        button.addEventListener(eventName, event => {
            if (event.key === ' ' || event.key === 'Enter') event.stopPropagation();
        });
    }
    button.addEventListener('click', async () => {
        try {
            if (document.fullscreenElement) await document.exitFullscreen();
            else await document.documentElement.requestFullscreen();
        } catch {
            // Fullscreen can be denied in a restricted browser context.
        }
    });
}
