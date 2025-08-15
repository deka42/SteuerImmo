// Enhanced Application State Management
class ApplicationState {
    constructor() {
        this.state = {};
        this.subscribers = new Map();
        this.history = [];
        this.historyIndex = -1;
        this.maxHistorySize = 50;
        
        // Initialize with current form state
        this.saveCurrentState();
    }

    subscribe(property, callback) {
        if (!this.subscribers.has(property)) {
            this.subscribers.set(property, new Set());
        }
        this.subscribers.get(property).add(callback);
        
        return () => this.unsubscribe(property, callback);
    }

    unsubscribe(property, callback) {
        const callbacks = this.subscribers.get(property);
        if (callbacks) {
            callbacks.delete(callback);
        }
    }

    notify(property, newValue, oldValue) {
        const callbacks = this.subscribers.get(property);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(newValue, oldValue, property);
                } catch (error) {
                    console.error('Error in state subscriber:', error);
                }
            });
        }
    }

    set(property, value) {
        this.saveCurrentState();
        this.state[property] = value;
        this.notify(property, value, this.state[property]);
    }

    get(property) {
        return this.state[property];
    }

    saveCurrentState() {
        // Get current form data
        const currentFormData = this.getCurrentFormData();
        
        // Don't save if it's the same as the last state
        if (this.history.length > 0 && 
            JSON.stringify(currentFormData) === JSON.stringify(this.history[this.historyIndex])) {
            return;
        }
        
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }
        
        this.history.push(JSON.parse(JSON.stringify(currentFormData)));
        this.historyIndex = this.history.length - 1;
        
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
            this.historyIndex--;
        }
        
        // Update undo/redo button states
        if (window.app) {
            window.app.updateHistoryButtons();
        }
    }
    
    getCurrentFormData() {
        const data = {};
        const inputs = document.querySelectorAll('.form-input, .form-select');
        
        inputs.forEach(input => {
            if (input.type === 'number') {
                data[input.id] = parseFloat(input.value) || 0;
            } else if (input.type === 'checkbox') {
                data[input.id] = input.checked;
            } else {
                data[input.id] = input.value || '';
            }
        });
        
        return data;
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            const previousState = this.history[this.historyIndex];
            this.restoreFormData(previousState);
            return true;
        }
        return false;
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            const nextState = this.history[this.historyIndex];
            this.restoreFormData(nextState);
            return true;
        }
        return false;
    }
    
    restoreFormData(data) {
        if (window.app) {
            window.app.isRestoringState = true;
            window.app.populateForm(data);
            window.app.isRestoringState = false;
        }
    }
    
    canUndo() {
        return this.historyIndex > 0;
    }
    
    canRedo() {
        return this.historyIndex < this.history.length - 1;
    }

    getSnapshot() {
        return this.getCurrentFormData();
    }

    loadSnapshot(snapshot) {
        this.saveCurrentState();
        this.restoreFormData(snapshot);
    }
}