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
    let database = "slides";

    // const users = new userscontroller(response, mongodbport);

    this.Get = async function (data) {
        let authenticated = await users.Authenticate(data.credentials);
        // let _module = await modules.Get(data);

        // if (authenticated && data.userid) {
        let query = { presentationid: data.presentationid };
        let collection = await mongo.FindRecord(database, query, {}, {});
        // let collection = await mongo.FindRecord(database);
        return self.Return(collection);

        // } else {
        //     return self.Return([]);
        // }
    };

    this.GetById = async function (data) {
        let query = { _id: data.id };
        let collection = await mongo.FindRecord(database, query, {}, {});
        return self.Return(collection);
    };

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

    this.Upload = async function (data, files) {
        if (data.options) {
            data = JSON.parse(data.options);
            // let authenticated = await users.Authenticate(data.credentials);

            // if (authenticated) {

            for (var name in files) {
                let upload = await self.UploadFile(files, data);

                if (upload) {
                    let field = data.field;

                    data = { _id: data._id };
                    // data[field] = upload;
                    data[field] = upload.filename;
                    await mongo.UpdateRecord(database, data);
                    break;
                }
            }


            // if (temp) {
            //     let query = { _id: data._id };
            //     let collection = await mongo.FindRecord(database, query);

            //     return self.Return(collection);
            // }
            return self.Return(true);

            // } else {
            //     return self.Return(false);
            // }
        } else {
            return self.Return(false);
        }
    };

    this.UploadFile = async function (files, data) {
        return new Promise((resolve, reject) => {
            for (var name in files) {
                if (Array.isArray(files[name])) {
                    let results = [];

                    for (let i = 0; i < files[name].length; i++) {
                        // self.SaveFile(files[name][i], { directory: "./public/presentation/" + data.modtitle + "/" + data.presid + "/" }).then(function (upload) {
                        self.SaveFile(files[name], { directory: "./public/presentation/" }).then(function (upload) {
                            if (upload)
                                results.push(upload);

                            if (i === files[name].length - 1)
                                resolve(results);
                        });
                    }
                } else {
                    // self.SaveFile(files[name], { directory: "./public/presentation/" + data.modtitle + "/" + data.presid + "/" }).then(function (upload) {
                    self.SaveFile(files[name], { directory: "./public/presentation/" }).then(function (upload) {
                        if (upload) {

                            // let field = data.field;

                            // data = { _id: data._id };
                            // data[field] = upload.filename;
                            // mongo.UpdateRecord(database, data);

                            resolve(upload);
                        } else
                            resolve(false);
                    });
                }
            }
        });
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

    this.GetByPresentationId = async function (data) {
        let query = { presentationid: data._id };
        let collection = await mongo.FindRecord(database, query, {}, {});
        return self.Return(collection);
    };

    this.DeleteDetails = async function (data) {
        // let authenticated = await users.Authenticate(data.credentials);

        // if (authenticated) {
        if (data._id) {
            let update = await mongo.DeleteRecord(database, data);
            return self.Return(update);
        } else {
            return self.Return(false);
        }

       
    };

    this.DeleteDetailsbyPresentationId = async function (data) {
        // let authenticated = await users.Authenticate(data.credentials);

         //if (authenticated) {
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

            //let query = { presentationid: data._id };
            //let update = await mongo.DeleteRecordByQuery(database, query);
            //return self.Return(update);
          
    };
};