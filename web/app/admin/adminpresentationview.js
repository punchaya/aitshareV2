var adminpresentationview = function (param) {
    let self = this;
    let model;
    let course = $COURSE;
    let viewparent;
    let tablecontainer;
    let splitrightcontainer;
    let readonly = false;
    let presentationid = param._id;

    let slidesdata;
    let allslidesdata;
    let prestype;

    let containertop;
    let containerbot;
    let clearalleditor = false;

    let presentationimage;
    let presimagedata_files = [];
    let presimagedata_field;

    let viewsavebutton = false;
    let viewdeletebutton = false;

    let _imgtitle;
    let _presentationorder;
    let _slidetype;
    let _imageheader;

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
            class: "back-icon",
            icon: "mdi-arrow-left",
            onclick: function () {
                let homepage = new contentview(param);
                homepage.Show(viewparent);
            }
        });

        tablecontainer = new mobiwork.SplitContainer({
            gap: 1,
            class: "contentview",
            children: [{ size: 450 }]
        });

        tablecontainer.Show(parent);
        back.Show(parent);

        self.ShowLeftPanel();
        self.ShowRightPanel();
    };

    this.ShowLeftPanel = function (parent) {
        let container = new mobiwork.ScrollContainer();
        container.class += " presentation-list-container";
        let data = { presentationid: presentationid };

        let leftbuttonadd = container.Add(new mobiwork.Container({ class: "button-container" }));
        leftbuttonadd.Add(new mobiwork.Button({
            text: "Add Content",
            class: "button-addcontent",
            icon: "plus",
            onclick: function () {
                clearalleditor = true;
                viewsavebutton = true;
                self.ShowRightPanel();
            }
        }));

        mobiwork.POST($API + "slide/Get", JSON.stringify(data)).then(function (response) {
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

            allslidesdata = response;

            for (let i = 0; i < response.length; i++) {
                container.Add(new mobiwork.List({
                    text: response[i].title,
                    data: response[i],
                    onclick: function (data) {
                        slidesdata = data.data;
                        clearalleditor = false;
                        viewsavebutton = true;
                        self.ShowRightPanel();
                    },
                    tools: [
                        new mobiwork({
                            text: response[i].order
                        })
                    ]
                }));
            }


            if (parent)
                container.Show(tablecontainer);
            else
                tablecontainer.Set(0, container);

            // self.ShowDataText();
            // self.ShowDataImage();

            self.ShowRightPanel();
        });
    };

    this.ShowRightPanel = function (parent) {
        let container = new mobiwork.ScrollContainer();
        splitrightcontainer = container.Add(new mobiwork.SplitContainer({
            orientation: ORIENTATION.VERTICAL,
            gap: 2
            // children: [{ size: 300 }]
        }));

        // console.log(prestype);

        if (parent)
            container.Show(parent);
        else
            tablecontainer.Set(1, container);

        self.ShowTopPanel();
        self.ShowBotPanel();
    };

    this.ShowTopPanel = function (parent) {
        containertop = new mobiwork.Container({ class: "editorimage-container" });
        let imgsource = undefined;
        let model = new presentation_model();
        let imgtitleval = undefined;
        let presenatationorderval = undefined;
        let stypeval = undefined;
        let imageheaderval = undefined;

        if (slidesdata) {
            // imgsource = $PUBLIC + "/presentation/" + param.moduletitle + "/" + slidesdata.presentationid + "/" + slidesdata.image;
            if (slidesdata.image)
                imgsource = $PUBLIC + "/presentation/" + slidesdata.image;
            imgtitleval = slidesdata.title;
            presenatationorderval = slidesdata.order;
            stypeval = slidesdata.type;
            imageheaderval = slidesdata.imageheader;
        } else if (allslidesdata) {
            if (allslidesdata.length !== 0) {
                // imgsource = $PUBLIC + "/presentation/" + param.moduletitle + "/" + allslidesdata[0].presentationid + "/" + allslidesdata[0].image;
                if (allslidesdata[0].image)
                    imgsource = $PUBLIC + "/presentation/" + allslidesdata[0].image;
                imgtitleval = allslidesdata[0].title;
                presenatationorderval = allslidesdata[0].order;
                stypeval = allslidesdata[0].type;
                imageheaderval = allslidesdata[0].imageheader;
            }
        }

        if (clearalleditor === true) {
            imgsource = undefined;
            imgtitleval = undefined;
            presenatationorderval = undefined;
            stypeval = undefined
            imageheaderval = undefined
        }

        let presinfocontainer = containertop.Add(new mobiwork.Container({ class: "pres-container" }));
        _imgtitle = presinfocontainer.Add(model.imgtitle);
        _imgtitle.value = imgtitleval;
        _presentationorder = presinfocontainer.Add(model.presenatationorder);
        _presentationorder.value = presenatationorderval;
        _slidetype = presinfocontainer.Add(model.stype);
        _slidetype.value = stypeval;
        _slidetype.onchange = function () {
            if (_slidetype.value === "Presentation") {
                _imageheader.visible = true;
            } else {
                _imageheader.visible = false;
            }
            presinfocontainer.Refresh();
        };

        _imageheader = presinfocontainer.Add(model.imageheader);
        _imageheader.value = imageheaderval;


        presentationimage = containertop.Add(new mobiwork.Image({
            class: "editor-image",
            src: imgsource,
            onclick: function (object) {
                mobiwork.OpenFile(function (file) {
                    self.UploadImage([file], object, "image");

                    // var reader = new FileReader();
                    // reader.readAsDataURL(file);

                    // reader.onloadend = function () {
                    //     var base64data = reader.result;
                    //     object.src = base64data;
                    //     object.Refresh();
                    // }

                    // presimagedata_files.push(file);
                    // presimagedata_field = "image"
                });
            },
            ondrop: function (files, object) {
                self.UploadImage(files, object, "image");

                // var reader = new FileReader();
                // reader.readAsDataURL(files[0]);

                // reader.onloadend = function () {
                //     var base64data = reader.result;
                //     object.src = base64data;
                //     object.Refresh();
                // }
                // presimagedata_files = file[0];
                // presimagedata_field = "image"
            }
        }));

        // if (!presentationimage.src) {
        //     presentationimage.object.addClass("image-empty");
        // }

        if (parent)
            containertop.Show(parent);
        else
            splitrightcontainer.Set(0, containertop);
    };

    this.ShowBotPanel = function (parent) {
        let items = [];
        containerbot = new mobiwork.Container({ class: "editor-container" });

        let contbotsave = containerbot.Add(new mobiwork.Container({ class: "button-container" }));
        contbotsave.Add(new mobiwork.Button({
            text: "Save",
            class: "button-addcontent-slide",
            icon: "content-save-outline",
            data: items,
            visible: viewsavebutton,
            onclick: function (data) {

                // console.log(presentationimage);


                if (clearalleditor === true) {
                    items.push({
                        presentationid: presentationid,
                        title: _imgtitle.value,
                        order: _presentationorder.value,
                        type: _slidetype.value,
                        imageheader: _imageheader.value,
                        content: editor.value,
                        experttip: et.value
                    });
                } else {
                    if (slidesdata) {
                        items.push({
                            presentationid: presentationid,
                            title: _imgtitle.value,
                            order: _presentationorder.value,
                            type: _slidetype.value,
                            imageheader: _imageheader.value,
                            _id: slidesdata._id,
                            content: editor.value,
                            experttip: et.value
                        });
                    } else {
                        items.push({
                            presentationid: presentationid,
                            title: _imgtitle.value,
                            order: _presentationorder.value,
                            type: _slidetype.value,
                            imageheader: _imageheader.value,
                            content: editor.value,
                            experttip: et.value
                        });
                    }
                }

                mobiwork.POST($API + "slide/Insert", JSON.stringify(data.data[0])).then(function (response) {
                    if (response) {
                        let options = { _id: response[0]._id, field: presimagedata_field, presid: presentationid, modtitle: param.moduletitle };

                        mobiwork.UploadFile({
                            url: $API + "slide/Upload",
                            name: presimagedata_field,
                            files: presimagedata_files,
                            options: options,
                            temp: data,
                            onsuccess: function () {
                                let slideid = { id: response[0]._id };
                                mobiwork.POST($API + "slide/GetById", JSON.stringify(slideid)).then(function (res) {
                                    if (res) {

                                        prestype = undefined;
                                        presentationdata = res[0];
                                        slidesdata = res[0];
                                        clearalleditor = false;

                                        let message = new mobiwork.MessageBox({
                                            text: "Submitted",
                                            message: "Save!",
                                            showcancel: false
                                        });

                                        // presentationdata = response[0];
                                        // slidesdata = response[0];

                                        self.ShowLeftPanel();
                                        // self.ShowRightPanel();
                                        self.ShowTopPanel();
                                        self.ShowBotPanel();

                                        message.Show();
                                    }
                                });


                            },
                            onerror: function (error) {

                            }
                        });

                        // let message = new mobiwork.MessageBox({
                        //     text: "Submitted",
                        //     message: "Save!",
                        //     showcancel: false
                        // });
                        // prestype = undefined;
                        // presentationdata = response[0];


                        // // self.SaveImage(options);
                        // self.ShowLeftPanel();
                        // // self.ShowRightPanel();
                        // self.ShowTopPanel();
                        // self.ShowBotPanel();

                        // message.Show();

                    } else {
                        let message = new mobiwork.MessageBox({
                            text: "Error",
                            message: "Unable to save data.",
                            showcancel: false
                        });

                        message.Show();
                    }
                });
            }
        }));

        contbotsave.Add(new mobiwork.Button({
            text: "Delete",
            class: "button-addcontent-slide-delete",
            icon: "trash-can-outline",
            data: slidesdata,
            visible: viewdeletebutton,
            onclick: function (data) {
                //delete object id in slide table
                let message = new mobiwork.MessageBox({
                    text: "Confirmation",
                    message: "Would you like to delete this record?",
                    showcancel: true,
                    onok: function () {

                        mobiwork.POST($API + "slide/DeleteDetails", JSON.stringify(data.data)).then(function (response) {
                            if (response) {

                                let message = new mobiwork.MessageBox({
                                    text: "Delete Record",
                                    message: "This record has been deleted!",
                                    showcancel: false
                                });

                                slidesdata = undefined;

                                self.ShowLeftPanel();
                                // self.ShowRightPanel();
                                self.ShowTopPanel();
                                self.ShowBotPanel();

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

        containerbot.Add(new mobiwork({ text: "Content", class: "editor-header" }));

        let editor = containerbot.Add(new mobiwork.InputTextArea({ placeholder: "Enter you text content here.", class: "editor-textarea" }));

        containerbot.Add(new mobiwork({ text: "Expert Tip", class: "et-header" }));

        let et = containerbot.Add(new mobiwork.InputTextArea({ placeholder: "Enter you exper tips here.", class: "editor-et" }));

        if (slidesdata) {
            if (slidesdata.content)
                editor.value = slidesdata.content;

            if (slidesdata.experttip)
                et.value = slidesdata.experttip;

        } else if (allslidesdata) {
            if (allslidesdata.length !== 0) {
                if (allslidesdata[0].content)
                    editor.value = allslidesdata[0].content;

                if (allslidesdata[0].experttip)
                    et.value = allslidesdata[0].experttip;
            } else {
                editor.value = undefined;
                et.value = undefined;
            }
        }

        if (clearalleditor === true) {
            editor.value = undefined;
            et.value = undefined;
        }



        if (parent)
            containerbot.Show(parent);
        else
            splitrightcontainer.Set(1, containerbot);
    }

    this.UploadImage = function (files, object, field) {
        if (!clearalleditor) {
            var reader = new FileReader();
            reader.readAsDataURL(files[0]);

            reader.onloadend = function () {
                var base64data = reader.result;
                object.src = base64data;
                object.Refresh();

                console.log(presentationimage);

                presentationimage.src = base64data;
                presentationimage.object.removeClass("image-empty");

                let spinner = new mobiwork.Spinner();
                spinner.Show();

                // let options = { _id: model._id.value, field: field };
                // $ACCOUNT.AddCredentials(options);

                mobiwork.UploadFile({
                    url: $API + "slide/Upload",
                    name: field,
                    files: files,
                    options: options,
                    onsuccess: function (data) {
                        presimagedata_field = field;
                        presimagedata_files = files;
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

    //-----------------------------------08-03-2021------------------------------------------------------------
    // this.UploadImage = function (files, object, field) {
    //     // if (model._id.value) {
    //     var reader = new FileReader();
    //     reader.readAsDataURL(files[0]);

    //     reader.onloadend = function () {
    //         var base64data = reader.result;
    //         object.src = base64data;
    //         object.Refresh();

    //         // model.medicalrecord.src = base64data;
    //         // model.medicalrecord.object.removeClass("image-empty");

    //         let spinner = new mobiwork.Spinner();
    //         spinner.Show();

    //         // let options = { _id: model._id.value, field: field };
    //         // $ACCOUNT.AddCredentials(options);

    //         mobiwork.UploadFile({
    //             url: $API + "slide/Upload",
    //             name: field,
    //             files: files,
    //             options: options,
    //             onsuccess: function (data) {
    //                 spinner.Dispose();
    //             },
    //             onerror: function (error) {
    //                 spinner.Dispose();
    //             }
    //         });
    //     }

    //     // } else {
    //     //     let message = new mobiwork.MessageBox({
    //     //         text: "Error",
    //     //         message: "Please press Save button first before uploading documents.",
    //     //         showcancel: false
    //     //     });

    //     //     message.Show();
    //     // }
    // };


};

var presentation_model = function () {
    let self = this;

    this.imgtitle = new mobiwork.InputText({
        text: "Title"
    });

    let stype_ = [];

    for (let i = 0; i < slidetype.length; i++) {
        stype_.push(slidetype[i]);
    };

    this.stype = new mobiwork.InputDataList({
        list: stype_,
        text: "Slide Type",
        value: "Presentation",
    });

    this.imageheader = new mobiwork.InputText({
        text: "Image Text Header",
        visible: true
    });

    this.presenatationorder = new mobiwork.InputText({
        text: "Presentation Order"
    });
};

var slidetype = [
    "Presentation",
    "Exercise"
]