class Controller {
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
