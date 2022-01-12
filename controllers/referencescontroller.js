const basecontroller = require('../framework/basecontroller.js');
const mongodb = require('../framework/mongodbserver.js');
const userscontroller = require('./userscontroller.js');
const objectid = require('mongodb').ObjectID;

module.exports = function (response, mongodbport) {
    basecontroller.call(this, response, mongodbport);

    let self = this;
    let mongo = new mongodb(mongodbport);
    let users = new userscontroller(response, mongodbport);
    let database = "references";

    this.Get = async function (data) {

        let collection = await mongo.FindRecord(database, {}, {}, {});
        
        return self.Return(collection);

    };

    this.GetByModuleId = async function (data) {

        if (data) {
            let query = { moduleid: data.moduleid };

            let collection = await mongo.FindRecord(database, query, {}, {});

            return self.Return(collection);

        } else {
            return self.Return([]);
        }
    };

    this.GetById = async function (data) {
        //let authenticated = await users.Authenticate(coursedata.credentials);

        // if (authenticated && coursedata)
        if (data) {
            let query = { _id: data._id };

            let collection = await mongo.FindRecord(database, query, {}, {});

            return self.Return(collection);

        } else {
            return self.Return([]);
        }
    };

    this.Insert = async function (data) {

        if (data._id) {
            await mongo.UpdateRecord(database, data);
            return self.Return(true);
        } else {

            var query = { moduleid:data.moduleid, title: data.title, url:data.url };

            let insert = await mongo.InsertRecord(database, query);
            return self.Return(insert);
        }

    };

    this.Delete = async function (data) {

        if (data._id) {
            let update = await mongo.DeleteRecord(database, data);
            return self.Return(update);
        } else {
            return self.Return(false);
        }

    };
};