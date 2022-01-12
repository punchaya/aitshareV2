const basecontroller = require('../framework/basecontroller.js');
const mongodb = require('../framework/mongodbserver.js');
const userscontroller = require('./userscontroller.js');
const objectid = require('mongodb').ObjectID;

module.exports = function (response, mongodbport) {
    basecontroller.call(this, response, mongodbport);

    let self = this;
    let mongo = new mongodb(mongodbport);
    let users = new userscontroller(response, mongodbport);
    let database = "userprogress";


    this.Get = async function (data) {
        let collection = await mongo.FindRecord(database);
        return self.Return(collection);
    };

    this.GetByUserIDModIDPresID = async function (data) {
        let query = { userid: data.userid, moduleid: data.moduleid, presentationid: data.presentationid };

        let collection = await mongo.FindRecord(database, query);
        return self.Return(collection);
    };

    this.Insert = async function (data) {

        let ins = await mongo.InsertRecord(database, data);

        if (ins)
            return self.Return(true);
        else
            return self.Return(true);
    };

    this.Update = async function (data) {

        let up = await mongo.UpdateRecord(database, data);


        if (up)
            return self.Return(true);
        else
            return self.Return(true);

    };
};