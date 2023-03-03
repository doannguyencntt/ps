
const fs = require('fs')

const variable = {
  ...process.env
}

fs.writeFileSync('env-origin.json', JSON.stringify(variable))
