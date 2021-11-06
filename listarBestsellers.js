console.log('Iniciando função');

const AWS = require('aws-sdk');
const puppeteer = require('puppeteer-core');
const chromium = require('chrome-aws-lambda');
const dynamo = new AWS.DynamoDB.DocumentClient();
const express = require("express");
const serverless = require("serverless-http");

const app = express();
app.use(express.json());


exports.handler = app.get('/', async (req, res) => {
    //
    let response;
    let retorno =[];
    let statusCode = '200';
    const headers = {
        'Content-Type': 'application/json',
    };
    
    try {
        response = await dynamo.scan({TableName:'bestsellers-amazon'}).promise();
        if(response.Items.length<1)
        return res.status(200).json({info:'O banco está vazio'})
    for (let i = 0; i < response.Items.length; i++) {//TODO: Ver a possibildiade de usar um filter
      if (response.Items[i].id==0|| response.Items[i].id==1||response.Items[i].id==2){
        delete response.Items[i].id;
        retorno.push(response.Items[i]);
      } 
    }    
    } catch (err) {
        statusCode=400;
        retorno = err.message;
    }
    return res.status(statusCode).json(retorno);
});

module.exports.handler = serverless(app); 