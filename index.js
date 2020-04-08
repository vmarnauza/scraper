const puppeteer = require('puppeteer');

(async function main () {
  try {
    const browser = await puppeteer.launch({
      // headless: false,
      ignoreHTTPSErrors: true,
    })
    const page = await browser.newPage()
    await page.goto('https://www.ss.lv/lv/transport/cars/volvo/filter/',
      { waitUntil: 'networkidle2' })
    await page.evaluate(async () => {
      let filterData = new FormData()
      let items = {
        'topt[8][min]': 5000,
        'topt[8][max]': 6500,
        'topt[18][min]': '',
        'topt[18][max]': '',
        'topt[15][min]': '',
        'topt[15][max]': '',
        'opt[34]': '',
        'opt[35]': '',
        'opt[32]': '',
        'opt[17]': '',
        'sid': '/lv/transport/cars/volvo/',
      }
      for (let key in items) {
        filterData.append(key, items[key])
      }
      return Promise.resolve(fetch(
        'https://www.ss.lv/lv/transport/cars/volvo/filter/',
        {
          method: 'POST',
          body: filterData,
        }).
        then(response => response.text()).
        then(text => document.body.innerHTML = text)).catch((error) => {
        console.error('Error:', error)
      })
    })

    browser.close()
  } catch (err) {
    console.error(err)
  }
})()