document.addEventListener('DOMContentLoaded', function () {
    let tickets = [];

    fetch('tickets (1).json')  // 👈 исправлено имя файла
        .then(response => {
            if (!response.ok) {
                throw new Error('Не удалось загрузить tickets (1).json');
            }
            return response.json();
        })
        .then(data => {
            tickets = data;
            saveTickets();
            updateStats();
            renderNotesList();
            getRandomTicket();
        })
        .catch(error => {
            console.warn('Ошибка загрузки tickets (1).json:', error);
            tickets = JSON.parse(localStorage.getItem('tickets')) || [];
            updateStats();
            renderNotesList();
            getRandomTicket();
        });

    function saveTickets() {
        localStorage.setItem('tickets', JSON.stringify(tickets));
    }

    const themeToggle = document.getElementById('theme-toggle');
    const navBtns = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.section');
    const randomBtn = document.getElementById('random-btn');
    const questionEl = document.getElementById('question');
    const answerEl = document.getElementById('answer');
    const showAnswerBtn = document.getElementById('show-answer');
    const toggleLearnedBtn = document.getElementById('toggle-learned');
    const hideLearnedCheckbox = document.getElementById('hide-learned');
    const searchInput = document.getElementById('search');
    const notesList = document.getElementById('notes-list');
    const addForm = document.getElementById('add-form');
    const totalCountEl = document.getElementById('total-count');
    const learnedCountEl = document.getElementById('learned-count');
    const deleteBtn = document.getElementById('delete-current');
    const exportBtn = document.getElementById('export-btn');

    let currentTicket = null;

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        themeToggle.innerHTML = document.body.classList.contains('dark-theme')
            ? '<i class="fas fa-sun"></i>'
            : '<i class="fas fa-moon"></i>';
    });

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            sections.forEach(section => section.classList.remove('active'));
            document.getElementById(btn.dataset.section).classList.add('active');
        });
    });

    randomBtn.addEventListener('click', getRandomTicket);

    showAnswerBtn.addEventListener('click', () => {
        answerEl.classList.toggle('hidden');
        showAnswerBtn.innerHTML = answerEl.classList.contains('hidden')
            ? '<i class="fas fa-eye"></i> Показать ответ'
            : '<i class="fas fa-eye-slash"></i> Скрыть ответ';
    });

    toggleLearnedBtn.addEventListener('click', () => {
        if (currentTicket) {
            currentTicket.learned = !currentTicket.learned;
            updateStats();
            renderNotesList();
            saveTickets();
            toggleLearnedBtn.innerHTML = currentTicket.learned
                ? '<i class="fas fa-check-circle"></i> Отметить невыученным'
                : '<i class="far fa-check-circle"></i> Отметить выученным';
        }
    });

    searchInput.addEventListener('input', renderNotesList);

    addForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const newQuestion = document.getElementById('new-question').value.trim();
        const newAnswer = document.getElementById('new-answer').value.trim();
        if (newQuestion && newAnswer) {
            tickets.push({
                id: Date.now(),
                question: newQuestion,
                answer: newAnswer,
                learned: false
            });
            addForm.reset();
            updateStats();
            renderNotesList();
            saveTickets();
            getRandomTicket();
            alert('Билет добавлен!');
        }
    });

    deleteBtn.addEventListener('click', () => {
        if (currentTicket) {
            if (confirm(`Удалить билет: "${currentTicket.question}"?`)) {
                tickets = tickets.filter(t => t !== currentTicket);
                currentTicket = null;
                questionEl.textContent = 'Выберите билет';
                answerEl.textContent = '';
                updateStats();
                renderNotesList();
                saveTickets();
            }
        }
    });

    exportBtn.addEventListener('click', () => {
        const dataStr = JSON.stringify(tickets, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tickets.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });

    function getRandomTicket() {
        let availableTickets = tickets;
        if (hideLearnedCheckbox.checked) {
            availableTickets = tickets.filter(t => !t.learned);
        }
        if (availableTickets.length > 0) {
            currentTicket = availableTickets[Math.floor(Math.random() * availableTickets.length)];
            questionEl.textContent = currentTicket.question;
            answerEl.innerHTML = currentTicket.answer
                .split('\n')
                .map(line => `<p>${line.trim()}</p>`)
                .join('');
            answerEl.classList.add('hidden');
            showAnswerBtn.innerHTML = '<i class="fas fa-eye"></i> Показать ответ';
            toggleLearnedBtn.innerHTML = currentTicket.learned
                ? '<i class="fas fa-check-circle"></i> Отметить невыученным'
                : '<i class="far fa-check-circle"></i> Отметить выученным';
        } else {
            currentTicket = null;
            questionEl.textContent = "Нет доступных билетов";
            answerEl.textContent = "";
        }
    }

    function renderNotesList() {
        const searchTerm = searchInput.value.toLowerCase();
        const filtered = tickets.filter(t =>
            t.question.toLowerCase().includes(searchTerm) ||
            t.answer.toLowerCase().includes(searchTerm)
        );
        notesList.innerHTML = filtered.map(ticket => `
            <div class="note-card ${ticket.learned ? 'learned' : ''}">
                <h3>${ticket.question}</h3>
                ${ticket.answer
                    .split('\n')
                    .map(line => `<p>${line.trim()}</p>`)
                    .join('')}
                <small>${ticket.learned ? '✓ Выучен' : ''}</small>
            </div>
        `).join('');
    }

    function updateStats() {
        totalCountEl.textContent = tickets.length;
        learnedCountEl.textContent = tickets.filter(t => t.learned).length;
    }
});
