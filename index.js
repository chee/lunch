require('dotenv').config()

const EVENT_MESSAGE = 'message'
const TYPE_MESSAGE = 'message'

const MSG_CLEAR = /clear\s+orders/
const MSG_ORDER = /(?:no,?\s+)?order\s+me\s+(.*)/
const MSG_LIST = /show\s+(?:all\s+)?orders/

const replyClear = () => 'all gone ✨'
const replyOrder = order => `👍 got it (${order})`
const replyList = orders => Object.entries(orders).map(([user, order], index) => `${index + 1}. ${order} (by ${user})`).join('\n')

let orders = {}

const clear = () => { orders = {} }
const add = (user, order) => { orders[user] = order }

const SlackBot = require('slackbots')

const bot = new SlackBot({
  token: process.env.token,
  name: 'lunchbot'
})

bot.on(EVENT_MESSAGE, data => {
  if (data.type !== TYPE_MESSAGE) return
  let match
  if (match = data.text.match(MSG_CLEAR)) {
    clear()
    bot.postMessage(data.channel, replyClear())
  } else if (match = data.text.match(MSG_ORDER)) {
    const order = match[1]
    bot.getUsers().then(({members}) => {
      const member = members.find(member => member.id === data.user)
      add(member.real_name || member.name, order)
      bot.postMessage(data.channel, replyOrder(order))
    })
  } else if (match = data.text.match(MSG_LIST)) {
    bot.postMessage(data.channel, replyList(orders))
  }
})
