const puppeteer = require('puppeteer');
const $ = require('cheerio');
const CronJob = require('cron').CronJob;
const nodemailer = require("nodemailer");

const url = `https://www.amazon.in/JBL-Tuner-Wireless-Bluetooth-Speaker/dp/B07KRQTTF3`;

const loadBrowser = async () => {

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, {
    waitUntil: 'load',
    timeout: 0
  });
  return page;
}

const trackPrice = async (page) => {

  let html = await page.evaluate(() => document.body.innerHTML);

  $('#priceblock_ourprice', html).each(function () { //priceblock_ourprice is the span ID from the page url.

    let price = $(this).text();
    let formattedPrice = price.replace(/[^0-9.-]+/g, "");

    if (formattedPrice < 5000) {
      sendEmailNotification();
    } else {
      console.log('Sorry!! Price is still high...');
    }
  });
};

const sendEmailNotification = async() => {

  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'xxxxxxxx@gmail.com', // on less secure apps here https://myaccount.google.com/lesssecureapps?pli=1
      pass: 'xxxxxx'
    }
  });

  const mailOptions = {
    from: 'xxxxxxxx@gmail.com',
    to: 'zzzzzzzzz@gmail.com',
    subject: 'Amazon Price Alert',
    html: `<h1>Price is down, Buy <a href=${url}>here</a> .</h1>`
  };

  try{
    
    await transporter.sendMail(mailOptions);
  } catch(err) {
    console.log(err.message);
  }
};

const runCron = async () => {

  const page = await loadBrowser();
  let job = new CronJob('*/1 * * * *', function () { //runs every 1 minutes

    trackPrice(page);
  }, null, true, null, null, true);

  job.start();
};

runCron();
