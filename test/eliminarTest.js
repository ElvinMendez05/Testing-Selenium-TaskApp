const { Builder, By, until } = require("selenium-webdriver");
const { expect } = require("chai");
const fs = require("fs");
const path = require("path");

describe("Prueba de eliminar tarea", function () {
  this.timeout(30000);
  let driver;

  before(async function () {
    driver = await new Builder().forBrowser("chrome").build();

    const dir = path.join(__dirname, "../screenshots");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
  });

  after(async function () {
    await driver.quit();
  });

  it("Eliminar tarea y tomar captura de pantalla", async function () {
    
    await driver.get("http://localhost:8000/tasks/1/");

   
    const deleteBtn = await driver.wait(until.elementLocated(By.css('form[action$="delete"] button')), 5000);


    await deleteBtn.click();

   
    try {
      await driver.wait(until.alertIsPresent(), 3000);
      const alert = await driver.switchTo().alert();
      await alert.accept();
    } catch (e) {
      
    }

   
    await driver.wait(until.urlIs("http://localhost:8000/tasks/"), 10000);

    
    const screenshot = await driver.takeScreenshot();
    const screenshotPath = path.join(__dirname, "../screenshots/eliminar-tarea.png");
    fs.writeFileSync(screenshotPath, screenshot, "base64");

    
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).to.equal("http://localhost:8000/tasks/");
  });
});

