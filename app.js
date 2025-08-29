// Initialize InstantDB
const APP_ID = '986fb340-0e2c-459c-93c9-e38917007a49';
let db;
try {
    db = instantdb.init({ appId: APP_ID });
    console.log('InstantDB initialized');
} catch (error) {
    console.error('Failed to initialize InstantDB:', error);
}

// State management
let currentUser = { id: 'demo-user' }; // Temporary demo user
let currentEditingTodo = null;
let selectedPriority = 'normal'; // Default priority

// Initialize demo todos
let todos = [
    { id: '1', text: 'Design the perfect minimal todo app', completed: true, userId: 'demo-user', createdAt: Date.now() - 3600000, completedAt: Date.now() - 1800000, order: 0, priority: 'high' },
    { id: '2', text: 'Implement Magic Codes authentication', completed: false, userId: 'demo-user', createdAt: Date.now() - 1800000, order: 1, priority: 'normal' },
    { id: '3', text: 'Add smooth animations and transitions', completed: false, userId: 'demo-user', createdAt: Date.now() - 900000, order: 2, priority: 'normal' },
    { id: '4', text: 'Deploy to Vercel', completed: false, userId: 'demo-user', createdAt: Date.now(), order: 3, priority: 'high' }
];

// DOM Elements
const authContainer = document.getElementById('auth-container');
const mainContainer = document.getElementById('main-container');
const emailStep = document.getElementById('email-step');
const codeStep = document.getElementById('code-step');
const emailForm = document.getElementById('email-form');
const codeForm = document.getElementById('code-form');
const emailInput = document.getElementById('email');
const codeInput = document.getElementById('code-input');
const sentEmailSpan = document.getElementById('sent-email');
const sendCodeBtn = document.getElementById('send-code-btn');
const verifyCodeBtn = document.getElementById('verify-code-btn');
const backToEmailBtn = document.getElementById('back-to-email');
const signoutBtn = document.getElementById('signout-btn');
const todoList = document.getElementById('todo-list');
const emptyState = document.getElementById('empty-state');
const addBtn = document.getElementById('add-btn');
const addModal = document.getElementById('add-modal');
const editModal = document.getElementById('edit-modal');
const newTodoInput = document.getElementById('new-todo-input');
const editTodoInput = document.getElementById('edit-todo-input');
let pendingCountEl = null;
let completedTodayCountEl = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    console.log('App initializing...');
    setupEventListeners();
    checkAuthState();
});

// Setup event listeners
function setupEventListeners() {
    // Temporarily disable auth
    // signoutBtn.addEventListener('click', handleSignOut);
    signoutBtn.style.display = 'none'; // Hide sign out for now
    
    // Todo interactions
    addBtn.addEventListener('click', showAddModal);
    document.getElementById('cancel-add').addEventListener('click', hideAddModal);
    document.getElementById('confirm-add').addEventListener('click', handleAddTodo);
    document.getElementById('cancel-edit').addEventListener('click', hideEditModal);
    document.getElementById('confirm-edit').addEventListener('click', handleUpdateTodo);
    document.getElementById('delete-todo').addEventListener('click', handleDeleteTodo);
    
    // Modal overlays
    addModal.querySelector('.modal-overlay').addEventListener('click', hideAddModal);
    editModal.querySelector('.modal-overlay').addEventListener('click', hideEditModal);
    
    // Enter key support
    newTodoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleAddTodo();
    });
    editTodoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleUpdateTodo();
    });
    
    // Priority toggle event listeners
    document.querySelectorAll('.priority-toggle').forEach(btn => {
        btn.addEventListener('click', handlePriorityToggle);
    });
}

// Handle priority toggle
function handlePriorityToggle(e) {
    const button = e.currentTarget;
    button.classList.toggle('active');
    
    // If active, set high priority, otherwise normal
    selectedPriority = button.classList.contains('active') ? 'high' : 'normal';
}

// Check authentication state
async function checkAuthState() {
    // Skip auth for now, go straight to main app
    showMainApp();
    subscribeToTodos();
}

// Show email step
function showEmailStep() {
    emailStep.classList.remove('hidden');
    codeStep.classList.add('hidden');
    codeInput.value = '';
    emailInput.focus();
}

