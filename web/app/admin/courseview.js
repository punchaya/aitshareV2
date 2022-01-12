
// AIT Admin
var courseview = function (param) {
    let self = this;
    let model;
    let course = $COURSE;
    let coursetitle = course[0].title.value;
    let courseid = course[0]._id.value;
    let viewparent;
    let tablecontainer;
    let tab;
    let readonly = false;
    let selectedcourse; // for back button purpose

    if (param) {
        if (param.model)
            model = param.model;

        if (param.children)
            course = param.children;

        if (param.readonly)
            readonly = param.readonly;
    }

    this.Show = function (parent) {
        if (parent) {
            viewparent = parent;
            viewparent.Clear();
        }

        tablecontainer = new mobiwork.Container();
        tablecontainer.Show(parent);

        self.ShowCourses();
    };

    this.ShowCourses = function () {
        let data = [];
        let datacourse = [];
        let name;

        // viewparent.Clear();


        for (let i = 0; i < course.length; i++) {
            if (course[i].title.value)
                name = course[i].title.value;
            else
                name = "[No Course]";

            datacourse.push({
                name: name,
                desc: course[i].description.value,
                image: course[i].image.src
            });

            // datacourse.push({
            //     name: new mobiwork({ class: "child-name", text: name, data: course[i], onclick: self.EditCourse }),
            //     image: course[i].image.src
            // });
        }

        let coursescontainer = new mobiwork.ScrollContainer();
        // coursescontainer.
        let thumbnail = coursescontainer.Add(new mobiwork.ThumbnailContainer());
        let coursethumb;

        if (!readonly) {
            coursethumb = thumbnail.Add(new mobiwork.Container({ class: "course-container", onclick: this.AddCourse }));
            coursethumb.Add(new mobiwork({ icon: "book", class: "student-icon" }));
            coursethumb.Add(new mobiwork.Button({
                text: "Add New Course",
                class: "button-save",
                icon: "plus",
                onclick: function () {                       //this.AddCourse
                    let form = new mobiwork.Form({
                        text: "Add Course",
                        width: 500,
                        height: window.innerHeight * 0.65,
                        showfooter: true,
                        onok: function () {
                            let items = [];
                            console.log(semyr);
                            items.push({
                                title: title.value,
                                description: desc.value,
                                unit: semyr.children[0].value.text,
                                year: semyr.children[1].value.text,
                            });
                            mobiwork.POST($API + "courses/Insert", JSON.stringify(items[0])).then(function (response) {
                                if (response) {
                                    let model = new course_model();
                                    model.Open(response);

                                    $COURSE.push(model);
                                    course = $COURSE;
                                    self.Show(viewparent);
                                }
                            });
                        }
                    });
                    let courseinfocontainer = form.Add(new mobiwork.ScrollContainer({}));
                    let coursemodel = new course_model();

                    let title = courseinfocontainer.Add(coursemodel.title);
                    let desc = courseinfocontainer.Add(coursemodel.description);
                    let semyr = courseinfocontainer.Add(new mobiwork.Grid({
                        children: [
                            coursemodel.unit, coursemodel.year
                        ]
                    }));


                    form.Show();
                }
            }));
        }

        if (datacourse.length) {
            for (let i = 0; i < datacourse.length; i++) {
                if (readonly && (course[i].submitted || course[i].archive))
                    continue;

                coursethumb = thumbnail.Add(new mobiwork.Container({ class: "course-container" }));

                let toolbaredit = new mobiwork.ToolbarButton({
                    icon: "pencil", text: "", onclick: function () {
                        let form = new mobiwork.Form({
                            text: "Edit Course",
                            // width: 500,
                            // height: 400,
                            width: 500,
                            height: window.innerHeight * 0.5,
                            showfooter: true,
                            onok: function () {
                                let items = [];
                                items.push({
                                    title: _title.value,
                                    description: _des.value,
                                    _id: course[i]._id.value

                                });

                                course[i].title.value = _title.value;
                                course[i].description.value = _des.value;
                                datacourse[i].name = "";

                                mobiwork.POST($API + "courses/Insert", JSON.stringify(items[0])).then(function (response) {
                                    if (response) {

                                        let message = new mobiwork.MessageBox({
                                            text: "Message",
                                            message: "The record has been updated!",
                                            showcancel: false

                                        });

                                        coursescontainer.Clear();
                                        self.ShowCourses();
                                        message.Show();

                                    }
                                });


                            }


                        });

                        let _courseinfocontainer = form.Add(new mobiwork.ScrollContainer({}));
                        let _coursemodel = new course_model();
                        let _title = undefined;
                        let _des = undefined;

                        let query = { courseid: course[i]._id.value }
                        mobiwork.POST($API + "courses/GetCoursesByCourseId", JSON.stringify(query)).then(function (response) {
                            if (response) {
                                _coursemodel.title.value = response[0].title;
                                _coursemodel.description.value = response[0].description;
                                _title = form.Add(_coursemodel.title);
                                _des = form.Add(_coursemodel.description);


                            }
                            else {
                                let message = new mobiwork.MessageBox({
                                    text: "Error",
                                    message: "Unable to update data.",
                                    showcancel: false
                                });

                                message.Show();
                            }
                            form.Show();
                        });

                        // form.Show();
                    }
                });

                let toolbardel = new mobiwork.ToolbarButton({
                    icon: "trash-can-outline", text: "", class: "delete",
                    onclick: function () {
                        let message = new mobiwork.MessageBox({
                            text: "Confirmation",
                            message: "Would you like to delete this record?",
                            showcancel: true,
                            onok: function () {

                                let data = { userid: $ACCOUNT.user._id };
                                let query = { _id: course[i]._id.value, details: "courses" }
                                mobiwork.POST($API + "courses/DeleteDetails", JSON.stringify(query)).then(function (response) {
                                    if (response) {

                                        let message = new mobiwork.MessageBox({
                                            text: "Delete Record",
                                            message: "This record has been deleted!",
                                            showcancel: false
                                        });

                                        mobiwork.POST($API + "courses/Get", JSON.stringify(data)).then(function (response) {
                                            if (response) {
                                                $COURSE = [];
                                                for (let i = 0; i < response.length; i++) {
                                                    model = new course_model();
                                                    model.Open(response[i]);


                                                    $COURSE.push(model);
                                                }
                                                data = { userid: $ACCOUNT.user._id };
                                                $ACCOUNT.AddCredentials(data);

                                                course = $COURSE;

                                                coursescontainer.Clear();
                                                self.ShowCourses();
                                                message.Show();

                                            }
                                        });




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
                });

                coursethumb.Add(toolbaredit);
                coursethumb.Add(toolbardel);

                // if (data[i].image)
                //     coursethumb.Add(new mobiwork.Thumbnail({ src: data[i].image, data: course[i], onclick: this.EditCourse }));
                // else
                //     coursethumb.Add(new mobiwork.List({ icon: "image", data: course[i], onclick: this.EditCourse, class: "no-image-container" }));

                // coursethumb.Add(new mobiwork.List({ text: data[i].name, data: course[i], onclick: this.EditCourse }));

                // coursethumb.Add(new mobiwork.List({ text: data[i].name, data: course[i], onclick: this.EditCourse, class: "course-description" }));

                if (datacourse[i].image)
                    coursethumb.Add(new mobiwork.Thumbnail({ icon: $PUBLIC + "/images/" + datacourse[i].image, data: course[i], onclick: this.ShowModules }));
                else
                    coursethumb.Add(new mobiwork.List({ icon: $PUBLIC + "/images/mbanner.jpg", data: course[i], onclick: this.ShowModules, class: "no-image-container" }));

                coursethumb.Add(new mobiwork.List({ text: datacourse[i].name, data: course[i], onclick: this.ShowModules }));



                // coursethumb.Add(new mobiwork.List({ text: datacourse[i].desc, data: course[i], onclick: this.ShowModules, class: "course-description" }));
            }
        }

        coursescontainer.Show(tablecontainer);
    };

    this.ShowModules = function (parent) {
        parent.Clear();
        selectedcourse = parent;

        let scroll = new mobiwork.ScrollContainer();

        let data = { courseid: parent.data._id.value };
        let titlepanel = scroll.Add(new mobiwork.Header({ text: parent.data.title.value, class: "toptitle" }));
        // let partnerlogo = new mobiwork.Container({ text: " ", icon: $PUBLIC + "images/logo2.png", class: "partner-logo" });
        let partnerlogo = scroll.Add(new mobiwork.Container({ text: " ", icon: "http://203.159.16.4:1999/public/images/logo2.png", class: "partner-logo" }));

        let topmenucpanel = scroll.Add(new mobiwork.ScrollContainer({
            class: "playlist-wrap",
            text: "",
            orientation: ORIENTATION.HORIZONTAL
        }));

        topmenucpanel.Add(new mobiwork.ToolbarButton({ icon: "information", text: "Welcome", class: " topmenu", onclick: self.ShowWelcome }));
        topmenucpanel.Add(new mobiwork.ToolbarButton({ icon: "book-open-outline", text: "Glossary", class: " topmenu", onclick: self.ShowGlossary }));
        topmenucpanel.Add(new mobiwork.ToolbarButton({ icon: "library", text: "Library", class: " topmenu", onclick: self.ShowReferences }));
        // topmenucpanel.Add(new mobiwork.ToolbarButton({ icon: "link-variant", text: "Useful Link", class: " topmenu", onclick:self.ShowReferences }));
        topmenucpanel.Add(new mobiwork.ToolbarButton({ icon: "help", text: "FAQ", class: " topmenu", onclick: self.ShowFAQ }));
        topmenucpanel.Add(new mobiwork.ToolbarButton({
            icon: "comment-text-outline",
            text: "Discussion",
            class: " topmenu",
            onclick: function () {
                let admindiscussion = new admindiscussionview(selectedcourse);
                admindiscussion.Show(viewparent);
            }
        }));
        topmenucpanel.Add(new mobiwork.ToolbarButton({ icon: "bullhorn", text: "Announcement", class: " topmenu", onclick: self.ShowAnnoucement }));


        let modulescontainer = scroll.Add(new mobiwork.ScrollContainer({
            class: "playlist-wrap",
            text: "MODULES",
            orientation: ORIENTATION.HORIZONTAL
        }));
        let thumbnailmodule = modulescontainer.Add(new mobiwork.ThumbnailContainer());
        let modulethumb;

        let back = new mobiwork({
            class: "back-icon", icon: "mdi-arrow-left", onclick: function () {
                self.Show(viewparent);
            }
        });

        if (!readonly) {
            modulethumb = thumbnailmodule.Add(new mobiwork.Container({ class: "course-container", onclick: this.AddCourse }));
            modulethumb.Add(new mobiwork({ icon: "image", class: "student-icon" }));
            modulethumb.Add(new mobiwork.Button({
                text: "Add Module",
                class: "button-save",
                icon: "plus",
                onclick: function () {                       //this.AddModule
                    let form = new mobiwork.Form({
                        text: "Add Module",
                        width: 500,
                        height: window.innerHeight * 0.5,
                        onok: function () {
                            let items = [];
                            items.push({
                                title: title.value,
                                description: des.value,
                                courseid: data.courseid
                            });
                            mobiwork.POST($API + "modules/Insert", JSON.stringify(items[0])).then(function (response) {
                                if (response) {
                                    tablecontainer.Clear();
                                    self.ShowModules(parent);
                                }
                            });
                        }
                    });
                    let courseinfocontainer = form.Add(new mobiwork.ScrollContainer({}));

                    let title = courseinfocontainer.Add(new mobiwork.InputText({ text: "Title" }));
                    let des = courseinfocontainer.Add(new mobiwork.InputTextArea({ text: "Description" }));

                    form.Show();

                }
            }));
        }

        mobiwork.POST($API + "modules/Get", JSON.stringify(data)).then(function (response) {
            if (response) {
                for (let i = 0; i < response.length; i++) {

                    modulethumb = thumbnailmodule.Add(new mobiwork.Container({ class: "course-container" }));

                    let toolbaredit = new mobiwork.ToolbarButton({
                        icon: "pencil", text: "", onclick: function () {
                            let form = new mobiwork.Form({
                                text: "Edit Module",
                                width: 500,
                                height: window.innerHeight * 0.5,
                                showfooter: true,
                                onok: function () {
                                    let items = [];
                                    items.push({
                                        title: _title.value,
                                        description: _des.value,
                                        _id: response[i]._id

                                    });

                                    mobiwork.POST($API + "modules/Insert", JSON.stringify(items[0])).then(function (response) {
                                        if (response) {

                                            let message = new mobiwork.MessageBox({
                                                text: "Message",
                                                message: "The record has been updated!",
                                                showcancel: false

                                            });

                                            self.ShowModules(parent);
                                            message.Show();

                                        }
                                    });
                                }

                            });

                            let courseinfocontainer = form.Add(new mobiwork.ScrollContainer({}));

                            let _title = courseinfocontainer.Add(new mobiwork.InputText({ text: "Title" }));
                            let _des = courseinfocontainer.Add(new mobiwork.InputTextArea({ text: "Description" }));

                            let query = { moduleid: response[i]._id }
                            mobiwork.POST($API + "modules/GetModuleByModuleId", JSON.stringify(query)).then(function (response) {
                                if (response) {
                                    _title.value = form.Add(response[0].title);
                                    if (response[0].description) {
                                        _des.value = form.Add(response[0].description);

                                    }
                                    else {
                                        _des.value = form.Add(" ");
                                    }
                                }
                                else {
                                    let message = new mobiwork.MessageBox({
                                        text: "Error",
                                        message: "Unable to update data.",
                                        showcancel: false
                                    });

                                    message.Show();
                                }
                                form.Show();
                            });

                        }
                    });

                    let toolbardel = new mobiwork.ToolbarButton({
                        icon: "trash-can-outline", text: "", class: "delete",
                        onclick: function () {
                            let message = new mobiwork.MessageBox({
                                text: "Confirmation",
                                message: "Would you like to delete this record?",
                                showcancel: true,
                                onok: function () {

                                    let query = { _id: response[i]._id, details: "modules" }
                                    mobiwork.POST($API + "modules/DeleteDetails", JSON.stringify(query)).then(function (response) {
                                        if (response) {

                                            let message = new mobiwork.MessageBox({
                                                text: "Delete Record",
                                                message: "This record has been deleted!",
                                                showcancel: false
                                            });

                                            self.ShowModules(parent);
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
                    });

                    modulethumb.Add(toolbaredit);
                    modulethumb.Add(toolbardel);

                    if (response[i].image)
                        modulethumb.Add(new mobiwork.Thumbnail({ icon: $PUBLIC + "/images/" + response[i].image, data: response[i], onclick: self.ShowContentView }));
                    else
                        modulethumb.Add(new mobiwork.List({ icon: $PUBLIC + "/images/mbanner.jpg", data: response[i], onclick: self.ShowContentView, class: "module no-image-container" }));

                    modulethumb.Add(new mobiwork.List({ text: response[i].title, data: response[i], onclick: self.ShowContentView, class: "module-title-admin" }));

                    // modulethumb.Add(new mobiwork.List({ text: response[i].createddate, data: response[i], onclick: self.ShowContentView, class: "course-description" }));
                }

                tablecontainer.Clear();
                // titlepanel.Show(tablecontainer);
                // partnerlogo.Show(tablecontainer);
                // topmenucpanel.Show(tablecontainer);
                // modulescontainer.Show(tablecontainer);
                scroll.Show(tablecontainer)
                back.Show(tablecontainer);

            }
        });
    };

    this.ShowWelcome = function () {
        let w = window.innerWidth * 0.7;
        let h = window.innerHeight * 0.95;
        let form = new mobiwork.Form({
            text: "",
            height: h,
            width: w,
            showcancel: true,
            showok: true,
            class: "about"

        });

        let scroll = new mobiwork.ScrollContainer({ class: "about" });

        let overviewcont = scroll.Add(new mobiwork.Container({ text: "Overview", class: "about-view", icon: "card-text" }));
        let overviewtext = overviewcont.Add(new mobiwork({ text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum", class: "term" }));

        let welcomecont = scroll.Add(new mobiwork.Container({ text: "Welcome Message", class: "about-view", icon: "youtube" }));

        // let msgscroll = gloscont.Add(new mobiwork.ScrollContainer({class: "faq"}));
        welcomecont.Add(new mobiwork.YoutubeContainer({ src: "xR7VBUjhbQ8", class: "msg-youtube", width: "50", height: "50" }));
        welcomecont.Add(new mobiwork.YoutubeContainer({ src: "SduiIcUvx68", class: "msg-youtube", width: "50", height: "50" }));
        welcomecont.Add(new mobiwork.YoutubeContainer({ src: "xR7VBUjhbQ8", class: "msg-youtube", width: "50", height: "50" }));
        // term.Add(new mobiwork.ToolbarButton({icon:"delete"}));
        // term = gloscont.Add(new mobiwork.List({ text: "Welcome Message", icon: "youtube", class:"term" }));
        // term.Add(new mobiwork.ToolbarButton({icon:"delete"}));
        welcomecont.Add(new mobiwork({ text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum" }));
        let toolbar = scroll.Add(new mobiwork.Container({ text: "Download", class: "about-view", icon: "download" }));
        toolbar.Add(new mobiwork.Button({ text: "Flyer", class: "button" }));
        toolbar.Add(new mobiwork.Button({ text: "Coure Outline", class: "button" }));
        toolbar.Add(new mobiwork.Button({ text: "Guide", class: "button" }));

        form.Add(scroll);
        // form.Add(featurecont);
        // form.Add(featurepanel);
        form.Show();



    };

    this.ShowDiscussion = function (parent) {
        if (parent) {
            // viewparent = parent;
            parent.Clear();
        }

        // tablecontainer.Clear();

        let splitter = new mobiwork.SplitContainer({
            class: "discussion-splitter",
            children: [{ size: window.innerHeight * 0.75 }],
            orientation: ORIENTATION.VERTICAL
        });


        let discussioncont = new mobiwork.Panel({ text: "Active Discussion", class: "discussion-view" });


        let back = new mobiwork({
            class: "back-icon", icon: "mdi-arrow-left", onclick: function () {
                self.Show(viewparent);
            }
        });

        discussioncont.Add(new mobiwork.Header({ text: "Topic 1" }));
        discussioncont.Add(new mobiwork.List({ text: "What is your topic", class: "discussion-content", icon: "account" }));
        discussioncont.Add(new mobiwork.List({ text: "What is your topic", icon: "reply" }));
        discussioncont.Add(new mobiwork.List({ text: "What is your topic", icon: "reply" }));

        discussioncont.Add(new mobiwork.Header({ text: "Topic 2" }));
        discussioncont.Add(new mobiwork.List({ text: "What is your topic", class: "discussion-content", icon: "account" }));
        discussioncont.Add(new mobiwork.List({ text: "What is your topic", icon: "reply" }));
        discussioncont.Add(new mobiwork.List({ text: "What is your topic", icon: "reply" }));

        discussioncont.Add(new mobiwork.Header({ text: "Topic 3" }));
        discussioncont.Add(new mobiwork.List({ text: "What is your topic", class: "discussion-content", icon: "account" }));
        discussioncont.Add(new mobiwork.List({ text: "What is your topic", icon: "reply" }));
        discussioncont.Add(new mobiwork.List({ text: "What is your topic", icon: "reply" }));

        let discussboard = new mobiwork.Panel({ text: "Discussion Board", class: "discussion-board" });
        discussboard.Add(new mobiwork.InputTextArea({ text: "Post your question here!" }));
        discussboard.Add(new mobiwork.Button({ text: "Post", class: "post" }));


        // let replylist = discusslist.Add(new mobiwork.List({ text: "What is your topic",class:"reply-content" }));
        // discussioncont.Show(tablecontainer);
        // discussboard.Show(tablecontainer);
        back.Show(tablecontainer);
        splitter.Set(0, discussioncont);
        splitter.Set(1, discussboard);
        splitter.Show(tablecontainer);


    };

    this.ShowReferences = function (parent) {
        if (parent) {
            // viewparent = parent;
            parent.Clear();
        }
        // let referencecont = new mobiwork.Panel({ text: "Module 1", class: "discussion-view" });
        let referencecont = new mobiwork.ScrollContainer({
            text: "Reference List",
            class: " glossaryview",
            icon: new mobiwork.ToolbarButton({
                text: "+ Add New Reference",
                class: " addterm",
                onclick: function () {
                    self.AddNewReferences();
                }
            })
        });
        let reflist;
        let refs = [];
        let mtitle;
        mobiwork.POST($API + "references/Get", JSON.stringify()).then(function (response) {

            if (response) {

                for (let i = 0; i < response.length; i++) {

                    refs.push(response[i]);

                }

            }

            let query;
            for (let i = 0; i < refs.length; i++) {

                if (refs[i].moduleid == "general") {
                    mtitle = "General"
                    reflist = referencecont.Add(new mobiwork.List({
                        text: refs[i].title + "<br><div class=\"mtitle\">" + mtitle + "</div>",
                        icon: "open-in-new",
                        class: "reference-list",
                        onclick: function () {
                            if (refs[i].url) {
                                window.open(refs[i].url);
                            }
                        }
                    }));
                    let toolbaredit = reflist.Add(new mobiwork.ToolbarButton({
                        class: "edit-glossary", icon: "pencil", text: "", onclick: function () {
                            editform = new mobiwork.Form({
                                text: "Edit Reference",
                                width: 500,
                                height: window.innerHeight * 0.5,
                                showfooter: true,
                                onok: function () {
                                    let items = [];
                                    items.push({
                                        title: model.linktit.value,
                                        url: model.url.value,
                                        _id: refs[i]._id

                                    });

                                    mobiwork.POST($API + "references/Insert", JSON.stringify(items[0])).then(function (response) {
                                        if (response) {

                                            let message = new mobiwork.MessageBox({
                                                text: "Message",
                                                message: "The record has been updated!",
                                                showcancel: false

                                            });

                                            self.ShowReferences(parent);
                                            message.Show();

                                        }
                                    });
                                }

                            });

                            let model = new linkmodel();
                            editform.Add(model.linktit);
                            editform.Add(model.url);

                            let query = { _id: refs[i]._id }
                            mobiwork.POST($API + "references/GetById", JSON.stringify(query)).then(function (response) {
                                if (response) {
                                    model.linktit.value = editform.Add(response[0].title);
                                    if (response[0].url) {
                                        model.url.value = editform.Add(response[0].url);

                                    }
                                    else {
                                        model.url.value = editform.Add(" ");
                                    }

                                }
                                else {
                                    let message = new mobiwork.MessageBox({
                                        text: "Error",
                                        message: "Unable to update data.",
                                        showcancel: false
                                    });

                                    message.Show();
                                }
                                editform.Show();
                            });

                        }
                    }));

                    let toolbardel = reflist.Add(new mobiwork.ToolbarButton({
                        class: "delete-glossary", icon: "trash-can-outline", text: "",
                        onclick: function () {
                            let message = new mobiwork.MessageBox({
                                text: "Confirmation",
                                message: "Would you like to delete this record?",
                                showcancel: true,
                                onok: function () {
                                    let query = { _id: refs[i]._id }
                                    mobiwork.POST($API + "references/Delete", JSON.stringify(query)).then(function (response) {
                                        if (response) {

                                            let message = new mobiwork.MessageBox({
                                                text: "Delete Record",
                                                message: "This record has been deleted!",
                                                showcancel: false
                                            });

                                            self.ShowReferences(parent);
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
                    referencecont.Show(tablecontainer);
                }
                else {
                    query = { moduleid: refs[i].moduleid };
                    mobiwork.POST($API + "modules/GetModuleByModuleId", JSON.stringify(query)).then(function (response2) {

                        if (response2) {
                            mtitle = response2[0].title;


                            reflist = referencecont.Add(new mobiwork.List({
                                text: refs[i].title + "<br><div class=\"mtitle\">" + mtitle + "</div>",
                                icon: "open-in-new",
                                class: "reference-list",
                                onclick: function () {
                                    if (refs[i].url) {
                                        window.open(refs[i].url);
                                    }
                                }
                            }));
                            let toolbaredit = reflist.Add(new mobiwork.ToolbarButton({
                                class: "edit-glossary", icon: "pencil", text: "", onclick: function () {
                                    editform = new mobiwork.Form({
                                        text: "Edit Reference",
                                        width: 500,
                                        height: window.innerHeight * 0.5,
                                        showfooter: true,
                                        onok: function () {
                                            let items = [];
                                            items.push({
                                                title: model.linktit.value,
                                                url: model.url.value,
                                                _id: refs[i]._id

                                            });

                                            mobiwork.POST($API + "references/Insert", JSON.stringify(items[0])).then(function (response) {
                                                if (response) {

                                                    let message = new mobiwork.MessageBox({
                                                        text: "Message",
                                                        message: "The record has been updated!",
                                                        showcancel: false

                                                    });

                                                    self.ShowReferences(parent);
                                                    message.Show();

                                                }
                                            });
                                        }

                                    });

                                    let model = new linkmodel();
                                    editform.Add(model.linktit);
                                    editform.Add(model.url);

                                    let query = { _id: refs[i]._id }
                                    mobiwork.POST($API + "references/GetById", JSON.stringify(query)).then(function (response) {
                                        if (response) {
                                            model.linktit.value = editform.Add(response[0].title);
                                            if (response[0].url) {
                                                model.url.value = editform.Add(response[0].url);

                                            }
                                            else {
                                                model.url.value = editform.Add(" ");
                                            }

                                        }
                                        else {
                                            let message = new mobiwork.MessageBox({
                                                text: "Error",
                                                message: "Unable to update data.",
                                                showcancel: false
                                            });

                                            message.Show();
                                        }
                                        editform.Show();
                                    });

                                }
                            }));

                            let toolbardel = reflist.Add(new mobiwork.ToolbarButton({
                                class: "delete-glossary", icon: "trash-can-outline", text: "",
                                onclick: function () {
                                    let query = { _id: refs[i]._id }
                                    mobiwork.POST($API + "references/Delete", JSON.stringify(query)).then(function (response) {
                                        if (response) {

                                            let message = new mobiwork.MessageBox({
                                                text: "Delete Record",
                                                message: "This record has been deleted!",
                                                showcancel: false
                                            });

                                            self.ShowReferences(parent);
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
                            }));

                        }
                        else {
                            reflist = referencecont.Add(new mobiwork.List({
                                text: "There are no references",
                                icon: "",
                                class: "reference-list"
                            }));
                        }
                        referencecont.Show(tablecontainer);
                    });
                }

            }
        });

        // referencecont.Show(tablecontainer);

        let back = referencecont.Add(new mobiwork({
            class: "back-icon",
            icon: "mdi-arrow-left",
            onclick: function () {
                let homepage = new courseview();
                homepage.Show(viewparent);
                homepage.ShowModules(selectedcourse);
            }
        }));
        back.Show(tablecontainer);
    };

    this.AddNewReferences = function () {
        let form = new mobiwork.Form({
            text: "Add New Reference",
            width: 500,
            height: window.innerHeight * 0.5,
            onok: function () {
                let items = [];
                items.push({
                    title: model.linktit.value,
                    url: model.url.value,
                    moduleid: "general"

                });
                mobiwork.POST($API + "references/Insert", JSON.stringify(items[0])).then(function (response) {
                    if (response) {
                        let msg = new mobiwork.MessageBox({
                            text: "Message",
                            message: "The record has been added!"

                        })
                        self.ShowReferences();
                        msg.Show();
                    }

                });
            }
        });

        let model = new linkmodel();
        form.Add(model.linktit);
        form.Add(model.url);
        form.Show();
    }

    this.ShowFAQ = function (parent) {
        if (parent) {
            // viewparent = parent;
            parent.Clear();
        }

        // let faqpanel = new mobiwork.Panel({
        //     icon: new mobiwork.ToolbarButton({
        //         text: "Add New FAQ",
        //         class: " addterm",
        //         onclick: function () {
        //             self.AddNewFAQ();
        //         }
        //     }),
        //     text: "FAQ",
        //     class: "discussion-view"
        // });
        let faqscroll = new mobiwork.ScrollContainer({
            text: "FAQ",
            class: " glossaryview",
            icon: new mobiwork.ToolbarButton({
                text: "+ Add New FAQ",
                class: " addterm",
                onclick: function () {
                    self.AddNewFAQ();
                }
            })
        });
        let faqcont;

        mobiwork.POST($API + "faq/Get", JSON.stringify()).then(function (response) {
            if (response) {

                let question;
                let editform;
                for (let i = 0; i < response.length; i++) {
                    faqcont = faqscroll.Add(new mobiwork.Container({ class: "faq-view" }));
                    question = faqcont.Add(new mobiwork.List({ text: response[i].question, icon: "comment-question-outline", class: "term" }));
                    let toolbaredit = new mobiwork.ToolbarButton({
                        class: "edit-glossary", icon: "pencil", text: "", onclick: function () {
                            editform = new mobiwork.Form({
                                text: "Edit FAQ",
                                width: 500,
                                height: window.innerHeight * 0.65,
                                showfooter: true,
                                onok: function () {
                                    let items = [];
                                    items.push({
                                        question: _question.value,
                                        answer: _answer.value,
                                        _id: response[i]._id

                                    });

                                    mobiwork.POST($API + "faq/Insert", JSON.stringify(items[0])).then(function (response) {
                                        if (response) {

                                            let message = new mobiwork.MessageBox({
                                                text: "Message",
                                                message: "The record has been updated!",
                                                showcancel: false

                                            });

                                            self.ShowFAQ(parent);
                                            message.Show();

                                        }
                                    });
                                }

                            });


                            let _question = editform.Add(new mobiwork.InputTextArea({ text: "Question" }));
                            let _answer = editform.Add(new mobiwork.InputTextArea({ text: "Answer" }));

                            let query = { _id: response[i]._id }
                            mobiwork.POST($API + "faq/GetById", JSON.stringify(query)).then(function (response) {
                                if (response) {
                                    _question.value = editform.Add(response[0].question);
                                    if (response[0].answer) {
                                        _answer.value = editform.Add(response[0].answer);

                                    }
                                    else {
                                        _answer.value = editform.Add(" ");
                                    }

                                }
                                else {
                                    let message = new mobiwork.MessageBox({
                                        text: "Error",
                                        message: "Unable to update data.",
                                        showcancel: false
                                    });

                                    message.Show();
                                }
                                editform.Show();
                            });

                        }
                    });

                    let toolbardel = new mobiwork.ToolbarButton({
                        class: "delete-glossary", icon: "trash-can-outline", text: "",
                        onclick: function () {
                            let message = new mobiwork.MessageBox({
                                text: "Confirmation",
                                message: "Would you like to delete this record?",
                                showcancel: true,
                                onok: function () {

                                    let query = { _id: response[i]._id }
                                    mobiwork.POST($API + "faq/Delete", JSON.stringify(query)).then(function (response) {
                                        if (response) {

                                            let message = new mobiwork.MessageBox({
                                                text: "Delete Record",
                                                message: "This record has been deleted!",
                                                showcancel: false
                                            });

                                            self.ShowFAQ(parent);
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
                    });

                    question.Add(toolbaredit);
                    question.Add(toolbardel);

                    // term.Add(new mobiwork.ToolbarButton({icon:"delete"}));
                    faqcont.Add(new mobiwork.Text({ text: response[i].answer }));
                }

            }
            faqscroll.Show(tablecontainer);
        });


        let back = faqscroll.Add(new mobiwork({
            class: "back-icon",
            icon: "mdi-arrow-left",
            onclick: function () {
                let homepage = new courseview();
                homepage.Show(viewparent);
                homepage.ShowModules(selectedcourse);
            }
        }));
        back.Show(tablecontainer);
        // faqpanel.Show(tablecontainer);

    };

    this.ShowAnnoucement = function (parent) {
        if (parent) {
            // viewparent = parent;
            parent.Clear();
        }

        // let annpanel = new mobiwork.Panel({
        //     icon: new mobiwork.ToolbarButton({
        //         text: "New Post",
        //         class: " addterm",
        //         onclick: function () {
        //             self.AddNewPost();
        //         }
        //     }),
        //     text: "Annoucement",
        //     class: "discussion-view"
        // });
        let annscroll = new mobiwork.ScrollContainer({
            text: "Announcement",
            class: " glossaryview",
            icon: new mobiwork.ToolbarButton({
                text: "+ Add New Post",
                class: " addterm",
                onclick: function () {
                    self.AddNewPost();
                }
            })
        });
        let anncont;

        mobiwork.POST($API + "annoucement/Get", JSON.stringify()).then(function (response) {
            if (response) {

                let topic;
                let message;
                let datepost;
                let editform;
                for (let i = 0; i < response.length; i++) {
                    anncont = annscroll.Add(new mobiwork.Container({ class: "faq-view" }));
                    topic = anncont.Add(new mobiwork.List({ text: response[i].topic, icon: "comment-question-outline", class: "term" }));
                    let toolbaredit = new mobiwork.ToolbarButton({
                        class: "edit-glossary", icon: "pencil", text: "", onclick: function () {
                            editform = new mobiwork.Form({
                                text: "Edit Post",
                                width: 500,
                                height: window.innerHeight * 0.65,
                                showfooter: true,
                                onok: function () {
                                    let items = [];
                                    items.push({
                                        topic: _topic.value,
                                        message: _message.value,
                                        _id: response[i]._id,
                                        coursetitle: coursetitle,
                                        courseid: courseid,
                                        userid: $ACCOUNT.userid,
                                        name: $ACCOUNT.user.name,
                                        username: $ACCOUNT.user.email

                                    });


                                    mobiwork.POST($API + "annoucement/Insert", JSON.stringify(items[0])).then(function (response) {
                                        if (response) {


                                            let msg = new mobiwork.MessageBox({
                                                text: "Message",
                                                message: "The record has been updated!",
                                                showcancel: false

                                            });

                                            self.ShowAnnoucement(parent);
                                            msg.Show();

                                        }
                                    });
                                }

                            });


                            let _topic = editform.Add(new mobiwork.InputTextArea({ text: "Topic" }));
                            let _message = editform.Add(new mobiwork.InputTextArea({ text: "Message" }));

                            let query = { _id: response[i]._id }
                            mobiwork.POST($API + "annoucement/GetById", JSON.stringify(query)).then(function (response) {
                                if (response) {
                                    _topic.value = editform.Add(response[0].topic);
                                    if (response[0].message) {
                                        _message.value = editform.Add(response[0].message);

                                    }
                                    else {
                                        _message.value = editform.Add(" ");
                                    }

                                }
                                else {
                                    let msg = new mobiwork.MessageBox({
                                        text: "Error",
                                        message: "Unable to update data.",
                                        showcancel: false
                                    });

                                    msg.Show();
                                }
                                editform.Show();
                            });

                        }
                    });

                    let toolbardel = new mobiwork.ToolbarButton({
                        class: "delete-glossary", icon: "trash-can-outline", text: "",
                        onclick: function () {
                            let message = new mobiwork.MessageBox({
                                text: "Confirmation",
                                message: "Would you like to delete this record?",
                                showcancel: true,
                                onok: function () {

                                    let query = { _id: response[i]._id }
                                    mobiwork.POST($API + "annoucement/Delete", JSON.stringify(query)).then(function (response) {
                                        if (response) {

                                            let msg = new mobiwork.MessageBox({
                                                text: "Delete Record",
                                                message: "This record has been deleted!",
                                                showcancel: false
                                            });

                                            self.ShowAnnoucement(parent);
                                            msg.Show();


                                        } else {
                                            let msg = new mobiwork.MessageBox({
                                                text: "Error",
                                                message: "Unable to delete data.",
                                                showcancel: false
                                            });

                                            msg.Show();
                                        }
                                    });
                                }
                            });
                            message.Show();
                        }
                    });

                    topic.Add(toolbaredit);
                    topic.Add(toolbardel);

                    // term.Add(new mobiwork.ToolbarButton({icon:"delete"}));
                    message = anncont.Add(new mobiwork.Text({ text: response[i].message }));
                    datepost = anncont.Add(new mobiwork.List({ text: FormatDate(response[i].dateentered), class: "date-post" }));

                }

            }
            annscroll.Show(tablecontainer);
        });


        let back = annscroll.Add(new mobiwork({
            class: "back-icon",
            icon: "mdi-arrow-left",
            onclick: function () {
                let homepage = new courseview();
                homepage.Show(viewparent);
                homepage.ShowModules(selectedcourse);
            }
        }));
        back.Show(tablecontainer);
    };

    this.ShowGlossary = function (parent) {
        if (parent) {
            // viewparent = parent;
            parent.Clear();
        }

        // let glospanel = new mobiwork.Panel({
        //     icon: new mobiwork.ToolbarButton({
        //         text: "Add New Term",
        //         class: " addterm",
        //         onclick: function () {
        //             self.AddNewTerm();
        //         }
        //     }),
        //     text: "Glossary",
        //     class: "discussion-view"
        // });
        let gloscroll = new mobiwork.ScrollContainer({
            text: "Glossary",
            class: " glossaryview",
            icon: new mobiwork.ToolbarButton({
                text: "+ Add New Term",
                class: " addterm",
                onclick: function () {
                    self.AddNewTerm();
                }
            })
        });
        let gloscont;


        mobiwork.POST($API + "glossary/Get", JSON.stringify()).then(function (response) {
            if (response) {

                let term;
                let editform;
                for (let i = 0; i < response.length; i++) {
                    gloscont = gloscroll.Add(new mobiwork.Container({ class: "faq-view" }));
                    term = gloscont.Add(new mobiwork.List({ text: response[i].term, icon: "text-shadow", class: "term" }));
                    let toolbaredit = term.Add(new mobiwork.ToolbarButton({
                        class: "edit-glossary", icon: "pencil", text: "", onclick: function () {
                            editform = new mobiwork.Form({
                                text: "Edit Term",
                                width: 500,
                                height: window.innerHeight * 0.5,
                                showfooter: true,
                                onok: function () {
                                    let items = [];
                                    items.push({
                                        term: _term.value,
                                        description: _des.value,
                                        _id: response[i]._id

                                    });

                                    mobiwork.POST($API + "glossary/Insert", JSON.stringify(items[0])).then(function (response) {
                                        if (response) {

                                            let message = new mobiwork.MessageBox({
                                                text: "Message",
                                                message: "The record has been updated!",
                                                showcancel: false

                                            });

                                            self.ShowGlossary(parent);
                                            message.Show();

                                        }
                                    });
                                }

                            });


                            let _term = editform.Add(new mobiwork.InputText({ text: "Term" }));
                            let _des = editform.Add(new mobiwork.InputTextArea({ text: "Description" }));

                            let query = { _id: response[i]._id }
                            mobiwork.POST($API + "glossary/GetTermById", JSON.stringify(query)).then(function (response) {
                                if (response) {
                                    _term.value = editform.Add(response[0].term);
                                    if (response[0].description) {
                                        _des.value = editform.Add(response[0].description);

                                    }
                                    else {
                                        _des.value = editform.Add(" ");
                                    }

                                }
                                else {
                                    let message = new mobiwork.MessageBox({
                                        text: "Error",
                                        message: "Unable to update data.",
                                        showcancel: false
                                    });

                                    message.Show();
                                }
                                editform.Show();
                            });

                        }
                    }));

                    let toolbardel = term.Add(new mobiwork.ToolbarButton({
                        class: "delete-glossary", icon: "trash-can-outline", text: "",
                        onclick: function () {
                            let message = new mobiwork.MessageBox({
                                text: "Confirmation",
                                message: "Would you like to delete this record?",
                                showcancel: true,
                                onok: function () {

                                    let query = { _id: response[i]._id }
                                    mobiwork.POST($API + "glossary/Delete", JSON.stringify(query)).then(function (response) {
                                        if (response) {

                                            let message = new mobiwork.MessageBox({
                                                text: "Delete Record",
                                                message: "This record has been deleted!",
                                                showcancel: false
                                            });

                                            self.ShowGlossary(parent);
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


                    // term.Add(new mobiwork.ToolbarButton({icon:"delete"}));
                    gloscont.Add(new mobiwork({ text: response[i].description }));
                }

            }
            gloscroll.Show(tablecontainer);
        });



        let back = gloscroll.Add(new mobiwork({
            class: "back-icon",
            icon: "mdi-arrow-left",
            onclick: function () {
                let homepage = new courseview();
                homepage.Show(viewparent);
                homepage.ShowModules(selectedcourse);
            }
        }));
        back.Show(tablecontainer);
        // glospanel.Show(tablecontainer);

    };

    this.AddNewTerm = function () {
        let form = new mobiwork.Form({
            text: "Add New Term",
            width: 500,
            height: window.innerHeight * 0.5,
            onok: function () {
                let data = { term: term.value, description: description.value };
                mobiwork.POST($API + "glossary/Insert", JSON.stringify(data)).then(function (response) {
                    if (response) {
                        let msg = new mobiwork.MessageBox({
                            text: "Message",
                            message: "The record has been added!",
                        })
                        self.ShowGlossary();
                        msg.Show();
                    }

                });
            }
        });

        let term = new mobiwork.InputText({ text: "Term" });
        let description = new mobiwork.InputTextArea({ text: "Description" });
        form.Add(term);
        form.Add(description);
        form.Show();
    }

    this.AddNewFAQ = function () {
        let form = new mobiwork.Form({
            text: "Add New FAQ",
            width: 500,
            height: window.innerHeight * 0.65,
            onok: function () {
                let data = { question: question.value, answer: answer.value };
                mobiwork.POST($API + "faq/Insert", JSON.stringify(data)).then(function (response) {
                    if (response) {
                        let msg = new mobiwork.MessageBox({
                            text: "Message",
                            message: "The record has been added!",
                        })
                        self.ShowFAQ();
                        msg.Show();
                    }

                });
            }
        });

        let question = new mobiwork.InputTextArea({ text: "Question" });
        let answer = new mobiwork.InputTextArea({ text: "Answer" });
        form.Add(question);
        form.Add(answer);
        form.Show();
    }

    this.AddNewPost = function () {
        let form = new mobiwork.Form({
            text: "Add New Post",
            width: 500,
            height: window.innerHeight * 0.65,
            onok: function () {
                let data = { topic: topic.value, message: message.value, datepost: postdate, userid: $ACCOUNT.userid, name: $ACCOUNT.user.name, username: $ACCOUNT.user.email, coursetitle: coursetitle, courseid: courseid };
                mobiwork.POST($API + "annoucement/Insert", JSON.stringify(data)).then(function (response) {
                    if (response) {
                        let msg = new mobiwork.MessageBox({
                            text: "Message",
                            message: "The record has been added!",
                        })
                        self.ShowAnnoucement();
                        msg.Show();
                    }

                });
            }
        });

        let topic = new mobiwork.InputTextArea({ text: "Topic" });
        let message = new mobiwork.InputTextArea({ text: "Message" });
        let postdate = new mobiwork.Button({
            text: "Select Date",
            icon: "calendar",
            class: " postdate",
            // onclick: function () {
            //     let calendar = new mobiwork.Calendar();
            //     let calendarform = new mobiwork.Form({
            //         width: 600,
            //         height: 480,
            //     });
            //     calendarform.Add(calendar);
            //     calendarform.Show();
            // }
        });
        form.Add(topic);
        form.Add(message);
        // form.Add(postdate);

        form.Show();
    }

    this.ShowInformation = function (parent) {
        parent.Clear();

        let back = new mobiwork({
            class: "back-icon", icon: "mdi-arrow-left", onclick: function () {
                self.Show(viewparent);
            }
        });

        back.Show(parent);


        if (!model.submitted) {
            // let submit = new mobiwork.Button({
            //     text: "Submit", class: "button-submit",
            //     onclick: function () {
            //         model.Submit(function () {
            //             model.submitted = true;
            //             model.Readonly(true);
            //             self.ShowInformation();
            //         });
            //     }
            // });
            // submit.Show(parent);

            let save = new mobiwork.Button({ text: "Save", class: "button-save", onclick: model.Save });
            save.Show(parent);

        } else {
            let save = new mobiwork.Button({ text: "Edit", class: "button-save", onclick: self.Edit });
            save.Show(parent);
        }

        // tab = new mobiwork.Tab({
        //     class: model.submitted ? "form-readonly" : "form-editable",
        //     children: [
        //         { icon: "card-account-details", text: "Course Information" }
        //     ]
        // });

        // tab.Show(parent);

        self.ShowCourseInformation(viewparent);

        if (readonly) {
            let data = { userid: model.userid.value };
            $ACCOUNT.AddCredentials(data);

            mobiwork.POST($API + "parents/Get", JSON.stringify(data)).then(function (response) {
                if (response) {
                    let parents = new parentsmodel();

                    for (let i = 0; i < response.length; i++) {
                        parents.Open(response[i]);
                        break;
                    }

                    let view = new parentview({ print: true, model: parents });
                    view.Show(parent);
                }
            });
        }
    };

    this.ShowCourseInformation = function (parent) {
        let container = new mobiwork.Container({ class: "course-info-container" });

        container.Add(new mobiwork.Header({ class: "print-header", text: "Course Information" }));

        container.Add(new mobiwork.Grid({
            children: [
                model.title
            ]
        }));

        container.Add(new mobiwork.Grid({
            children: [
                model.description
            ]
        }));

        container.Add(new mobiwork.Grid({
            children: [
                model.semester, model.year
            ]
        }));

        container.Add(model.authorname);


        // if (parent)
        container.Show(parent);
        // else
        //     tab.Set(0, container);
    };

    this.ShowContentView = function (object) {
        // object.data({ coursedata: selectedcourse._id.value });
        model = { dataobject: object.data, courseiddata: selectedcourse };

        let contview = new contentview(model);
        contview.Show(viewparent);
        // self.ShowInformation(viewparent);
    };

    this.Edit = function () {
        model.submitted = false;
        model.Readonly(false);
        self.ShowInformation();
    };
};

var course_model = function () {
    let self = this;

    this.image = new mobiwork.Image({
        class: "student-photo",
    });
    this.image.noexport = true;

    this._id = new mobiwork.InputText({
        text: "ID"
    });
    this._id.noexport = true;

    this.title = new mobiwork.InputText({
        text: "Course Title"
    });

    this.description = new mobiwork.InputTextArea({
        text: "Description"
    });

    let _unit_ = [];

    for (let i = 0; i < unit.length; i++) {
        _unit_.push({ text: unit[i] });
    }

    this.unit = new mobiwork.InputDataList({
        list: _unit_,
        text: "Unit"
    });

    let _year_ = [];

    for (let i = 0; i < year.length; i++) {
        _year_.push({ text: year[i] });
    }

    this.year = new mobiwork.InputDataList({
        list: _year_,
        text: "Year"
    });

    this.authorname = new mobiwork.InputCombobox({
        list: [
            { text: "Dr.Naveed Anwar" },
            { text: "Prof.Pennuang" }
        ],
        selectedindex: 0,
        text: "Instructor"
    });

    this.Open = function (data) {
        for (let name in data) {
            if (this[name]) {
                if (this[name] instanceof mobiwork.Image) {
                    this[name].filename = data[name].filename;

                    if (name === "image")
                        this[name].src = $PUBLIC + "documents/thumbnail_" + data[name].filename;
                    else
                        this[name].src = $PUBLIC + "documents/" + data[name].filename;

                } else {
                    this[name].value = data[name];
                }
            }
        }

        this.submitted = data.submitted;
        this.archive = data.archive;
        this.Readonly(this.submitted);
    };

    this.Readonly = function (readonly) {
        for (let name in self) {
            if (self[name] && self[name].Show)
                self[name].readonly = readonly;
        }
    };

    this.GetInformation = function () {
        let data = { userid: $ACCOUNT.user._id };
        $ACCOUNT.AddCredentials(data);

        for (let name in self) {
            if (self[name]) {
                if (self[name].src) {
                    data[name] = self[name].src
                } else if (self[name].value) {
                    data[name] = self[name].value
                }
            }
        }

        return data;
    };

    this.UploadImage = function (file, field) {
    };

    this.Save = function () {
        let data = self.GetInformation();

        mobiwork.POST($API + "courses/Insert", JSON.stringify(data)).then(function (response) {
            if (response) {
                let message = new mobiwork.MessageBox({
                    text: "Saved",
                    message: "Student information was successfully saved!",
                    showcancel: false
                });

                message.Show();

                self._id.value = response;
            } else {
                let message = new mobiwork.MessageBox({
                    text: "Error",
                    message: "Unable to save information.",
                    showcancel: false
                });

                message.Show();
            }
        });
    };

    this.Submit = function (res) {
        let message = new mobiwork.MessageBox({
            text: "Submit Application",
            message: "Are you sure you want to submit the admission form?",
            onok: function () {
                let data = self.GetInformation();
                data.submitted = true;
                data.datesubmitted = new Date().toISOString();

                mobiwork.POST($API + "courses/Submit", JSON.stringify(data)).then(function (response) {
                    if (response) {
                        let message = new mobiwork.MessageBox({
                            text: "Submitted",
                            message: "Thank you! Your admission form has been submitted successfully.",
                            showcancel: false
                        });

                        message.Show();

                        res();
                    } else {
                        let message = new mobiwork.MessageBox({
                            text: "Error",
                            message: "Unable to submit information.",
                            showcancel: false
                        });

                        message.Show();
                    }
                });
            }
        });

        message.Show();
    };
};

var linkmodel = function () {
    this.linktit = new mobiwork.InputText({
        text: "Title"
    });

    this.url = new mobiwork.InputText({
        text: "Place Reference URL"
    });
}