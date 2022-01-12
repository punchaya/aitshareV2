// AIT Student
var studentmoduleview = function (param) {
    let self = this;
    let model;
    let module = $MODULE;
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
                dateentered: course[i].dateentered.value
            });
        }

        let thumbnail = new mobiwork.ThumbnailContainer();
        let coursethumb;

        if (!readonly) {
            coursethumb = thumbnail.Add(new mobiwork.Container({ class: "course-container", onclick: this.AddCourse }));
            coursethumb.Add(new mobiwork({ icon: "image", class: "student-icon" }));
            coursethumb.Add(new mobiwork.Button({
                text: "Add Course",
                class: "button-save",
                onclick: function () {                       //this.AddCourse
                    let content = new contentview();
                    tablecontainer.Clear();
                    tablecontainer.class = "content-container";
                    content.Show(viewparent);
                }
            }));
        }

        if (datacourse.length) {
            for (let i = 0; i < datacourse.length; i++) {
                if (readonly && (course[i].submitted || course[i].archive))
                    continue;

                coursethumb = thumbnail.Add(new mobiwork.Container({ class: "course-container" }));

                if (datacourse[i].image)
                    coursethumb.Add(new mobiwork.Thumbnail({ src: data[i].image, data: course[i], onclick: this.ShowModules }));
                else
                    coursethumb.Add(new mobiwork.List({ icon: "image", data: course[i], onclick: this.ShowModules, class: "no-image-container" }));

                coursethumb.Add(new mobiwork.List({ text: datacourse[i].name, data: course[i], onclick: this.ShowModules }));

                coursethumb.Add(new mobiwork.List({ text: datacourse[i].dateentered, data: course[i], onclick: this.ShowModules, class: "course-description" }));
            }
        }

        thumbnail.Show(tablecontainer);
    };

    this.ShowModules = function (parent) {
        parent.Clear();
        selectedcourse = parent;

        let data = { courseid: parent.data._id.value };
        let modulescontainer = new mobiwork.ScrollContainer({
            class: "playlist-wrap",
            orientation: ORIENTATION.HORIZONTAL
        });
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
                onclick: function () {                       //this.AddCourse
                    let content = new contentview();
                    tablecontainer.Clear();
                    tablecontainer.class = "content-container";
                    content.Show(viewparent);
                }
            }));
        }

        mobiwork.POST($API + "modules/Get", JSON.stringify(data)).then(function (response) {
            if (response) {
                for (let i = 0; i < response.length; i++) {

                    modulethumb = thumbnailmodule.Add(new mobiwork.Container({ class: "course-container" }));

                    if (response[i].image)
                        modulethumb.Add(new mobiwork.Thumbnail({ src: response[i].image, response: course[i], onclick: self.ShowContentView }));
                    else
                        modulethumb.Add(new mobiwork.List({ icon: "image", response: course[i], onclick: self.ShowContentView, class: "no-image-container" }));

                    modulethumb.Add(new mobiwork.List({ text: response[i].title, response: course[i], onclick: self.ShowContentView }));

                    modulethumb.Add(new mobiwork.List({ text: response[i].createddate, response: course[i], onclick: self.ShowContentView, class: "course-description" }));
                }
                tablecontainer.Clear();
                modulescontainer.Show(tablecontainer);
                // thumbnailmodule.Show(tablecontainer);
                back.Show(tablecontainer);
            }
        });


    };

    this.ShowInformation = function (parent) {
        parent.Clear();

        let back = new mobiwork({
            class: "back-icon", icon: "mdi-arrow-left", onclick: function () {
                self.Show(viewparent);
            }
        });

        back.Show(parent);

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
        model = { dataobject: object.data, courseiddata: selectedcourse };
        let contview = new contentview();
        contview.Show(viewparent);

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