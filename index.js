const puppeteer = require("puppeteer");

(async function main() {
    try {
        const browser = await puppeteer.launch({
            // headless: false,
        });

        const page = await browser.newPage();

        // set fake user agent data to make it work in headless mode
        // otherwise the page will think you're a bot
        await page.setUserAgent(
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
        );

        await page.goto("https://www.ss.lv/lv/transport/cars/volvo/filter/");

        // enter filter params for price
        await page.type("#f_o_8_min", "5000");
        await page.type("#f_o_8_max", "6500");

        // submit filter form
        const form = await page.$("#filter_frm");
        await form.evaluate((form) => form.submit());

        // wait for results
        await page.waitForNavigation();

        // read the text of all results on this page
        const resultNameEls = await page.$$(".msg2");
        const resultNames = await Promise.all(
            resultNameEls.map((el) => page.evaluate((el) => el.textContent, el))
        );

        // log top 5 results
        console.log(resultNames.splice(0, 5));

        browser.close();
    } catch (err) {
        console.error(err);
    }
})();
