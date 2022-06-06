import { ForbiddenError } from "@casl/ability";
import { ObjectId } from "mongodb";
import LogAdminActionController from "./LogAdminActionController";
import mongoose from "mongoose";
import errorHelper from "../helper/errorHelper";

class Controller {
  constructor(service) {
    this.service = service;
  }

  getAll = async (req, res) => {
    try {
      ForbiddenError.from(req.ability).throwUnlessCan(
        "read",
        this.service.model
      );
      let response = await this.service.getAll(req.query);
      return response.statusCode < 400
        ? res.status(response.statusCode).send(response)
        : res
            .status(response.statusCode)
            .json(errorHelper(response.statusCode, response.errors));
    } catch (e) {
      const statusCode = e.message.match(/cannot execute/i) ? 400 : 500;
      return res
        .status(statusCode)
        .json(errorHelper(statusCode, e.message || e));
    }
  };

  // get by id
  get = async (req, res) => {
    try {
      ForbiddenError.from(req.ability).throwUnlessCan(
        "read",
        this.service.model
      );
      let response = await this.service.get(req.params.id);
      return response.statusCode < 400
        ? res.status(response.statusCode).send(response)
        : res
            .status(response.statusCode)
            .json(errorHelper(response.statusCode, response.errors));
    } catch (e) {
      const statusCode = e.message.match(/cannot execute/i) ? 400 : 500;
      return res
        .status(statusCode)
        .json(errorHelper(statusCode, e.message || e));
    }
  };

  // get by query
  getOne = async (req, res) => {
    try {
      ForbiddenError.from(req.ability).throwUnlessCan(
        "read",
        this.service.model
      );
      let response = await this.service.getOne(req.query);
      return response.statusCode < 400
        ? res.status(response.statusCode).send(response)
        : res
            .status(response.statusCode)
            .json(errorHelper(response.statusCode, response.errors));
    } catch (e) {
      const statusCode = e.message.match(/cannot execute/i) ? 400 : 500;
      return res
        .status(statusCode)
        .json(errorHelper(statusCode, e.message || e));
    }
  };

  insert = async (req, res) => {
    try {
      ForbiddenError.from(req.ability).throwUnlessCan(
        "create",
        this.service.model
      );
      let response = await this.service.insert(req.body);
      if (response.error)
        return response.statusCode < 400
          ? res.status(response.statusCode).send(response)
          : res
              .status(response.statusCode)
              .json(errorHelper(response.statusCode, response.errors));
      return res.status(201).send(response);
    } catch (e) {
      const statusCode = e.message.match(/cannot execute/i) ? 400 : 500;
      return res
        .status(statusCode)
        .json(errorHelper(statusCode, e.message || e));
    }
  };

  // update by id
  update = async (req, res) => {
    try {
      ForbiddenError.from(req.ability).throwUnlessCan(
        "update",
        this.service.model
      );
      let response = await this.service.update(req.params.id, req.body);

      // insert log
      if (req.user) {
        try {
          // logData
          req.logData = {
            user: req.user._id,
            action: `update ${this.service.model.collection.collectionName}`,
            body: req.body,
            subject: this.service.model.collection.collectionName,
            subjectModel: req.params.id,
            details: {
              old: {},
            },
            context: req.originalUrl,
          };

          Object.keys(req.body).forEach((key) => {
            req.logData.details.old[key] = response.item[key];
          });

          LogAdminActionController.insert(req);
        } catch {}
      }
      return response.statusCode < 400
        ? res.status(response.statusCode).send(response)
        : res
            .status(response.statusCode)
            .json(errorHelper(response.statusCode, response.errors));
    } catch (e) {
      const statusCode = e.message.match(/cannot execute/i) ? 400 : 500;
      return res
        .status(statusCode)
        .json(errorHelper(statusCode, e.message || e));
    }
  };

  // update by id
  updateOne = async (req, res) => {
    try {
      ForbiddenError.from(req.ability).throwUnlessCan(
        "update",
        this.service.model
      );
      let response = await this.service.updateOne(req.query, req.body, false);

      // insert log
      if (req.user) {
        // logData
        req.logData = {
          user: req.user._id,
          action: `update ${this.service.model.collection.collectionName}`,
          body: req.body,
          subject: this.service.model.collection.collectionName,
          subjectModel: response.item._id,
          details: {
            old: {},
          },
          context: req.originalUrl,
        };

        Object.keys(req.body).forEach((key) => {
          req.logData.details.old[key] = response.item[key];
        });

        LogAdminActionController.insert(req);
      }
      return response.statusCode < 400
        ? res.status(response.statusCode).send(response)
        : res
            .status(response.statusCode)
            .json(errorHelper(response.statusCode, response.errors));
    } catch (e) {
      const statusCode = e.message.match(/cannot execute/i) ? 400 : 500;
      return res
        .status(statusCode)
        .json(errorHelper(statusCode, e.message || e));
    }
  };
}

export default Controller;
