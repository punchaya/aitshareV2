const basecontroller = require('../framework/basecontroller.js');
const mongodb = require('../framework/mongodbserver.js');
const userscontroller = require('./userscontroller.js');
const objectid = require('mongodb').ObjectID;

module.exports = function (response, mongodbport) {
    basecontroller.call(this, response, mongodbport);

    let self = this;
    let mongo = new mongodb(mongodbport);
    let users = new userscontroller(response, mongodbport);
    let database = "quiz";

    // const users = new userscontroller(response, mongodbport);

    this.GetByPresentationID = async function (data) {

        let query = { presentationid: data.pid };
        let collection = await mongo.FindRecord(database, query, {}, {});
        return self.Return(collection);

    };

    //zin
    this.Insert = async function (data) {

        if (data._id) {
            await mongo.UpdateRecord(database, data);
            let query = { _id: data._id }
            let collection = await mongo.FindRecord(database, query, {}, {});
            return self.Return(collection);
        } else {
            await mongo.InsertRecord(database, data);
            let query = { _id: data._id };
            let collection = await mongo.FindRecord(database, query);
            return self.Return(collection);
        }

    };

    this.GetByPresentationIdforDelete = async function (data) {
        let query = { presentationid: data._id };
        let collection = await mongo.FindRecord(database, query, {}, {});
        return self.Return(collection);
    };

    this.GetById = async function (data) {
        let query = { _id: data.id };
        let collection = await mongo.FindRecord(database, query, {}, {});
        return self.Return(collection);
    };

    this.DeleteDetails = async function (data) {
       
        if (data._id) {
            let update = await mongo.DeleteRecord(database, data);
            return self.Return(update);
        } else {
            return self.Return(false);
        }

       
    };

    this.DeleteDetailsbyPresentationId = async function (data) {
       
            let update;
            let query = { presentationid: data._id };
            let collection = await mongo.FindRecord(database, query);       
          
            if (collection.length > 0 )
            {                
                for (let i = 0; i < collection.length; i++) {

                    data = {_id : collection[i]._id};
                    update = await mongo.DeleteRecord(database, data);
                    
                }
                return self.Return(update);
                
            }
            else{
                return self.Return(update);
            }

          
    };
    //


};