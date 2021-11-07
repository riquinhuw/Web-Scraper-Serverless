console.log('Iniciando função');

const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
const express = require("express");
const serverless = require("serverless-http");

const app = express();
app.use(express.json());


exports.handler = app.get('/historico', async (req, res) => {
    //
    let response;
    let statusCode = '200';

    try {
        response = {Items}.Items = await dynamo.scan({ TableName: 'bestsellers-amazon-historico' }).promise();
        if (response.Items.length < 1)
            return res.status(200).json({ info: 'O banco está vazio' })
    } catch (err) {
        statusCode = 400;
        response = err.message;
    }finally{
        return res.status(statusCode).json(response);
    }
});

module.exports.handler = serverless(app);