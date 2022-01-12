
// AIT Student
var studentcourseview = function (param) {
    let self = this;
    let model;
    let course = $COURSE;
    let viewparent;
    let tablecontainer;
    let tab;
    let readonly = false;
    let comparepercent = [];

    let selectedcourse; // for back button purpose
    let selectedmodule;
    let moduletitle;

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

        for (let i = 0; i < course.length; i++) {
            if (course[i].title.value)
                name = course[i].title.value;
            else
                name = "[NO NAME]";

            datacourse.push({
                name: new mobiwork({ class: "child-name", text: name, data: course[i], onclick: self.EditCourse }),
                image: course[i].image.src,
                _description: course[i].description.value,
            });
        }

        let thumbnail = new mobiwork.ThumbnailContainer();
        let coursethumb;

        if (datacourse.length) {
            for (let i = 0; i < datacourse.length; i++) {
                if (readonly && (course[i].submitted || course[i].archive))
                    continue;

                coursethumb = thumbnail.Add(new mobiwork.Container({ class: "course-thumbnail" }));

                if (datacourse[i].image)
                    coursethumb.Add(new mobiwork.Thumbnail({ icon: $PUBLIC + "/images/" + datacourse[i].image, data: course[i], onclick: this.GetModulesWithPercent }));
                else
                    coursethumb.Add(new mobiwork.List({ icon: $PUBLIC + "/images/mbanner.jpg", data: course[i], onclick: this.GetModulesWithPercent, class: "no-image-container" }));


                coursethumb.Add(new mobiwork.List({ text: datacourse[i].name, data: course[i], onclick: this.GetModulesWithPercent }));

                coursethumb.Add(new mobiwork.List({ text: datacourse[i]._description, data: course[i], onclick: this.GetModulesWithPercent, readonly: true, class: "course-description" }));
                // coursethumb.Add(new mobiwork.List({ text: datacourse[i]._description, data: course[i], onclick: this.ShowModules, readonly: true, class: "course-description" }));
            }
        }

        thumbnail.Show(tablecontainer);


    };

    this.GetModulesWithPercent = function (parent) {
        let data = { courseid: parent.data._id.value };
        comparepercent = [];
        mobiwork.POST($API + "modules/Get", JSON.stringify(data)).then(function (response) {
            if (response) {
                response.sort(function (a, b) {
                    _a = parseInt(a.order);
                    _b = parseInt(b.order);

                    if (_a > _b)
                        return 1;
                    else if (_a < _b)
                        return -1;
                    else
                        return 0;
                });

                for (let i = 0; i < response.length; i++) {
                    let modulepercent = { userid: $ACCOUNT.user._id, moduleid: response[i]._id };
                    mobiwork.POST($API + "userpresentationlog/SummaryLog", JSON.stringify(modulepercent)).then(function (responselog_) {
                        if (responselog_) {
                            comparepercent.push({ moduleid: response[i]._id, percent: responselog_ });
                        }

                        if (i === response.length - 1)
                            self.ShowModules(parent);
                    });
                }
            }
        });
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
                let studentdiscussion = new studentdiscussionview(selectedcourse);
                studentdiscussion.Show(viewparent);
            }
        }));
        topmenucpanel.Add(new mobiwork.ToolbarButton({ icon: "bullhorn", text: "Announcement", class: " topmenu", onclick: self.ShowAnnouncement }));

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


        mobiwork.POST($API + "modules/Get", JSON.stringify(data)).then(function (response) {
            if (response) {
                response.sort(function (a, b) {
                    _a = parseInt(a.order);
                    _b = parseInt(b.order);

                    if (_a > _b)
                        return 1;
                    else if (_a < _b)
                        return -1;
                    else
                        return 0;
                });

                for (let i = 0; i < response.length; i++) {

                    modulethumb = thumbnailmodule.Add(new mobiwork.Container({ class: "course-container" }));

                    if (response[i].image)
                        modulethumb.Add(new mobiwork.Thumbnail({ icon: $PUBLIC + "/images/" + response[i].image, data: response[i], onclick: self.ShowContentView }));
                    else
                        modulethumb.Add(new mobiwork.List({ icon: $PUBLIC + "/images/mbanner.jpg", data: response[i], onclick: self.ShowContentView, class: "no-image-container" }));

                    modulethumb.Add(new mobiwork.List({ text: response[i].title, data: response[i], onclick: self.ShowContentView, class: "module-title" }));

                    for (let ii = 0; ii < comparepercent.length; ii++) {
                        let p;
                        if (comparepercent.length !== 0) {
                            if (response[i]._id === comparepercent[ii].moduleid) {
                                p = comparepercent[ii].percent;
                                modulethumb.Add(new mobiwork.ProgressBarRRCAP({ percentage: p }));

                                if (p === 100) {
                                    let pushitems_ = { userid: $ACCOUNT.user._id, courseid: response[i].courseid, moduleid: response[i]._id };

                                    mobiwork.POST($API + "modulescomplog/Insert", JSON.stringify(pushitems_)).then(function (response) {
                                        if (response) {
                                            // console.log(this);
                                        }
                                    });
                                }
                            }
                        }

                        modulethumb.Refresh();
                    }

                    tablecontainer.Clear();
                    // titlepanel.Show(tablecontainer);
                    // partnerlogo.Show(tablecontainer);
                    // topmenucpanel.Show(tablecontainer);
                    // modulescontainer.Show(tablecontainer);
                    scroll.Show(tablecontainer);

                    back.Show(tablecontainer);

                }
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

    this.ShowWelcome1 = function (parent) {

        if (parent) {
            selectedmodule = parent;
            parent.Clear();
        }

        // let glospanel = new mobiwork.Container({ text: "Welcome & Information", class: "discussion-view" });
        let gloscroll = new mobiwork.ScrollContainer({ text: "Welcome", class: " welcomeview" });
        let gloscont;

        // gloscont = gloscroll.Add(new mobiwork.Container({class: " welcomeview"}));
        let overviewcont = gloscroll.Add(new mobiwork.Container({ text: "Overview" }));
        let overviewtext = overviewcont.Add(new mobiwork({ text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum" }))
        // gloscroll.Add(new mobiwork.List({ text: "Overview", icon: "information", class: "term" }));
        // // term.Add(new mobiwork.ToolbarButton({icon:"delete"}));
        // gloscroll.Add(new mobiwork.List({ text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum" }));
        // gloscroll.Add(new mobiwork.List({ text: "Welcome Message", icon: "youtube", class: "term" }));
        // // let msgscroll = gloscont.Add(new mobiwork.ScrollContainer({class: "faq"}));
        // gloscroll.Add(new mobiwork.YoutubeContainer({ src: "xR7VBUjhbQ8", class: "msg-youtube", width: "50", height: "50" }));
        // gloscroll.Add(new mobiwork.YoutubeContainer({ src: "SduiIcUvx68", class: "msg-youtube", width: "50", height: "50" }));
        // gloscroll.Add(new mobiwork.YoutubeContainer({ src: "xR7VBUjhbQ8", class: "msg-youtube", width: "50", height: "50" }));
        // // term.Add(new mobiwork.ToolbarButton({icon:"delete"}));
        // // term = gloscont.Add(new mobiwork.List({ text: "Welcome Message", icon: "youtube", class:"term" }));
        // // term.Add(new mobiwork.ToolbarButton({icon:"delete"}));
        // gloscroll.Add(new mobiwork.List({ text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum" }));
        // let toolbar = gloscroll.Add(new mobiwork.Toolbar({ text: "Download", icon: "download", class: "welcome-download" }));
        // toolbar.Add(new mobiwork.Button({ text: "Flyer", class: "button" }));
        // toolbar.Add(new mobiwork.Button({ text: "Coure Outline", class: "button" }));
        // toolbar.Add(new mobiwork.Button({ text: "Guide", class: "button" }));
        let overviewcont2 = gloscroll.Add(new mobiwork.Container({ text: "Overview" }));
        let overviewtext2 = overviewcont2.Add(new mobiwork({ text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum" }))



        gloscroll.Show(tablecontainer);


        let back = new mobiwork({
            class: "back-icon",
            icon: "mdi-arrow-left",
            onclick: function () {
                let homepage = new studentcourseview();
                homepage.Show(viewparent);
                homepage.GetModulesWithPercent(selectedcourse);
            }
        });


        // let back = new mobiwork({
        //     class: "back-icon", icon: "mdi-arrow-left", onclick: function () {
        //         self.Show(selectedmodule);
        //     }
        // });
        back.Show(tablecontainer);

    };

    this.ShowGlossary = function (parent) {
        if (parent) {
            // viewparent = parent;
            parent.Clear();
        }

        // let glospanel = new mobiwork.Panel({ text: "Glossary", class: "discussion-view" });
        let gloscroll = new mobiwork.ScrollContainer({ text: "Glossary", class: " glossaryview" });
        let gloscont;


        mobiwork.POST($API + "glossary/Get", JSON.stringify()).then(function (response) {
            if (response) {

                let term;
                let editform;
                // let _gloscroll = new mobiwork.ScrollContainer({class: " glossaryview" });
                for (let i = 0; i < response.length; i++) {
                    gloscont = gloscroll.Add(new mobiwork.Container({ class: " faq-view" }));
                    term = gloscont.Add(new mobiwork.List({ text: response[i].term, icon: "text-shadow", class: "term" }));
                    // term.Add(new mobiwork.ToolbarButton({icon:"delete"}));
                    gloscont.Add(new mobiwork({ text: response[i].description, class: " term" }));
                }
                // _gloscroll.Show(gloscroll);

            }
            gloscroll.Show(tablecontainer);
        });



        let back = gloscroll.Add(new mobiwork({
            class: "back-icon",
            icon: "mdi-arrow-left",
            onclick: function () {
                let homepage = new studentcourseview();
                homepage.Show(viewparent);
                homepage.GetModulesWithPercent(selectedcourse);
            }
        }));
        back.Show(tablecontainer);
        // glospanel.Show(tablecontainer);

    };

    this.ShowFAQ = function (parent) {
        if (parent) {
            // viewparent = parent;
            parent.Clear();
        }

        let faqscroll = new mobiwork.ScrollContainer({ text: "FAQ", class: " glossaryview" });
        // let faqscroll = faqpanel.Add(new mobiwork.ScrollContainer({ class: "faq" }));
        let faqcont;

        mobiwork.POST($API + "faq/Get", JSON.stringify()).then(function (response) {
            if (response) {

                let question;
                let editform;
                for (let i = 0; i < response.length; i++) {
                    faqcont = faqscroll.Add(new mobiwork.Container({ class: "faq-view" }));
                    question = faqcont.Add(new mobiwork.List({ text: response[i].question, icon: "comment-question-outline", class: "term" }));
                    faqcont.Add(new mobiwork.Text({ text: response[i].answer }));
                }

            }
            faqscroll.Show(tablecontainer);
        });


        let back = faqscroll.Add(new mobiwork({
            class: "back-icon",
            icon: "mdi-arrow-left",
            onclick: function () {
                let homepage = new studentcourseview();
                homepage.Show(viewparent);
                homepage.GetModulesWithPercent(selectedcourse);
            }
        }));
        back.Show(tablecontainer);
        // faqpanel.Show(tablecontainer);

    };

    this.ShowAnnouncement = function (parent) {
        if (parent) {
            // viewparent = parent;
            parent.Clear();
        }

        let annscroll = new mobiwork.ScrollContainer({ text: "Announcement", class: " glossaryview" });
        // let annscroll = annpanel.Add(new mobiwork.ScrollContainer({ class: "faq" }));
        let anncont;

        mobiwork.POST($API + "annoucement/Get", JSON.stringify()).then(function (response) {
            if (response) {

                let date;
                let topic;
                let message;
                let editform;
                for (let i = 0; i < response.length; i++) {
                    anncont = annscroll.Add(new mobiwork.Container({ class: "faq-view" }));
                    date = anncont.Add(new mobiwork.List({ text: FormatDate(response[i].dateentered), icon: "calendar", class: "announcement" }));
                    topic = anncont.Add(new mobiwork.List({ text: response[i].topic, class: "announcement" }));
                    message = anncont.Add(new mobiwork.Text({ text: response[i].message }));
                }

            }
            annscroll.Show(tablecontainer);
        });


        let back = annscroll.Add(new mobiwork({
            class: "back-icon",
            icon: "mdi-arrow-left",
            onclick: function () {
                let homepage = new studentcourseview();
                homepage.Show(viewparent);
                homepage.GetModulesWithPercent(selectedcourse);
            }
        }));
        back.Show(tablecontainer);
        // annpanel.Show(tablecontainer);

    };

    this.ShowReferences = function (parent) {
        if (parent) {
            // viewparent = parent;
            parent.Clear();
        }

        // let referencecont = new mobiwork.Panel({ text: "Module 1", class: "discussion-view" });
        let referencecont = new mobiwork.ScrollContainer({ text: "Reference List", class: " glossaryview" });
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
        });

        referencecont.Show(tablecontainer);

        let back = referencecont.Add(new mobiwork({
            class: "back-icon",
            icon: "mdi-arrow-left",
            onclick: function () {
                let homepage = new studentcourseview();
                homepage.Show(viewparent);
                homepage.GetModulesWithPercent(selectedcourse);
            }
        }));
        back.Show(tablecontainer);
    };


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
        $MODDESC = object.data.description;
        model = { dataobject: object.data, courseiddata: selectedcourse };
        let contview = new studentcontentview(model);
        contview.Show(viewparent);
    };
};

var studentcourse_model = function () {
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

    this.description = new mobiwork.InputText({
        text: "Description"
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
};