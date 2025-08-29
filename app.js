// Initialize InstantDB
const APP_ID = '986fb340-0e2c-459c-93c9-e38917007a49';
const db = instantdb.init({ appId: APP_ID });

// State management
let currentUser = null;
let currentEditingTodo = null;
let isAuthenticating = false;

// DOM Elements
const authContainer = document.getElementById('auth-container');
const mainContainer = document.getElementById('main-container');
const authForm = document.getElementById('auth-form');
const authTitle = document.getElementById('auth-title');
const authSubmit = document.getElementById('auth-submit');
const authSwitchText = document.getElementById('auth-switch-text');
const authSwitchLink = document.getElementById('auth-switch-link');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const signoutBtn = document.getElementById('signout-btn');
const todoList = document.getElementById('todo-list');
const emptyState = document.getElementById('empty-state');
const addBtn = document.getElementById('add-btn');
const addModal = document.getElementById('add-modal');
const editModal = document.getElementById('edit-modal');
const newTodoInput = document.getElementById('new-todo-input');
const editTodoInput = document.getElementById('edit-todo-input');

// Auth state
let isSignUp = false;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    checkAuthState();
});

// Setup event listeners
function setupEventListeners() {
    // Auth form
    authForm.addEventListener('submit', handleAuthSubmit);
    authSwitchLink.addEventListener('click', toggleAuthMode);
    signoutBtn.addEventListener('click', handleSignOut);
    
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

// Toggle between sign in and sign up
function toggleAuthMode(e) {
    e.preventDefault();
    isSignUp = !isSignUp;
    
    authTitle.textContent = isSignUp ? 'Sign Up' : 'Sign In';
    authSubmit.textContent = isSignUp ? 'Sign Up' : 'Sign In';
    authSwitchText.textContent = isSignUp ? 'Already have an account?' : "Don't have an account?";
    authSwitchLink.textContent = isSignUp ? 'Sign In' : 'Sign Up';
}

// Check authentication state
async function checkAuthState() {
    // Check if user is logged in
    db.auth.onAuthStateChange((authState) => {
        if (authState.user) {
            currentUser = authState.user;
            showMainApp();
            subscribeToTodos();
        } else {
            currentUser = null;
            showAuthScreen();
        }
    });
}

// Handle authentication submit
async function handleAuthSubmit(e) {
    e.preventDefault();
    
    if (isAuthenticating) return;
    
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    
    if (!email || !password) {
        showError('Please fill in all fields');
        return;
    }
    
    isAuthenticating = true;
    authSubmit.disabled = true;
    authSubmit.textContent = isSignUp ? 'Creating Account...' : 'Signing In...';
    
    try {
        if (isSignUp) {
            await db.auth.createUser({ email, password });
        } else {
            await db.auth.signInWithEmail({ email, password });
        }
    } catch (error) {
        console.error('Auth error:', error);
        showError(error.message || 'Authentication failed');
    } finally {
        isAuthenticating = false;
        authSubmit.disabled = false;
        authSubmit.textContent = isSignUp ? 'Sign Up' : 'Sign In';
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
    authForm.reset();
}

// Show auth screen
function showAuthScreen() {
    authContainer.classList.remove('hidden');
    mainContainer.classList.add('hidden');
}

// Subscribe to todos
function subscribeToTodos() {
    if (!currentUser) return;
    
    // Subscribe to user's todos
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
}

// Handle update todo
async function handleUpdateTodo() {
    if (!currentEditingTodo) return;
    
    const text = editTodoInput.value.trim();
    
    if (!text) {
        editTodoInput.focus();
        return;
    }
    
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
}

// Handle delete todo
async function handleDeleteTodo() {
    if (!currentEditingTodo) return;
    
    try {
        await deleteTodo(currentEditingTodo.id);
        hideEditModal();
    } catch (error) {
        console.error('Delete todo error:', error);
        showError('Failed to delete todo');
    }
}

// Toggle todo complete status
async function toggleTodoComplete(todoId, completed) {
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
}

// Delete todo
async function deleteTodo(todoId) {
    try {
        await db.transact(
            db.tx.todos[todoId].delete()
        );
    } catch (error) {
        console.error('Delete todo error:', error);
        showError('Failed to delete todo');
    }
}

// Show error message
function showError(message) {
    // For now, using alert. In production, use a toast notification
    alert(message);
}