// Show code step
function showCodeStep() {
    emailStep.classList.add('hidden');
    codeStep.classList.remove('hidden');
    sentEmailSpan.textContent = sentEmail;
    codeInput.value = '';
    codeInput.focus();
}

// Handle send magic code
async function handleSendCode(e) {
    e.preventDefault();
    
    if (isAuthenticating) return;
    
    const email = emailInput.value.trim();
    
    if (!email) {
        showError('Please enter your email');
        return;
    }
    
    isAuthenticating = true;
    sendCodeBtn.disabled = true;
    sendCodeBtn.textContent = 'Sending...';
    
    try {
        await db.auth.sendMagicCode({ email });
        sentEmail = email;
        showCodeStep();
    } catch (error) {
        console.error('Send code error:', error);
        showError(error.message || 'Failed to send code');
    } finally {
        isAuthenticating = false;
        sendCodeBtn.disabled = false;
        sendCodeBtn.textContent = 'Send Code';
    }
}

// Handle verify magic code
async function handleVerifyCode(e) {
    e.preventDefault();
    
    if (isAuthenticating) return;
    
    const code = codeInput.value.trim();
    
    if (!code) {
        showError('Please enter the code');
        return;
    }
    
    isAuthenticating = true;
    verifyCodeBtn.disabled = true;
    verifyCodeBtn.textContent = 'Verifying...';
    
    try {
        await db.auth.signInWithMagicCode({ 
            email: sentEmail, 
            code: code 
        });
        // Auth state change will handle navigation
    } catch (error) {
        console.error('Verify code error:', error);
        showError(error.message || 'Invalid code. Please try again.');
    } finally {
        isAuthenticating = false;
        verifyCodeBtn.disabled = false;
        verifyCodeBtn.textContent = 'Verify Code';
    }
}

// Handle sign out
async function handleSignOut() {
    try {
        await db.auth.signOut();
    } catch (error) {
        console.error('Sign out error:', error);
        showError('Failed to sign out');
    }
}

// Show main app
function showMainApp() {
    authContainer.classList.add('hidden');
    mainContainer.classList.remove('hidden');
    emailForm.reset();
    codeForm.reset();
}

// Show auth screen
function showAuthScreen() {
    authContainer.classList.remove('hidden');
    mainContainer.classList.add('hidden');
    showEmailStep();
}

// Subscribe to todos
function subscribeToTodos() {
    if (!currentUser) return;
    
    // Render current todos
    renderTodos(todos);
    
    // Force update stats after a short delay to ensure DOM is ready
    setTimeout(() => {
        console.log('Force updating stats...');
        updateStats();
    }, 100);
    
    // Commented out for now while we work on design
    /*
    const query = db.useQuery({
        todos: {
            $: {
                where: {
                    userId: currentUser.id
                },
                order: {
                    createdAt: 'asc'
                }
            }
        }
    });
    
    // Update UI when data changes
    query.subscribe((result) => {
        if (result.data?.todos) {
            renderTodos(result.data.todos);
        }
    });
    */
}

// Update statistics
function updateStats() {
    console.log('updateStats called!');
    
    if (!pendingCountEl || !completedTodayCountEl) {
        console.error('Stat elements not found!', { pendingCountEl, completedTodayCountEl });
        return;
    }
    
    const pending = todos.filter(todo => !todo.completed).length;
    const completed = todos.filter(todo => todo.completed).length;
    
    console.log('=== STATS UPDATE ===');
    console.log('Total todos:', todos.length);
    console.log('Pending (not checked):', pending);
    console.log('Completed (checked):', completed);
    console.log('Todos details:', todos.map(t => ({ text: t.text, completed: t.completed })));
    
    // Directly set the text content to test
    pendingCountEl.textContent = pending;
    completedTodayCountEl.textContent = completed;
    
    console.log('Stats should now show:', { pending, completed });
}

// Make updateStats and todos globally available for testing
window.updateStats = updateStats;
window.todos = todos;

