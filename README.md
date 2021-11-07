# Web Scraper Serverless

_Aplicação Web Scraper para salvar os 3 itens mais vendidos da Amazon, disponibilizando via API utilizando um backend serverless._

***********
## Sobre o projeto
#### A aplicação funciona com 5 Lambadas:
- **AtualizarBestsellers**: Responsável por realizar o scraping na Amazon e salvar no DynamoDB.
- **ListarBestsellers**: Responsável por listar os 3 produtos mais vendidos do dia.
- **ListarBestsellersHistorico**: Responsável por realizar o scraping e salvar no DynamoDB Histórico.
- **AtualizarBestsellersHistorico**: Responsável por listar todos os produtos do histórico.
- **EnviarMensagemTelegram**: Responsável por enviar a notificação para o canal no Telegram.

#### Possuindo 3 endpoints:
- **GET /**: Informando os 3 produtos mais vendidos do dia.
- **GET /atualizarlista**: Para atualizar os 3 produtos mais vendidos do dia.
- **GET /historico**: Informando histórico com todos os produtos que foram mais vendidos.

#### Com 2 DynamoDB:
- **Bestsellers-Amazon**: Responsável em guardar apenas os produtos mais vendidos do dia.
- **Bestsellers-Amazon-Historico**: Responsável em manter todos os produtos que foram classificados como mais vendidos.

#### Utilizando 2 EventBridge:
- **Atualizar**: Rodando uma vez ao dia para atualizar a lista dos produtos do dia, acessando diretamente o Lambda *AtualizarBestsellers*.
- **AttBestHist**: Rodando uma vez ao dia para atualizar os produtos do histórico e enviar uma mensagem para o canal do Telegram, utilizando o Step Function *AtualizacaoBestsellersHistoricoComTelegram*.

#### E um Step Function:
- **AtualizacaoBestsellersHistoricoComTelegram**: Utilizando a lambda *AtualizarBestsellersHistorico* e jogando o resultado para a lambda  *EnviarMensagemTelegram*.

## Tecnologias
* AWS Lambda
* AWS APIGateway
* AWS DynamoDB
* AWS EventBridge
* AWS Step Functions
* Puppeteer
* Serverless

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
Ao realizar o deploy será criado três endpoints ```GET``` um raiz ```/``` para consultar os 3 produtos mais vendidos, o ```/autalizarlista``` para forçar a atualização dos produtos mais vendidos, e o ```/historico``` para consultar os mais vendidos dos outros dias.

Temos o EventBridge configurado para atualizar 2 tabelas uma sendo a *bestsellers-amazon* onde só é guardado os produtos do dia e que pode ser atualizado usando o endpoint ```/atualizarlista```, a outra *bestsellers-amazon-historico* onde apenas o EventBridge atualiza.

A atualização do *bestsellers-amazon-historico* é feito usando o Step Functions para atualizar e informar no canal do telegram que a atualização foi feita.

### ListarBestsellers ```/```
O [listarBestsellers.js](https://github.com/riquinhuw/Web-Scraper-Serverless/blob/main/listarBestsellers.js) irá consultar a tabela ```bestsellers-amazon```, caso aconteça um problema na requisição será retornado status **400** com a mensagem de erro.
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
O [atualizarBestsellers.js](https://github.com/riquinhuw/Web-Scraper-Serverless/blob/main/atualizarBestsellers.js) irá usar o puppeteer com o ```chrome-aws-lambda```, a resolução foi configurada em full hd para conseguir pegar os produtos da página, já que a renderização da página é responsiva.

Inicialmente será necessário acessar a página principal da Amazon, para conseguir "autorização" de acessar a parte de bestsellers.

Com a página carregada será feito o scraping, depois será apagado todos os registros para que sejam adicionados os novos.

Ao final será retornado status code **200** para sucesso ou **400** com o erro caso que dê algum problema, se for **200** será envaido o JSON:
```JSON
{"mensagem":"Processo Finalizado"}
```

### ListarBestsellersHistorico ```/historico```
O [listarBestsellersHistorico.js](https://github.com/riquinhuw/Web-Scraper-Serverless/blob/main/listarBestsellersHistorico.js) irá consultar a tabela ```bestsellers-amazon-historico```, caso aconteça um problema na requisição será retornado status **400** com a mensagem de erro.
Se a tabela estiver vazia irá retornar status **200** com o seguinte JSON:
```JSON
{"info":"O banco está vazio"}
```
Se tudo estiver correto será retornado status **200** com um vetor de 3 objetos contendo os produtos:
```JSON
[
    {
        "uuid": "15beb04d-1d89-4e6f-9e4f-f2ae733cb8f1",
        "datahora": "Sun Nov 07 2021 02:18:55 GMT+0000 (Coordinated Universal Time)",
        "valor": "R$ 53,01",
        "link": "https://www.amazon.com.br/Souza-3704-Suporte-Ergon%C3%B4mico-Multicolor/dp/B077P59SWX/ref=zg-bs_furniture_6/140-8166625-8816639?pd_rd_w=kpZls&pf_rd_p=c0c0f25f-aaf5-43d0-b46e-c8c2c04a86c2&pf_rd_r=CW47A358E3DQM1QKVJ8B&pd_rd_r=638b79c4-8ce1-4f03-8e71-b010f07584fc&pd_rd_wg=MqJ31&pd_rd_i=B077P59SWX&psc=1",
        "nome": "Apoio Ergonômico para Os Pés, MDF Natural (Cor: Black Piano) - Souza & Cia"
    }
]
```

### AtualizarBestsellersHistorico
O [atualizarBestsellersHistorico.js](https://github.com/riquinhuw/Web-Scraper-Serverless/blob/main/atualizarBestsellersHistorico.js) irá usar o puppeteer com o ```chrome-aws-lambda```, a resolução foi configurada em full hd para conseguir pegar os produtos da página, já que a renderização da página é responsiva.

Inicialmente será necessário acessar a página principal da Amazon, para conseguir "autorização" de acessar a parte de bestsellers.

Com a página carregada será feito o scraping, depois será apagado todos os registros para que sejam adicionados os novos.

Ao final será retornado status code **200** para sucesso ou **400** com o erro caso que dê algum problema, se for **200** será envaido o JSON:
```JSON
    {
        "mensagem":"Processo de salvar os bestsellers no histórico foi finalizado",
        "statusCode":200
    }
```

### enviarMensagemTelegram
O [enviarMensagemTelegram.js](https://github.com/riquinhuw/Web-Scraper-Serverless/blob/main/enviarMensagemTelegram.js) é responsável em receber uma mensagem e enviar para um canal no Telegram, utilizando a API do Telegram.

Ao final será retornado status code **200** caso tenha sucesso ou **400** se acontecer um problema.
```JSON
{
    "statusCode":200,
    "response:":"Mensagem Enviada com sucesso"
}
```

### Step Function
O Setp Function foi utilizado para enviar uma notificação via Telegram informando que foi atualizado o banco de histórico, com o EventBridge para que essa operação seja feita uma vez por dia.

![Step Function](https://user-images.githubusercontent.com/24635144/140645132-0f0c2ca8-68ec-45b2-970c-3ca06c25b96b.png)


*****

## Sobre o desenvolvimento
Inicialmente foquei em criar o MVP, para que eu tenha uma entrega de uma aplicação funcional.

Identifiquei um problema que pode acontecer que são os captcha, depois de acessar a página uma determinada quantidade de vezes eles começam a aparecer, com isso a função principal deve rodar pelo menos em hora e hora.

Tive problemas para conseguir subir a aplicação na AWS, nesse momento aprendi como usar o serverless framework, realmente ele poupa tempo para fazer o deploy.
Um dos maiores problemas foi o uso do Puppeteer, a lib completa é muito grande para subir na AWS, consegui resolver usando chrome-aws-lambda com o puppeteer-core.

Percebi que preciso usar o Express parar fazer o retorno das requisições, acreditava que daria para só usar o Lambda e o Api-gateway para isso, agora vou reescrever o código para adaptar ao express.

Com o serverless.yml devidamente configurado, estarei limpando o código já para a sua versão final, acredito que ainda tem muita coisa que possa melhorar, mas ele está funcional.

Realizei a implementação da função para enviar mensagens via Telegram, afim de usar a ferramenta AWS Function.

## Etapas de desenvolvimento
* [X] Extrair nome e valor dos 3 primeiros produtos mais vendidos
* [X] Salvar as informações no  AWS DynamoDB
* [X] Subir a aplicação na AWS
* [X] MVP
* [X] Limpar o código do MVP
* [X] Criar Endpoint de Consulta
* [X] Utilizar o EventBridge ou CloudWatch para agendamento diário
* [X] Escrever o Como Instalar e Como Usar do readme
* [ ] Adicionar o uso de token no endpoint
* [X] Melhorar o serverless.yml para a automatização correta.
* [ ] Refatorar atualizarBestsellers.js
* [X] Utilizar o AWS Step Functions


## Considerações finais
O uso do banco de dados está em hardcode, é possível configurar para usar variável de ambiente para customização, o mesmo se aplica para os nomes dos Lambdas e dos demais recursos da AWS.

A forma que o scraping foi construído não irá funcionar se a página de Bestseller da Amazon mudar, estou utilizando a busca via tag html, é possível realizar a busca usando classes ou outros métodos mais específicos.

Durante o scraping inicialmente é acessado a página principal da Amazon, para que seja carregado alguma informação especifica antes de acessar a página de Bestsellers. Caso que página principal não seja acessada antes irá dar o erro de "Página não encontrada" quando for acessar os Bestsellers.

É possível apagar todos os registros de uma vez só, mas estou apagando um registro de cada vez. Outra solução é realizar um update caso que já tenha registro.