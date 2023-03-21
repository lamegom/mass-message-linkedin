require("chromedriver");
let swd = require("selenium-webdriver");
let { username, password } = require("./credentials.json");
const { Driver } = require("selenium-webdriver/chrome");
let browser = new swd.Builder();
let tab = browser.forBrowser("chrome").build();
let tabWillBeOpenedPromise = tab.get(
  "https://www.linkedin.com/login?fromSignIn=true&trk=guest_homepage-basic_nav-header-signin"
);

let company = "RH";
let maxPages = 15;
let maxRequests = 90;
let requestCount = 0;
let profilesUrls = [];
let myMessage = 'Ola,\n\nTenho interesse nas oportunidades JAVA.\n\nSegue meu curriculo atualizado: https://www.linkedin.com/in/lamegom/\n\n Minha pretensão salarial é de R$ 14.000,00 e início imediato.\r\n';

tabWillBeOpenedPromise
  .then(function () {
    let findTimeOut = tab.manage().setTimeouts({
      implicit: 10000,
    });
    return findTimeOut;
  })
  .then(async function () {
    await login();
    await tab.get(
      'https://www.linkedin.com/search/results/people/?facetNetwork=%5B"F"%5D&keywords=' +
      company +
      "&origin=FACETED_SEARCH"
    );
    await tab.sleep(100000);
    //search-results__total
    let resText = await (await tab.findElement(
      swd.By.xpath("/html/body/div[5]/div[3]/div[2]/div/div[1]/main/div/div/div[1]/h2")
    )).getText();
    let results = resText.split(" ")[0];
    results = results.replace(",", "");
    results = parseInt(results);
    maxPages = Math.ceil(results / 10);
    for (let i = 16 ;i <= maxPages; i++) {
      await tab.get(
        'https://www.linkedin.com/search/results/people/?facetNetwork=%5B"F"%5D&keywords=' +
        company +
        "&origin=FACETED_SEARCH&page=" +
        i
      );

      await tab.executeScript("window.scroll(0,1000)");

      await tab.sleep(1000);
      await tab;
      let people = await tab.findElements(
        swd.By.css("a[data-test-app-aware-link]")
      );

      let count = 0;

      //console.log(people.length);

      for (let index = 0; index < people.length; index++) {
        let element = people[index];
        let profileUrl = await (await element).getAttribute("href");
        if (count % 2 == 0) profilesUrls.push(profileUrl);
        count++;
      }
    }
    //console.log(profilesUrls);

    for (let index = 0; index < profilesUrls.length; index++) {
      await message(profilesUrls[index]);
      await tab.sleep(1000);
    }

    return undefined;
  })
  .catch(function (err) {
    console.log(err);
  });

async function login() {
  return new Promise(async function (resolve, reject) {
    let inputUserBoxPromise = tab.findElement(swd.By.css("#username"));
    let inputPassBoxPromise = tab.findElement(swd.By.css("#password"));
    let pArr = await Promise.all([inputUserBoxPromise, inputPassBoxPromise]);

    let inputUserBox = pArr[0];
    let inputPassBox = pArr[1];
    let inputUserBoxWillBeFilledP = inputUserBox.sendKeys(username);
    let inputPassBoxWillBeFilledP = inputPassBox.sendKeys(password);

    let willBeFilledArr = await Promise.all([
      inputUserBoxWillBeFilledP,
      inputPassBoxWillBeFilledP,
    ]);

    await click("button[data-litms-control-urn='login-submit']");

    resolve();
  });
}
async function clickXpath(selector) {
  return new Promise(async function (resolve, reject) {
    try {
      let sendBtn = await tab.findElement(
        swd.By.xpath(
          selector
        )
      );
      console.log(sendBtn);
      await sendBtn.click();
      console.log("btn clicked");
      await tab;
      resolve();
    } catch (error) {
      reject();
    }
  })
}
async function clickId(selector) {
  return new Promise(async function (resolve, reject) {
    try {
      let sendBtn = await tab.findElement(
        swd.By.id(
          selector
        )
      );
      console.log(sendBtn);
      await sendBtn.click();
      console.log("btn clicked");
      await tab;
      resolve();
    } catch (error) {
      reject();
    }
  })
}
async function click(selector) {
  return new Promise(async function (resolve, reject) {
    try {
      let sendBtn = await tab.findElement(
        swd.By.css(
          selector
        )
      );
      console.log(sendBtn);
      await sendBtn.click();
      console.log("btn clicked");
      await tab;
      resolve();
    } catch (error) {
      reject();
    }
  })
}
async function clickAll(selector) {
  return new Promise(async function (resolve, reject) {
    try {
      let sendBtns = await tab.findElements(
        swd.By.css(
          selector
        )
      );
      for (let i = 0; i < sendBtns.length; i++) {

        await sendBtns[i].click();
        console.log("btn clicked");
        await tab;
      }

      resolve();
    } catch (error) {
      reject();
    }
  })
}
async function fill(selector, input) {
  return new Promise(async function (resolve, reject) {
    try {
      let inputBox = await tab.findElement(
        swd.By.css(
          selector
        )
      );
      await inputBox.sendKeys(input);
      await tab;
      resolve();
    } catch (error) {
      reject();
    }
  })
}

async function message(url) {
  return new Promise(async function (resolve, reject) {
    try {
     // console.log(url);
      let getProfilePage = await tab.get(url);
      let nameli = await tab.findElement(
        swd.By.xpath("/html/body/div[5]/div[3]/div/div/div[2]/div/div/main/section[1]/div[2]/div[2]/div[1]/div[1]/h1")
      );
     // console.log(nameli);
      let name = await nameli.getText();
      console.log('name: ' + name);    

      //await clickAll("li-icon[type='close']");
      //await tab.executeScript("window.scroll(0,1000)");
      //await tab.sleep(1000);
      //await click(".message-anywhere-button");
      await clickXpath("/html/body/div[5]/div[3]/div/div/div[2]/div/div/main/section[1]/div[2]/div[3]/div/div[1]/button");
      await tab.sleep(1000);

      //await tab.executeScript('document.querySelector(".msg-form__contenteditable").value="+ myMessage + ")');
      await fill(".msg-form__contenteditable", myMessage);
      await tab.sleep(1000);
      await click(".msg-form__send-button");
      await tab.sleep(1000);
      await clickXpath("//button[contains(.,'Close your conversation ')]");
      await tab.sleep(1000);

      resolve();
    } catch (error) {
      resolve();
    }
  });
}