// Animate number changes
function animateValue(element, start, end, duration) {
    // Handle NaN cases
    start = isNaN(start) ? 0 : start;
    end = isNaN(end) ? 0 : end;
    
    // If no change, just set the value
    if (start === end) {
        element.textContent = end;
        return;
    }
    
    const startTimestamp = Date.now();
    const step = () => {
        const current = Date.now();
        const progress = Math.min((current - startTimestamp) / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        element.textContent = Math.floor(easeOutQuart * (end - start) + start);
        
        if (progress < 1) {
            requestAnimationFrame(step);
        }
    };
    requestAnimationFrame(step);
}

// Render todos
function renderTodos(todos) {
    // Make sure we have the stat elements
    if (!pendingCountEl || !completedTodayCountEl) {
        pendingCountEl = document.getElementById('pending-count');
        completedTodayCountEl = document.getElementById('completed-today-count');
        console.log('Getting stat elements in renderTodos:', { pendingCountEl, completedTodayCountEl });
    }
    
    todoList.innerHTML = '';
    
    if (!todos || todos.length === 0) {
        emptyState.classList.remove('hidden');
        updateStats();
        return;
    }
    
    emptyState.classList.add('hidden');
    updateStats();
    
    // Sort todos by order before rendering
    const sortedTodos = [...todos].sort((a, b) => a.order - b.order);
    
    sortedTodos.forEach(todo => {
        const todoItem = createTodoElement(todo);
        todoList.appendChild(todoItem);
    });
}

// Drag and drop state
let draggedElement = null;
let draggedTodoId = null;

// Drag and drop handlers
function handleDragStart(e) {
    draggedElement = this;
    draggedTodoId = this.dataset.todoId;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragEnter(e) {
    if (this !== draggedElement) {
        this.classList.add('drag-over');
    }
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    
    if (draggedElement !== this) {
        // Get the dragged todo and the target todo
        const draggedTodo = todos.find(t => t.id === draggedTodoId);
        const targetTodoId = this.dataset.todoId;
        const targetTodo = todos.find(t => t.id === targetTodoId);
        
        if (draggedTodo && targetTodo) {
            // Swap orders
            const tempOrder = draggedTodo.order;
            draggedTodo.order = targetTodo.order;
            targetTodo.order = tempOrder;
            
            // Re-render todos
            renderTodos(todos);
        }
    }
    
    return false;
}

function handleDragEnd(e) {
    // Clean up
    const items = document.querySelectorAll('.todo-item');
    items.forEach(item => {
        item.classList.remove('dragging', 'drag-over');
    });
    draggedElement = null;
    draggedTodoId = null;
}

// Create todo element
function createTodoElement(todo) {
    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    li.dataset.todoId = todo.id;
    li.draggable = true;
    
    // Drag event handlers
    li.addEventListener('dragstart', handleDragStart);
    li.addEventListener('dragenter', handleDragEnter);
    li.addEventListener('dragover', handleDragOver);
    li.addEventListener('dragleave', handleDragLeave);
    li.addEventListener('drop', handleDrop);
    li.addEventListener('dragend', handleDragEnd);
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'todo-checkbox';
    checkbox.checked = todo.completed;
    checkbox.addEventListener('change', (e) => toggleTodoComplete(todo.id, e.target.checked));
    
    // Add priority flag for high priority items only
    let priorityFlag = null;
    if (todo.priority === 'high') {
        priorityFlag = document.createElement('span');
        priorityFlag.className = 'todo-priority-flag';
        priorityFlag.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/></svg>';
    }
    
    const text = document.createElement('span');
    text.className = 'todo-text';
    text.textContent = todo.text;
    
    // Create action buttons container
    const actions = document.createElement('div');
    actions.className = 'todo-actions';
    
    // Edit button
    const editBtn = document.createElement('button');
    editBtn.className = 'todo-action-btn edit-btn';
    editBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>';
    editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showEditModal(todo);
    });
    
    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'todo-action-btn delete-btn';
    deleteBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>';
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('Delete this todo?')) {
            deleteTodo(todo.id);
        }
    });
    
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    
    if (priorityFlag) {
        li.appendChild(priorityFlag);
    }
    li.appendChild(checkbox);
    li.appendChild(text);
    li.appendChild(actions);
    
    return li;
}

