// AIT Student
var studentview = function (param) {
    let self = this;
    let model;
    let children = $COURSE;
    let viewparent;
    let tablecontainer;
    let readonly = false;
    let progcontainer_;
    let comparepercent;

    let modlistwithdata;
    let modlistwithdata_ = [];
    let modlistquiz = [];

    let alldatalogsbyid = [];

    let studentname;
    let studentcont;
    let studentlist;

    if (param) {
        if (param.model)
            model = param.model;

        if (param.children)
            children = param.children;

        if (param.readonly)
            readonly = param.readonly;
    }

    this.Show = function (parent) {
        viewparent = parent;
        viewparent.Clear();

        tablecontainer = new mobiwork.Container();
        tablecontainer.Show(parent);

        self.ShowAllStudents();
    };

    this.ShowAllStudents = function () {
        let studentscrollcontainer = new mobiwork.ScrollContainer({ class: "student" });

        let studentid;
        let studentprogress;
        let name;
        let email;
        let password;
        mobiwork.POST($API + "users/GetStudentList", JSON.stringify()).then(function (response) {
            studentcont = studentscrollcontainer.Add(new mobiwork.Container({ class: "faq-view" }));
            let stdlist = studentcont.Add(new mobiwork({
                text: "Student List",
                class: "contheader-text"
            }));
            stdlist.Add(new mobiwork.ToolbarButton({
                text: "Add New Student",
                icon: "plus",
                class: "button-save",
                onclick: function () {
                    let form = new mobiwork.Form({
                        text: "Add New Student",
                        width: 500,
                        height: window.innerHeight * 0.65,
                        showfooter: true,
                        onok: function () {
                            if (regname.value && regemail.value && regpassword.value && regverpassword.value) {
                                name = regname.value.trim();
                                email = regemail.value.trim();
                                password = regpassword.value.trim();

                                if (mobiwork.ValidateEmail(email)) {
                                    if (password !== "" && password === regverpassword.value.trim())
                                        self.Register(name, email, password);
                                    else {
                                        let message = new mobiwork.MessageBox({
                                            text: "Error",
                                            message: "Passwords are not matching.",
                                            icon: "alert-circle-outline"
                                        });

                                        message.Show();
                                    }
                                } else {
                                    let message = new mobiwork.MessageBox({
                                        text: "Error",
                                        message: "Please enter a valid email address.",
                                        icon: "alert-circle-outline"
                                    });

                                    message.Show();
                                }
                            } else {
                                let message = new mobiwork.MessageBox({
                                    text: "Error",
                                    message: "Please fill-up all the required information.",
                                    icon: "alert-circle-outline"
                                });

                                message.Show();
                            }
                        }
                    });

                    let regname = form.Add(new mobiwork.InputText({ text: "Name" }));
                    let regemail = form.Add(new mobiwork.InputText({ text: "Email", type: "email" }));
                    let regpassword = form.Add(new mobiwork.InputText({ type: "password", text: "Password" }));

                    let regverpassword = form.Add(new mobiwork.InputText({
                        class: "input-hint",
                        type: "password",
                        text: "Reenter password",
                        onupdate: function () {
                            if (regpassword.value !== regverpassword.value)
                                info.icon = "close-circle";
                            else
                                info.icon = "check-circle";

                            info.Refresh();
                        }
                    }));

                    form.Show();
                }

            }));
            if (response) {

                for (let i = 0; i < response.length; i++) {
                    studentid = response[i]._id;
                    studentlist = studentcont.Add(new mobiwork.List({
                        text: response[i].name,
                        icon: "account",
                        class: "student-list",
                        onclick: function () {
                            let query = { userid: response[i]._id };

                            studentname = response[i].name;
                            mobiwork.POST($API + "modules/GetModulesByCourseId", JSON.stringify(query)).then(function (response_) {
                                if (response_) {
                                    let counter = 0;

                                    for (let ii = 0; ii < response_.length; ii++) {

                                        let modulepercent = { userid: response[i]._id, moduleid: response_[ii]._id };
                                        mobiwork.POST($API + "userpresentationlog/SummaryLogWithUserQuiz", JSON.stringify(modulepercent)).then(function (responselog_) {
                                            if (responselog_) {
                                                counter++;
                                                // modlistwithdata_.push({ title: response_[ii].title, percent: responselog_[0].percentage, order: counter, score: responselog_[0].quizdata.score, remarks: responselog_[0].quizdata.remarks });
                                                modlistwithdata_.push({ title: response_[ii].title, percent: responselog_[0].percentage, order: counter, quizdata: responselog_[0].quizdata });

                                            } else {
                                                counter++;
                                                // modlistwithdata_.push({ title: response_[ii].title, percent: 0, order: counter, score: responselog_[0].quizdata.score, remarks: responselog_[0].quizdata.remarks });
                                                modlistwithdata_.push({ title: response_[ii].title, percent: 0, order: counter, quizdata: responselog_[0].quizdata });

                                            }

                                            if (ii === response_.length - 1) {
                                                modlistwithdata_.sort(function (a, b) {
                                                    _a = parseInt(a.order);
                                                    _b = parseInt(b.order);

                                                    if (_a > _b)
                                                        return 1;
                                                    else if (_a < _b)
                                                        return -1;
                                                    else
                                                        return 0;
                                                });
                                                self.ShowProgress();
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    }));
                    let toolbaredit = studentlist.Add(new mobiwork.ToolbarButton({
                        class: "edit-glossary",
                        icon: "pencil",
                        text: "",
                        onclick: function () {
                            let form = new mobiwork.Form({
                                text: "Edit Student Information",
                                width: 600,
                                height: window.innerHeight * 0.95,
                                showfooter: true,
                                onok: function () {
                                    let items = [];
                                    items.push({
                                        _id: response[i]._id,
                                        name: stdname.value,
                                        email: stdemail.value,
                                        organization: stdorg.value,
                                        position: stdposition.value,
                                        country: stdcountry.value.text,
                                        nationality: stdnationality.value.text,
                                        gender: stdgender.value.text,
                                        involvement: gcfinvolve.value,
                                        expectation: expectation.value
                                    });
                                    mobiwork.POST($API + "users/Update", JSON.stringify(items[0])).then(function (response) {
                                        if (response) {

                                            let message = new mobiwork.MessageBox({
                                                text: "Message",
                                                message: "The record has been updated!",
                                                showcancel: false

                                            });
                                            studentlist.Clear();
                                            studentcont.Clear();
                                            self.ShowAllStudents();
                                            message.Show();

                                        }
                                    });
                                }
                            });

                            let _nationality_ = [];
                            for (let i = 0; i < nationality.length; i++) {
                                _nationality_.push({ text: nationality[i] });
                            }

                            let _country_ = [];
                            for (let ii = 0; ii < country.length; ii++) {
                                _country_.push({ text: country[ii] });
                            }

                            let stdname = form.Add(new mobiwork.InputText({ text: "Name", value: response[i].name }));
                            let stdemail = form.Add(new mobiwork.InputText({ text: "Email", type: "email", value: response[i].email }));
                            let stdorg = form.Add(new mobiwork.InputText({ text: "Organization", value: response[i].organization }));
                            let stdposition = form.Add(new mobiwork.InputText({ text: "Position", value: response[i].position }));
                            let stdcountry = form.Add(new mobiwork.InputDataList({ text: "Country", list: _country_, value: response[i].country }));
                            let stdnationality = form.Add(new mobiwork.InputDataList({ text: "Nationality", list: _nationality_, value: response[i].nationality }));
                            let stdgender = form.Add(new mobiwork.InputDataList({ text: "Gender", list: [{ text: "Man" }, { text: "Woman" }, { text: "Other" }, { text: "Prefer not to say" }], value: response[i].gender }));
                            let gcfinvolve = form.Add(new mobiwork.InputText({ text: "GCF Involvement", value: response[i].involvement }));
                            let expectation = form.Add(new mobiwork.InputTextArea({ text: "Expectation", value: response[i].expectation }));

                            gcfinvolve.readonly = true;
                            expectation.readonly = true;

                            form.Show();
                        }
                    }));

                    let toolbardel = studentlist.Add(new mobiwork.ToolbarButton({
                        class: "delete-glossary", icon: "trash-can-outline", text: "",
                        onclick: function () {
                            let message = new mobiwork.MessageBox({
                                text: "Confirmation",
                                message: "Would you like to delete this record?",
                                showcancel: true,
                                onok: function () {
                                    let query = { _id: response[i]._id }
                                    mobiwork.POST($API + "users/Delete", JSON.stringify(query)).then(function (response) {
                                        if (response) {

                                            let message = new mobiwork.MessageBox({
                                                text: "Delete Record",
                                                message: "This record has been deleted!",
                                                showcancel: false
                                            });

                                            studentlist.Clear();
                                            studentcont.Clear();
                                            self.ShowAllStudents();
                                            message.Show();


                                        } else {
                                            let message = new mobiwork.MessageBox({
                                                text: "Error",
                                                message: "Unable to delete data.",
                                                showcancel: false
                                            });

                                            message.Show();
                                        }
                                    });
                                }
                            });

                            message.Show();


                        }
                    }));
                }
            }
            else {
                studentcont.Add(new mobiwork.List({
                    text: "There are no registered student",
                    icon: "",
                    class: "student-list"
                }));
            }

            studentscrollcontainer.Show(tablecontainer);
        });
    };

    this.ShowProgress = function () {
        let progscontainer = new mobiwork.ScrollContainer({ class: "student-progress-scontainer" });
        let progcontainer1;
        let progcontainer2;
        let llst1;
        let lprcent;
        let lquiztitle;
        let lquizscore;
        let lstatus;

        let progressheadercont = progscontainer.Add(new mobiwork.Container({ class: "progressheadercont" }));
        progressheadercont.Add(new mobiwork({ text: studentname + " Report", icon: "book", class: "contheader" }));
        // progressheadercont.Add(new mobiwork({ text: "MODULES", class: "progressheadercont1" }));
        progressheadercont.Add(new mobiwork({ text: "Module", class: "progressheadercont2" }));
        progressheadercont.Add(new mobiwork({ text: "Quiz Score", class: "progressheadercont3" }));
        progressheadercont.Add(new mobiwork({ text: "Status", class: "progressheadercont4" }));

        for (let i = 0; i < modlistwithdata_.length; i++) {
            progcontainer1 = progscontainer.Add(new mobiwork.Container({ class: "student-list-progress-container" }));
            llst1 = progcontainer1.Add(new mobiwork.List({
                text: modlistwithdata_[i].title,
                // icon: "account",
                icon: $PUBLIC + "/images/mbanner.jpg",
                class: "student-list-progress",
                onclick: function () {

                }
            }));

            lprcent = progcontainer1.Add(new mobiwork.ProgressBarRRCAP({ percentage: Number(modlistwithdata_[i].percent) }));
            lprcent.class += " student-list-progress-bar";

            for (let ii = 0; ii < modlistwithdata_[i].quizdata.length; ii++) {
                progcontainer2 = progscontainer.Add(new mobiwork.Container({ class: "student-list-progress-container" }));

                let qdata = modlistwithdata_[i].quizdata[ii].quizdata;

                lquiztitle = progcontainer2.Add(new mobiwork({ class: "student-list-progress-qtitle", text: qdata.title, icon: "format-list-checks" }));

                // lquizscore = progcontainer2.Add(new mobiwork({ class: "student-list-progress-score", text: Number(qdata.score) }));
                lquizscore = progcontainer2.Add(new mobiwork({ class: "student-list-progress-score", text: Number(qdata.scorepercent) + "%" }));

                lstatus = progcontainer2.Add(new mobiwork({ class: "student-list-progress-text", text: qdata.remarks }));
            }
        }

        progscontainer.Show(tablecontainer);
    };

    this.Register = function (name, email, password) {
        mobiwork.FingerPrint(function (fingerprint) {
            mobiwork.POST($API + "users/Register", JSON.stringify({
                name: name,
                email: email,
                password: password,
                fingerprint: fingerprint

            })).then(function (response) {
                if (response) {
                    //Set user
                    // self.user = response.user;

                    // //Store
                    // response.userid = response.user._id;
                    // response.user = self.user;

                    // delete response.fingerprint;

                    // self.userid = self.user._id;
                    // self.token = response.token;
                    // self.fingerprint = fingerprint;

                    let message = new mobiwork.MessageBox({
                        text: "Message",
                        message: "New student has been enrolled!",
                        showcancel: false

                    });
                    studentlist.Clear();
                    studentcont.Clear();
                    self.ShowAllStudents();
                    message.Show();

                    // localStorage.setItem($BUNDLEID, JSON.stringify(response));
                    // location.reload();

                } else {
                    let error = response.err || "Unable to register!";

                    let message = new mobiwork.MessageBox({
                        text: "Error",
                        message: error,
                        icon: "alert-circle-outline"
                    });

                    message.Show();
                }
            }, function () {
                let message = new mobiwork.MessageBox({
                    text: "Unable to connect to the server. Please try again later.",
                    icon: "alert-circle-outline"
                });

                message.Show();
            });
        });
    };



    //----------------------------------------------------------------------------------------------------------------------------------------------------------

    // this.ShowLeftPanel = function (parent) {
    //     let container = new mobiwork.ScrollContainer();
    //     let thumbnailmodule = container.Add(new mobiwork.ThumbnailContainer());
    //     let modulethumb;

    //     let data = { courseid: "5fd04437aa7adb0d57fac597" };

    //     mobiwork.POST($API + "modules/Get", JSON.stringify(data)).then(function (response) {
    //         if (response) {
    //             response.sort(function (a, b) {
    //                 _a = parseInt(a.order);
    //                 _b = parseInt(b.order);

    //                 if (_a > _b)
    //                     return 1;
    //                 else if (_a < _b)
    //                     return -1;
    //                 else
    //                     return 0;
    //             });

    //             for (let i = 0; i < response.length; i++) {

    //                 modulethumb = thumbnailmodule.Add(new mobiwork.Container({ class: "course-container" }));

    //                 if (response[i].image)
    //                     modulethumb.Add(new mobiwork.Thumbnail({ icon: $PUBLIC + "/images/" + response[i].image, data: response[i], onclick: self.ShowContentView }));
    //                 else
    //                     modulethumb.Add(new mobiwork.List({ icon: $PUBLIC + "/images/mbanner.jpg", data: response[i], onclick: self.ShowContentView, class: "no-image-container" }));

    //                 modulethumb.Add(new mobiwork.List({ text: response[i].title, data: response[i], onclick: self.ShowContentView, class: "module-title" }));

    //                 for (let ii = 0; ii < comparepercent.length; ii++) {
    //                     let p;
    //                     if (comparepercent.length !== 0) {
    //                         if (response[i]._id === comparepercent[ii].moduleid) {
    //                             p = comparepercent[ii].percent;
    //                             modulethumb.Add(new mobiwork.ProgressBarRRCAP({ percentage: p }));
    //                         }
    //                     }

    //                     modulethumb.Refresh();
    //                 }

    //                 // tablecontainer.Clear();

    //                 // container.Show(tablecontainer);

    //                 // back.Show(tablecontainer);

    //             }

    //         }
    //         if (parent)
    //             container.Show(parent);
    //         else
    //             progcontainer_.Set(0, container);
    //     });


    // };

    // this.ShowRightPanel = function (parent) {
    //     let container = new mobiwork.ScrollContainer();
    //     new chat

    //     let chart = container.Add(new Chart(ctx, {
    //         type: 'line',
    //         data: {
    //             datasets: [{
    //                 data: [0, 0],
    //             }, {
    //                 data: [0, 1]
    //             }, {
    //                 data: [1, 0],
    //                 showLine: true // overrides the `line` dataset default
    //             }, {
    //                 type: 'scatter', // 'line' dataset default does not affect this dataset since it's a 'scatter'
    //                 data: [1, 1]
    //             }]
    //         }
    //     }));

    //     if (parent)
    //         container.Show(parent);
    //     else
    //         progcontainer_.Set(1, container);
    // };

    //----------------------------------------------------------------------------------------------------------------------------------------------------------

    // this.ShowCourses = function () {
    //     let data = [];
    //     let name;

    //     for (let i = 0; i < children.length; i++) {
    //         if (children[i].firstname.value && children[i].lastname.value)
    //             name = children[i].firstname.value + " " + children[i].lastname.value;

    //         else if (children[i].firstname.value)
    //             name = children[i].firstname.value;

    //         else if (children[i].lastname.value)
    //             name = children[i].lastname.value;

    //         else
    //             name = "[NO NAME]";

    //         data.push({
    //             name: new mobiwork({ class: "child-name", text: name, data: children[i], onclick: self.EditChild }),
    //             birthdate: children[i].birth.value,
    //             gender: children[i].gender.value ? children[i].gender.value.text : "[NOT SET]",
    //             image: children[i].image.src
    //         });
    //     }

    //     let thumbnail = new mobiwork.ThumbnailContainer();
    //     let student;

    //     if (data.length) {
    //         for (let i = 0; i < data.length; i++) {
    //             if (readonly && !children[i].submitted)
    //                 continue;

    //             student = thumbnail.Add(new mobiwork.Container({ class: "student-container" }));

    //             if (data[i].image)
    //                 student.Add(new mobiwork.Thumbnail({ src: data[i].image, data: children[i], onclick: this.EditChild }));

    //             else if (data[i].gender === "Male")
    //                 student.Add(new mobiwork.Thumbnail({ src: "res/male.png", data: children[i], onclick: this.EditChild }));

    //             else
    //                 student.Add(new mobiwork.Thumbnail({ src: "res/female.png", data: children[i], onclick: this.EditChild }));

    //             student.Add(new mobiwork.List({ text: data[i].name, data: children[i], onclick: this.EditChild }));
    //             student.Add(new mobiwork({ 
    //                 class: "admission-text",
    //                 text: children[i].admission.value.text, 
    //                 data: children[i], 
    //                 onclick: this.EditChild 
    //             }));
    //         }
    //     }

    //     if (!readonly) {
    //         student = thumbnail.Add(new mobiwork.Container({ class: "student-container", onclick: this.AddChild }));
    //         student.Add(new mobiwork({ icon: "account", class: "student-icon" }));
    //         student.Add(new mobiwork.Button({ text: "Add Course", class: "button-save", onclick: this.AddChild }));
    //     }

    //     thumbnail.Show(tablecontainer);
    // };

    // this.ShowInformation = function (parent) {
    //     if (parent) {
    //         this.infoparent = parent;
    //     } else {
    //         parent = this.infoparent;
    //     }

    //     parent.Clear();

    //     let back = new mobiwork({
    //         class: "back-icon", icon: "mdi-arrow-left", onclick: function () {
    //             self.Show(viewparent);
    //         }
    //     });

    //     back.Show(parent);

    //     if (!readonly) {
    //         if (!model.submitted) {
    //             let submit = new mobiwork.Button({
    //                 text: "Submit", class: "button-submit",
    //                 onclick: function () {
    //                     model.Submit(function () {
    //                         model.submitted = true;
    //                         model.Readonly(true);
    //                         self.ShowInformation();
    //                     });
    //                 }
    //             });
    //             submit.Show(parent);

    //             let save = new mobiwork.Button({ text: "Save", class: "button-save", onclick: model.Save });
    //             save.Show(parent);

    //         } else {
    //             let save = new mobiwork.Button({ text: "Edit", class: "button-save", onclick: self.Edit });
    //             save.Show(parent);
    //         }
    //     }

    //     let print = new mobiwork.Button({ icon: "printer", class: "button-print", onclick: self.Print });
    //     print.Show(parent);

    //     tab = new mobiwork.Tab({
    //         class: model.submitted ? "form-readonly" : "form-editable",
    //         children: [
    //             { icon: "card-account-details", text: "Student Information" },
    //             { icon: "school", text: "Previous School" },
    //             { icon: "translate", text: "Languages" },
    //             { icon: "medical-bag", text: "Medical Form" },
    //             { icon: "book-open", text: "Medical Record" }
    //         ]
    //     });

    //     tab.Show(parent);

    //     self.ShowStudentInformation();
    //     self.ShowPreviousSchool();
    //     self.ShowLanguages();
    //     self.ShowMedicalForm();
    //     self.ShowMedicalRecord();
    // };

    // this.ShowStudentInformation = function (parent) {
    //     let container = new mobiwork.Container();

    //     container.Add(new mobiwork.Header({ class: "print-header", text: "Student Information" }));
    //     container.Add(model.image);

    //     model.image.onclick = function (object) {
    //         mobiwork.OpenFile(function (file) {
    //             self.UploadImage([file], object, "image");
    //         });
    //     };

    //     model.image.ondrop = function (files, object) {
    //         self.UploadImage(files, object, "image");
    //     };

    //     container.Add(new mobiwork.Grid({
    //         children: [
    //             model.firstname, model.lastname, model.nickname
    //         ]
    //     }));

    //     container.Add(new mobiwork.Grid({
    //         children: [
    //             model.birth, model.gender
    //         ]
    //     }));

    //     container.Add(new mobiwork.Grid({
    //         children: [
    //             model.nationality, model.country, model.passport
    //         ]
    //     }));

    //     container.Add(model.admission);

    //     container.Add(model.emergencycont);

    //     container.Add(new mobiwork.Grid({
    //         children: [
    //             model.emphone, model.emrelationship
    //         ]
    //     }));

    //     container.Add(model.studliveswith);

    //     if (parent)
    //         container.Show(parent);
    //     else
    //         tab.Set(0, container);
    // };

    // this.ShowPreviousSchool = function (parent) {
    //     let container = new mobiwork.Container();
    //     container.Add(new mobiwork.Header({ class: "print-header", text: "Previous School Attended" }));

    //     prevschoolcont = container.Add(new mobiwork.Container());
    //     prevschoolcont.class = "prevschool_container";

    //     let columns = [
    //         { name: "from", text: "From<br>Mo./Yr." },
    //         { name: "to", text: "To<br>Mo./Yr." },
    //         { name: "grade", text: "Grade<br>Level" },
    //         { name: "school", text: "Name of School" },
    //         { name: "city", text: "City" },
    //         { name: "country", text: "Country" },
    //         { name: "language", text: "Language of<br>Instruction" }
    //     ];

    //     let data = [];

    //     for (let i = 0; i < model.previousschools.length; i++) {
    //         data.push({
    //             from: model.previousschools[i].from.value,
    //             to: model.previousschools[i].to.value,
    //             grade: model.previousschools[i].grade.value,
    //             school: model.previousschools[i].school.value,
    //             city: model.previousschools[i].city.value,
    //             country: model.previousschools[i].country.value.text,
    //             language: model.previousschools[i].language.value ? model.previousschools[i].language.value.text: "",
    //         });
    //     }

    //     let prevschooltable = new mobiwork.Table({
    //         showheader: true,
    //         columns: columns,
    //         data: data,
    //         indexed: true,
    //     });

    //     prevschoolcont.Add(prevschooltable);

    //     if (!model.submitted) {
    //         container.Add(new mobiwork.Button({
    //             text: "Add",
    //             class: "button-save",
    //             onclick: function () {
    //                 let form = new mobiwork.Form({
    //                     text: "Add School Attended",
    //                     width: 500,
    //                     height: 570,
    //                     onok: function () {
    //                         model.previousschools.push(school);
    //                         self.ShowPreviousSchool();
    //                     }
    //                 });

    //                 let school = new schoolmodel();
    //                 form.Add(school.from);
    //                 form.Add(school.to);
    //                 form.Add(school.grade);
    //                 form.Add(school.school);

    //                 form.Add(new mobiwork.Grid({
    //                     children: [
    //                         school.city, school.country
    //                     ]
    //                 }));

    //                 form.Add(school.language);

    //                 form.Show();
    //             }
    //         }));
    //     }

    //     if (parent)
    //         container.Show(parent);
    //     else
    //         tab.Set(1, container);
    // };

    // this.ShowLanguages = function (parent) {
    //     let container = new mobiwork.Container();
    //     container.Add(new mobiwork({ text: "&nbsp;", class: "page-break" }));
    //     container.Add(new mobiwork.Header({ class: "print-header", text: "Languages" }));

    //     container.Add(new mobiwork.Grid({
    //         children: [
    //             model.studlang, model.homelang
    //         ]
    //     }));

    //     container.Add(new mobiwork.Grid({
    //         children: [
    //             model.fatherlang, model.motherlang
    //         ]
    //     }));

    //     container.Add(model.otherinfo);

    //     if (parent)
    //         container.Show(parent);
    //     else
    //         tab.Set(2, container);
    // };

    // this.ShowMedicalForm = function (parent) {
    //     let container = new mobiwork.Container();
    //     container.Add(new mobiwork.Header({ class: "print-header", text: "Medical Form" }));

    //     if (!model.submitted) {
    //         let downloadcontainer = new container.Add(new mobiwork.Container({ class: "download-container" }));
    //         downloadcontainer.Add(new mobiwork({ text: "Please download the Medical and Immunization forms. Attach a scanned copy of the signed forms below." }));

    //         let downloadlink = downloadcontainer.Add(new mobiwork.DownloadForm({
    //             text: "Download Medical Form",
    //             src: "res/Medical.pdf",
    //             filename: "Medical-Form.pdf"
    //         }));
    //         downloadlink.class = "download-form"

    //         let downloadlink1 = downloadcontainer.Add(new mobiwork.DownloadForm({
    //             text: "Download Immunization Form",
    //             src: "res/Medical.pdf",
    //             filename: "Immunization-Form.pdf"
    //         }));
    //         downloadlink1.class = "download-form"
    //     }

    //     container.Add(new mobiwork.Grid({
    //         children: [
    //             model.height, model.weight, model.blood
    //         ]
    //     }));

    //     container.Add(new mobiwork.Grid({
    //         children: [
    //             model.vision, model.hearing
    //         ]
    //     }));

    //     container.Add(new mobiwork.Grid({
    //         children: [
    //             model.skin, model.hair
    //         ]
    //     }));

    //     container.Add(model.limit);

    //     container.Add(new mobiwork({ text: "&nbsp;", class: "page-break" }));

    //     if (print)
    //         container.Add(new mobiwork({ text: "Medical Record", class: "label" }));
    //     else
    //         container.Add(new mobiwork({ text: "Drop or attached Medical Record here", class: "label" }));

    //     container.Add(model.medicalrecord);

    //     if (!model.submitted) {
    //         model.medicalrecord.onclick = function (object) {
    //             mobiwork.OpenFile(function (file) {
    //                 self.UploadImage([file], object, "medicalrecord");
    //             });
    //         };

    //         model.medicalrecord.ondrop = function (files, object) {
    //             self.UploadImage(files, object, "medicalrecord");
    //         };
    //     }


    //     container.Add(new mobiwork({ text: "&nbsp;", class: "page-break" }));

    //     if (print)
    //         container.Add(new mobiwork({ text: "Immunization Record", class: "label" }));
    //     else
    //         container.Add(new mobiwork({ text: "Drop or attached Immunization Record here", class: "label" }));

    //     container.Add(model.immunrecord);

    //     if (!model.submitted) {
    //         model.immunrecord.onclick = function (object) {
    //             mobiwork.OpenFile(function (file) {
    //                 self.UploadImage([file], object, "immunrecord");
    //             });
    //         };

    //         model.immunrecord.ondrop = function (files, object) {
    //             self.UploadImage(files, object, "immunrecord");
    //         };
    //     }

    //     if (parent)
    //         container.Show(parent);
    //     else
    //         tab.Set(3, container);


    //     if (!model.medicalrecord.src) {
    //         model.medicalrecord.object.addClass("image-empty");
    //     }

    //     if (!model.immunrecord.src) {
    //         model.immunrecord.object.addClass("image-empty");
    //     }
    // };

    // this.ShowMedicalRecord = function (parent) {
    //     let container = new mobiwork.Container();
    //     container.Add(new mobiwork({ text: "&nbsp;", class: "page-break" }));
    //     container.Add(new mobiwork.Header({ class: "print-header", text: "Medical Record" }));

    //     container.Add(new mobiwork.Grid({
    //         children: [
    //             model.doctor, model.dphone
    //         ]
    //     }));

    //     container.Add(new mobiwork.Grid({
    //         children: [
    //             model.hospital, model.hphone
    //         ]
    //     }));

    //     container.Add(new mobiwork({ text: "Is the child susceptible to any of the following?", class: "label" }));

    //     container.Add(model.susceptible);
    //     container.Add(model.susceptibleother);

    //     container.Add(new mobiwork.Grid({
    //         children: [
    //             model.food, model.drug
    //         ]
    //     }));
    //     container.Add(new mobiwork.Grid({
    //         children: [
    //             model.other, model.dietary
    //         ]
    //     }));
    //     container.Add(new mobiwork.Grid({
    //         children: [
    //             model.visual, model.aural
    //         ]
    //     }));

    //     container.Add(new mobiwork.Grid({
    //         children: [
    //             model.physical, model.attention
    //         ]
    //     }));

    //     container.Add(model.relevantinfo);

    //     container.Add(new mobiwork({ text: "In case of an emergency, if the school cannot contact the person above the child will be taken to Thammasat Hospital or the AIT Clinic.", class: "info-more" }));

    //     if (parent)
    //         container.Show(parent);
    //     else
    //         tab.Set(4, container);
    // };

    // this.ShowApproval = function () {
    //     let container = new mobiwork.Container();
    //     container.Add(new mobiwork({ text: "&nbsp;", class: "page-break" }));

    //     container.Add(new mobiwork({ text: "Drop or attached Student Accommodation Officer's Approval(for AIT Students)", class: "label" }));

    //     container.Add(model.accommodation);

    //     model.accommodation.onclick = function (object) {
    //         mobiwork.OpenFile(function (file) {
    //             var reader = new FileReader();
    //             reader.readAsDataURL(file);

    //             reader.onloadend = function () {
    //                 var base64data = reader.result;
    //                 object.src = base64data;
    //                 object.Refresh();

    //                 model.accommodation.src = base64data;
    //             }
    //         });
    //     };

    //     model.accommodation.ondrop = function (files, object) {
    //         var reader = new FileReader();
    //         reader.readAsDataURL(files[0]);

    //         reader.onloadend = function () {
    //             var base64data = reader.result;
    //             object.src = base64data;
    //             object.Refresh();

    //             model.accommodation.src = base64data;
    //         }
    //     };

    //     container.Add(new mobiwork({ text: "&nbsp;", class: "page-break" }));
    //     container.Add(new mobiwork({ text: "Drop or attached Registry Officer's Approval(eligible for subsidy)", class: "label" }));

    //     container.Add(model.registry);

    //     model.registry.onclick = function (object) {
    //         mobiwork.OpenFile(function (file) {
    //             var reader = new FileReader();
    //             reader.readAsDataURL(file);

    //             reader.onloadend = function () {
    //                 var base64data = reader.result;
    //                 object.src = base64data;
    //                 object.Refresh();

    //                 model.registry.src = base64data;
    //             }
    //         });
    //     };

    //     model.registry.ondrop = function (files, object) {
    //         var reader = new FileReader();
    //         reader.readAsDataURL(files[0]);

    //         reader.onloadend = function () {
    //             var base64data = reader.result;
    //             object.src = base64data;
    //             object.Refresh();

    //             model.registry.src = base64data;
    //         }
    //     };


    //     tab.Set(5, container);
    // }

    // this.UploadImage = function (files, object, field) {
    //     if (model._id.value) {
    //         var reader = new FileReader();
    //         reader.readAsDataURL(files[0]);

    //         reader.onloadend = function () {
    //             var base64data = reader.result;
    //             object.src = base64data;
    //             object.Refresh();

    //             model.medicalrecord.src = base64data;
    //             model.medicalrecord.object.removeClass("image-empty");

    //             let spinner = new mobiwork.Spinner();
    //             spinner.Show();

    //             let options = { _id: model._id.value, field: field };
    //             $ACCOUNT.AddCredentials(options);

    //             mobiwork.UploadFile({
    //                 url: $API + "students/Upload",
    //                 name: field,
    //                 files: files,
    //                 options: options,
    //                 onsuccess: function (data) {
    //                     spinner.Dispose();
    //                 },
    //                 onerror: function (error) {
    //                     spinner.Dispose();
    //                 }
    //             });
    //         }

    //     } else {
    //         let message = new mobiwork.MessageBox({
    //             text: "Error",
    //             message: "Please press Save button first before uploading documents.",
    //             showcancel: false
    //         });

    //         message.Show();
    //     }
    // };

    // this.AddChild = function () {
    //     model = new studentmodel();
    //     children.push(model);

    //     self.ShowInformation(viewparent);
    // };

    // this.EditChild = function (object) {
    //     model = object.data;
    //     self.ShowInformation(viewparent);
    // };

    // this.Print = function () {
    //     let container = new mobiwork.Container();
    //     container.Show();

    //     let parent = new parentview(true);
    //     parent.Show(container);

    //     $(".main-container").append(container.object[0]);
    //     window.SHAREDREPORT = $(".main-container")[0];

    //     window.SHAREDREPORT.onprint = function () {
    //         container.Dispose();
    //     };

    //     $(".iframe").remove();

    //     let frame = new mobiwork.iFrame({
    //         src: "report.html"
    //     });

    //     frame.class += " hide";
    //     frame.Show();
    // };

    // this.Edit = function () {
    //     model.submitted = false;
    //     model.Readonly(false);
    //     self.ShowInformation();
    // };
};

