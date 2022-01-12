const basecontroller = require('../framework/basecontroller.js');
const mongodb = require('../framework/mongodbserver.js');
const userscontroller = require('./userscontroller.js');
// const modulescontroller = require('./modulescontroller.js');

module.exports = function (response, mongodbport) {
    basecontroller.call(this, response, mongodbport);

    let self = this;
    let mongo = new mongodb(mongodbport);
    let users = new userscontroller(response, mongodbport);
    // let modules = new modulescontroller(response, mongodbport);
    let database = "presentation";

    // const users = new userscontroller(response, mongodbport);

    this.Get = async function (data) {
        let authenticated = await users.Authenticate(data.credentials);
        // let _module = await modules.Get(data);

        // if (authenticated && data.userid) {
        let query = { moduleid: data.moduleid };
        let collection = await mongo.FindRecord(database, query, {}, {});
        // let collection = await mongo.FindRecord(database);
        return self.Return(collection);

        // } else {
        //     return self.Return([]);
        // }
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

        // await mongo.InsertRecord(database, data);
        // return self.Return(true);

        // let authenticated = await users.Authenticate(data.credentials);

        // if (authenticated) {
        //     delete data.credentials;

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

        return self.Return(true);

        // } else
        //     return self.Return(false);

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

    this.UploadReference = async function (data, files) {
        if (data.options) {
            data = JSON.parse(data.options);
            let authenticated = await users.Authenticate(data.credentials);

            // if (authenticated) {

            for (var name in files) {
                let upload = await self.UploadFile(files);

                if (upload) {
                    let field = data.field;

                    if (data._id) {
                        data = { _id: data._id };
                        data[field] = upload.filename;
                        data["originalname"] = upload.name;
                        await mongo.UpdateRecord(database, data);
                    }
                    else {
                        data[field] = upload.filename;
                        data["originalname"] = upload.name;
                        await mongo.InsertRecord(database, data);
                    }
                    
                    

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

        //if (authenticated) {
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