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

            response = await dynamo.scan({TableName:'users-table-dev'
                                      }).promise();
            //response = await dynamo.put({TableName:'users-table-dev',Item:{...produtosBestsellers[i],userId:`a${i}`}}).promise();
            console.log(`Resposta de inserindo registros:${JSON.stringify(response.Items)}`);
        
        
    } catch (err) {
        statusCode = '400';
        response = err.message;
    } finally {
        let retorno =[];
        for (let i = 0; i < response.Items.length; i++) {
          if (response.Items[i].userId=='a0'|| response.Items[i].userId=='a1'||response.Items[i].userId=='a2'){
            delete response.Items[i].userId;
            retorno.push(response.Items[i]);
          } 
        }
        response=retorno;
    }
    return res.status(statusCode).json(response);
});

module.exports.handler = serverless(app); 