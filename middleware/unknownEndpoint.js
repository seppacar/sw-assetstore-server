const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'Unknown API endpoint' })
}

module.exports = unknownEndpoint
