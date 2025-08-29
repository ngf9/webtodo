// Simple version without InstantDB for debugging

// State management
let todos = [
    { id: '1', text: 'Design the perfect minimal todo app', completed: true },
    { id: '2', text: 'Implement Magic Codes authentication', completed: false },
    { id: '3', text: 'Add smooth animations and transitions', completed: false },
    { id: '4', text: 'Deploy to Vercel', completed: false }
];
let currentEditingTodo = null;

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded');
    
    // Get elements
    const mainContainer = document.getElementById('main-container');
    const authContainer = document.getElementById('auth-container');
    const addBtn = document.getElementById('add-btn');
    const addModal = document.getElementById('add-modal');
    const todoList = document.getElementById('todo-list');
    const newTodoInput = document.getElementById('new-todo-input');
    const emptyState = document.getElementById('empty-state');
    
    // Check if elements exist
    console.log('Elements found:', {
        mainContainer: !!mainContainer,
        authContainer: !!authContainer,
        addBtn: !!addBtn,
        addModal: !!addModal,
        todoList: !!todoList
    });
    
    // Show main app immediately
    if (authContainer) authContainer.classList.add('hidden');
    if (mainContainer) mainContainer.classList.remove('hidden');
    
    // Setup event listeners
    if (addBtn) {
        console.log('Setting up add button');
        addBtn.addEventListener('click', () => {
            console.log('Add button clicked');
            if (addModal) {
                addModal.classList.remove('hidden');
                if (newTodoInput) newTodoInput.focus();
            }
        });
    }
    
    // Cancel button
    const cancelBtn = document.getElementById('cancel-add');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            console.log('Cancel clicked');
            if (addModal) addModal.classList.add('hidden');
        });
    }
    
    // Confirm add button
    const confirmBtn = document.getElementById('confirm-add');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            console.log('Confirm clicked');
            if (newTodoInput && newTodoInput.value.trim()) {
                const newTodo = {
                    id: Date.now().toString(),
                    text: newTodoInput.value.trim(),
                    completed: false
                };
                todos.unshift(newTodo);
                renderTodos();
                newTodoInput.value = '';
                if (addModal) addModal.classList.add('hidden');
            }
        });
    }
    
    // Modal overlay click
    const modalOverlay = addModal?.querySelector('.modal-overlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', () => {
            if (addModal) addModal.classList.add('hidden');
        });
    }
    
    // Initial render
    renderTodos();
    
    // Render todos function
    function renderTodos() {
        console.log('Rendering todos:', todos);
        
        if (!todoList) {
            console.error('Todo list element not found');
            return;
        }
        
        todoList.innerHTML = '';
        
        if (todos.length === 0) {
            if (emptyState) emptyState.classList.remove('hidden');
            return;
        }
        
        if (emptyState) emptyState.classList.add('hidden');
        
        todos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'todo-checkbox';
            checkbox.checked = todo.completed;
            checkbox.addEventListener('change', () => {
                todo.completed = !todo.completed;
                renderTodos();
            });
            
            const text = document.createElement('span');
            text.className = 'todo-text';
            text.textContent = todo.text;
            
            li.appendChild(checkbox);
            li.appendChild(text);
            todoList.appendChild(li);
        });
    }
});