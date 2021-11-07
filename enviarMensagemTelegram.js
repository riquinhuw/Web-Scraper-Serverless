const fetch = require("node-fetch")
const express = require("express");
const serverless = require("serverless-http");
require('dotenv').config();

const app = express();
app.use(express.json());
module.exports.handler = async (body) => {
	let statusCode = '200';
	const params = new URLSearchParams();
	params.append('chat_id',process.env.CHAT_ID);
	params.append('text',body.mensagem);
	console.log(`id:${process.env.CHAT_ID}`);
	console.log(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}`);

	let response = 'Mensagem Enviada com sucesso'
	try {
		await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`, {method: 'POST', body: params})
	} catch (error) {
		statusCode=400
		response=error.message;
	}

	return {statusCode:statusCode,response:response};
};


