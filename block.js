// A block that stores a transaction
class Block {
    constructor() {
        this.ops = [];
    }

    log(func, ...args) {
        this.ops.push([func, args]);
    }

    rollback() {
        // run the command in reverse order
        for(let i = this.ops.length-1; i >= 0; i--) {
            const op = this.ops[i];
            op[0](...op[1]);
        }
    }
}



exports.Block = Block;