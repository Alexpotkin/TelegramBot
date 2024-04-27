const { Telegraf } = require('telegraf')
const axios = require('axios')
const config = require('./config.json')
const bot = new Telegraf(config.token)
const chatId = config.BOT_chat

// Словарь для хранения состояний пользователей
let userData = {}

bot.command('menu', ctx => {
	if (ctx.message.chat.id.toString() === chatId) {
		ctx.reply('Добро пожаловать!', {
			reply_markup: {
				inline_keyboard: [
					[
						{ text: '🆕 Новый', callback_data: 'new' },
						{ text: '📝 Записать', callback_data: 'record' },
					],
					[
						{ text: 'ℹ️ Информация', callback_data: 'info' },
						{ text: '🔍 Поиск', callback_data: 'search' },
					],
					[
						{ text: '❓ Справка', callback_data: 'help' },
						{ text: '⚙️ Настройки', callback_data: 'settings' },
					],
				],
			},
		})
	} else {
		ctx.reply('Этот бот работает только в определенном чате.')
	}
})

bot.action('new', ctx => {
	ctx.answerCbQuery()
	if (ctx.callbackQuery.message.chat.id.toString() === chatId) {
		userData[ctx.from.id] = { name: '', group: '' } // Инициализация состояния
		ctx.reply('Введите имя:')
		bot.on('text', ctx => {
			if (!userData[ctx.from.id].name) {
				userData[ctx.from.id].name = ctx.message.text
				ctx.reply('Введите группу:')
			} else if (!userData[ctx.from.id].group) {
				userData[ctx.from.id].group = ctx.message.text

				const requestBody = {
					name: userData[ctx.from.id].name,
					group: userData[ctx.from.id].group,
				}

				// URL для запроса
				const addClientURL = `${config.serverURL}/registration`

				// POST запрос
				axios
					.post(addClientURL, requestBody)
					.then(response => {
						ctx.reply(`Код: ${response.data.message}`)
					})
					.catch(error => {
						console.log(error)
						ctx.reply('Ошибка при отправке данных')
					})

				delete userData[ctx.from.id] // Очистка состояния
			}
		})
	} else {
		ctx.reply('Этот бот работает только в определенном чате.')
	}
})

// Обработка команд информации и помощи
bot.action('info', ctx => {
	ctx.answerCbQuery()
	ctx.reply('Информация о боте...')
})

bot.action('help', ctx => {
	ctx.answerCbQuery()
	ctx.reply('Справочная информация...')
})

bot.launch()
