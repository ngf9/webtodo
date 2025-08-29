// Premium Todo App with Advanced Features

// State management
let todos = [];
let currentEditingTodo = null;
let currentPriority = 'medium';
let completedToday = 0;
let streak = parseInt(localStorage.getItem('streak') || '0');

// DOM Elements
const mainContainer = document.getElementById('main-container');
const addBtn = document.getElementById('add-btn');
const addModal = document.getElementById('add-modal');
const editModal = document.getElementById('edit-modal');
const todoList = document.getElementById('todo-list');
const newTodoInput = document.getElementById('new-todo-input');
const editTodoInput = document.getElementById('edit-todo-input');
const emptyState = document.getElementById('empty-state');
const greetingEl = document.getElementById('greeting');
const currentDateEl = document.getElementById('current-date');
const completedCountEl = document.getElementById('completed-count');
const totalCountEl = document.getElementById('total-count');
const streakCountEl = document.getElementById('streak-count');
const todayCountEl = document.getElementById('today-count');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    console.log('Premium Todo App Initialized');
    
    // Load todos from localStorage
    loadTodos();
    
    // Set up dynamic greeting and date
    updateGreeting();
    updateDate();
    
    // Update stats
    updateStats();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initial render
    renderTodos();
    
    // Add mouse move effect for cards
    setupMouseEffects();
    
    // Update greeting every minute
    setInterval(updateGreeting, 60000);
});

// Setup event listeners
function setupEventListeners() {
    // Add button
    addBtn.addEventListener('click', () => {
        showModal(addModal);
        newTodoInput.focus();
    });
    
    // Modal buttons
    document.getElementById('cancel-add').addEventListener('click', () => hideModal(addModal));
    document.getElementById('confirm-add').addEventListener('click', handleAddTodo);
    document.getElementById('cancel-edit').addEventListener('click', () => hideModal(editModal));
    document.getElementById('confirm-edit').addEventListener('click', handleUpdateTodo);
    document.getElementById('delete-todo').addEventListener('click', handleDeleteTodo);
    
    // Modal overlays
    addModal.querySelector('.modal-overlay').addEventListener('click', () => hideModal(addModal));
    editModal.querySelector('.modal-overlay').addEventListener('click', () => hideModal(editModal));
    
    // Enter key support
    newTodoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleAddTodo();
    });
    editTodoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleUpdateTodo();
    });
    
    // Priority selectors
    setupPrioritySelectors();
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.metaKey || e.ctrlKey) {
            if (e.key === 'n') {
                e.preventDefault();
                showModal(addModal);
            }
        }
    });
}

// Setup priority selectors
function setupPrioritySelectors() {
    const addPriorityBtns = addModal.querySelectorAll('.priority-btn');
    const editPriorityBtns = editModal.querySelectorAll('.priority-btn');
    
    addPriorityBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            addPriorityBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentPriority = btn.dataset.priority;
        });
    });
    
    editPriorityBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            editPriorityBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (currentEditingTodo) {
                currentEditingTodo.priority = btn.dataset.priority;
            }
        });
    });
}

// Update dynamic greeting
function updateGreeting() {
    const hour = new Date().getHours();
    let greeting = 'Good evening';
    
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 17) greeting = 'Good afternoon';
    
    greetingEl.textContent = greeting;
}

// Update current date
function updateDate() {
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    const date = new Date().toLocaleDateString('en-US', options);
    currentDateEl.textContent = date;
}

// Show modal with animation
function showModal(modal) {
    modal.classList.remove('hidden');
    modal.classList.remove('closing');
}

// Hide modal with animation
function hideModal(modal) {
    modal.classList.add('closing');
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('closing');
    }, 300);
}

// Load todos from localStorage
function loadTodos() {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
        todos = JSON.parse(savedTodos);
    } else {
        // Demo todos for first time
        todos = [
            { 
                id: '1', 
                text: 'Welcome to your premium todo experience', 
                completed: false,
                priority: 'high',
                createdAt: Date.now() - 3600000
            },
            { 
                id: '2', 
                text: 'Try the keyboard shortcut: Cmd+N to add a task', 
                completed: false,
                priority: 'medium',
                createdAt: Date.now() - 1800000
            }
        ];
        saveTodos();
    }
}

// Save todos to localStorage
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Render todos with animations
function renderTodos() {
    todoList.innerHTML = '';
    
    if (todos.length === 0) {
        emptyState.classList.remove('hidden');
        updateStats();
        return;
    }
    
    emptyState.classList.add('hidden');
    
    // Sort todos: incomplete first, then by priority
    const sortedTodos = [...todos].sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    
    sortedTodos.forEach((todo, index) => {
        const li = createTodoElement(todo, index);
        todoList.appendChild(li);
    });
    
    updateStats();
}

