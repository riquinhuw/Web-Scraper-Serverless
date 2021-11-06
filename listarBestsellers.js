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
    let statusCode = '200';
    const headers = {
        'Content-Type': 'application/json',
    };
    
    try {
        //Adicionar os novos registros
            response = await dynamo.scan({TableName:'bestsellers-amazon'}).promise();
            //response = await dynamo.put({TableName:'users-table-dev',Item:{...produtosBestsellers[i],id:`a${i}`}}).promise();
            console.log(`Resposta de inserindo registros:${JSON.stringify(response.Items)}`);        
    } catch (err) {
        statusCode = '400';
        response = err.message;
    } finally {
        if(response.Items.length<1)
            return res.status(200).json({info:'O banco está vazio'})
        let retorno =[];
        for (let i = 0; i < response.Items.length; i++) {
          if (response.Items[i].id==0|| response.Items[i].id==1||response.Items[i].id==2){
            delete response.Items[i].id;
            retorno.push(response.Items[i]);
          } 
        }
        response=retorno;
    }
    return res.status(statusCode).json(response);
});

module.exports.handler = serverless(app); 