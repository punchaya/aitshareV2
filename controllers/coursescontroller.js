const basecontroller = require('../framework/basecontroller.js');
const mongodb = require('../framework/mongodbserver.js');
const userscontroller = require('./userscontroller.js');
const objectid = require('mongodb').ObjectID;

module.exports = function (response, mongodbport) {
    basecontroller.call(this, response, mongodbport);

    let self = this;
    let mongo = new mongodb(mongodbport);
    let users = new userscontroller(response, mongodbport);
    let database = "courses";

    // const users = new userscontroller(response, mongodbport);

    this.Get = async function (data) {
        let authenticated = await users.Authenticate(data.credentials);

        // if (authenticated && data.userid) {
            let query = { userid: data.userid };
            // let collection = await mongo.FindRecord(database, query, {}, {});
            let collection = await mongo.FindRecord(database);
            return self.Return(collection);

        // } else {
        //     return self.Return([]);
        // }
    };

    this.GetCoursesByUserId = async function (data) {
        //let authenticated = await users.Authenticate(data.credentials);
        // if (authenticated && data.userid) 
        if (data.userid) {
            let query = { userid: data.userid };
            let coursedata = [];
            let collection1 = await mongo.FindRecord("usercourse", query, {}, {});

            if (collection1) {
                for (let i = 0; i < collection1.length; i++) {
                    let cid = { _id: collection1[i].courseid };
                    let collection2 = await mongo.FindRecord(database, cid, {}, {});
                    if (collection2) {
                        coursedata.push(collection2[0]);

                    } else {
                        return self.Return([]);
                    }
                }
                return self.Return(coursedata);
            } else {
                return self.Return([]);
            }

            // return self.Return(collection);

        } else {
            return self.Return([]);
        }
    };

    this.GetCoursesByCourseId = async function (coursedata) {
        //let authenticated = await users.Authenticate(coursedata.credentials);

        // if (authenticated && coursedata)
        if (coursedata) {
            let query = { _id: coursedata.courseid };

            let collection = await mongo.FindRecord(database, query, {}, {});

            return self.Return(collection);

        } else {
            return self.Return([]);
        }
    };

    this.Insert = async function (data) {
        // let authenticated = await users.Authenticate(data.credentials);

        // if (authenticated) {
        //     //Must do before insert
        //     delete data.credentials;
        //     data = data;
        //     // data = data.data;

        //     let insert = await mongo.InsertRecord(database, data);
        //     return self.Return(insert);

        // } else {
        //     return self.Return([]);
        // }

        // let authenticated = await users.Authenticate(data.credentials);

        // if (authenticated) {
        // delete data.credentials;

        if (data._id) {
            await mongo.UpdateRecord(database, data);
        } else {
            await mongo.InsertRecord(database, data);

            let query = { userid: data.userid };
            let student = await mongo.FindRecord(database, query);

            // data._id = student[student.length - 1]._id;
            data._id = student[student.length - 1];
        }

        return self.Return(data._id);

        // } else
        //     return self.Return(false);
    };

    this.Upload = async function (data, files) {
        if (data.options) {
            data = JSON.parse(data.options);
            let authenticated = await users.Authenticate(data.credentials);

            // if (authenticated) {

            for (var name in files) {
                let upload = await self.UploadFile(files);

                if (upload) {
                    let field = data.field;

                    data = { _id: data._id };
                    data[field] = upload;
                    await mongo.UpdateRecord(database, data);
                    break;
                }
            }

            return self.Return(false);

            // } else {
            //     return self.Return(false);
            // }
        } else {
            return self.Return(false);
        }
    };

    this.UpdateField = async function (data) {
        let authenticated = await users.Authenticate(data.credentials);

        if (authenticated) {
            let query = { _id: data._id };

            if (Array.isArray(data.field)) {
                for (let i = 0; i < data.field.length; i++)
                    query[data.field[i]] = data[data.field[i]];

            } else
                query[data.field] = data[data.field];

            collection = await mongo.UpdateRecord(database, query);
            return self.Return(true);

        } else
            return self.Return(false);
    };

    this.GetDetails = async function (data) {
        let authenticated = await users.Authenticate(data.credentials);

        if (authenticated) {
            let collection = await mongo.FindRecord(data.details, data.query);
            return self.Return(collection);

        } else {
            return self.Return([]);
        }
    };

    //zin
    this.InsertDetails = async function (data) {
        let authenticated = await users.Authenticate(data.credentials);

        if (authenticated) {
            delete data.credentials;


            var query = {

                title: data.coursetitle,
                //authorid:
                authorname: data.faculty.text,
                //category:
                //subcategory:
                //file:
                description: data.coursedesc,
                //image:data.image,
                //order:
                //length:
                //deleted:
                //url:
                dateentered: Date(),
                year: data.year.text,
                semester: data.semester.text
                //userid:data.parentid//

            }


            //if (data.parentid) {//data._id
            //let update = await mongo.UpdateRecord(database, data);
            //return self.Return(update);

            let insert = await mongo.InsertRecord(database, query);
            return self.Return(insert);

            //}
            // else {
            // if (Array.isArray(data.data)) {
            //     let insert = [];

            //     for (let i = 0; i < data.data.length; i++)//data.data.length
            //         insert.push(await mongo.InsertRecord(data.details, data.data[i]));//data.details, data.data[i])

            //     return self.Return(insert);

            // } else {
            //     let insert = await mongo.InsertRecord(data.details, data.data);//data.details, data.data
            //     return self.Return(insert);
            // }
            //}


        } else {
            return self.Return([]);
        }
    };



    this.DeleteDetails = async function (data) {
        // let authenticated = await users.Authenticate(data.credentials);

        // if (authenticated) {
            if (data._id) {
                let update = await mongo.DeleteRecord(data.details, data);
                return self.Return(update);
            } else {
                return self.Return(false);
            }

        // } else {
        //     return self.Return(false);
        // }
    };
};