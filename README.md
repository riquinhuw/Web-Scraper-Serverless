# Web Scraper Serverless

_Aplicação Web Scraper para salvar os 3 itens mais vendidos da Amazon, disponibilizando via API utilizando um backend serverless._

***********
## Sobre o projeto
Temos dois Lambadas, um para atualizar os produtos mais vendidos da Amazon no DynamoDB utilizando o Puppeteer para fazer o scraping, outro para consultar o DynamoDB e retornar os 3 produtos mais vendidos.

## Tecnologias
* AWS Lambda
* AWS APIGateway
* AWS DynamoDB
* AWS EventBridge
* Puppeteer

## Como instalar
Clonar o projeto:
```bash
git clone https://github.com/riquinhuw/Web-Scraper-Serverless.git
```
Baixar as dependências:
```bash
npm install
```
Realizar o deploy via serverless (condierando que você já tenha configurado a sua conexão com a AWS)
```bash
serverless deploy
```
## Funcionamento
Ao realizar o deploy será criado dois endpoints ```GET``` um raiz ```/``` para consultar os 3 produtos mais vendidos, e o ```/autalizarlista``` para forçar a atualização dos produtos mais vendidos, o EventBridge está configurado para rodar uma vez por dia.

### ListarBestsellers ```/```
O [listarBestsellers.js](https://github.com/riquinhuw/Web-Scraper-Serverless/blob/main/listarBestsellers.js) irá consultar a tabela ```bestsellers-amazon```, caso aconteça um problema na requisição será retronado status **400** com a mensagem de erro.
Se a tabela estiver vazia irá retornar status **200** com o seguinte JSON:
```JSON
{"info":"O banco está vazio"}
```
Se tudo estiver correto será retornado status **200** com um vetor de 3 objetos contendo os produtos:
```JSON
[
    {
        "valor": "R$ 251,16",
        "link": "https://www.amazon.com.br/Escrit%C3%B3rio-Diretor-Estilo-Industrial-Kuadra/dp/B089Y3S71L/ref=zg-bs_furniture_3/132-5898074-6520438?pd_rd_w=awWb8&pf_rd_p=c0c0f25f-aaf5-43d0-b46e-c8c2c04a86c2&pf_rd_r=QJM8F9EF0R4DS62V2NDE&pd_rd_r=01aaa5c4-ecbd-494e-ade1-8662effd853a&pd_rd_wg=M9sO8&pd_rd_i=B089Y3S71L&psc=1",
        "nome": "Escrivaninha Trevalla Kuadra Me150-E10 Industrial 150cm Preto Onix"
    }
]
```

### AtualizarBestsellers ```/atualizarlista```
O [atualizarBestsellers.js](linkSeráGerado) irá usar o puppeteer com o ```chrome-aws-lambda```, a resolução foi configurada em full hd para conseguir pegar os produtos da página, já que a renderização da página é responsiva.

Inicialmente será necessário acessar a página principal da Amazon, para conseguir "autorização" de acessar a parte de bestsellers.

Com a página carregada será feito o scraping, depois será apagado todos os registros para que sejam adicionados os novos.

Ao final será retornado status code **200** para sucesso ou **400** com o erro caso que dê algum problema, se for **200** será envaido o JSON:
```JSON
{"mensagem":"Processo Finalizado"}
```

*****

## Sobre o desenvolimento
Inicialmente foquei em criar o MVP, para que eu tenha uma entrega de uma aplicação funcional.

Identifiquei um problema que pode acontecer que são os captcha, depois de acessar a página uma determinada quantidade de vezes eles começam a aparecer, com isso a função principal deve rodar pelo menos em hora e hora.

Tive problemas para conseguir subir a aplicação na AWS, nesse momento aprendi como usar o serverless framework, realmente ele poupa tempo para fazer o deploy.
Um dos maiores problemas foi o uso do Puppeteer, a lib completa é muito grande para subir na AWS, consegui resolver usando chrome-aws-lambda com o puppeteer-core.

Percebi que preciso usar o Express parar fazer o retorno das requisições, acreditava que daria para só usar o Lambda e o Api-gateway para isso, agora vou reescrever o código para adaptar ao express.

Com o serverless.yml devidamente configurado, estarei limpando o código já para a sua versão final, acredito que ainda tem muita coisa que possa melhorar, mas ele está funcional.

## Etapas de desenvolvimento
* [X] Extrair nome e valor dos 3 primeiros produtos mais vendidos
* [X] Salvar as informações no  AWS DynamoDB
* [X] Subir a aplicação na AWS
* [X] MVP
* [ ] Limpar o código do MVP
* [X] Criar Endpoint de Consulta
* [X] Utilizar o EventBridge ou CloudWatch para agendamento diário
* [X] Escrever o Como Instalar e Como Usar do readme
* [ ] Adicionar o uso de token no endpoint
* [X] Melhorar o serverless.yml para a automatização correta.
* [ ] Refatorar atualizarBestsellers.js

## Considerações finais
O uso do banco de dados está em hardcode, é possível configurar para usar variável de ambiente para customização, o mesmo se aplica para os nomes dos Lambdas e dos demais recursos da AWS.

A forma que o scraping foi construído não irá funcionar se a página de Bestseller da Amazon mudar, estou utilizando a busca via tag html, é possível realizar a busca usando classes ou outros métodos mais específicos.

Durante o scraping inicialmente é acessado a página principal da Amazon, para que seja carregado alguma informação especifica antes de acessar a página de Bestsellers. Caso que página principal não seja acessada antes irá dar o erro de "Página não encontrada" quando for acessar os Bestsellers.

É possivel apagar todos os registros de uma vez só, mas estou apagando um registro de cada vez. Outra solução é realizar um update caso que já tenha registro.