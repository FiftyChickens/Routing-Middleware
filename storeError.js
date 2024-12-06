class StoreError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
    console.error(this.stack);
  }
}

module.exports = StoreError;
