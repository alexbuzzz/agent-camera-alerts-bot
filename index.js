require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const fs = require('fs')
const path = require('path')
const { Telegraf } = require('telegraf')

const app = express()
const port = process.env.HTTP_PORT
const token = process.env.AGENT_TOKEN

const bot = new Telegraf(process.env.TELEGRAM_API_KEY)
const chatId = process.env.TELEGRAM_ID

app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }))

// Middleware to check for Authorization header
app.use((req, res, next) => {
  const authorizationHeader = req.get('Authorization')

  // Check if the Authorization header is present and has a valid value
  if (!authorizationHeader || authorizationHeader !== token) {
    return res.status(401).send('Unauthorized')
  }

  next() // Move to the next middleware or route handler
})

app.post('/camera-message', (req, res) => {
  try {
    const imageBuffer = Buffer.from(req.body.imageData, 'base64')

    // Send the image to Telegram
    bot.telegram.sendPhoto(chatId, { source: imageBuffer })

    res.status(200).send('Image sent to Telegram successfully')
  } catch (error) {
    console.error('Error sending image to Telegram:', error.message)
    res.status(500).send('Internal Server Error')
  }
})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})

bot.launch()
