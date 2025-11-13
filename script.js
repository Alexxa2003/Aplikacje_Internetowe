document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('new-task');
    const dateInput = document.getElementById('task-date');
    const addBtn = document.getElementById('add-task-btn');
    const list = document.getElementById('tasks');
    const search = document.getElementById('search-task');
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);

    //wczytaj istniejące zadania z localStorage
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    renderTasks(tasks);

    //funkcja zapisu do localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    //funkcja tworząca przycisk Usuń
    function createRemoveButton(index) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = 'Usuń';
        btn.className = 'remove-btn';
        btn.addEventListener('click', () => {
            tasks.splice(index, 1);
            saveTasks();
            renderTasks(tasks);
        });
        return btn;
    }

    //funkcja renderująca listę zadań
    function renderTasks(taskArray) {
        list.innerHTML = '';

        taskArray.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = 'task-item';

            //checkbox
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = task.done || false;
            checkbox.className = 'task-checkbox';
            checkbox.addEventListener('change', () => {
                task.done = checkbox.checked;
                saveTasks();
                renderTasks(tasks);
            });

            //tekst zadania (kliknięcie = edycja)
            const textSpan = document.createElement('span');
            textSpan.className = 'task-text';
            textSpan.innerHTML = highlightSearch(task.text);
            textSpan.title = 'Kliknij, aby edytować';
            textSpan.addEventListener('click', () => editTask(li, index, 'text'));

            //data (kliknięcie = edycja daty)
            const dateSpan = document.createElement('span');
            dateSpan.className = 'task-date';
            dateSpan.textContent = task.date ? task.date : '—';
            dateSpan.title = 'Kliknij, aby zmienić datę';
            dateSpan.addEventListener('click', () => editTask(li, index, 'date'));

            //przekreślenie wykonanych
            if (task.done) {
                textSpan.style.textDecoration = 'line-through';
                textSpan.style.opacity = '0.6';
            }

            li.appendChild(checkbox);
            li.appendChild(textSpan);
            li.appendChild(dateSpan);
            li.appendChild(createRemoveButton(index));

            list.appendChild(li);
        });
    }

    //funkcja edycji pola (tekst lub data)
    function editTask(li, index, field) {
        const current = tasks[index];
        li.innerHTML = '';

        //pole tekstowe
        const editInput = document.createElement('input');
        editInput.type = 'text';
        editInput.value = current.text;
        editInput.className = 'edit-input';

        //pole daty
        const editDate = document.createElement('input');
        editDate.type = 'date';
        editDate.value = current.date || '';
        editDate.min = new Date().toISOString().split('T')[0];
        editDate.className = 'edit-date';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = current.done || false;
        checkbox.className = 'task-checkbox';
        checkbox.addEventListener('change', () => {
            current.done = checkbox.checked;
            saveTasks();
            renderTasks(tasks);
        });

        li.appendChild(checkbox);

        if (field === 'text') {
            li.appendChild(editInput);
            li.appendChild(createRemoveButton(index));
            editInput.focus();

            editInput.addEventListener('blur', saveEdit);
            editInput.addEventListener('keydown', e => {
                if (e.key === 'Enter') saveEdit();
            });

            function saveEdit() {
                const newText = editInput.value.trim();
                if (newText.length >= 3 && newText.length <= 255) {
                    current.text = newText;
                    saveTasks();
                    renderTasks(tasks);
                } else {
                    alert('Tekst zadania musi mieć od 3 do 255 znaków.');
                }
            }

        } else if (field === 'date') {
            li.appendChild(editDate);
            li.appendChild(createRemoveButton(index));
            editDate.addEventListener('change', saveEdit);
            editDate.addEventListener('blur', saveEdit);

            function saveEdit() {
                current.date = editDate.value;
                saveTasks();
                renderTasks(tasks);
            }
        }
    }

    //funkcja dodawania zadania
    function addItem() {
        const text = input.value.trim();
        const date = dateInput.value;

        if (text.length < 3 || text.length > 255) {
            alert('Zadanie musi mieć od 3 do 255 znaków.');
            return;
        }

        if (date) {
            const today = new Date().toISOString().split('T')[0];
            if (date < today) {
                alert('Data musi być dzisiejsza lub przyszła.');
                return;
            }
        }

        tasks.push({ text, date, done: false });
        saveTasks();
        renderTasks(tasks);

        input.value = '';
        dateInput.value = '';
        input.focus();
    }

    //funkcja filtrowania i podświetlania wyników
    function highlightSearch(text) {
        const phrase = search.value.trim().toLowerCase();
        if (phrase.length < 2) return text;
        const regex = new RegExp(`(${phrase})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    search.addEventListener('input', () => {
        const phrase = search.value.trim().toLowerCase();
        if (phrase.length < 2) {
            renderTasks(tasks);
            return;
        }
        const filtered = tasks.filter(t => t.text.toLowerCase().includes(phrase));
        renderTasks(filtered);
    });

    addBtn.addEventListener('click', addItem);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') addItem();
    });
});
