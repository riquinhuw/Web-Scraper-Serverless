# Web Scraper Serverless
_Readme em desenvolvimento_

Aplicação Web Scraper para salvar os 3 itens mais vendidos da Amazon, disponibilizando via API utilizando um backend serverless.

***********

## Tecnologias
* AWS Lambda
* AWS APIGateway
* AWS DynamoDB
* Puppeteer

## Como instalar
_em desenvolvimento_

## Como usar
_em desenvolvimento_

## Sobre o desenvolimento
Inicialmente foquei em criar o MVP, para que eu tenha uma entrega de uma aplicação funcional.

Identifiquei um problema que pode acontecer que são os captcha, depois de acessar a página uma determinada quantidade de vezes eles começam a aparecer, com isso a função principal deve rodar pelo menos em hora e hora.

Tive problemas para conseguir subir a aplicação na AWS, nesse momento aprendi como usar o serverless framework, realmente ele poupa tempo para fazer o deploy.
Um dos maiores problemas foi o uso do Puppeteer, a lib completa é muito grande para subir na AWS, consegui resolver usando chrome-aws-lambda com o puppeteer-core.

Percebi que preciso usar o Express parar fazer o retorno das requisições, acreditava que daria para só usar o Lambda e o Api-gateway para isso, agora vou reescrever o código para adaptar ao express.

## Etapas de desenvolvimento
* [X] Extrair nome e valor dos 3 primeiros produtos mais vendidos
* [X] Salvar as informações no  AWS DynamoDB
* [X] Subir a aplicação na AWS
* [ ] MVP
* [ ] Limpar o código do MVP
* [ ] Criar Endpoint de Consulta
* [ ] Utilizar o EventBridge ou CloudWatch para agendamento diário
* [ ] Escrever o Como Instalar e Como Usar do readme
* [ ] Adicionar o uso de token no endpoint
* [ ] Melhorar o serverless.yml para a automatização correta.