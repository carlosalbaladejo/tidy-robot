const messages = new Map(Object.entries({
    "Habitación del robot": "Robot’s room",
    "Objetos guardados": "Toys put away",
    "Activar sonido": "Enable sound",
    "Configuración": "Settings",
    "Avanzar": "Move forward",
    "Girar a la izquierda": "Turn left",
    "Retroceder": "Move backward",
    "Girar a la derecha": "Turn right",
    "Soltar": "Drop",
    "Coger": "Pick up",
    "Guarda cada cosa en su sitio": "Put everything in its place",
    "¡Cada juguete a su sitio!": "Every toy has a place!",
    "Dormitorio": "Bedroom",
    "Cocina": "Kitchen",
    "Baño": "Bathroom",
    "Jardín": "Garden",
    "Cruceta ·": "D-pad ·",
    "Soltar · Select: menú": "Drop · Select: settings",
    "Contrarreloj:": "Time trial:",
    "Sí": "Yes",
    "Volver": "Back",
    "Pausa": "Paused",
    "Seguir": "Resume",
    "Repetir": "Retry",
    "Habitaciones": "Rooms",
    "¡Eso va en otro sitio!": "That goes somewhere else!",
    "¡Todo en su sitio!": "Everything in its place!",
    "¡Se acabó el tiempo!": "Time’s up!",
    "Mira dónde quedó y cámbialo de sitio.": "Find it and put it in the right place.",
    "¡Mamá está contenta!": "Mum is happy!",
    "Todo bien guardado, pero un poquito tarde.": "Everything is put away, but a little late.",
    "Arreglar": "Fix it",
    "Siguiente": "Next",
    "Mamá señalando el objeto": "Mum pointing at the toy",
    "Mamá contenta": "Happy mum",
    "Mamá señalando el reloj": "Mum pointing at the clock",
    "Coge el juguete equivocado": "Pick up the misplaced toy",
    "Esta pantalla no ha podido iniciar los gráficos 3D. Prueba a abrir el juego en Link Arcade o en otro navegador.": "3D graphics could not start. Try opening the game in Link Arcade or another browser."
}));
const preference = 'tidy-robot.language';
let language = 'es';
try {
    const saved = localStorage.getItem(preference);
    if (saved === 'en' || saved === 'es') language = saved;
} catch {}

export const t = text => language === 'es' ? text : messages.get(text) ?? text;
export const languageOption = () => language === 'es' ? 'Idioma: Español' : 'Language: English';

function capture(root) {
    const bindings = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const source = node.data.trim();
        if (messages.has(source) && !node.parentElement?.closest('script, style')) {
            bindings.push(() => { node.data = node.data.replace(node.data.trim(), t(source)); });
        }
    }
    for (const node of root.querySelectorAll('[aria-label], [title]')) {
        for (const attr of ['aria-label', 'title']) {
            const source = node.getAttribute(attr);
            if (messages.has(source)) bindings.push(() => node.setAttribute(attr, t(source)));
        }
    }
    return bindings;
}

const page = capture(document.body);
function applyLanguage() {
    document.documentElement.lang = language;
    page.forEach(update => update());
}
applyLanguage();

export function toggleLanguage() {
    language = language === 'es' ? 'en' : 'es';
    try { localStorage.setItem(preference, language); } catch {}
    applyLanguage();
}

export function localizedHTML(markup) {
    const template = document.createElement('template');
    template.innerHTML = markup;
    capture(template.content).forEach(update => update());
    return template.innerHTML;
}
