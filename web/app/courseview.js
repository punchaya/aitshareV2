// AIT Student
var courseview = function (param) {
    let self = this;
    let model;
    let course = $COURSE;
    let viewparent;
    let tablecontainer;
    let tab;
    let readonly = false;

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

        let back = new mobiwork({
            class: "back-icon", icon: "mdi-arrow-left", onclick: function () {
                // self.Show(viewparent);

                // // let content = new mobiwork.Container({ class: "content-container" });
                // viewparent.Dispose();
                // // self.Show(viewparent);
                parent.Dispose();
                let homepage = new mainview();
                homepage.Show();
            }
        });


        tablecontainer = new mobiwork.Container();
        tablecontainer.Show(parent);
        back.Show(parent);

        self.ShowCourses();
    };

    this.ShowCourses = function () {
        let data = [];
        let name;

        for (let i = 0; i < course.length; i++) {
            if (course[i].title.value)
                name = course[i].title.value;
            else
                name = "[NO NAME]";

            data.push({
                name: new mobiwork({ class: "child-name", text: name, data: course[i], onclick: self.EditCourse }),
                image: course[i].image.src
            });
        }

        let thumbnail = new mobiwork.ThumbnailContainer();
        let coursethumb;

        if (!readonly) {
            coursethumb = thumbnail.Add(new mobiwork.Container({ class: "course-container", onclick: this.AddCourse }));
            coursethumb.Add(new mobiwork({ icon: "image", class: "student-icon" }));
            coursethumb.Add(new mobiwork.Button({
                text: "Add New Module",
                class: "button-save",
                onclick: function () {                       //this.AddCourse
                    let content = new contentview();
                    tablecontainer.Clear();
                    tablecontainer.class = "content-container";
                    content.Show(viewparent);
                }
            }));
        }

        if (data.length) {
            for (let i = 0; i < data.length; i++) {
                if (readonly && (course[i].submitted || course[i].archive))
                    continue;

                coursethumb = thumbnail.Add(new mobiwork.Container({ class: "course-container" }));

                if (data[i].image)
                    coursethumb.Add(new mobiwork.Thumbnail({ src: data[i].image, data: course[i], onclick: this.EditCourse }));
                else
                    coursethumb.Add(new mobiwork.List({ icon: "image", data: course[i], onclick: this.EditCourse, class: "no-image-container" }));

                coursethumb.Add(new mobiwork.List({ text: data[i].name, data: course[i], onclick: this.EditCourse }));

                coursethumb.Add(new mobiwork.List({ text: data[i].name, data: course[i], onclick: this.EditCourse, class: "course-description" }));
            }
        }

        thumbnail.Show(tablecontainer);
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
        // container.Add(model.image);

        // model.image.onclick = function (object) {
        //     mobiwork.OpenFile(function (file) {
        //         self.UploadImage([file], object, "image");
        //     });
        // };

        // model.image.ondrop = function (files, object) {
        //     self.UploadImage(files, object, "image");
        // };

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

    this.UploadImage = function (files, object, field) {
        if (model._id.value) {
            var reader = new FileReader();
            reader.readAsDataURL(files[0]);

            reader.onloadend = function () {
                var base64data = reader.result;
                object.src = base64data;
                object.Refresh();

                // model.medicalrecord.src = base64data;
                // model.medicalrecord.object.removeClass("image-empty");

                let spinner = new mobiwork.Spinner();
                spinner.Show();

                let options = { _id: model._id.value, field: field };
                $ACCOUNT.AddCredentials(options);

                mobiwork.UploadFile({
                    url: $API + "courses/Upload",
                    name: field,
                    files: files,
                    options: options,
                    onsuccess: function (data) {
                        spinner.Dispose();
                    },
                    onerror: function (error) {
                        spinner.Dispose();
                    }
                });
            }

        } else {
            let message = new mobiwork.MessageBox({
                text: "Error",
                message: "Please press Save button first before uploading documents.",
                showcancel: false
            });

            message.Show();
        }
    };

    this.AddCourse = function () {
        model = new course_model();
        course.push(model);

        self.ShowInformation(viewparent);
    };

    this.EditCourse = function (object) {
        model = object.data;
        self.ShowInformation(viewparent);
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

    this.description = new mobiwork.InputText({
        text: "Description"
    });

    let _semester_ = [];

    for (let i = 0; i < semester.length; i++) {
        _semester_.push({ text: semester[i] });
    }

    this.semester = new mobiwork.InputDataList({
        list: _semester_,
        text: "Semester"
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