console.log('Iniciando função');

const AWS = require('aws-sdk');
const puppeteer = require('puppeteer-core');
const chromium = require('chrome-aws-lambda');
const { v4: uuidv4 } = require('uuid');
const dynamo = new AWS.DynamoDB.DocumentClient();
const express = require("express");
const serverless = require("serverless-http");


module.exports.handler = async () => {
  const baseUrl = 'https://www.amazon.com.br';
  let response = 'Processo de salvar os bestsellers no histórico foi finalizado';
  let statusCode = '200';
  let produtosBestsellers = [];
  const datahora = new Date().toString();
  console.log("Datahora:"+datahora)
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


  let nomes = await page.$$eval('#anonCarousel1 > ol > li> div > div > a > span > div ', nomeBusca =>
    nomeBusca.map(elemento => elemento.textContent));
  nomes = await page.$$eval('#anonCarousel1 > ol > li> div > div > a > span > div ', nomeBusca =>
    nomeBusca.map(elemento => elemento.textContent));
  const valores = await page.$$eval('#anonCarousel1 > ol > li > div > div > div > a > span > span ', valorBusca =>
    valorBusca.map(elemento => elemento.textContent));
  const links = await page.$$eval('#anonCarousel1 > ol > li > div > div > a:nth-child(2)', linkBsuca =>
    linkBsuca.map(elemento => elemento.getAttribute('href')));

  await browser.close();

  produtosBestsellers = nomes.reduce((acumulador, valorAtual, index) => {
    return acumulador = [...acumulador, {uuid:uuidv4(), nome: valorAtual, valor: valores[index], link: baseUrl + links[index],datahora:datahora }]
  }, []);  

  try {
    for (var i = 0; i < produtosBestsellers.length; i++) {
      console.log(`Inserindo:${JSON.stringify({ TableName: 'bestsellers-amazon-historico', Item: produtosBestsellers[i]})}`);
      await dynamo.put({ TableName: 'bestsellers-amazon-historico', Item: produtosBestsellers[i]}).promise();
    }

  } catch (err) {
    statusCode = '400';
    response = err.message;
  } finally {
    return { mensagem: response,statusCode:statusCode };
  }
};