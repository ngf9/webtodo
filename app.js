// Initialize InstantDB
const APP_ID = '986fb340-0e2c-459c-93c9-e38917007a49';
const db = instantdb.init({ appId: APP_ID });

// State management
let currentUser = { id: 'demo-user' }; // Temporary demo user
let currentEditingTodo = null;
let todos = []; // Store todos in memory for now

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

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
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
    
    // For now, use demo todos while we work on the design
    todos = [
        { id: '1', text: 'Design the perfect minimal todo app', completed: true, userId: 'demo-user', createdAt: Date.now() - 3600000 },
        { id: '2', text: 'Implement Magic Codes authentication', completed: false, userId: 'demo-user', createdAt: Date.now() - 1800000 },
        { id: '3', text: 'Add smooth animations and transitions', completed: false, userId: 'demo-user', createdAt: Date.now() - 900000 },
        { id: '4', text: 'Deploy to Vercel', completed: false, userId: 'demo-user', createdAt: Date.now() }
    ];
    
    // Render demo todos
    renderTodos(todos);
    
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

// Render todos
function renderTodos(todos) {
    todoList.innerHTML = '';
    
    if (!todos || todos.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    
    todos.forEach(todo => {
        const todoItem = createTodoElement(todo);
        todoList.appendChild(todoItem);
    });
}

// Create todo element
function createTodoElement(todo) {
    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    li.dataset.todoId = todo.id;
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'todo-checkbox';
    checkbox.checked = todo.completed;
    checkbox.addEventListener('change', () => toggleTodoComplete(todo.id, !todo.completed));
    
    const text = document.createElement('span');
    text.className = 'todo-text';
    text.textContent = todo.text;
    text.addEventListener('click', () => showEditModal(todo));
    
    // Long press for delete
    let pressTimer;
    text.addEventListener('mousedown', () => {
        pressTimer = setTimeout(() => {
            if (confirm('Delete this todo?')) {
                deleteTodo(todo.id);
            }
        }, 500);
    });
    text.addEventListener('mouseup', () => clearTimeout(pressTimer));
    text.addEventListener('mouseleave', () => clearTimeout(pressTimer));
    
    li.appendChild(checkbox);
    li.appendChild(text);
    
    return li;
}

// Show add modal
function showAddModal() {
    addModal.classList.remove('hidden');
    newTodoInput.value = '';
    newTodoInput.focus();
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
    const newTodo = {
        id: Date.now().toString(),
        text,
        completed: false,
        userId: currentUser.id,
        createdAt: Date.now()
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
    // Update in local array
    const todoIndex = todos.findIndex(t => t.id === todoId);
    if (todoIndex !== -1) {
        todos[todoIndex].completed = completed;
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