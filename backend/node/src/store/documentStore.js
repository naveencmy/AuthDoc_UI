const store = new Map();

/**
 * In-memory document store
 * No DB by design (prototype)
 */
module.exports = {
  save(id, data) {
    store.set(id, data);
  },
  get(id) {
    return store.get(id);
  }
};
