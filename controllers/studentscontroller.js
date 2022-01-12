const basecontroller = require('../framework/basecontroller.js');
const mongodb = require('../framework/mongodbserver.js');
const userscontroller = require('./userscontroller.js');
const objectid = require('mongodb').ObjectID;

//Email
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

const senderName = 'AIT International School';
const senderEmail = 'aitisapp@ait.asia';
const senderPassword = 'Enx@2ytk';

// const senderEmail = 'aitshare@ait.asia';
// const senderPassword = 'AITSolutions#2018$P';

module.exports = function (response, mongodbport) {
    basecontroller.call(this, response);

    let self = this;
    let mongo = new mongodb(mongodbport);
    let users = new userscontroller(response, mongodbport);
    let database = "students";

    this.Get = async function (data) {
        let authenticated = await users.Authenticate(data.credentials);

        if (authenticated && data.parentid) {
            let query = { parentid: data.parentid };
            let collection = await mongo.FindRecord(database, query, {}, {});
            return self.Return(collection);

        } else {
            return self.Return([]);
        }
    };

    this.GetAll = async function (data) {
        let authenticated = await users.Authenticate(data.credentials);

        if (authenticated) {
            let collection = await mongo.FindRecord("users", { _id: data.credentials.userid });

            if (collection.length && collection[0].admin) {
                collection = await mongo.FindRecord(database);
                return self.Return(collection);

            } else {
                return self.Return([]);
            }

        } else {
            return self.Return([]);
        }
    };

    this.Insert = async function (data) {
        let authenticated = await users.Authenticate(data.credentials);

        if (authenticated) {
            delete data.credentials;

            if (data._id) {
                await mongo.UpdateRecord(database, data);
            } else {
                await mongo.InsertRecord(database, data);

                let query = { parentid: data.parentid };
                let student = await mongo.FindRecord(database, query);
                
                data._id = student[student.length - 1]._id;
            }

            return self.Return(data._id);

        } else
            return self.Return(false);
    };

    this.Submit = async function (data) {
        let authenticated = await users.Authenticate(data.credentials);

        if (authenticated) {
            delete data.credentials;

            if (data._id) {
                await mongo.UpdateRecord(database, data);
            } else {
                await mongo.InsertRecord(database, data);
            }

            //Query Admin Email
            let adminsemail = [];
            let query = { _id: objectid(data.parentid) };

            let collection = await mongo.FindRecord("users", {}, ["_id", "name", "email", "admin"], {});

            if (collection) {
                for (let i = 0; i < collection.length; i++) {
                    if (collection[i].admin) {
                        adminsemail.push(collection[i].email);
                    }

                }
            }

            let res = await mongo.FindRecord("users", query, ["_id", "name", "email"], {});
            let parentemail = res[0].email;



            //Send email containing this reset link
            let link = "http://aitisapp.ait.ac.th?id=" + data._id;

            // let receivers = adminsemail;
            let messagetoparent = {
                subject: "AITIS - Submission Completed",
                message: "<div>Dear Parent,</div>" +
                    "<div>&nbsp;<div>" +
                    "<div>Thank you for filling out your information!. Student Information has been received.<div>" +
                    "<div>Please click the link below to view your information.<div>" +
                    "<a href='" + link + "'>" + link + "</div>" +
                    "<div>Best regards,<div>" +
                    "<div>AITIS Application Administrator<div>"
            };

            let messagetoadmin = {
                subject: "AITIS - New Application Received",
                message: "<div>Dear Admin,</div>" +
                    "<div>&nbsp;<div>" +
                    "<div>A new application has been submitted.<div>" +
                    "<div>Please click the link below to view the application.<div>" +
                    "<a href='" + link + "'>" + link + "</div>" +
                    "<div>&nbsp;<div>" +
                    "<div>Best regards,<div>" +
                    "<div>AITIS Application Administrator<div>"
            };

            self.SendEmail(messagetoparent, parentemail);
            self.SendEmail(messagetoadmin, adminsemail);
            return self.Return(data);

        } else
            return self.Return(false);
    };

    this.SendEmail = function (data, receivers) {
        return new Promise((resolve, reject) => {
            let transporter = nodemailer.createTransport(smtpTransport({
                service: 'gmail',
                host: 'smtp.gmail.com',
                auth: {
                    user: senderEmail,
                    pass: senderPassword
                }
            }));

            let mailOptions = {
                from: senderName + "<" + senderEmail + ">",
                to: receivers,
                subject: data.subject,
                html: data.message
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    resolve(false);
                } else {
                    resolve(true);
                    console.log("Email sent!");
                }
            });
        });
    };

    this.Upload = async function (data, files) {
        if (data.options) {
            data = JSON.parse(data.options);
            let authenticated = await users.Authenticate(data.credentials);

            if (authenticated) {

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

            } else {
                return self.Return(false);
            }
        } else {
            return self.Return(false);
        }
    };
};