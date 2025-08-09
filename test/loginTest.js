const { Builder, By, until } = require("selenium-webdriver");
const { expect } = require("chai");
const fs = require("fs");
const path = require("path");

describe("Prueba de Login", function () {
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

  it("Login exitoso con usuario válido y captura de pantalla", async function () {
    await driver.get("http://localhost:8000/signin/");

    await driver.wait(until.elementLocated(By.id("username")), 5000);

    await driver.findElement(By.id("username")).sendKeys("usuarioPrueba");
    await driver.findElement(By.id("password")).sendKeys("contraseña123");

    await driver.findElement(By.css('form button[type="submit"]')).click();

    await driver.wait(until.urlContains("/tasks"), 10000);

    const screenshot = await driver.takeScreenshot();
    const screenshotPath = path.join(__dirname, "../screenshots/login-success.png");
    fs.writeFileSync(screenshotPath, screenshot, "base64");

    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).to.include("/tasks");
  });
});