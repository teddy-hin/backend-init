const fs = require("fs");
const fsPromise = fs.promises;
const Controller = require("./material/Controller");

async function backendInit(entities) {
  const firstLayer = ["key", "src"];
  const secondLayer = ["app", "config", "utils"];
  const pillars = ["controller", "model", "route", "service", "middleware"];
  const firstLayerBasePath = "./src";
  const secondLayerBasePath = "./src/app";
  let indexService = `export { default as Service } from "./Service"\n`;
  let indexController = `export { default as Controller } from "./Controller"\n`;
  for (let entity of entities) {
    indexService += `export { default as ${capitalizeFirstLetter(
      entity
    )}Service } from "./${capitalizeFirstLetter(entity)}Service"\n`;
    indexController += `export { default as ${capitalizeFirstLetter(
      entity
    )}Controller } from "./${capitalizeFirstLetter(entity)}Controller"\n`;
  }

  for (let folder of firstLayer) {
    await fsPromise.mkdir(folder);
  }
  for (let folder of secondLayer) {
    await fsPromise.mkdir(`${firstLayerBasePath}/${folder}`);
  }
  for (let pillar of pillars) {
    await fsPromise.mkdir(`${secondLayerBasePath}/${pillar}`);
    for (let entity of entities) {
      if (pillar === "controller") {
        await fsPromise.writeFile(
          `${secondLayerBasePath}/controller/${capitalizeFirstLetter(
            entity
          )}Controller.js`,
          ""
        );
      } else if (pillar === "model") {
        await fsPromise.writeFile(
          `${secondLayerBasePath}/model/${capitalizeFirstLetter(entity)}.js`,
          ""
        );
      } else if (pillar === "route") {
        await fsPromise.writeFile(
          `${secondLayerBasePath}/route/${capitalizeFirstLetter(
            entity
          )}Route.js`,
          ""
        );
      } else if (pillar === "service") {
        await fsPromise.writeFile(
          `${secondLayerBasePath}/service/${capitalizeFirstLetter(
            entity
          )}Service.js`,
          ""
        );
      }
    }
  }
  fs.copyFile(
    "../material/Controller.js",
    `${secondLayerBasePath}/Controller/Controller.js`,
    (err) => {
      if (err) {
        console.log(err);
      }
    }
  );
  fsPromise.writeFile(`${secondLayerBasePath}/Service/index.js`, indexService);
  fsPromise.writeFile(
    `${secondLayerBasePath}/Controller/index.js`,
    indexController
  );
}

module.exports = backendInit;

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
