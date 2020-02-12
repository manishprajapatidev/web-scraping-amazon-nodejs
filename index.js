const puppeteer = require('puppeteer');
const $ = require('cheerio');
const CronJob = require('cron').CronJob;

const url = `https://www.amazon.in/JBL-Tuner-Wireless-Bluetooth-Speaker/dp/B07KRQTTF3`;

const loadBrowser = async() => {
  
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  return page; 
}

const trackPrice = async (page) => {
  
  let html = await page.evaluate(() => document.body.innerHTML);

  $('#priceblock_ourprice', html).each(function () { //priceblock_ourprice is the span ID from the page url.
    
      let price = $(this).text();
      let formattedPrice = price.replace(/[^0-9.-]+/g,"");
      
      if(formattedPrice < 4000) {
        //sendEmailNotification();
      } else {
        console.log('Sorry!! Price is still high...');
      }
  });
}

const runCron = async() => {

  const page = await loadBrowser();
  let job = new CronJob('*/1 * * * *', function() { //runs every 1 minutes
    
    trackPrice(page);
  }, null, true, null, null, true);
  
  job.start();
}

runCron();