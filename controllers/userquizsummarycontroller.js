const basecontroller = require('../framework/basecontroller.js');
const mongodb = require('../framework/mongodbserver.js');
const userscontroller = require('./userscontroller.js');
const objectid = require('mongodb').ObjectID;

module.exports = function (response, mongodbport) {
    basecontroller.call(this, response, mongodbport);

    let self = this;
    let mongo = new mongodb(mongodbport);
    let users = new userscontroller(response, mongodbport);
    let database = "userquizsummary";


    this.Insert = async function (data) {
        insertdata = await mongo.InsertRecord(database, data);
        if (insertdata)
            return self.Return(true);
        else
            return self.Return(false);
    };
};