const basecontroller = require('../framework/basecontroller.js');
const mongodb = require('../framework/mongodbserver.js');
const userscontroller = require('./userscontroller.js');
const objectid = require('mongodb').ObjectID;

module.exports = function (response, mongodbport) {
    basecontroller.call(this, response, mongodbport);

    let self = this;
    let mongo = new mongodb(mongodbport);
    let users = new userscontroller(response, mongodbport);
    let database = "modulescomplog";


    // this.Get = async function (data) {

    //     let query = { userid: data.userid, slideid: data.slideid };

    //     let collection = await mongo.FindRecord(database, query);

    //     return self.Return(collection);

    // };

    // this.GetByUserPresentationID = async function (data) {

    //     let query = { userid: data.userid, presentationid: data.presentationid };

    //     let collection = await mongo.FindRecord(database, query);

    //     return self.Return(collection);

    // };

    // this.GetByPresentationID = async function (data) {

    //     let query = { presentationid: data.presentationid };

    //     let collection = await mongo.FindRecord(database, query);
    //     if (collection.length !== 0)
    //         return self.Return(true);
    //     else
    //         return self.Return(false);

    // };

    this.GetCertificate = async function (data) {

        let query = { courseid: data.courseid };
        let collectionmodules = await mongo.FindRecord("modules", query);

        if (collectionmodules.length !== 0) {
            let collectionlog = await mongo.FindRecord("modulescomplog", query)
            if (collectionlog.length !== 0) {
                if (collectionmodules.length === collectionlog.length)
                    return self.Return(true);
                else
                    return self.Return(false);
            } else
                return self.Return(false);
        } else
            return self.Return(false);

    };

    this.Insert = async function (data) {
        let data_ = { userid: data.userid, courseid: data.courseid, moduleid: data.moduleid };

        let collection = await mongo.FindRecord(database, data_);

        if (collection.length === 0) {
            //     let _data_ = { _id: objectid(collection[0]._id), userid: data.userid, slideid: data.slideid, presentationid: data.presentationid, complete: data.complete };

            //     let insertdata = await mongo.UpdateRecord(database, _data_);
            //     if (insertdata)
            //         return self.Return(true);
            //     else
            //         return self.Return(false);
            // } else {
            insertdata = await mongo.InsertRecord(database, data);
            if (insertdata)
                return self.Return(true);
            else
                return self.Return(false);
        }
    };

    // this.SummaryLog = async function (data) {
    //     let query1 = { userid: data.userid, presentationid: data.presentationid };
    //     let collection1 = await mongo.FindRecord(database, query1);

    //     let query2 = { presentationid: data.presentationid };
    //     let collection2 = await mongo.FindRecord("slides", query2);

    //     let percentage;

    //     if (collection1 !== 0) {
    //         percentage = (collection1.length / collection2.length) * 100;

    //         return self.Return(percentage);

    //     } else {
    //         return self.Return(0);
    //     }
    // };
};