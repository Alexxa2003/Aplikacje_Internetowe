//słownik dostępnych stylów
const styles: Record<string, string> = {
    "Styl 1": "style-1.css",
    "Styl 2": "style-2.css",
    "Styl 3": "dynamic-style-3"
};

const style3CssContent = `
    body {
        background-color: #000;
        color: #e3342f;
        font-family: 'Cinzel', serif;
        margin: 0;
        padding: 0;
        min-height: 100vh;
    }

    h1, h2, h3 {
        letter-spacing: 2px;
        color: #e3342f;
    }

    main {
        display: grid;
        grid-template-columns: 1fr 320px; /* lewa kolumna, prawa kolumna */
        grid-template-areas:
            "list    image"
            "text    image"
            "nav     nav";
        gap: 20px;
        padding: 20px;
        background: radial-gradient(circle, #5d0f0f 0%, #1a1a1a 100%);
    }

  
    aside.list { grid-area: list; }
    section.text { grid-area: text; }

    
    section.photo {
        grid-area: image;  
        display: flex;
        justify-content: center;
        align-items: start;
        padding: 0;
        margin: 0;
    }

    section.photo img {
        width: 100%;
        max-width: 300px;
        border: 2px solid #e3342f;
        border-radius: 6px;
        object-fit: cover;
    }

    nav {
        grid-area: nav;
        background-color: #1a1a1a;
        border: 1px solid #5d0f0f;
        border-radius: 6px;
        padding: 10px;
    }

    nav a {
        color: #ffb2b2;
    }

    footer {
        background-color: #1a1a1a;
        color: #e3342f;
        padding: 12px;
        text-align: center;
        border-top: 2px solid #5d0f0f;
    }
`;


//stan aplikacji (nie jest tu używany, ale może być potrzebny później)
let currentStyle: string = "style-1.css";


//inicjalizacja po załadowaniu strony
window.addEventListener("DOMContentLoaded", () => {
    generateStyleLinks();
});



function generateStyleLinks(): void {
    const nav = document.getElementById("style-nav");
    if (!nav) return;

    nav.innerHTML = "";

    for (const [name, file] of Object.entries(styles)) {
        const link = document.createElement("a");
        link.textContent = name;
        link.href = "#";
        link.style.marginRight = "15px";

        link.addEventListener("click", () => {
            changeStyle(file);
        });

        nav.appendChild(link);
    }
}


function changeStyle(styleFile: string): void {
    const styleLink = document.getElementById("style-link") as HTMLLinkElement;

    if (styleFile === "dynamic-style-3") {
        styleLink.href = "";

        let dynTag = document.getElementById("dynamic-style-tag") as HTMLStyleElement;

        if (!dynTag) {
            dynTag = document.createElement("style");
            dynTag.id = "dynamic-style-tag";
            document.head.appendChild(dynTag);
        }

        dynTag.innerHTML = style3CssContent;
        return;
    }

    const dynTag = document.getElementById("dynamic-style-tag");
    if (dynTag) dynTag.remove();

    document.body.removeAttribute("style");
    document.body.style.display = "";
    document.body.style.gridTemplateRows = "";

    styleLink.href = `/${styleFile}`;
}