// Create todo element with premium features
function createTodoElement(todo, index) {
    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    li.dataset.todoId = todo.id;
    li.dataset.priority = todo.priority || 'medium';
    li.style.animationDelay = `${index * 0.05}s`;
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'todo-checkbox';
    checkbox.checked = todo.completed;
    checkbox.addEventListener('change', () => toggleTodoComplete(todo.id));
    
    const text = document.createElement('span');
    text.className = 'todo-text';
    text.textContent = todo.text;
    text.addEventListener('click', () => showEditModal(todo));
    
    const meta = document.createElement('div');
    meta.className = 'todo-meta';
    
    const time = document.createElement('span');
    time.className = 'todo-time';
    time.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        ${formatTime(todo.createdAt)}
    `;
    
    meta.appendChild(time);
    
    li.appendChild(checkbox);
    li.appendChild(text);
    li.appendChild(meta);
    
    return li;
}

// Format time ago
function formatTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
}

// Toggle todo completion with celebration
function toggleTodoComplete(todoId) {
    const todoIndex = todos.findIndex(t => t.id === todoId);
    if (todoIndex === -1) return;
    
    todos[todoIndex].completed = !todos[todoIndex].completed;
    
    // Celebration animation
    if (todos[todoIndex].completed) {
        const todoEl = document.querySelector(`[data-todo-id="${todoId}"]`);
        todoEl.classList.add('celebrating');
        
        // Update completed today count
        const today = new Date().toDateString();
        const lastCompleted = localStorage.getItem('lastCompletedDate');
        
        if (lastCompleted !== today) {
            completedToday = 1;
            updateStreak();
        } else {
            completedToday++;
        }
        
        localStorage.setItem('lastCompletedDate', today);
        
        setTimeout(() => {
            todoEl.classList.remove('celebrating');
            renderTodos();
        }, 600);
    } else {
        renderTodos();
    }
    
    saveTodos();
}

// Update streak
function updateStreak() {
    const lastDate = localStorage.getItem('lastStreakDate');
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (lastDate === yesterday) {
        streak++;
    } else if (lastDate !== today) {
        streak = 1;
    }
    
    localStorage.setItem('streak', streak.toString());
    localStorage.setItem('lastStreakDate', today);
}

// Update statistics
function updateStats() {
    const completed = todos.filter(t => t.completed).length;
    const total = todos.length;
    
    completedCountEl.textContent = completed;
    totalCountEl.textContent = total;
    streakCountEl.textContent = streak;
    todayCountEl.textContent = `${total} task${total !== 1 ? 's' : ''}`;
    
    // Animate number changes
    [completedCountEl, totalCountEl, streakCountEl].forEach(el => {
        el.style.transform = 'scale(1.2)';
        setTimeout(() => {
            el.style.transform = 'scale(1)';
        }, 200);
    });
}

// Show edit modal
function showEditModal(todo) {
    currentEditingTodo = todo;
    editTodoInput.value = todo.text;
    
    // Set priority
    const priorityBtns = editModal.querySelectorAll('.priority-btn');
    priorityBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.priority === todo.priority) {
            btn.classList.add('active');
        }
    });
    
    showModal(editModal);
    editTodoInput.focus();
    editTodoInput.select();
}

// Handle add todo
function handleAddTodo() {
    const text = newTodoInput.value.trim();
    if (!text) return;
    
    const newTodo = {
        id: Date.now().toString(),
        text,
        completed: false,
        priority: currentPriority,
        createdAt: Date.now()
    };
    
    todos.unshift(newTodo);
    saveTodos();
    renderTodos();
    
    newTodoInput.value = '';
    currentPriority = 'medium';
    hideModal(addModal);
    
    // Reset priority buttons
    addModal.querySelectorAll('.priority-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.priority === 'medium') btn.classList.add('active');
    });
}

// Handle update todo
function handleUpdateTodo() {
    if (!currentEditingTodo) return;
    
    const text = editTodoInput.value.trim();
    if (!text) return;
    
    const todoIndex = todos.findIndex(t => t.id === currentEditingTodo.id);
    if (todoIndex !== -1) {
        todos[todoIndex].text = text;
        todos[todoIndex].priority = currentEditingTodo.priority;
        saveTodos();
        renderTodos();
    }
    
    hideModal(editModal);
    currentEditingTodo = null;
}

// Handle delete todo
function handleDeleteTodo() {
    if (!currentEditingTodo) return;
    
    todos = todos.filter(t => t.id !== currentEditingTodo.id);
    saveTodos();
    renderTodos();
    
    hideModal(editModal);
    currentEditingTodo = null;
}

// Setup mouse effects for cards
function setupMouseEffects() {
    document.addEventListener('mousemove', (e) => {
        const cards = document.querySelectorAll('.todo-item');
        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty('--mouse-x', `${x}%`);
            card.style.setProperty('--mouse-y', `${y}%`);
        });
    });
}