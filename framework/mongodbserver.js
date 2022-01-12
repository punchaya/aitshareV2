const basecontroller = require('../framework/basecontroller.js');

const mongodb = require("mongodb").MongoClient;
const objectid = require('mongodb').ObjectID;

module.exports = function (mongodbport) {
    let self = this;
    let url = 'mongodb://localhost:' + mongodbport + '/local';

    this.FindRecord = async function (database, query, fields, sort) {
        return new Promise((resolve, reject) => {
            try {
                mongodb.connect(url, function (err, db) {
                    if (!err) {
                        if (query && query._id) {
                            try {
                                if (query._id.$in) {
                                    for (let i = 0; i < query._id.$in.length; i++) {
                                        query._id.$in[i] = objectid(query._id.$in[i]);
                                    }

                                } else
                                    query._id = objectid(query._id);
                            }
                            catch (err) {
                                console.log(err.message);
                            }
                        }

                        let stream = db.collection(database).find(query, fields).sort(sort);

                        let collection = [];

                        stream.on("data", function (doc) {
                            collection.push(doc);
                        });

                        stream.on("end", function () {
                            db.close();
                            resolve(collection);
                        })
                    }
                    else {
                        console.log(JSON.stringify(err));
                        resolve([]);
                    }
                });
            } catch (err) {
                console.log(err.message);
                resolve([]);
            }
        });
    };

    this.InsertRecord = async function (database, data) {
        return new Promise((resolve, reject) => {
            try {
                if (data) {
                    data.dateentered = new Date().toISOString();

                    mongodb.connect(url, function (err, db) {
                        if (!err) {
                            db.collection(database).insertOne(data, function (err, doc) {
                                resolve({ _id: doc.insertedId });
                            });

                            db.close();
                        }
                        else {
                            resolve(false);
                        }
                    });
                }
                else {
                    resolve(false);
                }
            } catch (error) {
                console.log(JSON.stringify(error));
                resolve(false);
            }
        });
    };

    this.UpdateRecord = async function (database, data) {
        return new Promise((resolve, reject) => {
            try {
                if (data._id) {
                    mongodb.connect(url, function (err, db) {
                        if (!err) {
                            var query = { _id: data._id };
                            var id = data._id;

                            query = { _id: objectid(id) };
                            data._id = objectid(id);

                            data = { $set: data };

                            db.collection(database).update(
                                query, data,
                                function (err, results) {
                                    if (!err)
                                        resolve(true);
                                    else
                                        resolve(false);
                                }
                            );

                            db.close();

                        } else {
                            resolve(false);
                        }
                    });
                }
                else {
                    resolve(false);
                }
            } catch (error) {
                console.log(JSON.stringify(error));
                resolve(false);
            }
        });
    };

    this.DeleteRecord = async function (database, data) {
        return new Promise((resolve, reject) => {
            try {
                if (data._id) {
                    mongodb.connect(url, function (err, db) {
                        if (!err) {
                            var query = { _id: data._id };
                            var id = data._id;

                            query = { _id: objectid(id) };
                            data._id = objectid(id);

                            db.collection(database).deleteOne(query, function (err) {
                                if (err)
                                    resolve(false);
                                else
                                    resolve(true);
                            });

                            db.close();

                        } else {
                            resolve(false);
                        }
                    });
                }
                else {
                    resolve(false);
                }
            } catch (error) {
                console.log(JSON.stringify(error));
                resolve(false);
            }
        });
    };
};