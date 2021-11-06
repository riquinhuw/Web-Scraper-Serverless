console.log('Iniciando função');

const AWS = require('aws-sdk');
const puppeteer = require('puppeteer-core');
const chromium = require('chrome-aws-lambda');
const dynamo = new AWS.DynamoDB.DocumentClient();
const express = require("express");
const serverless = require("serverless-http");

const app = express();
app.use(express.json());

app.get("/atualizarlista", async (req, res) => {
    const baseUrl ='https://www.amazon.com.br';
    let produtosBestsellers = [];
    const browser = await puppeteer.launch({
      executablePath: await chromium.executablePath,
      args: chromium.args
      });
    const page = await browser.newPage();
    await page.setViewport({
      width: 1920,
      height: 1080
    })

    await page.goto(baseUrl);
    await page.goto('https://www.amazon.com.br/bestsellers');

    //TODO: Melhorar a busca para trazer cada <li> como um obj
    /**
     * Buscando os nomes dos itens da primeira fileira, a busca está sendo feita "na mão"
     * Dessa forma só estou trazendo 3 primeiros itens de uma categoria só.
     * Ainda não descobri o motivo, mas a primeira busca do $$eval sempre retorna vazio, então faço duas vezes.
     */
    let nomes = await page.$$eval('#anonCarousel1 > ol > li> div > div > a > span > div ', nomeBusca =>
    nomeBusca.map(elemento => elemento.textContent));
    nomes = await page.$$eval('#anonCarousel1 > ol > li> div > div > a > span > div ', nomeBusca =>
    nomeBusca.map(elemento => elemento.textContent));
    const valores = await page.$$eval('#anonCarousel1 > ol > li > div > div > div > a > span > span ', valorBusca =>
    valorBusca.map(elemento => elemento.textContent));
    const links = await page.$$eval('#anonCarousel1 > ol > li > div > div > a:nth-child(2)', linkBsuca =>
    linkBsuca.map(elemento => elemento.getAttribute('href')));

    await browser.close();
    produtosBestsellers = nomes.reduce((acumulador,valorAtual,index)=>{
      return acumulador =[...acumulador,{nome:valorAtual,valor:valores[index],link:baseUrl+links[index]}]
    },[]);

    let response='Processo Finalizado';
    let statusCode = '200';
      
    try {
      //buscando os registros
      let {Items:registros} = await dynamo.scan({ TableName: 'bestsellers-amazon' }).promise();
      console.log(`Registros:${JSON.stringify(registros)}`)
        
        //Limpando os Registros
        if(registros.length>0){
          for (var x = 0; x < registros.length; x++) {
              console.log(`Apagando o registro:${JSON.stringify({TableName: 'bestsellers-amazon',Key:{id:registros[x].id}})}`);
              await  dynamo.delete({TableName: 'bestsellers-amazon',Key:{id:registros[x].id}}).promise();
          }
        }
        console.log(`Tudo que vou salvar:${produtosBestsellers}`);
        //Adicionar os novos registros
        for (var i = 0; i < produtosBestsellers.length; i++) {
            console.log(`O que quero inserir:${JSON.stringify({TableName:'bestsellers-amazon',Item:{...produtosBestsellers[i],id:i}})}`);
            await dynamo.put({TableName:'bestsellers-amazon',Item:{...produtosBestsellers[i],id:i}}).promise();
        }
        
    } catch (err) {
        statusCode = '400';
        response = err.message;
    } finally {
      return res.status(statusCode).json({mensagem:response}); 
    }

});

module.exports.handler = serverless(app); 