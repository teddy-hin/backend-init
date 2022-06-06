import mongoose from "mongoose";
import fs from "fs";
import { ObjectId } from "mongodb";

// service class to access DB
class Service {
  constructor(model) {
    this.model = model;
  }

  getAll = async (query, populate = [], select = null, noLimit = false) => {
    let { page, limit, sort_by, order_by } = query;
    let sort = {};

    page = page ? Number(page) : 1;
    limit = limit ? Number(limit) : Number(process.env.DEFAULT_NO_PER_PAGE);
    if (!noLimit)
      limit =
        limit > Number(process.env.MAX_NO_PER_PAGE)
          ? Number(process.env.MAX_NO_PER_PAGE)
          : limit;

    delete query.page;
    delete query.limit;
    delete query.sort_by;
    delete query.order_by;

    if (sort_by && order_by) sort[sort_by] = order_by === "desc" ? -1 : 1;

    try {
      let items = await this.model
        .find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit);

      if (select) {
        items = await this.model
          .find(query)
          .select(select)
          .sort(sort)
          .skip((page - 1) * limit)
          .limit(limit);
      }

      await Promise.all(
        items.map(async (item) => {
          await Promise.all(
            populate.map(async (obj) => {
              await item.populate(obj).execPopulate();
            })
          );
        })
      );

      const total = await this.model.countDocuments(query);
      const current_page = page;
      const total_page = total == 0 ? 1 : Math.ceil(total / limit);
      const next_page = page == total_page ? null : page + 1;
      const prev_page = page == 1 ? null : page - 1;

      return {
        error: false,
        statusCode: 200,
        data: items,
        total,
        total_page,
        current_page,
        next_page,
        prev_page,
      };
    } catch (errors) {
      return {
        error: true,
        statusCode: 500,
        errors,
      };
    }
  };

  get = async (id, projection = null, populate = []) => {
    try {
      let item = await this.model.findById(id, projection);

      await Promise.all(
        populate.map(async (obj) => {
          await item.populate(obj).execPopulate();
        })
      );

      if (item)
        return {
          error: false,
          statusCode: 200,
          item,
        };
      else
        return {
          error: true,
          statusCode: 404,
        };
    } catch (errors) {
      return {
        error: true,
        statusCode: 500,
        errors,
      };
    }
  };

  // detail view
  getOne = async (query, populate = []) => {
    try {
      let item = await this.model.findOne(query);

      if (item) {
        await Promise.all(
          populate.map(async (obj) => {
            await item.populate(obj).execPopulate();
          })
        );

        return {
          error: false,
          statusCode: 200,
          item,
        };
      } else
        return {
          error: true,
          statusCode: 404,
        };
    } catch (errors) {
      return {
        error: true,
        statusCode: 500,
        errors,
      };
    }
  };

  // create record
  insert = async (data) => {
    try {
      let item = await this.model.create(data);
      if (item)
        return {
          error: false,
          statusCode: 200,
          item,
        };
    } catch (errors) {
      //console.log("error", errors);
      return {
        error: true,
        statusCode: 500,
        errors,
      };
    }
  };

  // update - put/ patch
  update = async (id, data, return_new = true) => {
    try {
      if (this.model.collection.collectionName != "posts" && !data.updatedAt)
        data.updatedAt = new Date();
      let item = await this.model.findOneAndUpdate(
        { _id: ObjectId(id) },
        data,
        { new: return_new }
      );
      return {
        error: false,
        statusCode: 202,
        item,
      };
    } catch (errors) {
      return {
        error: true,
        statusCode: 500,
        errors,
      };
    }
  };

  // update one
  updateOne = async (query, data, return_new = true, options = {}) => {
    try {
      let item = await this.model.findOne(query);
      if (!item) throw "not found";

      if (!data.updatedAt) data.updatedAt = new Date();
      item = await this.model.findOneAndUpdate(query, data, {
        new: return_new,
        ...options,
      });
      return {
        error: false,
        statusCode: 202,
        item,
      };
    } catch (errors) {
      return {
        error: true,
        statusCode: 500,
        errors,
      };
    }
  };

  updateMany = async (query, data, return_new = true) => {
    try {
      if (!data.updatedAt) data.updatedAt = new Date();
      let item = await this.model.updateMany(query, data, {
        new: return_new,
        multi: true,
      });
      return {
        error: false,
        statusCode: 202,
        item,
      };
    } catch (errors) {
      return {
        error: true,
        statusCode: 500,
        errors,
      };
    }
  };

  // update one
  deleteSafe = async (id) => {
    try {
      const item = await this.model.findOneAndUpdate(
        { _id: ObjectId(id) },
        { deleted: true, deletedAt: new Date() },
        { new: true }
      );
      return {
        error: false,
        statusCode: 202,
        item,
      };
    } catch (errors) {
      return {
        error: true,
        statusCode: 500,
        errors,
      };
    }
  };

  getOrCreate = async (query, data) => {
    let item;

    try {
      item = await this.model.findOne(query);

      if (item) {
        //delete data.createdAt;
        item = await this.updateOne(query, data, true);
      } else {
        // not found, create one
        item = await this.insert(data);
      }
    } catch (errors) {
      console.log(errors);
    }

    return {
      error: false,
      statusCode: 200,
      ...item,
    };
  };
}

export default Service;
