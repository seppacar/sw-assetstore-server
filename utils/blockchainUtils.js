const Web3 = require('web3')

// Ethereum Web3 instance
const ethereumWeb3 = new Web3('https://eth.public-rpc.com')

// Avalanche Web3 instance
const avalancheWeb3 = new Web3('https://api.avax.network/ext/bc/C/rpc')

// Polygon Web3 instance
const polygonWeb3 = new Web3('https://polygon-rpc.com/')

// Sepolia testnet instance
const sepoliaWeb3 = new Web3('https://rpc2.sepolia.org')

// Goerli testnet instance
const goerliWeb3 = new Web3('https://rpc.ankr.com/eth_goerli')
// Get transaction details for Ethereum
const getEthereumTransactionDetails = async (transactionHash) => {
  const transaction = await ethereumWeb3.eth.getTransaction(transactionHash)
  if (!transaction) {
    throw new Error('Transaction not found, txHash: ' + transactionHash)
  }
  const currentBlockNumber = await ethereumWeb3.eth.getBlockNumber()
  const confirmations = currentBlockNumber - transaction.blockNumber
  const inputData = Web3.utils.hexToString(transaction.input)

  const senderAddress = transaction.from

  return {
    network: 'Ethereum',
    senderAddress,
    transactionHash,
    amount: Web3.utils.fromWei(transaction.value),
    symbol: 'ETH',
    confirmations,
    inputData
  }
}

// Get transaction details for Avalanche
const getAvalancheTransactionDetails = async (transactionHash) => {
  const transaction = await avalancheWeb3.eth.getTransaction(transactionHash)
  if (!transaction) {
    throw new Error('Transaction not found, txHash: ' + transactionHash)
  }
  const currentBlockNumber = await avalancheWeb3.eth.getBlockNumber()
  const confirmations = currentBlockNumber - transaction.blockNumber
  const inputData = Web3.utils.hexToString(transaction.input)

  const senderAddress = transaction.from

  return {
    network: 'Avalanche',
    senderAddress,
    transactionHash,
    amount: Web3.utils.fromWei(transaction.value),
    symbol: 'AVAX',
    confirmations,
    inputData
  }
}

// Get transaction details for Polygon
const getPolygonTransactionDetails = async (transactionHash) => {
  const transaction = await polygonWeb3.eth.getTransaction(transactionHash)
  if (!transaction) {
    throw new Error('Transaction not found, txHash: ' + transactionHash)
  }
  const currentBlockNumber = await polygonWeb3.eth.getBlockNumber()
  const confirmations = currentBlockNumber - transaction.blockNumber
  const inputData = Web3.utils.hexToString(transaction.input)
  const senderAddress = transaction.from

  return {
    network: 'Polygon',
    senderAddress,
    transactionHash,
    symbol: 'MATIC',
    amount: Web3.utils.fromWei(transaction.value),
    confirmations,
    inputData
  }
}

// Get transaction details for Sepolia
const getSepoliaTransactionDetails = async (transactionHash) => {
  const transaction = await sepoliaWeb3.eth.getTransaction(transactionHash)
  if (!transaction) {
    throw new Error('Transaction not found, txHash: ' + transactionHash)
  }

  const currentBlockNumber = await sepoliaWeb3.eth.getBlockNumber()
  const confirmations = currentBlockNumber - transaction.blockNumber
  // Input is
  const inputData = Web3.utils.hexToString(transaction.input)
  const senderAddress = transaction.from

  return {
    network: 'Sepolia',
    senderAddress,
    transactionHash,
    symbol: 'ETH',
    amount: Web3.utils.fromWei(transaction.value),
    confirmations,
    inputData
  }
}

const getGoerliTransactionDetails = async (transactionHash) => {
  const transaction = await goerliWeb3.eth.getTransaction(transactionHash)
  if (!transaction) {
    throw new Error('Transaction not found, txHash: ' + transactionHash)
  }

  const currentBlockNumber = await goerliWeb3.eth.getBlockNumber()
  const confirmations = currentBlockNumber - transaction.blockNumber
  // Input is
  const inputData = Web3.utils.hexToString(transaction.input)
  const senderAddress = transaction.from

  return {
    network: 'Goerli',
    senderAddress,
    transactionHash,
    symbol: 'ETH',
    amount: Web3.utils.fromWei(transaction.value),
    confirmations,
    inputData
  }
}

module.exports = {
  getEthereumTransactionDetails,
  getAvalancheTransactionDetails,
  getPolygonTransactionDetails,
  getSepoliaTransactionDetails,
  getGoerliTransactionDetails
}
