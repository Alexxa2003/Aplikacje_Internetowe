document.addEventListener("DOMContentLoaded", () => {
    //mapa
    const map = L.map(document.querySelector('.geo')).setView([52.2297, 21.0122], 17);
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.esri.com/">Esri</a>'
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

    document.querySelector('.btn.liquidR').addEventListener('click', async () => {
        const mapContainer = document.querySelector('.geo');
        await new Promise(r => setTimeout(r, 200));

        html2canvas(mapContainer, { useCORS: true, backgroundColor: "#fff" })
            .then(canvas => generatePuzzleFromCanvas(canvas))
            .catch(err => alert("Nie udało się pobrać mapy: " + err.message));
    });

    //generowanie puzzli z obrazu
    function generatePuzzleFromCanvas(canvas) {
        const puzzleContainer = document.getElementById('puzzleContainer');
        const boardContainer = document.getElementById('boardContainer');

        puzzleContainer.innerHTML = '';
        boardContainer.innerHTML = '';

        const size = 75;
        const total = 16;
        const indices = [...Array(total).keys()].sort(() => Math.random() - 0.5);

        //pomieszane puzzle
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

        //pusta plansza 
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

    //obsługa przeciągania
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

    //sprawdzanie poprawności ułożenia puzzli
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
            console.log("Wszystkie puzzle ułożone poprawnie!");
            showSystemNotification("Puzzle ułożone!");
        } else {
            console.log("Puzzle nie są jeszcze dobrze ułożone.");
        }
    }

    //funkcja wyświetlająca powiadomienie systemowe
    function showSystemNotification(message) {
        if (Notification.permission === "granted") {
            new Notification(message);
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    new Notification(message);
                } else {
                    console.log("Użytkownik nie zezwolił na powiadomienia systemowe.");
                }
            });
        } else {
            console.log("Powiadomienia systemowe są zablokowane przez użytkownika.");
        }
    }
});
