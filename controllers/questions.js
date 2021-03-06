function findAll (req, res) {
  return res.json([
    {
      id: 1,
      type: 'text',
      value: 'How old are you?',
    },
    {
      id: 2,
      type: 'select',
      value: 'How much commercial experience do you have with programming?',
      options: [
        { id: 1, value: 'not at all' },
        { id: 2, value: 'less than 1 year' },
        { id: 3, value: '1-3 years' },
        { id: 4, value: 'more than 3 years' },
      ],
    },
    {
      id: 3,
      type: 'text',
      value: 'How is your planet called?',
    },
  ])
}

module.exports = {
  findAll,
}
