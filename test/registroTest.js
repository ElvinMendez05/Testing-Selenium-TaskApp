// const { Builder, By, until } = require("selenium-webdriver");
// const { expect } = require("chai");
// const fs = require("fs");
// const path = require("path");

// describe("Prueba de Registro de Usuario", function () {
//   this.timeout(30000);
//   let driver;

//   before(async function () {
//     driver = await new Builder().forBrowser("chrome").build();

//     const dir = path.join(__dirname, "../screenshots");
//     if (!fs.existsSync(dir)) {
//       fs.mkdirSync(dir);
//     }
//   });

//   after(async function () {
//     await driver.quit();
//   });

//   it("Registro exitoso con datos válidos y captura de pantalla", async function () {
//     await driver.get("http://localhost:8000/signup/");

//     await driver.wait(until.elementLocated(By.id("username")), 5000);

//     await driver.findElement(By.id("username")).sendKeys("nuevoUsuario");
//     await driver.findElement(By.id("password1")).sendKeys("contraseña123");
//     await driver.findElement(By.id("password2")).sendKeys("contraseña123");

//     await driver.findElement(By.css('form button[type="submit"]')).click();

//     await driver.wait(until.urlContains("/signin"), 10000);

//     const screenshot = await driver.takeScreenshot();
//     const screenshotPath = path.join(__dirname, "../screenshots/registro-exitoso.png");
//     fs.writeFileSync(screenshotPath, screenshot, "base64");

//     const currentUrl = await driver.getCurrentUrl();
//     expect(currentUrl).to.include("/signin");
//   });
// });

const { Builder, By, until } = require("selenium-webdriver");
const { expect } = require("chai");

describe("Prueba de Registro de Usuario - Historia de Usuario", function () {
  this.timeout(60000);
  let driver;

  before(async function () {
    driver = await new Builder().forBrowser("chrome").build();
  });

  after(async function () {
    await driver.quit();
  });

  // Generar usuario y correo únicos para evitar conflictos
  function generateUniqueUser() {
    const timestamp = Date.now();
    return {
      username: `user${timestamp}`,
      email: `user${timestamp}@mail.com`,
      password: "contraseña123",
    };
  }

  it("Formulario tiene usuario, correo y contraseña", async function () {
    await driver.get("http://localhost:8000/signup/");
    const username = await driver.findElement(By.id("username"));
    const email = await driver.findElement(By.id("email"));
    const password1 = await driver.findElement(By.id("password1"));
    const password2 = await driver.findElement(By.id("password2"));

    expect(username).to.exist;
    expect(email).to.exist;
    expect(password1).to.exist;
    expect(password2).to.exist;
  });

  it("No permite enviar formulario con campos vacíos", async function () {
    await driver.get("http://localhost:8000/signup/");

    await driver.findElement(By.css('form button[type="submit"]')).click();

    // Esperar que aparezcan mensajes de validación o error
    // Ajusta el selector según tu app, puede ser ".error" o ".invalid-feedback"
    const errors = await driver.findElements(By.css(".error, .invalid-feedback, .alert-danger"));
    expect(errors.length).to.be.greaterThan(0);
  });

  it("No permite contraseña menor a 6 caracteres", async function () {
    await driver.get("http://localhost:8000/signup/");

    await driver.findElement(By.id("username")).sendKeys("usuarioTest");
    await driver.findElement(By.id("email")).sendKeys("usuarioTest@mail.com");
    await driver.findElement(By.id("password1")).sendKeys("123");
    await driver.findElement(By.id("password2")).sendKeys("123");

    await driver.findElement(By.css('form button[type="submit"]')).click();

    // Verificar mensaje de error para contraseña corta
    const error = await driver.wait(until.elementLocated(By.css(".error, .invalid-feedback, .alert-danger")), 5000);
    const text = await error.getText();
    expect(text.toLowerCase()).to.include("6 caracteres");
  });

  it("Registro exitoso con datos válidos", async function () {
    const user = generateUniqueUser();

    await driver.get("http://localhost:8000/signup/");

    await driver.findElement(By.id("username")).sendKeys(user.username);
    await driver.findElement(By.id("email")).sendKeys(user.email);
    await driver.findElement(By.id("password1")).sendKeys(user.password);
    await driver.findElement(By.id("password2")).sendKeys(user.password);

    await driver.findElement(By.css('form button[type="submit"]')).click();

    // Esperar redirección o mensaje de éxito (ajustar según tu app)
    await driver.wait(until.urlContains("/signin"), 10000);

    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).to.include("/signin");
  });

  it("No permite registro con correo duplicado", async function () {
    const user = generateUniqueUser();

    // Primer registro exitoso
    await driver.get("http://localhost:8000/signup/");
    await driver.findElement(By.id("username")).sendKeys(user.username);
    await driver.findElement(By.id("email")).sendKeys(user.email);
    await driver.findElement(By.id("password1")).sendKeys(user.password);
    await driver.findElement(By.id("password2")).sendKeys(user.password);
    await driver.findElement(By.css('form button[type="submit"]')).click();
    await driver.wait(until.urlContains("/signin"), 10000);

    // Intentar registrar otra vez con mismo correo
    await driver.get("http://localhost:8000/signup/");
    await driver.findElement(By.id("username")).sendKeys(user.username + "2");
    await driver.findElement(By.id("email")).sendKeys(user.email);
    await driver.findElement(By.id("password1")).sendKeys(user.password);
    await driver.findElement(By.id("password2")).sendKeys(user.password);
    await driver.findElement(By.css('form button[type="submit"]')).click();

    // Verificar mensaje de error por correo duplicado
    const error = await driver.wait(until.elementLocated(By.css(".error, .alert-danger")), 5000);
    const text = await error.getText();
    expect(text.toLowerCase()).to.include("correo");
  });
});
