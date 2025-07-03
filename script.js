class UniTasks {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.currentDate = new Date();
        this.editingTaskId = null;
        
        // Pomodoro properties
        this.pomodoro = {
            timeLeft: 25 * 60, // 25 minutos em segundos
            isRunning: false,
            currentMode: 'focus', // 'focus', 'short-break', 'long-break'
            totalTime: 25 * 60,
            completedCycles: this.loadPomodoroData().completedCycles || 0,
            currentCycle: this.loadPomodoroData().currentCycle || 1,
            interval: null,
            cyclesToday: this.loadPomodoroData().cyclesToday || []
        };
        
        this.init();
    }

    // Inicialização da aplicação
    init() {
        this.bindEvents();
        this.renderTasks();
        this.renderCalendar();
        this.updatePendingCount();
        this.setMinDate();
        this.initPomodoro();
    }

    // Configuração de eventos
    bindEvents() {
        // Modal
        document.getElementById('addTaskBtn').addEventListener('click', () => this.openModal());
        document.querySelector('.close').addEventListener('click', () => this.closeModal());
        document.getElementById('cancelBtn').addEventListener('click', () => this.closeModal());
        
        // Form
        document.getElementById('taskForm').addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });
        
        // Filtros
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.filterTasks(e.target.dataset.filter));
        });
        
        // Calendário
        document.getElementById('prevMonth').addEventListener('click', () => this.navigateMonth(-1));
        document.getElementById('nextMonth').addEventListener('click', () => this.navigateMonth(1));
        
        // Export dropdown
        document.getElementById('exportBtn').addEventListener('click', () => this.toggleExportDropdown());
        
        // Fechar dropdown ao clicar fora
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.export-dropdown')) {
                this.closeExportDropdown();
            }
        });
        
        // Pomodoro controls
        document.getElementById('startBtn').addEventListener('click', () => this.startPomodoro());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pausePomodoro());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetPomodoro());
        
        // Fechar modal clicando fora
        window.addEventListener('click', (e) => {
            if (e.target === document.getElementById('taskModal')) {
                this.closeModal();
            }
        });
    }

    // Gerenciamento de dados
    loadTasks() {
        const saved = localStorage.getItem('unitasks_data');
        return saved ? JSON.parse(saved) : [];
    }

    loadPomodoroData() {
        const saved = localStorage.getItem('unitasks_pomodoro');
        return saved ? JSON.parse(saved) : {};
    }

    saveTasks() {
        localStorage.setItem('unitasks_data', JSON.stringify(this.tasks));
        this.updatePendingCount();
    }

    savePomodoroData() {
        const data = {
            completedCycles: this.pomodoro.completedCycles,
            currentCycle: this.pomodoro.currentCycle,
            cyclesToday: this.pomodoro.cyclesToday
        };
        localStorage.setItem('unitasks_pomodoro', JSON.stringify(data));
    }

    // Modal
    openModal(task = null) {
        const modal = document.getElementById('taskModal');
        const form = document.getElementById('taskForm');
        const title = document.getElementById('modalTitle');
        
        if (task) {
            // Edição
            this.editingTaskId = task.id;
            title.textContent = 'Editar Tarefa';
            document.getElementById('taskTitle').value = task.title;
            document.getElementById('taskDescription').value = task.description;
            document.getElementById('taskDueDate').value = task.dueDate;
            document.getElementById('taskPriority').value = task.priority;
        } else {
            // Nova tarefa
            this.editingTaskId = null;
            title.textContent = 'Nova Tarefa';
            form.reset();
        }
        
        modal.style.display = 'block';
        document.getElementById('taskTitle').focus();
    }

    closeModal() {
        document.getElementById('taskModal').style.display = 'none';
        document.getElementById('taskForm').reset();
        this.editingTaskId = null;
    }

    // Configurar data mínima (hoje)
    setMinDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('taskDueDate').min = today;
    }

    // Manipulação de tarefas
    handleSubmit(e) {
        e.preventDefault();
        
        const formData = {
            title: document.getElementById('taskTitle').value.trim(),
            description: document.getElementById('taskDescription').value.trim(),
            dueDate: document.getElementById('taskDueDate').value,
            priority: document.getElementById('taskPriority').value
        };

        if (!formData.title || !formData.dueDate) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        if (this.editingTaskId) {
            this.updateTask(this.editingTaskId, formData);
        } else {
            this.addTask(formData);
        }

        this.closeModal();
    }

    addTask(taskData) {
        const task = {
            id: this.generateId(),
            ...taskData,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.push(task);
        this.saveTasks();
        this.renderTasks();
        this.renderCalendar();
        
        this.showNotification(`Tarefa "${task.title}" adicionada com sucesso!`, 'success');
    }

    updateTask(id, taskData) {
        const index = this.tasks.findIndex(task => task.id === id);
        if (index !== -1) {
            this.tasks[index] = { ...this.tasks[index], ...taskData };
            this.saveTasks();
            this.renderTasks();
            this.renderCalendar();
            
            this.showNotification(`Tarefa "${taskData.title}" atualizada com sucesso!`, 'success');
        }
    }

    toggleTask(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
            this.renderCalendar();
            
            const status = task.completed ? 'concluída' : 'reaberta';
            this.showNotification(`Tarefa "${task.title}" ${status}!`, 'success');
        }
    }

    deleteTask(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task && confirm(`Tem certeza que deseja excluir a tarefa "${task.title}"?`)) {
            this.tasks = this.tasks.filter(task => task.id !== id);
            this.saveTasks();
            this.renderTasks();
            this.renderCalendar();
            
            this.showNotification(`Tarefa "${task.title}" excluída com sucesso!`, 'success');
        }
    }

    // Renderização
    renderTasks() {
        const container = document.getElementById('tasksList');
        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>📝 ${this.getEmptyMessage()}</p>
                    <p>Clique em "Nova Tarefa" para começar!</p>
                </div>
            `;
            return;
        }

        // Ordenar tarefas: não concluídas primeiro, depois por data de entrega
        const sortedTasks = filteredTasks.sort((a, b) => {
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            return new Date(a.dueDate) - new Date(b.dueDate);
        });

        container.innerHTML = sortedTasks.map(task => this.createTaskHTML(task)).join('');
        
        // Adicionar eventos aos botões
        this.bindTaskEvents();
    }

    createTaskHTML(task) {
        const isUrgent = this.isTaskUrgent(task);
        const priorityClass = `priority-${task.priority}`;
        const priorityEmoji = this.getPriorityEmoji(task.priority);
        const dueDateFormatted = this.formatDate(task.dueDate);
        const priorityColor = this.getPriorityColor(task.priority);

        return `
            <div class="task-item ${task.completed ? 'completed' : ''} ${isUrgent ? 'urgent' : ''}" 
                 style="--priority-color: ${priorityColor}">
                <div class="task-checkbox ${task.completed ? 'checked' : ''}" 
                     onclick="app.toggleTask('${task.id}')"></div>
                <div class="task-content">
                    <div class="task-title">${this.escapeHtml(task.title)}</div>
                    ${task.description ? `<div class="task-description">${this.escapeHtml(task.description)}</div>` : ''}
                    <div class="task-meta">
                        <div class="task-due-date">
                            📅 ${dueDateFormatted}
                            ${isUrgent ? '<span style="color: #ff6b6b; font-weight: bold;">⚠️ Urgente</span>' : ''}
                        </div>
                        <div class="task-priority ${priorityClass}">
                            ${priorityEmoji} ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </div>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="edit-btn" onclick="app.editTask('${task.id}')" title="Editar tarefa">
                        ✏️
                    </button>
                    <button class="delete-btn" onclick="app.deleteTask('${task.id}')" title="Excluir tarefa">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    }

    bindTaskEvents() {
        // Os eventos já são vinculados via onclick no HTML
        // Esta função pode ser usada para eventos mais complexos se necessário
    }

    editTask(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            this.openModal(task);
        }
    }

    // Filtros
    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'pending':
                return this.tasks.filter(task => !task.completed);
            case 'completed':
                return this.tasks.filter(task => task.completed);
            default:
                return this.tasks;
        }
    }

    filterTasks(filter) {
        this.currentFilter = filter;
        
        // Atualizar botões ativos
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        this.renderTasks();
    }

    // Calendário
    renderCalendar() {
        const container = document.getElementById('calendar');
        const monthName = this.currentDate.toLocaleDateString('pt-BR', { 
            month: 'long', 
            year: 'numeric' 
        });
        
        document.getElementById('currentMonth').textContent = 
            monthName.charAt(0).toUpperCase() + monthName.slice(1);

        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const days = [];
        const today = new Date();
        
        // Cabeçalho dos dias da semana
        const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        weekDays.forEach(day => {
            days.push(`<div class="calendar-day" style="font-weight: bold; text-align: center; background: #f0f0f0;">${day}</div>`);
        });

        // Dias do calendário
        for (let i = 0; i < 42; i++) {
            const currentDay = new Date(startDate);
            currentDay.setDate(startDate.getDate() + i);
            
            const isToday = this.isSameDay(currentDay, today);
            const isCurrentMonth = currentDay.getMonth() === this.currentDate.getMonth();
            const dayTasks = this.getTasksForDate(currentDay);
            
            const classes = [
                'calendar-day',
                !isCurrentMonth ? 'other-month' : '',
                isToday ? 'today' : '',
                dayTasks.length > 0 ? 'has-tasks' : ''
            ].filter(Boolean).join(' ');

            const tasksHTML = dayTasks
                .slice(0, 3)
                .map(task => {
                    const classes = [
                        'calendar-task',
                        task.completed ? 'completed' : '',
                        this.isTaskUrgent(task) ? 'urgent' : ''
                    ].filter(Boolean).join(' ');
                    
                    return `<div class="${classes}" title="${this.escapeHtml(task.title)}">${this.escapeHtml(task.title)}</div>`;
                })
                .join('');

            const moreCount = dayTasks.length > 3 ? dayTasks.length - 3 : 0;
            const moreHTML = moreCount > 0 ? `<div class="calendar-task">+${moreCount} mais</div>` : '';

            days.push(`
                <div class="${classes}">
                    <div class="day-number">${currentDay.getDate()}</div>
                    <div class="day-tasks">${tasksHTML}${moreHTML}</div>
                </div>
            `);
        }

        container.innerHTML = days.join('');
    }

    navigateMonth(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.renderCalendar();
    }

    getTasksForDate(date) {
        const dateStr = date.toISOString().split('T')[0];
        return this.tasks.filter(task => task.dueDate === dateStr);
    }

    // Alternância de abas
    switchTab(tabName) {
        // Atualizar botões
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        // Atualizar conteúdo
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}Tab`);
        });
        
        // Re-renderizar se necessário
        if (tabName === 'calendar') {
            this.renderCalendar();
        } else if (tabName === 'pomodoro') {
            this.renderPomodoroStats();
        }
    }

    // Controle do dropdown de exportação
    toggleExportDropdown() {
        const dropdown = document.getElementById('exportOptions');
        dropdown.classList.toggle('show');
    }

    closeExportDropdown() {
        const dropdown = document.getElementById('exportOptions');
        dropdown.classList.remove('show');
    }

    // Exportar tarefas
    exportTasks(format = 'json') {
        if (this.tasks.length === 0) {
            alert('Não há tarefas para exportar.');
            return;
        }

        this.closeExportDropdown();

        if (format === 'excel') {
            this.exportToExcel();
        } else {
            this.exportToJSON();
        }
    }

    exportToJSON() {
        const dataToExport = {
            exportDate: new Date().toISOString(),
            totalTasks: this.tasks.length,
            pendingTasks: this.tasks.filter(t => !t.completed).length,
            completedTasks: this.tasks.filter(t => t.completed).length,
            tasks: this.tasks
        };

        const dataStr = JSON.stringify(dataToExport, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `unitasks_backup_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showNotification('Tarefas exportadas em JSON com sucesso!', 'success');
    }

    exportToExcel() {
        // Criar dados para Excel (formato CSV)
        const headers = ['Título', 'Descrição', 'Data de Entrega', 'Prioridade', 'Status', 'Data de Criação'];
        const rows = this.tasks.map(task => [
            task.title,
            task.description || '',
            this.formatDate(task.dueDate),
            task.priority.charAt(0).toUpperCase() + task.priority.slice(1),
            task.completed ? 'Concluída' : 'Pendente',
            new Date(task.createdAt).toLocaleDateString('pt-BR')
        ]);

        // Criar conteúdo CSV
        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(','))
            .join('\n');

        // Adicionar BOM para suporte a caracteres especiais no Excel
        const BOM = '\uFEFF';
        const csvWithBOM = BOM + csvContent;

        // Criar e baixar arquivo
        const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `unitasks_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();

        this.showNotification('Tarefas exportadas para Excel com sucesso!', 'success');
    }

    // Pomodoro
    
    initPomodoro() {
        this.updatePomodoroDisplay();
        this.renderPomodoroStats();
        this.renderCycleIndicators();
        this.updateTimerTheme();
        this.updatePomodoroButtons();
        
        // Solicitar permissão para notificações
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    startPomodoro() {
        if (this.pomodoro.isRunning) return;
        
        this.pomodoro.isRunning = true;
        this.updatePomodoroButtons();
        
        this.pomodoro.interval = setInterval(() => {
            this.pomodoro.timeLeft--;
            this.updatePomodoroDisplay();
            
            if (this.pomodoro.timeLeft <= 0) {
                this.completePomodoro();
            }
        }, 1000);
        
        this.updateCurrentStatus();
    }

    pausePomodoro() {
        if (!this.pomodoro.isRunning) return;
        
        this.pomodoro.isRunning = false;
        clearInterval(this.pomodoro.interval);
        this.updatePomodoroButtons();
        this.updateCurrentStatus();
    }

    resetPomodoro() {
        this.pausePomodoro();
        
        if (this.pomodoro.currentMode === 'focus') {
            this.pomodoro.timeLeft = 25 * 60;
            this.pomodoro.totalTime = 25 * 60;
        } else if (this.pomodoro.currentMode === 'short-break') {
            this.pomodoro.timeLeft = 5 * 60;
            this.pomodoro.totalTime = 5 * 60;
        } else {
            this.pomodoro.timeLeft = 15 * 60;
            this.pomodoro.totalTime = 15 * 60;
        }
        
        this.updatePomodoroDisplay();
        this.updateCurrentStatus();
    }

    completePomodoro() {
        this.pausePomodoro();
        
        if (this.pomodoro.currentMode === 'focus') {
            // Ciclo de foco completado
            this.pomodoro.completedCycles++;
            this.addCycleToHistory();
            
            // Determinar próxima pausa
            if (this.pomodoro.completedCycles % 4 === 0) {
                this.startLongBreak();
            } else {
                this.startShortBreak();
            }
        } else {
            // Pausa completada, voltar ao foco
            this.startFocusSession();
        }
        
        this.savePomodoroData();
        this.renderPomodoroStats();
        this.renderCycleIndicators();
    }

    startFocusSession() {
        this.pomodoro.currentMode = 'focus';
        this.pomodoro.timeLeft = 25 * 60;
        this.pomodoro.totalTime = 25 * 60;
        this.updatePomodoroDisplay();
        this.updateTimerTheme();
        
        this.showPomodoroNotification(
            '🎯 Hora de focar!', 
            'Vamos começar um novo ciclo de 25 minutos de foco intenso.',
            () => this.startPomodoro()
        );
    }

    startShortBreak() {
        this.pomodoro.currentMode = 'short-break';
        this.pomodoro.timeLeft = 5 * 60;
        this.pomodoro.totalTime = 5 * 60;
        this.updatePomodoroDisplay();
        this.updateTimerTheme();
        
        this.showPomodoroNotification(
            '☕ Hora da pausa!', 
            'Você completou um ciclo! Relaxe por 5 minutos.',
            () => this.startPomodoro()
        );
    }

    startLongBreak() {
        this.pomodoro.currentMode = 'long-break';
        this.pomodoro.timeLeft = 15 * 60;
        this.pomodoro.totalTime = 15 * 60;
        this.updatePomodoroDisplay();
        this.updateTimerTheme();
        
        this.showPomodoroNotification(
            '🏖️ Pausa longa!', 
            'Você completou 4 ciclos! Descanse por 15 minutos.',
            () => this.startPomodoro()
        );
    }

    updatePomodoroDisplay() {
        const minutes = Math.floor(this.pomodoro.timeLeft / 60);
        const seconds = this.pomodoro.timeLeft % 60;
        const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        document.getElementById('timerDisplay').textContent = display;
        
        // Atualizar barra de progresso
        const progress = ((this.pomodoro.totalTime - this.pomodoro.timeLeft) / this.pomodoro.totalTime) * 100;
        document.getElementById('progressBar').style.width = `${progress}%`;
        
        // Atualizar título da página
        document.title = `${display} - UniTasks Pomodoro`;
    }

    updatePomodoroButtons() {
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        
        if (this.pomodoro.isRunning) {
            startBtn.disabled = true;
            pauseBtn.disabled = false;
        } else {
            startBtn.disabled = false;
            pauseBtn.disabled = true;
        }
    }

    updateTimerTheme() {
        const timer = document.querySelector('.pomodoro-timer');
        const timerType = document.getElementById('timerType');
        
        timer.className = 'pomodoro-timer';
        
        switch (this.pomodoro.currentMode) {
            case 'focus':
                timer.classList.add('focus');
                timerType.textContent = 'Foco';
                break;
            case 'short-break':
                timer.classList.add('short-break');
                timerType.textContent = 'Pausa Curta';
                break;
            case 'long-break':
                timer.classList.add('long-break');
                timerType.textContent = 'Pausa Longa';
                break;
        }
    }

    updateCurrentStatus() {
        const statusElement = document.getElementById('currentStatus');
        
        if (this.pomodoro.isRunning) {
            switch (this.pomodoro.currentMode) {
                case 'focus':
                    statusElement.textContent = 'Focando...';
                    break;
                case 'short-break':
                    statusElement.textContent = 'Pausa curta';
                    break;
                case 'long-break':
                    statusElement.textContent = 'Pausa longa';
                    break;
            }
        } else {
            if (this.pomodoro.timeLeft === this.pomodoro.totalTime) {
                statusElement.textContent = 'Pronto para começar';
            } else {
                statusElement.textContent = 'Pausado';
            }
        }
    }

    renderPomodoroStats() {
        document.getElementById('completedCycles').textContent = this.pomodoro.completedCycles;
        this.updateCurrentStatus();
    }

    renderCycleIndicators() {
        const container = document.getElementById('cyclesDisplay');
        const currentSet = Math.floor(this.pomodoro.completedCycles / 4) * 4;
        
        let html = '';
        for (let i = 1; i <= 4; i++) {
            const cycleNumber = currentSet + i;
            let className = 'cycle-indicator pending';
            
            if (cycleNumber <= this.pomodoro.completedCycles) {
                className = 'cycle-indicator completed';
            } else if (cycleNumber === this.pomodoro.completedCycles + 1 && this.pomodoro.currentMode === 'focus') {
                className = 'cycle-indicator current';
            }
            
            html += `<div class="${className}">${i}</div>`;
        }
        
        container.innerHTML = html;
    }

    addCycleToHistory() {
        const today = new Date().toDateString();
        const todayCycles = this.pomodoro.cyclesToday.filter(cycle => 
            new Date(cycle.date).toDateString() === today
        );
        
        if (todayCycles.length === 0 || todayCycles[todayCycles.length - 1].date !== today) {
            this.pomodoro.cyclesToday.push({
                date: today,
                timestamp: new Date().toISOString(),
                type: 'focus'
            });
        }
        
        // Manter apenas os últimos 30 dias
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        this.pomodoro.cyclesToday = this.pomodoro.cyclesToday.filter(cycle => 
            new Date(cycle.date) >= thirtyDaysAgo
        );
    }

    showPomodoroNotification(title, message, onStart) {
        // Tocar som de notificação (se suportado)
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: message,
                icon: '🍅'
            });
        }
        
        // Mostrar modal personalizado
        const notification = document.createElement('div');
        notification.className = 'pomodoro-notification';
        notification.innerHTML = `
            <h3>${title}</h3>
            <p>${message}</p>
            <button onclick="this.parentElement.remove(); document.title = 'UniTasks - Organizador de Tarefas Acadêmicas';">Pular</button>
            <button onclick="this.parentElement.remove(); window.app.startPomodoro(); document.title = 'UniTasks - Organizador de Tarefas Acadêmicas';">Iniciar</button>
        `;
        
        document.body.appendChild(notification);
        
        // Remover automaticamente após 10 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
                document.title = 'UniTasks - Organizador de Tarefas Acadêmicas';
            }
        }, 10000);
    }

    // === final do pomodoro ===

    // Utilitários
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    isTaskUrgent(task) {
        if (task.completed) return false;
        
        const today = new Date();
        const dueDate = new Date(task.dueDate);
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays <= 2 && diffDays >= 0;
    }

    isSameDay(date1, date2) {
        return date1.toDateString() === date2.toDateString();
    }

    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    getPriorityEmoji(priority) {
        const emojis = {
            'baixa': '🟢',
            'media': '🟡',
            'alta': '🔴'
        };
        return emojis[priority] || '🟡';
    }

    getPriorityColor(priority) {
        const colors = {
            'baixa': '#4caf50',
            'media': '#ff9800',
            'alta': '#f44336'
        };
        return colors[priority] || '#ff9800';
    }

    getEmptyMessage() {
        switch (this.currentFilter) {
            case 'pending':
                return 'Nenhuma tarefa pendente encontrada.';
            case 'completed':
                return 'Nenhuma tarefa concluída encontrada.';
            default:
                return 'Nenhuma tarefa cadastrada ainda.';
        }
    }

    updatePendingCount() {
        const pendingCount = this.tasks.filter(task => !task.completed).length;
        document.getElementById('pendingCount').textContent = pendingCount;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message, type = 'info') {
        // Criar elemento de notificação
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#4caf50' : '#2196f3'};
            color: white;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            z-index: 10000;
            font-family: inherit;
            font-size: 14px;
            max-width: 300px;
            animation: slideInRight 0.3s ease;
        `;
        notification.textContent = message;

        // Adicionar CSS da animação
        if (!document.getElementById('notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(notification);

        // Remover após 3 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Inicializar aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.app = new UniTasks();
});

// Prevenir envio do formulário com Enter em campos de texto
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type === 'text') {
        e.preventDefault();
    }
});

// Atalhos de teclado
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K para abrir modal de nova tarefa
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (window.app) {
            window.app.openModal();
        }
    }
    
    // Escape para fechar modal
    if (e.key === 'Escape') {
        const modal = document.getElementById('taskModal');
        if (modal && modal.style.display === 'block') {
            window.app.closeModal();
        }
    }
});
