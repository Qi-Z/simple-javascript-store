const Store = require('./store').Store;

const store = new Store();

store.set('a', 10);
store.newTransaction();
store.set('a', 20);
store.rollback();

const x = store.numequalto(10);
// store.rollback();
console.log(store, x);
