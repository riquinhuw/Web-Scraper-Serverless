console.log('Iniciando função');

const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
const express = require("express");
const serverless = require("serverless-http");

const app = express();
app.use(express.json());


exports.handler = app.get('/', async (req, res) => {
    //
    let response;
    let retorno = [];
    let statusCode = '200';
    const idsDeRetorno = [0, 1, 2];
    const headers = {
        'Content-Type': 'application/json',
    };

    try {
        response = await dynamo.scan({ TableName: 'bestsellers-amazon' }).promise();
        if (response.Items.length < 1)
            return res.status(200).json({ info: 'O banco está vazio' })

        retorno = response.Items.filter((obj) => {
            if (idsDeRetorno.includes(obj.id))
                return delete obj.id;
        });
    } catch (err) {
        statusCode = 400;
        retorno = err.message;
    }
    return res.status(statusCode).json(retorno);
});

module.exports.handler = serverless(app);