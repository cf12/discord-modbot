// Dependencies
const DiscordJS = require('discord.js')
const fs = require('fs')
const path = require('path')

// Load Config Files
try {
  var config = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'config', 'config.json'), 'utf8'))
} catch (err) {
  if (err) throw Error('Configuration files appear to be missing / corrupt. Please double check the configs.')
}

// Variables
let pf = config.prefix

// Constructions
let bot = new DiscordJS.Client()

// Functions

// Event: On Ready
bot.on('ready', () => {
  console.log('[' + new Date().toLocaleTimeString() + ']' + ' | INFO >> Bot is ready!')
})

// Logs the bot in
bot.login(config.bot_token)
