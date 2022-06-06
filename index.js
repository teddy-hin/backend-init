const fs = require("fs");
const fsPromise = fs.promises;

async function backendInit(entities) {
  const firstLayer = ["key", "src"];
  const secondLayer = ["app", "config", "utils"];
  const pillars = ["controller", "model", "route", "service", "middleware"];
  const firstLayerBasePath = "./src";
  const secondLayerBasePath = "./src/app";

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
          `${secondLayerBasePath}/controller/${entity}Controller.js`,
          ""
        );
      } else if (pillar === "model") {
        await fsPromise.writeFile(
          `${secondLayerBasePath}/model/${entity}.js`,
          ""
        );
      } else if (pillar === "route") {
        await fsPromise.writeFile(
          `${secondLayerBasePath}/route/${entity}Route.js`,
          ""
        );
      } else if (pillar === "service") {
        await fsPromise.writeFile(
          `${secondLayerBasePath}/service/${entity}Service.js`,
          ""
        );
      }
    }
  }
}

module.exports = backendInit;
