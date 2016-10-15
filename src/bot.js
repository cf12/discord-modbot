// Dependencies
const Eris = require('eris')
const fs = require('fs')
const path = require('path')

// Setting up objects
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json')))
let bot = new Eris(config.bot_token)

// Attempts to connect the bot
try {
  bot.connect()
} catch (err) {
  if (err) throw err
  console.log('ERROR > Error while connecting to discord. Check your bot token.')
}

// On: Bot Ready
bot.on('ready', () => {
  console.log('INFO > Bot activated')
})

bot.on('messageCreate', (msg) => {
  if (msg.content.startsWith('ping')) {
    msg.channel.createMessage('Pong!')
  }
})