// Show add modal
function showAddModal() {
    addModal.classList.remove('hidden');
    newTodoInput.value = '';
    newTodoInput.focus();
    
    // Reset priority to normal
    selectedPriority = 'normal';
    const priorityToggle = addModal.querySelector('.priority-toggle');
    if (priorityToggle) {
        priorityToggle.classList.remove('active');
    }
}

// Hide add modal
function hideAddModal() {
    addModal.classList.add('hidden');
    newTodoInput.value = '';
}

// Show edit modal
function showEditModal(todo) {
    currentEditingTodo = todo;
    editModal.classList.remove('hidden');
    editTodoInput.value = todo.text;
    editTodoInput.focus();
    editTodoInput.select();
    
    // Set current priority
    selectedPriority = todo.priority || 'normal';
    const priorityToggle = editModal.querySelector('.priority-toggle');
    if (priorityToggle) {
        priorityToggle.classList.toggle('active', selectedPriority === 'high');
    }
}

// Hide edit modal
function hideEditModal() {
    editModal.classList.add('hidden');
    editTodoInput.value = '';
    currentEditingTodo = null;
}

// Handle add todo
async function handleAddTodo() {
    const text = newTodoInput.value.trim();
    
    if (!text) {
        newTodoInput.focus();
        return;
    }
    
    // For now, add to local array
    const maxOrder = Math.max(...todos.map(t => t.order), -1);
    const newTodo = {
        id: Date.now().toString(),
        text,
        completed: false,
        userId: currentUser.id,
        createdAt: Date.now(),
        order: maxOrder + 1,
        priority: selectedPriority
    };
    
    todos.unshift(newTodo); // Add to beginning
    renderTodos(todos);
    hideAddModal();
    
    /* Commented out for now
    try {
        await db.transact(
            db.tx.todos[db.id()].update({
                text,
                completed: false,
                userId: currentUser.id,
                createdAt: Date.now()
            })
        );
        hideAddModal();
    } catch (error) {
        console.error('Add todo error:', error);
        showError('Failed to add todo');
    }
    */
}

// Handle update todo
async function handleUpdateTodo() {
    if (!currentEditingTodo) return;
    
    const text = editTodoInput.value.trim();
    
    if (!text) {
        editTodoInput.focus();
        return;
    }
    
    // Update in local array
    const todoIndex = todos.findIndex(t => t.id === currentEditingTodo.id);
    if (todoIndex !== -1) {
        todos[todoIndex].text = text;
        todos[todoIndex].priority = selectedPriority;
        renderTodos(todos);
    }
    hideEditModal();
    
    /* Commented out for now
    try {
        await db.transact(
            db.tx.todos[currentEditingTodo.id].update({
                text
            })
        );
        hideEditModal();
    } catch (error) {
        console.error('Update todo error:', error);
        showError('Failed to update todo');
    }
    */
}

// Handle delete todo
async function handleDeleteTodo() {
    if (!currentEditingTodo) return;
    
    deleteTodo(currentEditingTodo.id);
    hideEditModal();
}

// Toggle todo complete status
async function toggleTodoComplete(todoId, completed) {
    console.log('Toggle todo:', todoId, completed);
    
    // Update in local array
    const todoIndex = todos.findIndex(t => t.id === todoId);
    if (todoIndex !== -1) {
        todos[todoIndex].completed = completed;
        if (completed) {
            todos[todoIndex].completedAt = Date.now();
        } else {
            delete todos[todoIndex].completedAt;
        }
        console.log('Updated todo:', todos[todoIndex]);
        renderTodos(todos);
    }
    
    /* Commented out for now
    try {
        await db.transact(
            db.tx.todos[todoId].update({
                completed
            })
        );
    } catch (error) {
        console.error('Toggle todo error:', error);
        showError('Failed to update todo');
    }
    */
}

// Delete todo
async function deleteTodo(todoId) {
    // Delete from local array
    todos = todos.filter(t => t.id !== todoId);
    renderTodos(todos);
    
    /* Commented out for now
    try {
        await db.transact(
            db.tx.todos[todoId].delete()
        );
    } catch (error) {
        console.error('Delete todo error:', error);
        showError('Failed to delete todo');
    }
    */
}

// Show error message
function showError(message) {
    // For now, using alert. In production, use a toast notification
    alert(message);
}