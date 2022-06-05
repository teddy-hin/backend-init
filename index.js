const fs = require("fs");
const fsPromise = fs.promises;
const path = require("path");

let baseDir = path.join(__dirname);

async function backendInit(entities) {
  console.log(__dirname, 123);
  console.log(entities);
  const structures = [
    "controller",
    "model",
    "route",
    "service",
    "middleware",
    "utils",
  ];
  for (let item of structures) {
    await fsPromise.mkdir(item);
    for (let entity of entities) {
      if (item === "controller") {
        await fsPromise.writeFile(`./controller/${entity}Controller.js`, "");
      } else if (item === "model") {
        await fsPromise.writeFile(`./model/${entity}.js`, "");
      } else if (item === "route") {
        await fsPromise.writeFile(`./route/${entity}Route.js`, "");
      } else if (item === "service") {
        await fsPromise.writeFile(`./service/${entity}Service.js`, "");
      }
    }
  }
}

module.exports = backendInit;
