console.log('Iniciando função');

const AWS = require('aws-sdk');
const puppeteer = require('puppeteer-core');
const chromium = require('chrome-aws-lambda');
const dynamo = new AWS.DynamoDB.DocumentClient();
const express = require("express");
const serverless = require("serverless-http");

const app = express();
app.use(express.json());
/*
(async()=>{
  produtosBestsellers = await buscarBestsellers();
  console.log(produtosBestsellers);
})();
*/

//TODO: usar then,catch
async function buscarBestsellers() {
    const baseUrl ='https://www.amazon.com.br';
    const browser = await chromium.puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
        ignoreHTTPSErrors: true,
      });
    const page = await browser.newPage();
    await page.setViewport({
      width: 1920,
      height: 1080
  })
    await page.goto(baseUrl);
    //await page.screenshot({path: 'pessoal/example.png'}); 
    await page.goto('https://www.amazon.com.br/bestsellers');
    console.log(page.url());
    //await page.screenshot({path: 'pessoal/example1.png'});  

    //TODO: Melhorar a busca para trazer cada <li> como um obj
    /**
     * Buscando os nomes dos itens da primeira fileira, a busca está sendo feita "na mão"
     * Dessa forma só estou trazendo 3 primeiros itens de uma categoria só.
     */
    const nomes = await page.$$eval('#anonCarousel1 > ol > li> div > div > a > span > div ', titles =>
    titles.map(titles => titles.textContent));  
    const valores = await page.$$eval('#anonCarousel1 > ol > li > div > div > div > a > span > span ', titles =>
    titles.map(titles => titles.textContent));
    const links = await page.$$eval('#anonCarousel1 > ol > li > div > div > a:nth-child(2)', titles =>
    titles.map(titles => titles.getAttribute('href')));
    const codigo = await page.$$eval('#anonCarousel1 > ol > li> div > div > a', titles =>
    titles.map(titles => titles.outerHTML)
    );  

    await browser.close();
    console.log(nomes,valores,links,codigo);
    console.log(`Url base: ${baseUrl}`)
    return nomes.reduce((acumulador,valorAtual,index)=>{
      return acumulador =[...acumulador,{nome:valorAtual,valor:valores[index],link:baseUrl+links[index]}]
    },[]);
  };

app.get("/atualizarlista", async (req, res) => {
    //console.log('Received event:', JSON.stringify(event, null, 2));
    const baseUrl ='https://www.amazon.com.br';
    let produtosBestsellers = [];
    const browser = await puppeteer.launch({
      executablePath: await chromium.executablePath,
      args: chromium.args
      });
      /*
    const browser = await chromium.puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
        ignoreHTTPSErrors: true,
      });*/
    const page = await browser.newPage();
    await page.setViewport({
      width: 1920,
      height: 1080
    })
    await page.goto(baseUrl);
    //await page.screenshot({path: 'pessoal/example.png'}); 
    await page.goto('https://www.amazon.com.br/bestsellers');
    console.log(page.url());
    //await page.screenshot({path: 'pessoal/example1.png'});  

    //TODO: Melhorar a busca para trazer cada <li> como um obj
    /**
     * Buscando os nomes dos itens da primeira fileira, a busca está sendo feita "na mão"
     * Dessa forma só estou trazendo 3 primeiros itens de uma categoria só.
     */
    const nomes = await page.$$eval('#anonCarousel1 > ol > li> div > div > a > span > div ', titles =>
    titles.map(titles => titles.textContent));//Funciona quando chamo o lambda em si
    const valores = await page.$$eval('#anonCarousel1 > ol > li > div > div > div > a > span > span ', titles =>
    titles.map(titles => titles.textContent));
    const links = await page.$$eval('#anonCarousel1 > ol > li > div > div > a:nth-child(2)', titles =>
    titles.map(titles => titles.getAttribute('href')));
    const imgTexto = await page.$$eval('#anonCarousel1 > ol > li> div > div > a > div> img', titles =>
    titles.map(titles => titles.getAttribute('alt')));  

    await browser.close();
    console.log(nomes,valores,imgTexto,links);
    console.log(`Url base: ${baseUrl}`)
    produtosBestsellers = imgTexto.reduce((acumulador,valorAtual,index)=>{
      return acumulador =[...acumulador,{nome:valorAtual,valor:valores[index],link:baseUrl+links[index]}]
    },[]);
    //
    let response;
    let statusCode = '200';
    const headers = {
        'Content-Type': 'application/json',
    };
    
    try {
        let {Items:registros} = await dynamo.scan({ TableName: 'bestsellers-amazon' }).promise();
        console.log(`Registros:${JSON.stringify(registros)}`)
        
        //Limpar os Registros
        if(registros.length>0){
          for (var x = 0; x < registros.length; x++) {
              console.log(`Apagando o registro:${JSON.stringify({TableName: 'bestsellers-amazon',Key:{id:registros[x].id}})}`);
              response = await  dynamo.delete({TableName: 'bestsellers-amazon',Key:{id:registros[x].id}}).promise();
              console.log(`Resposta de Apagando registros:${JSON.stringify(response)}`);
          }
        }
        console.log(`Tudo que vou salvar:${produtosBestsellers}`);
        //Adicionar os novos registros
        for (var i = 0; i < produtosBestsellers.length; i++) {
            console.log(`O que quero inserir:${JSON.stringify({TableName:'bestsellers-amazon',Item:{...produtosBestsellers[i],id:i}})}`);
            response = await dynamo.put({TableName:'bestsellers-amazon',Item:{...produtosBestsellers[i],id:i}}).promise();
            console.log(`Resposta de inserindo registros:${response}`);
        }
        
    } catch (err) {
        statusCode = '400';
        response = err.message;
    } finally {
        response = JSON.stringify(response);
    }


    return res.status(statusCode).json({mensagem:'Processo Finalizado'}); 

});

module.exports.handler = serverless(app); 