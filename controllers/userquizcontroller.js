const basecontroller = require('../framework/basecontroller.js');
const mongodb = require('../framework/mongodbserver.js');
const userscontroller = require('./userscontroller.js');
const objectid = require('mongodb').ObjectID;

module.exports = function (response, mongodbport) {
    basecontroller.call(this, response, mongodbport);

    let self = this;
    let mongo = new mongodb(mongodbport);
    let users = new userscontroller(response, mongodbport);
    let database = "userquiz";

    this.GetQuizByModuleID = async function (data) {
        let query1 = { userid: data.userid, moduleid: data.moduleid };
        let collection1 = await mongo.FindRecord(database, query1, {}, {});

        if (collection1) {
            collection1.sort(function (a, b) {
                _a = parseInt(a.score);
                _b = parseInt(b.score);

                if (_a > _b)
                    return -1;
                else if (_a < _b)
                    return 1;
                else
                    return 0;
            });
            return self.Return(collection1[0]);
        } else {
            let noitem = { score: 0, remarks: "NOT TAKEN" };

            return self.Return(noitem);
        }
    };

    this.Insert = async function (data) {
        insertdata = await mongo.InsertRecord(database, data);
        if (insertdata)
            return self.Return(true);
        else
            return self.Return(false);
    };

    this.CheckRemarks = async function (data) {
        let query = { userid: data.userid, presentationid: data.presentationid, remarks: "Pass" };

        let collection = await mongo.FindRecord(database, query);
        if (collection.length !== 0) {
            return self.Return(true);
        } else {
            return self.Return(false);
        }
    };

    this.CheckPassFailed_ = async function (data) {
        let query = { userid: data.userid, presentationid: data.presentationid, remarks: "PASS" };

        let collection = await mongo.FindRecord(database, query);

        if (collection.length !== 0) {
            return self.Return(true);
        } else {
            return self.Return(false);
        }
    }

};