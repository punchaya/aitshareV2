const basecontroller = require('../framework/basecontroller.js');
const mongodb = require('../framework/mongodbserver.js');
const userscontroller = require('./userscontroller.js');
const objectid = require('mongodb').ObjectID;

module.exports = function (response, mongodbport) {
    basecontroller.call(this, response, mongodbport);

    let self = this;
    let mongo = new mongodb(mongodbport);
    let users = new userscontroller(response, mongodbport);
    let database = "userpresentationlog";


    this.Get = async function (data) {

        let query = { userid: data.userid, slideid: data.slideid };

        let collection = await mongo.FindRecord(database, query);

        return self.Return(collection);

    };

    this.GetAllData = async function (data) {

        let query = { userid: data.userid };
        let collection = await mongo.FindRecord(database, query);

        // let query2 = { moduleid: data.moduleid };
        // let collection2 = await mongo.FindRecord("presentation", query2);

        return self.Return(collection);

    };

    this.GetByUserModuleID = async function (data) {

        let query = { userid: data.userid, moduleid: data.moduleid };

        let collection = await mongo.FindRecord(database, query);

        return self.Return(collection);

    };

    this.GetByModuleID = async function (data) {

        let query = { presentationid: data.presentationid };

        let collection = await mongo.FindRecord(database, query);
        if (collection.length !== 0)
            return self.Return(true);
        else
            return self.Return(false);

    };

    this.Insert = async function (data) {
        let data_ = { userid: data.userid, presentationid: data.presentationid, moduleid: data.moduleid };

        let collection = await mongo.FindRecord(database, data_);

        if (collection.length !== 0) {
            let _data_ = { _id: objectid(collection[0]._id), userid: data.userid, moduleid: data.moduleid, presentationid: data.presentationid, complete: data.complete };

            let insertdata = await mongo.UpdateRecord(database, _data_);
            if (insertdata)
                return self.Return(true);
            else
                return self.Return(false);
        } else {
            insertdata = await mongo.InsertRecord(database, data);
            if (insertdata)
                return self.Return(true);
            else
                return self.Return(false);
        }
    };

    this.SummaryLog = async function (data) {
        let query1 = { userid: data.userid, moduleid: data.moduleid };
        let collection1 = await mongo.FindRecord(database, query1);

        let query2 = { moduleid: data.moduleid };
        let collection2 = await mongo.FindRecord("presentation", query2);

        let percentage;

        if (collection1 !== 0) {

            percentage = (collection1.length / collection2.length) * 100;

            return self.Return(percentage);

        } else {
            return self.Return(0);
        }
    };

    this.SummaryLogWithUserQuiz = async function (data) {
        let query1 = { userid: data.userid, moduleid: data.moduleid };
        let collection1 = await mongo.FindRecord(database, query1);

        let query2 = { moduleid: data.moduleid };
        let collection2 = await mongo.FindRecord("presentation", query2);

        let collection3 = await mongo.FindRecord("userquiz", query1);

        let percentage;

        let bothresponse = [];

        if (collection1 !== 0) {

            percentage = (collection1.length / collection2.length) * 100;

            if (collection3.length === 0) {
                let noitem = { score: 0, remarks: "NOT TAKEN" };

                bothresponse.push({ percentage: percentage, quizdata: noitem });
                return self.Return(bothresponse);
            } else {
                collection3.sort(function (a, b) {
                    _a = parseInt(a.score);
                    _b = parseInt(b.score);

                    if (_a > _b)
                        return -1;
                    else if (_a < _b)
                        return 1;
                    else
                        return 0;
                });

                let resArr = [];
                let listofquiz = [];
                collection3.forEach(function (item) {
                    var i = resArr.findIndex(x => x.presentationid === item.presentationid);
                    if (i <= -1) {
                        resArr.push({ presentationid: item.presentationid });
                        listofquiz.push({ quizdata: item });
                    }
                });
                // console.log(resArr);

                // bothresponse.push({ percentage: percentage, quizdata: collection3[0] });
                bothresponse.push({ percentage: percentage, quizdata: listofquiz });
                return self.Return(bothresponse);
            }


        } else {
            if (collection3.length === 0) {
                return self.Return(0);
            } else {
                let noitem = { score: 0, remarks: "NOT TAKEN" };

                bothresponse.push({ percentage: percentage, quizdata: noitem });
                return self.Return(bothresponse);
            }

        }
    };
};