const fs = require("fs");
const fsPromise = fs.promises;

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
  fsPromise.writeFile(
    `${secondLayerBasePath}/Controller/Controller.js`,
    Controller
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

const Controller = `class Controller {
  constructor(service) {
      this.service = service;
      this.get = this.getById.bind(this);
      this.getAll = this.getAll.bind(this);
      this.insertMany = this.insertMany.bind(this);
      this.updateOne = this.updateOne.bind(this);
      this.deleteOne = this.deleteOne.bind(this);
  }

  //List page
  async getAll(req, res) {
      try {
          return res.send(await this.service.getAll(req.query));
      } catch (e) {
          return res.json({ error: e.message });
      }
  }

  // get by id
  async getById(req, res) {
      try {
          console.log(req.params.id, 'at Controller');
          let response = await this.service.getById(req.params.id);
          return res.send(response);
      } catch (e) {
          return res.json({ error: e.message });
      }
  }

  async insertMany(req, res) {
      try {
          console.log(req.body, 'in controller');
          if (Object.keys(req.body).length === 0) return res.json({ message: 'no req.body' });
          const response = await this.service.insertMany(req.body);
          if (response) {
              return res.send(response);
          } else {
              return res.json({ error: 'failed to insert' });
          }
      } catch (e) {
          return res.json({ error: e.message });
      }
  }

  async insertManyAndRedis(req, res, next) {
      try {
          req.updated = false;
          if (Object.keys(req.body).length === 0) return res.json({ message: 'no req.body' });
          const response = await this.service.insertMany(req.body);
          if (response) {
              req.updated = true;
              next();
          } else {
              return res.json({ error: 'failed to insert' });
          }
      } catch (e) {
          return res.json({ error: e.message });
      }
  }

  async updateOne(req, res) {
      try {
          if (Object.keys(req.body).length === 0) return res.json({ message: 'no req.body' });
          let response = await this.service.updateOne(req.params.id, req.body);
          if (response) {
              return res.json(response);
          } else {
              return res.json({ error: 'failed to update' });
          }
      } catch (e) {
          return res.json({ error: e.message });
      }
  }

  async updateOneAndRedis(req, res, next) {
      try {
          req.updated = false;
          if (Object.keys(req.body).length === 0) return res.json({ message: 'no req.body' });
          let response = await this.service.updateOne(req.params.id, req.body);
          if (response) {
              req.updated = true;
              req.updatedObject = response;
              next();
          } else {
              return res.json({ error: 'failed to update' });
          }
      } catch (e) {
          return res.json({ error: e.message });
      }
  }

  async deleteOne(req, res) {
      try {
          const response = await this.service.deleteOne(req.params.id);
          return res.json(response);
      } catch (e) {
          return res.json({ error: e.message });
      }
  }
}

export default Controller;
`;
