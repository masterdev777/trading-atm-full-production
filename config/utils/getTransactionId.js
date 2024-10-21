
// Generate token
const generateTransactionId = (id) => {
    return `${id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

module.exports = { generateTransactionId }