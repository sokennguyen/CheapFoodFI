const { By, Builder } = require("selenium-webdriver");
const { Options } = require("selenium-webdriver/chrome");
const options = new Options();
const fs = require("fs");

(async function helloSelenium() {
  //init selenium
  let driver = await new Builder()
    .forBrowser("chrome")
    //.setChromeOptions(options.addArguments("--headless=new")) //headless mode if needed
    .build();

  //init card object array that will be transformed into json and saved
  let cardObjs = [];
  let arrLength = 0;

  //let categories = {};
  let cookieClicked = false;
  for (let j = 0; j <= 0; j++) {
    for (let i = 0; i <= 0; i++) {
      //access site and wait for cookie to pop up
      //go through each page with url because next button is not clickable
      await driver.get(
        "https://www.s-kaupat.fi/tuotteet/liha-ja-kasviproteiinit-1?sort=comparisonPrice%3Aasc",
      );
      //accept cookie on browser init
      if (i === 0 && !cookieClicked) {
        //await driver.wait(until.elementLocated(By.css(".cLOoRA")), 5000).click();

        await driver.sleep(2000); // wait for 10 seconds

        // S-market hides their stuff behind a shadow DOM, so everything is a bit more complicated
        // find the host element that contains the shadow DOM
        const host = await driver.findElement(By.id("usercentrics-root"));

        // get the shadow root of the host element
        const shadowRoot = await host.getShadowRoot();
        const button = await shadowRoot.findElement(By.className("buWPBS"));

        await button.click().then(() => {
          console.log("Cookie accpeted");
          cookieClicked = true;
        });
      }
      //find all cards
      let cards = await driver.findElements(By.css("article"));
      const promisses = cards.map(async (card, index) => {
        const content = await card.getAttribute("innerHTML");

        //print first card of each page
        if (index === 0) console.log(content);

        //split product name
        let name = "";
        if (content.indexOf("productName") >= 0) {
          name = content
            .split("productName")[1]
            .split("span")[1]
            .split(">")[1]
            .split("<")[0];
          console.log(name);
        } else {
          name = "N/A";
        }

        //split price
        if (content.indexOf("comparisonPrice") >= 0) {
          price = content.split('comparisonPrice">')[1].split("<")[0];
          console.log(price);
        } else {
          price = "N/A";
        }

        //split unit price
        let unitPrice = "";
        if (content.indexOf("unitPrice") >= 0) {
          unitPrice = content.split('unitPrice">')[1].split("<")[0];
          console.log(unitPrice);
        } else {
          unitPrice = "N/A";
        }

        //each page's index is added with the previous page's length
        cardObjs[arrLength] = {
          name: name,
          price: price,
          unitPrice: unitPrice,
        };

        arrLength++;
      });
      await Promise.all(promisses);

      console.log("page: " + i);
      //console.log("section: " + categoriesNames[j]);
    }
    //at this point data are not saved to hard memory, but still in working mem

    //turn cards into json string
    let products = {
      products: cardObjs,
    };
    const productsString = JSON.stringify(products);

    //write to file
    fs.writeFile(`./results/res.json`, productsString, (err) => {
      if (err) {
        console.error(err);
      } else {
        //file written successfully
        //reset for next category
        cardObjs = [];
        arrLength = 0;
      }
    });
  }
  await driver.quit();
})();
