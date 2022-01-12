const basecontroller = require('../framework/basecontroller.js');
const mongodb = require('../framework/mongodbserver.js');
const jwt = require('jsonwebtoken');

const bcrypt = require('bcryptjs');
const saltrounds = 10;
const privatekey = "$2b$10$oXHP/jtC7j8l5Ah69RNS1ufAL1sgcHvOyPCs34neRHG0348oKxzme";

//Email
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

const senderName = 'AIT International School';
const senderEmail = 'aitshare@ait.asia';
const senderPassword = 'AITSolutions#2018$P';

const objectid = require('mongodb').ObjectID;

module.exports = function (response, mongodbport) {
    basecontroller.call(this, response);

    let self = this;
    let mongo = new mongodb(mongodbport);
    let database = "users";

    this.Login = async function (data) {
        if (data && data.fingerprint) {
            if (data.password) {
                data.email = data.email.trim();
                data.password = data.password.trim();

                let query = { email: data.email.trim() };
                let collection = await mongo.FindRecord(database, query, {}, {});

                //No record
                if (!collection.length)
                    return self.Return({
                        err: "Email doesn't exist in our record."
                    });

                let user = collection[0];

                if (!user.encrypted) {
                    //Password is not encrypted yet. Do encryption.
                    if (user.password === data.password) {
                        let salt = bcrypt.genSaltSync(saltrounds);
                        let hash = bcrypt.hashSync(data.password, salt);

                        query = { _id: user._id, password: hash, encrypted: true };
                        let update = await mongo.UpdateRecord(database, query);

                        if (update)
                            return self.InsertAuthentication(user, data.fingerprint);
                        else
                            return self.Return(false);

                    } else
                        return self.Return(false);

                } else {
                    //Password is encrypted.
                    let compare = bcrypt.compareSync(data.password, user.password);

                    if (compare)
                        self.InsertAuthentication(user, data.fingerprint);
                    else
                        return self.Return(false);
                }

            } else if (data.token) {

            } else {
                return self.Return(false);
            }

        } else {
            return self.Return(false);
        }
    };

    this.InsertAuthentication = async function (user, fingerprint) {
        user.encrypted = undefined;
        user.password = undefined;

        let query = { userid: user._id.toString(), fingerprint: fingerprint };
        let authentication = await mongo.FindRecord("authentications", query, {}, {});

        let token = jwt.sign(user, privatekey);

        if (authentication.length) {
            query = { _id: authentication[0]._id, token: token };
            await mongo.UpdateRecord("authentications", query);

        } else {
            query = { userid: user._id.toString(), token: token, fingerprint: fingerprint };
            await mongo.InsertRecord("authentications", query);
        }

        return self.Return({ user: user, token: token });
    };

    this.Verify = async function (data) {
        if (data && data.token && data.fingerprint) {
            let query = { userid: data.userid, token: data.token, fingerprint: data.fingerprint };
            let collection = await mongo.FindRecord("authentications", query, {}, {});

            //No record
            if (!collection.length)
                return self.Return(false);

            try {
                query = { _id: data.userid };

                let user = await mongo.FindRecord(database, query);
                return self.Return(user[0]);

            } catch (error) {
                return self.Return(false);
            }
        }
    };

    this.Authenticate = async function (data) {
        return new Promise((resolve, reject) => {
            try {
                if (data && data.token && data.fingerprint) {
                    let query = { userid: data.userid, token: data.token, fingerprint: data.fingerprint };
                    mongo.FindRecord("authentications", query).then(function (collection) {
                        if (collection.length)
                            resolve(true);
                        else
                            resolve(false);
                    });
                } else
                    resolve(false);

            } catch (error) {
                console.log(JSON.stringify(error));
                resolve(false);
            }
        });
    };

    this.Register = async function (data) {
        let query = { email: data.email.trim() };
        let collection = await mongo.FindRecord(database, query, {}, {});

        //No record
        if (collection.length) {
            return self.Return({
                err: "Email already exists in our record. If you cannot remember your password, please click the Reset Password button."
            });
        } else {
            let query = {
                name: data.name,
                email: data.email,
                password: data.password,
                usertype: "student",
                admin: false,
                organization: data.organization,
                position: data.position,
                country: data.country,
                nationality: data.nationality,
                gender: data.gender,
                involvement: data.involvement,
                expectation: data.expectation
            };
            let newuser = await mongo.InsertRecord(database, query);
            let _query = { email: data.email };
            let _collection = await mongo.FindRecord(database, _query, {}, {});

            if (_collection.length === 1) {
                for (let i = 0; i < _collection.length; i++) {
                    let query2 = { courseid: "601cae6e0c6fe63f08120ca3", userid: _collection[i]._id.toString() };
                    await mongo.InsertRecord("usercourse", query2);
                    return self.Return(_collection[0]);
                    // self.Login(data);
                }
            }
            else {
                return self.Return({
                    err: "Cannot enroll user to the course"
                })
            }

        }
    };

    this.Update = async function (data) {
        // let authenticated = await self.Authenticate(data.credentials);

        // if (authenticated) {
        // delete data.credentials;
        if (data._id) {
            await mongo.UpdateRecord(database, data);
            return self.Return(true);
        }

        // } 
        else
            return self.Return(false);
    };

    this.Delete = async function (data) {

        if (data._id) {
            let update = await mongo.DeleteRecord(database, data);
            return self.Return(update);
        } else {
            return self.Return(false);
        }

    };

    this.ResetPassword = async function (data) {
        let query = { email: data.email.trim() };
        let collection = await mongo.FindRecord(database, query, {}, {});

        //No record
        if (collection.length) {
            let uuid = require('uuid');
            let guid = uuid.v4();

            let salt = bcrypt.genSaltSync(saltrounds);
            let hash = bcrypt.hashSync(guid, salt);

            query = { _id: collection[0]._id, reset: hash };
            await mongo.UpdateRecord("users", query);

            //Send email containing this reset link
            let link = "http://203.159.16.4:1900?reset=" + hash + "&email=" + data.email.trim();

            let receivers = [data.email.trim()];
            let message = {
                subject: "AITIS - Request to Reset Password",
                message: "<div>Dear Parent,</div>" +
                    "<div>&nbsp;<div>" +
                    "<div>You have requested to reset your password.<div>" +
                    "<div>Please click the link below to proceed.<div>" +
                    "<a href='" + link + "'>" + link + "</div>" +
                    "<div>If you didn't requested this, please ignore this email.<div>" +
                    "<div>&nbsp;<div>" +
                    "<div>Best regards,<div>" +
                    "<div>AITIS<div>"
            };

            self.SendEmail(message, receivers);
            return self.Return(true);

        } else {
            return self.Return({
                err: "Email doesn't exists in our record."
            });
        }
    };

    this.UpdatePassword = async function (data) {
        let query = { email: data.email.trim(), reset: data.reset };
        let collection = await mongo.FindRecord(database, query, {}, {});

        //No record
        if (collection.length) {
            let query = { _id: collection[0]._id, password: data.password, encrypted: false, reset: undefined };
            await mongo.UpdateRecord("users", query);
            return self.Return(true);

        } else {
            return self.Return({
                err: "Request to update password not valid. Please request a new one."
            });
        }
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

    this.Get = async function (data) {
        // let authenticated = await self.Authenticate(data);

        // if (authenticated) {
        let collection = await mongo.FindRecord(database, {}, ["_id", "name", "email"], {});

        return self.Return(collection);

        // } else {
        //     return self.Return([]);
        // }
    };

    this.GetStudentList = async function (data) {
        // let authenticated = await self.Authenticate(data);

        // if (authenticated) {
        let query = { usertype: "student" };
        let collection = await mongo.FindRecord(database, query, {}, {});

        return self.Return(collection);

        // } else {
        //     return self.Return([]);
        // }
    };

    this.GetByUserId = async function (data) {
        let authenticated = await self.Authenticate(data.credentials);

        if (authenticated) {
            let query = { _id: objectid(data.userid) };
            let collection = await mongo.FindRecord(database, query, {}, {});

            return self.Return(collection);

        } else {
            return self.Return([]);
        }
    };

};