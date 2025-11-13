document.addEventListener("DOMContentLoaded", () => {
    const map = L.map(document.querySelector('.geo'));
    map.setView([0, 0], 2); 

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
        const { latitude, longitude } = pos.coords;
        map.setView([latitude, longitude], 17);
        L.marker([latitude, longitude]).addTo(map)
            .bindPopup(`Twoja lokalizacja:<br>${latitude.toFixed(5)}, ${longitude.toFixed(5)}`)
            .openPopup();
    }, () => {
        console.warn("Nie udało się pobrać lokalizacji — zostaje widok globalny.");
    });
}


    //warstwa satelitarna ESRI
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.esri.com/">Esri</a>, Earthstar Geographics'
    }).addTo(map);

    //przycisk lokalizacji
    document.querySelector('.btn.liquid').addEventListener('click', () => {
        if (!navigator.geolocation) {
            alert('Twoja przeglądarka nie obsługuje geolokalizacji.');
            return;
        }

        navigator.geolocation.getCurrentPosition(pos => {
            const { latitude, longitude } = pos.coords;
            L.marker([latitude, longitude]).addTo(map)
                .bindPopup(`Twoja lokalizacja:<br>${latitude.toFixed(5)}, ${longitude.toFixed(5)}`)
                .openPopup();
            map.setView([latitude, longitude], 13);
        });
    });

    //przycisk pobierz mape
    document.querySelector('.btn.liquidR').addEventListener('click', async () => {
        console.log("Tworzenie pliku PNG z mapy ESRI...");

        const mapContainer = document.querySelector('.geo');
        const { width, height } = mapContainer.getBoundingClientRect();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;

        //pobieramy kafelki z Leafleta
        const tiles = mapContainer.querySelectorAll('.leaflet-tile');
        if (tiles.length === 0) {
            console.warn("Brak kafelków. Mapa się jeszcze nie załadowała.");
            return;
        }

        let loaded = 0;

        for (const tile of tiles) {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = tile.src;

            const transform = tile.style.transform.match(/translate3d\(([-0-9.]+)px,\s*([-0-9.]+)px/);
            if (!transform) continue;

            const x = parseFloat(transform[1]);
            const y = parseFloat(transform[2]);

            img.onload = () => {
                try {
                    ctx.drawImage(img, x, y);
                } catch (err) {
                    console.warn("Nie udało się narysować kafelka:", err);
                }
                loaded++;
                if (loaded === tiles.length) {
                    downloadCanvasAsImage(canvas, 'mapa.png');
                    generatePuzzleFromCanvas(canvas);
                }
            };

            img.onerror = () => {
                loaded++;
                console.warn("Nie udało się załadować kafelka:", tile.src);
                if (loaded === tiles.length) {
                    downloadCanvasAsImage(canvas, 'mapa.png');
                    generatePuzzleFromCanvas(canvas);
                }
            };
        }
    }); 

    //funkcja zapisująca obraz z canvas jako PNG
    function downloadCanvasAsImage(canvas, filename) {
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }

    //generowanie puzzli
    function generatePuzzleFromCanvas(canvas) {
        const puzzleContainer = document.getElementById('puzzleContainer');
        const boardContainer = document.getElementById('boardContainer');
        puzzleContainer.innerHTML = '';
        boardContainer.innerHTML = '';

        const size = 75;
        const total = 16;
        const indices = [...Array(total).keys()].sort(() => Math.random() - 0.5);

        indices.forEach(i => {
            const r = Math.floor(i / 4);
            const c = i % 4;
            const piece = document.createElement('div');
            piece.className = 'piece';
            piece.draggable = true;
            piece.dataset.correct = i;
            piece.style.backgroundImage = `url(${canvas.toDataURL()})`;
            piece.style.backgroundPosition = `-${c * size}px -${r * size}px`;
            piece.addEventListener('dragstart', dragStart);
            puzzleContainer.appendChild(piece);
        });

        for (let i = 0; i < total; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.index = i;
            cell.addEventListener('dragover', dragOver);
            cell.addEventListener('drop', dropOnCell);
            boardContainer.appendChild(cell);
        }

        console.log("Puzzle wygenerowane – przeciągnij je na planszę.");
    }

    let dragged = null;
    function dragStart(e) {
        dragged = e.target;
    }

    function dragOver(e) {
        e.preventDefault();
    }

    function dropOnCell(e) {
        e.preventDefault();
        if (!dragged) return;
        if (e.target.classList.contains('cell') && e.target.children.length === 0) {
            e.target.appendChild(dragged);
            checkIfSolved();
        }
    }

    function checkIfSolved() {
        const cells = document.querySelectorAll('.cell');
        const allPlaced = [...cells].every(c => c.children.length === 1);
        if (!allPlaced) {
            console.log("Nie wszystkie puzzle są jeszcze ułożone.");
            return;
        }

        const solved = [...cells].every((c, i) => {
            const piece = c.firstChild;
            return piece && parseInt(piece.dataset.correct) === i;
        });

        if (solved) {
            console.log("Puzzle ułożone poprawnie!");
            showSystemNotification("Puzzle ułożone!");
        } else {
            console.log("Puzzle nie są poprawnie ułożone.");
        }
    }

    //powiadomienia systemowe
    function showSystemNotification(message) {
        if (Notification.permission === "granted") {
            new Notification(message);
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") new Notification(message);
            });
        }
    }
});
