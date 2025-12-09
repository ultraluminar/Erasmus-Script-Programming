document.addEventListener('DOMContentLoaded', () => {
    // --- State ---
    let currentDate = new Date();
    let currentView = 'week'; // 'day', 'week', 'month', 'timeline'
    let selectedEventDate = null;
    let events = [
        {
            id: 0,
            title: 'Client Design Discussion',
            start: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1, 9, 30),
            end: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()-1, 11, 0),
            type: 'client-design'
        },
        {
            id: 1,
            title: 'Design Sync',
            start: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 10, 0),
            end: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 11, 30),
            type: 'team-design'
        },
        {
            id: 2,
            title: 'Project Kickoff',
            start: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1, 14, 0),
            end: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1, 15, 0),
            type: 'team-all'
        },
        {
            id: 3,
            title: 'End of Week Meeting',
            start: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 2, 16, 0),
            end: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 2, 17, 30),
            type: 'team-all'
        },
        {
            id: 4,
            title: 'All Hands Meeting',
            start: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 6, 14, 0),
            end: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 6, 15, 0),
            type: 'team-all'
        }
    ];

    // --- DOM Elements ---
    const gridContainer = document.getElementById('calendar-grid');
    const timeColumn = gridContainer.querySelector('.time-column');
    const daysGrid = gridContainer.querySelector('.days-grid');
    const currentMonthYear = document.getElementById('current-month-year');
    const miniCalendarEl = document.getElementById('mini-calendar');

    // Modal Elements
    const modalEl = document.getElementById('event-modal');
    const eventModal = new bootstrap.Modal(modalEl);  // Initialize Bootstrap Modal

    // Helper to get input elements within new structure
    const addPeopleInput = document.getElementById('add-people-input');
    const availabilityIndicator = document.getElementById('availability-indicator');
    const saveEventBtn = document.getElementById('save-event-btn');

    // --- Initialization ---
    init();

    function init() {
        renderHeader();
        renderMiniCalendar();
        renderMainCalendar();
        setupEventListeners();
    }

    // --- Rendering Logic ---

    function renderHeader() {
        const options = { month: 'long', year: 'numeric' };
        currentMonthYear.textContent = currentDate.toLocaleDateString('en-US', options);
    }

    function renderMiniCalendar() {
        // Simplified mini calendar for visual presence
        const now = new Date();
        const todayDate = now.getDate();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

        const htmlParts = [];

        // Bootstrap Utility classes for grid
        htmlParts.push(`<div class="d-grid gap-1 text-center w-100" style="grid-template-columns: repeat(7, 1fr);">`);

        ['M','T','W','T','F','S','S'].forEach(d => htmlParts.push(`<div class="text-muted small" style="font-size: 10px;">${d}</div>`));

        const startOfMonthWeekday = getStartOfMonthWeekday(currentDate);
        // Set empty fields to align first day to correct weekday
        for(let i=0; i<startOfMonthWeekday; i++) {
            htmlParts.push(`<div class="p-1 small rounded-circle" style="font-size: 12px; background: transparent; color: inherit;"></div>`);
        }

        for(let i=1; i<=daysInMonth; i++) {
            const isToday = i === todayDate;
            const bg = isToday ? 'var(--accent-color)' : 'transparent';
            const color = isToday ? 'white' : 'inherit';
            htmlParts.push(`<div class="p-1 small rounded-circle" style="font-size: 12px; background: ${bg}; color: ${color};">${i}</div>`);
        }
        htmlParts.push(`</div>`);

        miniCalendarEl.innerHTML = htmlParts.join('');
    }

    function renderMainCalendar() {
        // Clear previous
        timeColumn.innerHTML = '';
        daysGrid.innerHTML = '';

        // Time Slots Offset (height 50px)
        const offset = document.createElement('div');
        offset.style.height = '40px';
        timeColumn.appendChild(offset);

        // 1. Render Time Slots
        for (let i = 8; i < 19; i++) { // 8 AM to 6 PM work day
            const slot = document.createElement('div');
            slot.className = 'time-slot';
            slot.textContent = `${i}:00`;
            timeColumn.appendChild(slot);
        }

        // 2. Render Days (Week View Logic)
        const startOfWeek = getStartOfWeek(currentDate);

        // Setup Grid Columns based on view
        if (currentView === 'week') {
            daysGrid.style.gridTemplateColumns = 'repeat(7, 1fr)';
        } else if (currentView === 'day') {
            daysGrid.style.gridTemplateColumns = '1fr';
        }

        const daysToShow = currentView === 'week' ? 7 : 1;
        const startIndex = currentView === 'week' ? 0 : currentDate.getDay(); // logic simplify

        for (let i = 0; i < daysToShow; i++) {
            const dayDate = new Date(startOfWeek);
            dayDate.setDate(dayDate.getDate() + i);
            if (currentView === 'day') {
                 // If day view, we just show current date
                 dayDate.setTime(currentDate.getTime());
            }

            const isToday = isSameDate(dayDate, new Date());

            const dayCol = document.createElement('div');
            dayCol.className = `day-column ${isToday ? 'today' : ''}`;

            // Header
            const header = document.createElement('div');
            header.className = 'day-header';
            header.innerHTML = `
                <span class="day-name">${dayDate.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                <span class="day-number">${dayDate.getDate()}</span>
            `;
            dayCol.appendChild(header);

            // Grid Background Lines
            for (let h = 8; h < 18; h++) {
                const hourSlot = document.createElement('div');
                hourSlot.style.height = '60px';
                hourSlot.style.borderBottom = '1px solid var(--bs-border-color)'; // Bootstrap Variable if possible, or fallback
                hourSlot.style.borderRight = '1px solid transparent';

                // Add Click to Create
                hourSlot.addEventListener('click', () => openModal(dayDate, h));

                dayCol.appendChild(hourSlot);
            }

            // Events
            renderEventsForDay(dayCol, dayDate);

            daysGrid.appendChild(dayCol);
        }
    }

    function renderEventsForDay(container, date) {
        const dayEvents = events.filter(e => isSameDate(e.start, date));

        dayEvents.forEach(event => {
            const el = document.createElement('div');
            el.className = 'event-block shadow-sm';
            el.textContent = event.title;
            el.setAttribute('data-tooltip', `${event.title} (${formatTime(event.start)} - ${formatTime(event.end)})`);

            // Position
            const startHour = event.start.getHours();
            const startMin = event.start.getMinutes();
            const durationHrs = (event.end - event.start) / (1000 * 60 * 60);

            const topOffset = ((startHour - 8) * 60) + startMin + 48; // 48 is header height
            const height = durationHrs * 60;

            el.style.top = `${topOffset}px`;
            el.style.height = `${height}px`;

            container.appendChild(el);
        });
    }

    // --- Helpers ---
    function getStartOfWeek(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day; // adjust when day is sunday
        return new Date(d.setDate(diff));
    }

    function getStartOfMonthWeekday(date) {
        const d = new Date(date.getFullYear(), date.getMonth(), 1);
        return d.getDay();
    }

    function isSameDate(d1, d2) {
        return d1.getFullYear() === d2.getFullYear() &&
               d1.getMonth() === d2.getMonth() &&
               d1.getDate() === d2.getDate();
    }

    function formatTime(date) {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }

    // --- Interactions ---

    function setupEventListeners() {
        // View Switcher
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.view-btn').forEach(b => {
                     b.classList.remove('active', 'shadow-sm', 'text-primary', 'btn-light');
                     b.classList.add('text-secondary', 'btn-link');
                });

                // Add Active Classes (Bootstrap style)
                const target = e.target;
                target.classList.remove('text-secondary', 'btn-link');
                target.classList.add('active', 'shadow-sm', 'text-primary', 'btn-light');

                currentView = target.getAttribute('data-view');
                renderMainCalendar();
            });
        });

        // Navigation
        document.querySelector('.nav-arrows').addEventListener('click', (e) => {
            if (e.target.textContent.includes('<')) {
                currentDate.setDate(currentDate.getDate() - 7);
            } else {
                currentDate.setDate(currentDate.getDate() + 7);
            }
            renderHeader();
            renderMainCalendar();
        });

        document.querySelector('.btn-nav').addEventListener('click', () => {
             currentDate = new Date();
             renderHeader();
             renderMainCalendar();
        });

        // Modal "Add People" Logic
        addPeopleInput.addEventListener('input', (e) => {
            const val = e.target.value.toLowerCase();
            if (val.includes('john')) {
                showAvailability(true, '✅ John is free');
            } else if (val.includes('mike')) {
                showAvailability(false, '⚠️ Mike has a conflict at 2 PM');
            } else if (val.length > 0) {
                availabilityIndicator.classList.add('d-none');
            } else {
                availabilityIndicator.classList.add('d-none');
            }
        });

        // Save Event Logic
        saveEventBtn.addEventListener('click', () => {
            const title = document.getElementById('event-title').value;
            const startStr = document.getElementById('event-start').value;
            const endStr = document.getElementById('event-end').value;

            if (!title || !startStr || !endStr || !selectedEventDate) {
                alert('Please fill in all fields');
                return;
            }

            const [startHour, startMin] = startStr.split(':').map(Number);
            const [endHour, endMin] = endStr.split(':').map(Number);

            const start = new Date(selectedEventDate);
            start.setHours(startHour, startMin);

            const end = new Date(selectedEventDate);
            end.setHours(endHour, endMin);

            // Simple validation
            if (end <= start) {
                alert('End time must be after start time');
                return;
            }

            const newEvent = {
                id: Date.now(),
                title: title,
                start: start,
                end: end,
                type: 'team-all' // Default type for now
            };

            events.push(newEvent);
            renderMainCalendar();
            eventModal.hide();
        });
    }

    function openModal(date, hour) {
        selectedEventDate = date;
        eventModal.show();

        // Pre-fill
        const start = new Date(date);
        start.setHours(hour);
        const end = new Date(date);
        end.setHours(hour + 1);

        document.getElementById('event-start').value = `${hour.toString().padStart(2, '0')}:00`;
        document.getElementById('event-end').value = `${(hour+1).toString().padStart(2, '0')}:00`;

        // Clear previous state
        addPeopleInput.value = '';
        availabilityIndicator.classList.add('d-none');
    }

    function showAvailability(isFree, msg) {
        availabilityIndicator.textContent = msg;
        availabilityIndicator.className = 'mt-2 p-2 rounded-2 small fw-medium ' + (isFree ? 'success' : 'conflict');
        availabilityIndicator.classList.remove('d-none');
    }
});
