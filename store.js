// Actual DB store
const Block = require('./block').Block;
class Store {
    constructor() {
        this.store = new Map();
        this.valueCounts = new Map();
        this.blocks = [];
    }

    set(key, value, doLog=true) {
        if(this.hasOpenTransactions()) {
            const block = this.blocks[this.blocks.length-1];
            // Get the reverse op
            if(this.store.has(key)) {
                const oldVal = this.store.get(key);
                block.log(this.set.bind(this), key, oldVal, false);
            } else {
                // unset
                block.log(this.unset.bind(this), key, false);
            }
        }

        // Update value counts
        if(this.store.has(key)) {
            const oldVal = this.store.get(key);
            
            // decrement or delete old
            if(this.valueCounts.has(oldVal)) {
                if(this.valueCounts.get(oldVal) === 1) {
                    this.valueCounts.delete(oldVal);
                } else {
                    this.valueCounts.set(oldVal, this.valueCounts.get(oldVal)-1);
                }
            }

            // update new value count
            if(this.valueCounts.has(value)) {
                this.valueCounts.set(value, this.valueCounts.get(value)+1);
            } else {
                this.valueCounts.set(value, 1);
            }
        } else {
            if(this.valueCounts.has(value)) {
                this.valueCounts.set(value, this.valueCounts.get(value)+1);
            } else {
                this.valueCounts.set(value, 1);
            }
        }
        
        // Update store
        this.store.set(key, value);
        
    }

    get(key) {
        return this.store.get(key);
    }

    unset(key, doLog=true) {
        if(!this.store.has(key)) {
            console.log('No Such Key Exist');
            return;
        }
        if(this.hasOpenTransactions()) {
            const block = this.blocks[this.blocks.length-1];
            // Get the reverse op
            const oldVal = this.store.get(key);
            block.log(this.set.bind(this), key, oldVal, false);
        }

        const oldVal = this.store.get(key);
        this.store.delete(key);

        if(this.valueCounts.has(oldVal)) {
            if(this.valueCounts.get(oldVal) === 1) {
                this.valueCounts.delete(oldVal);
            } else {
                this.valueCounts.set(oldVal, this.valueCounts.get(oldVal)-1);
            }
        }
    }

    numequalto(value) {
        return this.valueCounts.has(value) ? this.valueCounts.get(value) : 0;
    }

    rollback() {
        if(!this.hasOpenTransactions()) {
            console.log('INVALID ROLLBACK');
            return;
        }
        const block = this.blocks[this.blocks.length-1];
        block.rollback();
        this.pop();
    }

    commit() {
        this.blocks = [];
    }

    hasOpenTransactions() {
        return this.blocks.length !== 0;
    }

    pop() {
        this.blocks.splice(this.blocks.length-1, 1);
    }

    newTransaction() {
        this.blocks.push(new Block());
    }
}

exports.Store = Store;