const basecontroller = require('../framework/basecontroller.js');
const mongodb = require('../framework/mongodbserver.js');
const userscontroller = require('./userscontroller.js');
const objectid = require('mongodb').ObjectID;

module.exports = function (response, mongodbport) {
    basecontroller.call(this, response, mongodbport);

    let self = this;
    let mongo = new mongodb(mongodbport);
    let users = new userscontroller(response, mongodbport);
    let database = "faq";

    // const users = new userscontroller(response, mongodbport);

    this.Get = async function (data) {
        // let authenticated = await users.Authenticate(data.credentials);

        // if (authenticated && data.userid) {
        // let query = { userid: data.userid };
        // let collection = await mongo.FindRecord(database, query, {}, {});
        // let collection = await mongo.FindRecord(database,{"term":1});
        let collection = await mongo.FindRecord(database, {}, {}, {});
        return self.Return(collection);

        // } else {
        //     return self.Return([]);
        // }
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

    //zin
    this.Insert = async function (data) {
        // let authenticated = await users.Authenticate(data.credentials);

        // if (authenticated) {
        //     delete data.credentials;

        if (data._id) {
            await mongo.UpdateRecord(database, data);
            return self.Return(true);
        } else {

            var query = { question: data.question, answer: data.answer };

            let insert = await mongo.InsertRecord(database, query);
            return self.Return(insert);
        }

        // } else {
        //     return self.Return([]);
        // }

    };

    this.Delete = async function (data) {
        // let authenticated = await users.Authenticate(data.credentials);

        // if (authenticated) {
        if (data._id) {
            let update = await mongo.DeleteRecord(database, data);
            return self.Return(update);
        } else {
            return self.Return(false);
        }

        // } else {
        //     return self.Return(false);
        // }
    };
};