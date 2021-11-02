const puppeteer = require('puppeteer');

//TODO: Transformar em uma função separada
//TODO: usar then,catch
(async () => {
    const browser = await puppeteer.launch();  
    const page = await browser.newPage();
    await page.setViewport({
      width: 1920,
      height: 1080
  })
    await page.goto('https://www.amazon.com.br/');
    await page.screenshot({path: 'pessoal/example.png'}); 
    await page.goto('https://www.amazon.com.br/bestsellers');
    await page.screenshot({path: 'pessoal/example1.png'});  

    //TODO: Melhorar a busca para trazer cada <li> como um obj
    /**
     * Buscando os nomes dos itens da primeira fileira, a busca está sendo feita "na mão"
     * Dessa forma só estou trazendo 3 primeiros itens de uma categoria só.
     */
    const nomes = await page.$$eval('#anonCarousel1 > ol > li> div > div > a > span > div ', titles =>
    titles.map(titles => titles.textContent)
    );  
    const valores = await page.$$eval('#anonCarousel1 > ol > li > div > div > div > a > span > span ', titles =>
    titles.map(titles => titles.textContent)
    );
    console.log(nomes);
    console.log(valores);
    await browser.close();
  })();