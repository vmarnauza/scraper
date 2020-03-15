const puppeteer = require('puppeteer')
const fs = require('fs')
const schedule = require('node-schedule')
const minPrice = '1000' //must be a string
const maxPrice = '5000' //must be a string
const minYear = '2010' //must be a string
const maxYear = '2020' //must be a string

//will run every 5 min
schedule.scheduleJob('*/5 * * * *', function () {
  try {
    (async () => {
      const browser = await puppeteer.launch(
        {
          ignoreHTTPSErrors: true,
          headless: false,
          args: ['--fast-start', '--disable-extensions', '--no-sandbox'],
        })
      const page = await browser.newPage()
      const client = await page.target().createCDPSession()
      await client.send('Network.clearBrowserCookies')
      await client.send('Network.clearBrowserCache')
      await page.goto('https://m.ss.lv/lv/transport/cars/',
        { waitUntil: 'networkidle2' })

      await page.waitForSelector('#hmimg')
      await page.click('#hmimg')
      await page.evaluate(
        () => { document.querySelectorAll('a.menu')[3].click() })
      const minPriceInput = await page.$('input[name="topt[8][min]"]')
      await minPriceInput.focus()
      await page.keyboard.type(minPrice)
      const maxPriceInput = await page.$('input[name="topt[8][max]"]')
      await maxPriceInput.focus()
      await page.keyboard.type(maxPrice)
      await page.select('select[name="topt[18][min]"]', minYear)
      await page.select('select[name="topt[18][max]"]', maxYear)
      await page.waitFor(2000)
      await page.click('input.b.s12.btn100')

      // let's collect some data!
      try {
        // check if we have results according to our search criteria by waiting to a specific selector
        await page.waitForSelector('#main_mdv', { timeout: 4000 })
        let cars = await page.evaluate(() => {
          let dataTable = document.querySelector('table#main_mtbl')
          let dataRows = dataTable.querySelectorAll(
            'tr')
          let results = []
          dataRows.forEach((item) => {
            // in mobile version some rows are used as dividers, therefore we have to check for null values
            if (item.querySelector('a') !== null) {
              results.push({
                url: `${item.querySelector('a')}`,
                price: `${item.querySelector('td.omsg').
                  innerText.
                  split('\n')[0]}`,
                year: `${item.querySelector('td.omsg').
                  innerText.
                  split('\n')[1]}`,
                engine: `${item.querySelector('td.omsg').
                  innerText.
                  split('\n')[2]}`,
                mileage: `${item.querySelector('td.omsg').
                  innerText.
                  split('\n')[3]}`,
              })
            }
          })
          return results
        })
        //writes all results from the first page in a file and saves it with a time and date
        let timeStamp = Date.now()
        let date = new Date(timeStamp)
        let fileName = `${date.getDate()}-${date.getMonth() +
        1}-${date.getFullYear()}-${date.getHours()}-${date.getMinutes() < 10
          ? '0'
          : ''}${date.getMinutes()}`
        fs.writeFileSync(`${fileName}.json`, JSON.stringify(cars, null, 4))
        console.log('\x1b[36m%s\x1b[0m',
          'Jūsu meklēšanas rezultāti ir saglabāti!')
      } catch (e) {
        if (e instanceof puppeteer.errors.TimeoutError) {
          await browser.close()
          console.log(e)
          console.log('\x1b[31m%s\x1b[0m',
            'Jūsu meklēšanas kritērijiem neatbilst neviens sludinājums!')
        }
      }
      await browser.close()
    })()

  } catch (err) {
    console.error(err)
  }
})