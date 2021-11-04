console.log('Iniciando função');

const AWS = require('aws-sdk');
const puppeteer = require('puppeteer-core');
const chromium = require('chrome-aws-lambda');
const dynamo = new AWS.DynamoDB.DocumentClient();

let produtosBestsellers = [];

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

    await browser.close();
    console.log(nomes,valores,links);
    return nomes.reduce((acumulador,valorAtual,index)=>{
      return acumulador =[...acumulador,{nome:valorAtual,valor:valores[index],link:baseUrl+links[index]}]
    },[]);
  };

exports.handler = async (event, context,callback) => {
    //console.log('Received event:', JSON.stringify(event, null, 2));
    const baseUrl ='https://www.amazon.com.br';
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
    titles.map(titles => titles.textContent));  
    const valores = await page.$$eval('#anonCarousel1 > ol > li > div > div > div > a > span > span ', titles =>
    titles.map(titles => titles.textContent));
    const links = await page.$$eval('#anonCarousel1 > ol > li > div > div > a:nth-child(2)', titles =>
    titles.map(titles => titles.getAttribute('href')));

    await browser.close();
    console.log(nomes,valores,links);
    return nomes.reduce((acumulador,valorAtual,index)=>{
      return acumulador =[...acumulador,{nome:valorAtual,valor:valores[index],link:baseUrl+links[index]}]
    },[]);
    //
    let response;
    let statusCode = '200';
    const headers = {
        'Content-Type': 'application/json',
    };
    
    try {
        let registros = await dynamo.scan({ TableName: 'users-table-dev' }).promise();
        
        //Limpar os Registros
        for (var x = 0; x < registros.Items.length; x++) {
            response = await  dynamo.delete({TableName: 'users-table-dev',Key:registros.Items[x].userId}).promise()
        }
        
        //Adicionar os novos registros
        for (var i = 0; i < produtosBestsellers.length; i++) {
            response = await dynamo.put({TableName:'users-table-dev',Item:{...produtosBestsellers[i],userId:i}}).promise();
        }
        
    } catch (err) {
        statusCode = '400';
        response = err.message;
    } finally {
        response = JSON.stringify(response);
    }

    return {
        statusCode,
        response,
        headers,
    };
};
