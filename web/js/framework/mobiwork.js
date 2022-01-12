"use strict";

var _COUNTER_ = 100;
var _HASH_ = 0;
var _HISTORY_;

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

var FILEFORMAT = {
    RAW: 0,
    TEXT: 1,
    ZIP: 2,
    PDF: 3
};

var FORMSTATE = {
    NORMAL: 0,
    MAXIMIZE: 1,
    MINIMIZE: 2
};

var ORIENTATION = {
    HORIZONTAL: 0,
    VERTICAL: 1
};

var POSITION = {
    TOP: 0,
    BOTTOM: 1,
    LEFT: 2,
    RIGHT: 3
};

var SPINNERTYPE = {
    DOUBLEBOUNCE: "double-bounce",
    SQUARE: "square"
};

//To handle ESC key
document.onkeydown = function (event) {
    if (event.keyCode === 27 && mobiwork.eventescape.length !== 0) {
        if (mobiwork.eventescape[mobiwork.eventescape.length - 1].type !== "VIEW")
            history.back();
    }
};

// //To handle browser BACKBUTTON
// window.onhashchange = function (e) {
//     let hash;

//     if (_HISTORY_) {
//         _HISTORY_ = false;
//         return;
//     }

//     if (location.hash !== "" && location.hash.indexOf("$$$") === -1) {
//         return;
//     }

//     if (mobiwork.eventescape.length === 0) {
//         if (mobiwork.message && mobiwork.message.Dispose)
//             mobiwork.message.Dispose();

//         mobiwork.message = new mobiwork.MessageBox({
//             icon: "information-outline",
//             text: "Close Application",
//             message: "To close the application, close the browser or browser tab.",
//         });

//         mobiwork.message.Show();

//         _HISTORY_ = true;
//         location.hash = "$$$" + mobiwork.GUID();

//         return;

//     } else {
//         let url = e.oldURL.split("#$$$")[1];

//         if (url === undefined || url.length > 10)
//             hash = _HASH_;
//         else
//             hash = parseInt(location.hash.replace('#$$$', ''), 10);
//     }

//     if (_HASH_ !== hash) {
//         var action = mobiwork.eventescape.pop();

//         if (action) {
//             if (action.func)
//                 action.func(action.param);
//             else if (action.action)
//                 action.action();
//             else
//                 action();
//         }
//     }
// };

var mobiwork = function (_param_, _class_) {
    let self = this;

    this.id;
    this.class;
    this.element = "div";

    this.children = [];
    this.tools = [];

    this.enabled = true;
    this.visible = true;
    this.showcontrols = false;
    this.object;
    this.parent;
    this.controls;

    if (_class_) {
        this.class = _class_;
    }

    if (_param_) {
        if (_param_.element !== undefined)
            this.element = _param_.element;
        if (_param_.text !== undefined)
            this.text = _param_.text;

        if (_param_.icon !== undefined)
            this.icon = _param_.icon;

        if (_param_.children !== undefined)
            this.children = _param_.children;

        if (_param_.tools !== undefined)
            this.tools = _param_.tools;

        if (_param_.onclick !== undefined)
            this.onclick = _param_.onclick;

        if (_param_.onload !== undefined)
            this.onload = _param_.onload;

        if (_param_.onrefresh !== undefined)
            this.onrefresh = _param_.onrefresh;

        if (_param_.ondispose !== undefined)
            this.ondispose = _param_.ondispose;

        if (_param_.ondrop !== undefined)
            this.ondrop = _param_.ondrop;

        if (_param_.fileformat !== undefined)
            this.fileformat = _param_.fileformat;

        if (_param_.visible !== undefined)
            this.visible = _param_.visible;

        if (_param_.enabled !== undefined)
            this.enabled = _param_.enabled;

        if (_param_.highlight !== undefined)
            this.highlight = _param_.highlight;

        if (_param_.selected !== undefined)
            this.selected = _param_.selected;

        if (_param_.id !== undefined)
            this.id = _param_.id;

        if (_param_.data !== undefined)
            this.data = _param_.data;

        if (_param_.class !== undefined)
            if (this.class)
                this.class += " " + _param_.class;
            else
                this.class = _param_.class;
    }

    if (!this.ondispose) {
        this.ondispose = function (e) {
            e();
        };
    }

    //Display the object
    //This function will generate the container element
    this.Show = function (parent, parentcontrol) {
        if (parent) {
            if (parent.append) {
                //parent is a jQuery object
                this.parent = parent;

                if (parentcontrol) {
                    this.parentcontrol = parentcontrol;

                    if (parentcontrol.onclickchild)
                        self.onclickchild = parentcontrol.onclickchild;

                    if (parentcontrol.onrefresh)
                        self.onrefresh = parentcontrol.onrefresh;
                }
            } else if (parent.object) {
                //parent is a mobiwork control
                this.parent = parent.object;
                this.parentcontrol = parent;

                if (parent.onclickchild)
                    self.onclickchild = parent.onclickchild;

                if (parent.onrefresh)
                    self.onrefresh = parent.onrefresh;
            } else
                //Set body as the parent
                this.parent = $("body");
        } else
            //Set body as the parent
            this.parent = $("body");

        //Generate ID
        let _class_ = this.class;

        if (!this.visible)
            _class_ += " hidden";

        if (!this.enabled)
            _class_ += " disable";

        if (this.selected)
            _class_ += " highlight";

        let attributes = "";

        if (this.id)
            attributes += " id='" + this.id + "'";

        if (_class_)
            attributes += " class='" + _class_ + "'";

        //Create object

        this.object = $("<" + this.element + attributes + ">" + "</" + this.element + ">");

        this.parent.append(this.object);

        this.Refresh();

        //Drag and drop
        Drop();

        //Raise onload event
        if (this.onload)
            this.onload();
    };

    //Must be called when the object needs to be updated
    this.Refresh = function () {
        if (this.object) {
            //Empty DOM first before adding contents
            this.object.empty();

            this.Render(this.object, this);

            //Children
            if (this.children.length !== 0) {
                let children = $("<div class='children'></div>");
                this.object.append(children);

                for (let i = 0; i < this.children.length; i++)
                    if (this.children[i].Show) {
                        this.children[i].Show(children, self);

                    }
            }

            this.Events();

            // if (self.onrefresh)
            //     self.onrefresh();
        }
    };

    //Generate html elements
    this.Render = function (parent, param) {
        if (param.text || param.icon || self.showcontrols || self.tools.length !== 0) {
            //Add header icon
            let control = $("<div class='control'></div>");
            parent.append(control);

            this.RenderIcon(control, param);

            //Add header text
            if (param.text) {
                if (param.text.Show) {
                    let text = $("<div class='text'></div>");
                    control.append(text);
                    param.text.Show(text);
                } else
                    control.append("<div class='text'>" + param.text + "</div>");
            }

            //Tools
            if (self.showcontrols || self.tools.length !== 0) {
                self.controls = $("<div class='tools'></div>");
                control.append(self.controls);
                self.RenderTools();
            }
        }
    };

    //Render icon
    this.RenderIcon = function (parent, param) {
        if (param.icon) {
            if (param.icon.Show)
                param.icon.Show(parent);
            else {
                if (param.text)
                    parent.append("<div class='icon has-text'>" + mobiwork.FormatIcon(param.icon) + "</div>");
                else
                    parent.append("<div class='icon'>" + mobiwork.FormatIcon(param.icon) + "</div>");
            }
        }
    };

    this.RenderTools = function () {
        self.controls.empty();

        let icon;

        for (let i = 0; i < self.tools.length; i++)
            if (self.tools[i].Show) {
                icon = $("<div class='tool-icon'></div>");
                self.controls.append(icon);
                self.tools[i].Show(icon);
            }
    };

    //Bind events
    this.Events = function () {
        if (this.onclick || this.highlight) {
            self.object.addClass("pointer");

            this.Click(this.object, function (e) {
                e.stopPropagation();
                self.Click();
            });
        }
    };

    //Bind click event
    this.Click = function (object, func) {
        if (object) {
            object.unbind();
            object.click(func);

        } else {
            if (self.highlight) {
                self.ClearHighlight();
                self.object.addClass("highlight");
            }

            if (self.onclick)
                self.onclick(self, self.data);

            if (self.onclickchild)
                self.onclickchild(self, self.data);
        }
    };


    //Add chilren
    this.Add = function (child) {
        if (Array.isArray(child)) {
            //Child is an array of controls
            for (let i = 0; i < child.length; i++)
                self.children.push(child[i]);

        } else if (child.Show)
            //Child is a control
            self.children.push(child);

        else {
            //Child is an object containing controls
            for (let name in child)
                if (child[name].Show)
                    self.children.push(child[name]);
        }

        return child;
    };

    this.Append = function (object) {
        if (object.object) {
            if (!self.childrenobject) {
                self.childrenobject = self.object.find(">.children");

                if (self.childrenobject.length === 0) {
                    self.childrenobject = $("<div class='children'></div>");
                    self.object.append(self.childrenobject);
                }
            }

            object.object.detach().appendTo(self.childrenobject);
        } else if (object.Show) {
            self.childrenobject = self.object.find(">.children");

            if (!self.childrenobject.length) {
                self.childrenobject = $("<div class='children'></div>");
                self.object.append(self.childrenobject);
            }

            object.Show(self.childrenobject);

        } else
            object.detach().appendTo(self.object);

        return object;
    };

    //Clear children
    this.Clear = function () {
        if (self.object)
            self.object.empty();

        delete self.iconobject;

        self.children = [];
    };

    this.Focus = function () {
        self.object.focus();
    };

    //Progress bar
    this.Progress = function (value) {
        self.progressbar.css({
            width: value * 100 + "%"
        });
    };

    this.ShowProgress = function (value) {
        if (value) {
            self.progress = $("<div class='progress'><div class='progress-bar'></div></div>");
            self.object.append(self.progress);
            self.progressbar = self.progress.find(".progress-bar");
        } else {
            self.progress.remove();
            self.progress = undefined;
            self.progressbar = undefined;
        }
    };

    //Hide of show control
    //Must be called only when needed to speed up rendering of elements
    this.Visible = function (value) {
        if (value)
            this.object.removeClass("hidden");
        else
            this.object.addClass("hidden");
    };

    //Enable or disable control
    //Must be called only when needed to speed up rendering of elements
    this.Enable = function (value) {
        if (value)
            this.object.removeClass("disable");
        else
            this.object.addClass("disable");
    };

    //Readonly
    //Must be called only when needed to speed up rendering of elements
    this.Readonly = function (value) {
        if (value)
            this.object.addClass("readonly");
        else
            this.object.removeClass("readonly");
    };

    //Readonly
    //Must be called only when needed to speed up rendering of elements
    this.Highlight = function (value) {
        if (this.object) {
            if (value)
                this.object.addClass("highlight");
            else
                this.object.removeClass("highlight");
        }
    };

    this.AddClass = function (_class_) {
        self.object.addClass(_class_);
    };

    this.RemoveClass = function (_class_) {
        self.object.removeClass(_class_);
    };

    this.ClearHighlight = function () {
        if (self.object) {
            let objects = self.object.parent().find(".highlight");
            objects.removeClass("highlight");
        }
    };

    this.Resize = function () {
        for (let i = 0; i < this.children.length; i++)
            if (this.children[i].Resize)
                this.children[i].Resize();
    }

    //Destroy object and remove from DOM
    //Must be call when removing object to clear memory
    this.Dispose = function () {
        //Raise ondispose event
        self.ondispose(function () {
            //Remove DOM
            if (self.object) {
                self.object.remove();

                //Dispose children
                for (let i = 0; i < self.children.length; i++) {
                    if (self.children[i].Dispose)
                        self.children[i].Dispose();
                }
            }
        });
    };

    //Events
    function Drop() {
        if (self.ondrop) {
            self.object.on({
                'dragover dragenter': function (e) {
                    e.preventDefault(); // prevents default event from firing
                    e.stopPropagation(); // prevents firing of parent event handlers (prevents bubbling effect)

                    $(this).addClass("ondrag");
                },
                'dragleave': function (e) {
                    $(this).removeClass("ondrag");
                },
                'drop': function (e) {
                    $(this).removeClass("ondrag");

                    var dataTransfer = e.originalEvent.dataTransfer;

                    if (dataTransfer && dataTransfer.files.length) {
                        e.preventDefault();
                        e.stopPropagation();

                        switch (self.fileformat) {
                            case FILEFORMAT.TEXT:
                                $(dataTransfer.files).each(function () {
                                    var reader = new FileReader();
                                    reader.readAsText(this);

                                    reader.onload = function (readEvent) {
                                        self.ondrop(readEvent.target.result);
                                    }
                                });

                                break;

                            case FILEFORMAT.ZIP:
                                $(dataTransfer.files).each(function () {
                                    var zip = new JSZip();
                                    zip.loadAsync(this)
                                        .then(function (zip) {
                                            self.ondrop(zip);
                                            //Success
                                        }, function () {
                                            //Error
                                        });
                                });

                                break;

                            case FILEFORMAT.PDF:
                                $(dataTransfer.files).each(function () {
                                    $(dataTransfer.files).each(function () {
                                        var reader = new FileReader();
                                        reader.readAsArrayBuffer(this);

                                        reader.onload = function (readEvent) {
                                            pdfjsLib.disableWorker = true;

                                            var pdf = pdfjsLib.getDocument(readEvent.target.result).then(function (pdf) {
                                                let results = "";
                                                let counter = 0;
                                                let pages = pdf.numPages;

                                                for (let i = 0; i < pdf.numPages; i++) {
                                                    pdf.getPage(i + 1).then(function (page) {
                                                        page.getTextContent().then(function (textContent) {

                                                            for (let j = 0; j < textContent.items.length; j++) {
                                                                if (textContent.items[j].str.trim())
                                                                    results += textContent.items[j].str + '<br/>';
                                                            }

                                                            counter++;

                                                            if (counter === pages) {
                                                                self.ondrop(results);
                                                            }
                                                        });
                                                    });
                                                }
                                            });
                                        }
                                    });
                                });

                                break;

                            default:
                                self.ondrop(dataTransfer.files, self);
                                break;
                        }
                    }
                }
            });
        }
    };
};


mobiwork.ModalBackground = function (param) {
    mobiwork.call(this, param, "modal dock fadein");

    let self = this;
    let parent;
    let autodispose = true;

    if (param.parent)
        parent = param.parent;

    if (param.autodispose !== undefined)
        autodispose = param.autodispose;

    this.onclick = function () {
        if (autodispose) {
            self.Dispose();

            if (parent && parent.Dispose) {
                parent.Dispose();

                if (parent instanceof mobiwork.Form || parent instanceof mobiwork.SlidePanel)
                    mobiwork.eventescape.pop();
            }
        }
    };

    this.onload = function () {
        this.object.css({ "z-index": _COUNTER_++ });
    };

    this.ondispose = function (e) {
        this.object.addClass("fadeout");

        let timer = setTimeout(function () {
            clearTimeout(timer);
            e();
        }, 500);
    };

    this.SetOpacity = function (opacity) {
        this.object.css({ "background-color": "rgba(0, 0, 0, " + opacity + ")" });
    };
};

mobiwork.View = function (param) {
    mobiwork.call(this, param, "view dock");

    let self = this;
    let header;
    let body;

    this.icon = "menu";

    if (param) {
        this.onmenu = param.onmenu;
        this.autodispose = param.autodispose;

        if (param.icon)
            this.icon = param.icon;
    }

    this.Refresh = function () {
        self.object.empty();

        //Header
        header = $("<div class='view-header'></div>");
        self.object.append(header);

        //Body
        body = $("<div class='view-body'></div>");
        self.object.append(body);

        for (let i = 0; i < self.children.length; i++)
            self.children[i].Show(body);

        self.RefreshHeader();
    };

    this.RefreshHeader = function () {
        header.empty();
        self.Render(header, self);
        self.Events();
    };

    this.Events = function () {
        let menu = self.object.find(".view-header>.control>.icon");

        self.Click(menu, function () {
            if (self.onclick) {
                if (self.onclick)
                    self.onclick();
            } else if (self.autodispose) {
                mobiwork.eventescape.pop();
                self.Dispose();

            } else {
                let panel = new mobiwork.SlidePanel();
                panel.Show();

                if (self.onmenu)
                    self.onmenu(panel);
            }
        });
    };

    this.ShowBackButton = function () {
        self.autodispose = true;
        self.icon = "arrow-left";
        self.RefreshHeader();

        mobiwork.eventescape.push({ type: "VIEW", action: self.Dispose });
        //location.hash = "$$$" + ++_HASH_;
    };

    this.Progress = function (value) {
        self.progressbar.css({
            width: value * 100 + "%"
        });
    };

    this.ShowProgress = function (value) {
        if (value) {
            self.progress = $("<div class='progress'><div class='progress-bar'></div></div>");
            header.append(self.progress);
            self.progressbar = self.progress.find(".progress-bar");
        } else {
            self.progress.remove();
            self.progress = undefined;
            self.progressbar = undefined;
        }
    };
}

mobiwork.DesktopView = function (param) {
    mobiwork.call(this, param, "desktop-view dock");

    let self = this;
    let splitter;
    let menu = param.menu;

    this.view;

    this.Refresh = function () {
        splitter = new mobiwork.SplitContainer({
            class: "desktop-view-splitter",
            children: [{ size: 240 }]
        });

        splitter.Show();

        let container = new mobiwork.ScrollContainer();
        container.Add(menu);
        splitter.Set(0, container);

        self.view = new mobiwork.View({
            onclick: function () {
                if (splitter.children[0].size === 70) {
                    splitter.object.toggleClass("mini");
                    splitter.children[0].size = 240;
                } else {
                    splitter.object.toggleClass("mini");
                    splitter.children[0].size = 70;
                }

                splitter.Resize();
            }
        });

        splitter.Set(1, self.view);
    };
}

mobiwork.Form = function (param) {
    param.element = "form";
    mobiwork.call(this, param, "form bouncein");

    let self = this;
    let header;
    let body;
    let footer;
    let background;
    let recordhistory = true;

    this.left = 0;
    this.top = 0;
    this.width = 800;
    this.height = 600;

    this.state = FORMSTATE.NORMAL;
    this.check = true; //Check required inputs

    //View
    this.showheader = true;
    this.showfooter = true;
    this.showcancel = true;
    this.showclose = true;
    this.modal = true;
    this.autodispose = true;

    this.ok = "OK";
    this.cancel = "Cancel";

    //Action
    this.draggable = false;
    this.resizable = false;

    this.buttons = [];
    this.footer = [];

    if (param) {
        if (param.modal !== undefined)
            this.modal = param.modal;

        if (param.width !== undefined)
            this.width = param.width;

        if (param.height !== undefined)
            this.height = param.height;

        if (param.showheader !== undefined)
            this.showheader = param.showheader;

        if (param.showfooter !== undefined)
            this.showfooter = param.showfooter;

        if (param.showcancel !== undefined)
            this.showcancel = param.showcancel;

        if (param.showclose !== undefined)
            this.showclose = param.showclose;

        if (param.autodispose !== undefined)
            this.autodispose = param.autodispose;

        if (param.footer !== undefined)
            this.footer = param.footer;

        if (param.state !== undefined)
            this.state = param.state;

        if (param.onok !== undefined)
            this.onok = param.onok;

        if (param.oncancel !== undefined)
            this.oncancel = param.oncancel;

        if (param.ok !== undefined)
            this.ok = param.ok;

        if (param.cancel !== undefined)
            this.cancel = param.cancel;

        if (param.draggable !== undefined)
            this.draggable = param.draggable;

        if (param.resizable !== undefined)
            this.resizable = param.resizable;

        if (param.opacity !== undefined)
            this.opacity = param.opacity;

        if (param.recordhistory !== undefined) {
            recordhistory = param.recordhistory;
        }
    }

    //Show background
    if (self.modal) {
        background = new mobiwork.ModalBackground({
            autodispose: this.autodispose,
            parent: this,
            class: param.modalclass
        });

        background.Show();
    }

    this.onload = function () {
        //Dispose when user presses ESC key
        mobiwork.eventescape.push({ type: "FORM", action: self.Dispose });

        if (recordhistory)
            //location.hash = "$$$" + ++_HASH_;

            if (self.opacity !== undefined && self.modal) {
                background.SetOpacity(self.opacity);
            }
    };

    this.Refresh = function () {
        this.object.empty();
        this.object.attr("action", "#");
        this.object.append('<input type="submit" style="visibility: hidden; position: absolute;"/>');

        //Header
        if (this.showheader) {
            header = $("<div class='form-header'></div>");
            this.object.append(header);
        }

        //Body
        body = $("<div class='form-body'></div>");
        this.object.append(body);

        //Footer
        if (this.showfooter) {
            footer = $("<div class='form-footer'></div>");
            this.object.append(footer);
        }

        if (this.showheader) {
            self.Render(header, this);

            //Add buttons
            if (this.showclose) {
                if (!self.controls) {
                    self.controls = $("<div class='tools'></div>");
                    header.append(self.controls);

                    self.controls.append("<div class='form-close tool-icon'>" + mobiwork.FormatIcon("close") + "</div>");

                } else
                    self.controls.append("<div class='form-close tool-icon'>" + mobiwork.FormatIcon("close") + "</div>");
            }
        }

        if (this.showfooter) {
            let buttons = $("<div class='footer-buttons'></div>");
            footer.append(buttons);

            buttons.append("<div class='form-button form-ok'>" + this.ok + "</div>");

            if (this.showcancel)
                buttons.append("<div class='form-button form-cancel'>" + this.cancel + "</div>");

            if (this.footer.length) {
                buttons = $("<div class='footer-buttons footer-custom-buttons'></div>");
                footer.append(buttons);

                for (let i = 0; i < this.footer.length; i++) {
                    if (this.footer[i].Show)
                        this.footer[i].Show(buttons);
                    else
                        buttons.append("<div class='form-button'>" + this.footer[i] + "</div>");
                }
            }
        }

        if (this.state === FORMSTATE.MAXIMIZE)
            this.Maximize();

        if (!this.showheader)
            this.object.addClass("no-header");

        if (!this.showfooter)
            this.object.addClass("no-footer");

        if (this.draggable)
            this.object.draggable({
                cancel: '.form-body, .form-footer, .tools'
            });

        //Resize
        self.Resize();

        //Add children
        for (let i = 0; i < this.children.length; i++)
            this.children[i].Show(body);

        this.Events();
    };

    this.Events = function () {
        if (header) {
            let close = header.find(".form-close");

            self.Click(close, function () {
                mobiwork.eventescape.pop();

                if (self.autodispose)
                    self.Dispose();

                if (self.oncancel)
                    self.oncancel();
            });
        }

        if (footer) {
            let ok = footer.find(".form-ok");

            self.Click(ok, function () {
                self.Submit();
            });

            let cancel = footer.find(".form-cancel");

            self.Click(cancel, function () {
                mobiwork.eventescape.pop();

                if (self.oncancel)
                    self.oncancel();

                if (self.autodispose)
                    self.Dispose();
            });
        }

        //Submit
        self.object.submit(function (e) {
            e.preventDefault();
            self.Submit();
        });
    };

    this.Submit = function () {
        mobiwork.eventescape.pop();

        let handle = true;

        if (self.check) {
            let children = self.children;

            if (children[0] instanceof mobiwork.ScrollContainer)
                children = children[0].children;

            //Check required inputs. Can handle first level children only.
            for (let i = 0; i < children.length; i++) {
                if (children[i].required) {
                    if (children[i].value === undefined) {
                        //Remove existing required button
                        let required = children[i].object.find(".required");
                        required.remove();

                        //Show required button
                        let value = children[i].object.find(".value");
                        value.append("<div class='required fadein'>" + mobiwork.FormatIcon("star") + "</div>");

                        handle = false;
                        break;
                    }
                }
            }
        }

        if (handle) {
            if (self.onok)
                self.onok();

            if (self.autodispose)
                self.Dispose();
        }
    };

    this.AddList = function (list) {
        for (let i = 0; i < list.length; i++) {
            if (list[i].text)
                self.Add(new mobiwork.List(list[i]));
            else
                self.Add(new mobiwork.List({ text: list[i] }));
        }
    };

    this.Maximize = function () {
        self.object.addClass("maximize");
    };

    this.Location = function (left, top) {
        this.left = left;
        this.top = top;

        if (left !== undefined)
            self.object.css({ "left": left });
        if (top !== undefined)
            self.object.css({ "top": top });
    };
    this.Top = function (top) {
        this.top = top;

        if (top !== undefined)
            self.object.css({ "top": top });
    };

    this.Center = function () {
        let left = (window.innerWidth - this.width) / 2;
        let top = (window.innerHeight - this.height) / 2;

        self.object.css({
            "left": left,
            "top": top
        });
    };

    this.Resize = function () {
        if (self.width > window.innerWidth)
            self.width = window.innerWidth - 32;

        if (self.height > window.innerHeight)
            self.height = window.innerHeight;

        self.left = (window.innerWidth - self.width) / 2;
        self.top = (window.innerHeight - self.height) / 2;

        self.object.css({
            "z-index": _COUNTER_++,
            "width": self.width,
            "height": self.height,
            "left": self.left,
            "top": self.top
        });
    };

    this.Size = function (width, height) {
        this.width = width;
        this.height = height;

        self.object.css({
            "width": width,
            "height": height,
        });
    };

    this.Height = function (height) {
        self.object.css({ "height": height });
    };

    this.Width = function (width) {
        self.object.css({ "width": width });
    };

    //Must be called when removing object to clear memory
    this.Dispose = function () {
        if (self.modal && background && background.Dispose)
            background.Dispose();

        if (self.object) {
            self.object.addClass("bounceout");

            let timer = setTimeout(function () {
                clearTimeout(timer);

                //Remove DOM
                if (self.object) {
                    self.object.remove();

                    //Dispose children
                    for (let i = 0; i < self.children.length; i++) {
                        if (self.children[i].Dispose)
                            self.children[i].Dispose();
                    }
                }

                //Remove all references
                for (let name in self) {
                    self[name] = undefined;
                }

                //Raise ondispose event
                if (self.ondispose)
                    self.ondispose();

            }, 250);
        }
    };
};

mobiwork.ImageViwerRRCAP = function (param) {
    param.element = "form";
    mobiwork.call(this, param, "form bouncein");

    let self = this;
    let header;
    let body;
    let footer;
    let background;
    let recordhistory = true;

    this.left = 0;
    this.top = 0;
    this.width = window.innerWidth / 1.8;
    this.height = window.innerHeight / 1.3
    // this.width = 1024;
    // this.height = 650;

    this.state = FORMSTATE.NORMAL;
    this.check = true; //Check required inputs

    //View
    this.showheader = true;
    this.showfooter = true;
    this.showcancel = true;
    this.showclose = true;
    this.modal = true;
    this.autodispose = true;

    this.ok = "OK";
    this.cancel = "Cancel";

    //Action
    this.draggable = false;
    this.resizable = false;

    this.buttons = [];
    this.footer = [];

    if (param) {
        if (param.modal !== undefined)
            this.modal = param.modal;

        if (param.width !== undefined)
            this.width = param.width;

        if (param.height !== undefined)
            this.height = param.height;

        if (param.showheader !== undefined)
            this.showheader = param.showheader;

        if (param.showfooter !== undefined)
            this.showfooter = param.showfooter;

        if (param.showcancel !== undefined)
            this.showcancel = param.showcancel;

        if (param.showclose !== undefined)
            this.showclose = param.showclose;

        if (param.autodispose !== undefined)
            this.autodispose = param.autodispose;

        if (param.footer !== undefined)
            this.footer = param.footer;

        if (param.state !== undefined)
            this.state = param.state;

        if (param.onok !== undefined)
            this.onok = param.onok;

        if (param.oncancel !== undefined)
            this.oncancel = param.oncancel;

        if (param.ok !== undefined)
            this.ok = param.ok;

        if (param.cancel !== undefined)
            this.cancel = param.cancel;

        if (param.draggable !== undefined)
            this.draggable = param.draggable;

        if (param.resizable !== undefined)
            this.resizable = param.resizable;

        if (param.opacity !== undefined)
            this.opacity = param.opacity;

        if (param.recordhistory !== undefined) {
            recordhistory = param.recordhistory;
        }
    }

    //Show background
    if (self.modal) {
        background = new mobiwork.ModalBackground({
            autodispose: this.autodispose,
            parent: this,
            class: param.modalclass
        });

        background.Show();
    }

    this.onload = function () {
        //Dispose when user presses ESC key
        mobiwork.eventescape.push({ type: "FORM", action: self.Dispose });

        if (recordhistory)
            //location.hash = "$$$" + ++_HASH_;

            if (self.opacity !== undefined && self.modal) {
                background.SetOpacity(self.opacity);
            }
    };

    this.Refresh = function () {
        this.object.empty();
        this.object.attr("action", "#");
        this.object.append('<input type="submit" style="visibility: hidden; position: absolute;"/>');

        //Header
        if (this.showheader) {
            header = $("<div class='form-header'></div>");
            this.object.append(header);
        }

        //Body
        body = $("<div class='form-body'></div>");
        this.object.append(body);

        //Footer
        if (this.showfooter) {
            footer = $("<div class='form-footer'></div>");
            this.object.append(footer);
        }

        if (this.showheader) {
            self.Render(header, this);

            //Add buttons
            if (this.showclose) {
                if (!self.controls) {
                    self.controls = $("<div class='tools'></div>");
                    header.append(self.controls);

                    self.controls.append("<div class='form-close tool-icon'>" + mobiwork.FormatIcon("close") + "</div>");

                } else
                    self.controls.append("<div class='form-close tool-icon'>" + mobiwork.FormatIcon("close") + "</div>");
            }
        }

        if (this.showfooter) {
            let buttons = $("<div class='footer-buttons'></div>");
            footer.append(buttons);

            buttons.append("<div class='form-button form-ok'>" + this.ok + "</div>");

            if (this.showcancel)
                buttons.append("<div class='form-button form-cancel'>" + this.cancel + "</div>");

            if (this.footer.length) {
                buttons = $("<div class='footer-buttons footer-custom-buttons'></div>");
                footer.append(buttons);

                for (let i = 0; i < this.footer.length; i++) {
                    if (this.footer[i].Show)
                        this.footer[i].Show(buttons);
                    else
                        buttons.append("<div class='form-button'>" + this.footer[i] + "</div>");
                }
            }
        }

        if (this.state === FORMSTATE.MAXIMIZE)
            this.Maximize();

        if (!this.showheader)
            this.object.addClass("no-header");

        if (!this.showfooter)
            this.object.addClass("no-footer");

        if (this.draggable)
            this.object.draggable({
                cancel: '.form-body, .form-footer, .tools'
            });

        //Resize
        self.Resize();

        //Add children
        for (let i = 0; i < this.children.length; i++)
            this.children[i].Show(body);

        this.Events();
    };

    this.Events = function () {
        if (header) {
            let close = header.find(".form-close");

            self.Click(close, function () {
                mobiwork.eventescape.pop();

                if (self.autodispose)
                    self.Dispose();

                if (self.oncancel)
                    self.oncancel();
            });
        }

        if (footer) {
            let ok = footer.find(".form-ok");

            self.Click(ok, function () {
                self.Submit();
            });

            let cancel = footer.find(".form-cancel");

            self.Click(cancel, function () {
                mobiwork.eventescape.pop();

                if (self.oncancel)
                    self.oncancel();

                if (self.autodispose)
                    self.Dispose();
            });
        }

        //Submit
        self.object.submit(function (e) {
            e.preventDefault();
            self.Submit();
        });
    };

    this.Submit = function () {
        mobiwork.eventescape.pop();

        let handle = true;

        if (self.check) {
            let children = self.children;

            if (children[0] instanceof mobiwork.ScrollContainer)
                children = children[0].children;

            //Check required inputs. Can handle first level children only.
            for (let i = 0; i < children.length; i++) {
                if (children[i].required) {
                    if (children[i].value === undefined) {
                        //Remove existing required button
                        let required = children[i].object.find(".required");
                        required.remove();

                        //Show required button
                        let value = children[i].object.find(".value");
                        value.append("<div class='required fadein'>" + mobiwork.FormatIcon("star") + "</div>");

                        handle = false;
                        break;
                    }
                }
            }
        }

        if (handle) {
            if (self.onok)
                self.onok();

            if (self.autodispose)
                self.Dispose();
        }
    };

    this.AddList = function (list) {
        for (let i = 0; i < list.length; i++) {
            if (list[i].text)
                self.Add(new mobiwork.List(list[i]));
            else
                self.Add(new mobiwork.List({ text: list[i] }));
        }
    };

    this.Maximize = function () {
        self.object.addClass("maximize");
    };

    this.Location = function (left, top) {
        this.left = left;
        this.top = top;

        if (left !== undefined)
            self.object.css({ "left": left });
        if (top !== undefined)
            self.object.css({ "top": top });
    };
    this.Top = function (top) {
        this.top = top;

        if (top !== undefined)
            self.object.css({ "top": top });
    };

    this.Center = function () {
        let left = (window.innerWidth - this.width) / 2;
        let top = (window.innerHeight - this.height) / 2;

        self.object.css({
            "left": left,
            "top": top
        });
    };

    this.Resize = function () {
        if (self.width > window.innerWidth)
            self.width = window.innerWidth - 32;

        if (self.height > window.innerHeight)
            self.height = window.innerHeight;

        self.left = (window.innerWidth - self.width) / 2;
        self.top = (window.innerHeight - self.height) / 2;

        self.object.css({
            "z-index": _COUNTER_++,
            "width": self.width,
            "height": self.height,
            "left": self.left,
            "top": self.top
        });
    };

    this.Size = function (width, height) {
        this.width = width;
        this.height = height;

        self.object.css({
            "width": width,
            "height": height,
        });
    };

    this.Height = function (height) {
        self.object.css({ "height": height });
    };

    this.Width = function (width) {
        self.object.css({ "width": width });
    };

    //Must be called when removing object to clear memory
    this.Dispose = function () {
        if (self.modal && background && background.Dispose)
            background.Dispose();

        if (self.object) {
            self.object.addClass("bounceout");

            let timer = setTimeout(function () {
                clearTimeout(timer);

                //Remove DOM
                if (self.object) {
                    self.object.remove();

                    //Dispose children
                    for (let i = 0; i < self.children.length; i++) {
                        if (self.children[i].Dispose)
                            self.children[i].Dispose();
                    }
                }

                //Remove all references
                for (let name in self) {
                    self[name] = undefined;
                }

                //Raise ondispose event
                if (self.ondispose)
                    self.ondispose();

            }, 250);
        }
    };
};

mobiwork.MessageBox = function (param) {
    mobiwork.call(this, param, "message-box");

    let self = this;

    if (param.text !== undefined)
        this.text = param.text;

    if (param.message !== undefined)
        this.message = param.message;

    if (param.icon !== undefined)
        this.icon = param.icon;

    if (param.onok !== undefined)
        this.onok = param.onok;

    if (param.oncancel !== undefined)
        this.oncancel = param.oncancel;

    if (param.ok !== undefined)
        this.ok = param.ok;

    if (param.cancel !== undefined)
        this.cancel = param.cancel;

    this.showcancel = true;

    if (param.showcancel !== undefined)
        this.showcancel = param.showcancel;

    this.Show = function () {
        self.form = new mobiwork.Form({
            text: self.text,
            width: 400,
            height: 200,
            onok: self.onok,
            oncancel: self.oncancel,
            ok: this.ok,
            cancel: this.cancel,
            recordhistory: false,
            showcancel: this.showcancel
        });

        self.form.class += " message-box";

        self.form.Add(new mobiwork.List({ icon: self.icon, text: self.message }));
        self.form.Show();
    };

    this.Dispose = function () {
        if (self.form.Dispose)
            self.form.Dispose();
    };
};

mobiwork.MessagePopup = function (param) {
    mobiwork.call(this, param, "message-box message-popup");

    let self = this;

    if (param.text !== undefined)
        this.text = param.text;

    if (param.icon !== undefined)
        this.icon = param.icon;

    this.Show = function () {
        let form = new mobiwork.Form({
            showheader: false,
            showfooter: false,
            modal: false,
            width: 320,
            height: 60,
            recordhistory: false
        });

        form.class += " message-box message-popup slidemessagepop";

        form.Add(new mobiwork.List({ icon: self.icon, text: self.text }));
        form.Show();

        let timer = setTimeout(function () {
            form.Dispose();
            form = undefined;
        }, 4000);
    };
};


//Table

mobiwork.Table = function (param) {
    mobiwork.call(this, param, "table dock");

    let self = this;

    this.showheader = true;
    this.showfooter = true;
    this.showpage = true;

    this.columns = param.columns;

    let header;
    let body;
    let indexed = false;

    if (param.indexed !== undefined)
        indexed = param.indexed;

    this.Refresh = function () {
        this.object.empty();

        //Column
        let table = $("<table></table>");
        this.object.append(table);

        //Header
        header = $("<thead></thead>");
        table.append(header);

        //Body
        body = $("<tbody></tbody>");
        table.append(body);

        this.RefreshHeader();
        this.RefreshBody();
    };

    this.RefreshHeader = function () {
        header.empty();

        let row = $("<tr></tr>");
        header.append(row);

        let cell;
        let column;

        for (let i = 0; i < this.columns.length; i++) {
            column = this.columns[i];

            if (column.Show) {
                if (column.width)
                    cell = $("<th data-index='" + i + "' style='width:" + column.width + "px'></th>");
                else
                    cell = $("<th data-index='" + i + "'></th>");

                row.append(cell);

                column.showcontrols = true;
                column.Show(cell);

            } else if (column.text) {
                cell = $("<th data-index='" + i + "'>" + column.text + "</th>");
                row.append(cell);

            } else {
                cell = $("<th data-index='" + i + "'>" + column + "</th>");
                row.append(cell);
            }
        }
    };

    this.RefreshBody = function () {
        body.empty();

        let content = "";
        let column;
        let data;
        let tr;
        let td;

        for (let j = 0; j < self.data.length; j++) {
            data = this.data[j];

            tr = $("<tr></tr>");
            body.append(tr);

            for (let i = 0; i < this.columns.length; i++) {
                column = this.columns[i];

                if (data[column.name] !== undefined && data[column.name].cellclass)
                    content = "<td class='" + data[column.name].cellclass + "'";
                else if (data[i] !== undefined && data[i].cellclass)
                    content = "<td class='" + data[i].cellclass + "'";
                else
                    content = "<td";

                if (data[column.name] !== undefined && data[column.name].celldata)
                    content += " data-cell='" + data[column.name].celldata + "'";
                else if (data[i] !== undefined && data[i].celldata)
                    content += " data-cell='" + data[i].celldata + "'";

                content += "></td>";

                td = $(content);
                tr.append(td);

                if (data[column.name] !== undefined && data[column.name].Show)
                    data[column.name].Show(td);
                else if (data[i] !== undefined && data[i].Show)
                    data[i].Show(td);
                else
                    td.append(data[column.name]);
            }
        }
    };
};

mobiwork.Column = function (param) {
    mobiwork.call(this, param, "column");

    this.name = param.name;
    this.showsort = param.showsort;
    this.showfilter = param.showfilter;
};

mobiwork.DataTable = function (param) {
    mobiwork.call(this, param, "datatable dock");

    let self = this;

    this.showheader = true;
    this.showfooter = false;
    this.showpage = true;
    this.showcolumnheader = true;
    this.showsearch = true;

    this.page = 1;
    this.pagesize = 50000;

    this.data = param.data;
    this.columns = param.columns;
    this.readonly = true;
    this.filter = [];

    this.onfilter = param.onfilter;

    if (param.readonly !== undefined)
        this.readonly = param.readonly;

    if (param.showsearch !== undefined)
        this.showsearch = param.showsearch;

    if (param.pagesize !== undefined)
        this.pagesize = param.pagesize;

    let content;
    let header;
    let body;
    let search;
    let footer;
    let resized;
    let columnheader;
    let start, end;

    if (this.columns && !(this.columns[0] instanceof mobiwork.Column)) {
        this.columns = [];

        for (let i = 0; i < param.columns.length; i++)
            this.columns.push(new mobiwork.Column({ name: param.columns[i], text: param.columns[i] }));
    }

    this.Refresh = function () {
        this.object.empty();

        //Content
        content = $("<div class='content dock'></div>");
        this.object.append(content);

        //Header
        header = $("<div class='header'></div>");
        content.append(header);

        //Column header
        columnheader = $("<div class='column-header'></div>");
        this.object.append(columnheader);

        if (self.showsearch) {
            //Search
            search = $("<div class='search'></div>");
            content.append(search);

            //Body
            body = $("<div class='body has-search'></div>");
            content.append(body);

        } else {
            //Body
            body = $("<div class='body'></div>");
            content.append(body);
        }

        //Footer
        this.RefreshHeader();
        this.RefreshBody();

        this.AutoResizeColumns();
        this.Events();
    };

    this.RefreshHeader = function () {
        header.empty();

        let cell;
        let column;

        if (self.showcolumnheader) {
            cell = $("<div class='header-cell column-header-fixed'></div>");
            self.object.append(cell);
        }

        for (let i = 0; i < this.columns.length; i++) {
            column = this.columns[i];

            if (column.width)
                cell = $("<div class='header-cell' data-index='" + i + "' style='width:" + column.width + "px'></div>");
            else
                cell = $("<div class='header-cell' data-index='" + i + "'></th>");

            header.append(cell);

            column.showcontrols = true;

            if (column.Show)
                column.Show(cell);
            else if (column.text)
                cell.append(column.text);
            else if (column.name)
                cell.append(column.name);

            if (column.showsort) {
                let controls = column.controls;

                if (column.sort === 1)
                    controls.append("<div class='icon sorted pointer'>" + mobiwork.FormatIcon("sort-ascending") + "</div>");
                else if (column.sort === -1)
                    controls.append("<div class='icon sorted pointer'>" + mobiwork.FormatIcon("sort-descending") + "</div>");
                else
                    controls.append("<div class='icon pointer'>" + mobiwork.FormatIcon("sort") + "</div>");
            }

            if (column.showfilter) {
                let controls = column.controls;
                controls.append("<div class='icon filter pointer' data-index='" + i + "'>" + mobiwork.FormatIcon("filter-outline") + "</div>");
            }

            //Show resize grip
            let grip = $("<div class='grip' data-index='" + i + "'><div></div></div>");
            cell.append(grip);
        }

        if (self.showsearch) {
            if (self.showcolumnheader) {
                cell = $("<div class='search-cell column-header-fixed'>" + mobiwork.FormatIcon("magnify") + "</div>");
                self.object.append(cell);
            }

            for (let i = 0; i < this.columns.length; i++) {
                column = this.columns[i];

                if (column.width)
                    cell = $("<div class='search-cell' data-index='" + i + "' style='width:" + column.width + "px'><input type='text' placeholder='Search " + column.text + "'/></div>");
                else
                    cell = $("<div class='search-cell' data-index='" + i + "'><input type='text' placeholder='Search " + column.text + "'/></div>");

                search.append(cell);
            }
        }
    };

    this.RefreshBody = function () {
        body.empty();
        columnheader.empty();

        let item;
        let column;
        let handle;
        let cell;
        let rowcell;
        let add;
        let row;
        let counter = 0;
        let text = "";

        start = (self.page - 1) * self.pagesize;

        for (let j = 1; j <= self.pagesize; j++)
            text += "<div class='column-header-cell hidden'>" + (++counter) + "</div>";

        columnheader.append(text);

        if (self.filter.length === 0 && self.readonly) {
            text = "";
            counter = 1;

            for (let j = start; j < self.data.length; j++) {
                this.data[j].visible = true;
                row = $("<div class='body-row'>");
                body.append(row);

                //Column header
                row.append("<div class='body-cell column-header'>" + (counter++) + "</div>");

                for (let i = 0; i < this.columns.length; i++) {
                    column = this.columns[i];

                    rowcell = $("<div class='body-cell' data-row='" + j + "' data-column='" + i + "'>");
                    row.append(rowcell);

                    if (column.name)
                        cell = this.data[j][column.name];
                    else
                        cell = this.data[j][column];

                    if (cell) {
                        if (cell.Show) {
                            cell.Show(rowcell);
                        } else
                            rowcell.append(cell);
                    }
                }

                if (counter > self.pagesize) {
                    end = j;
                    break;
                }
            }

        } else {
            counter = 0;

            for (let j = start; j < self.data.length; j++) {
                add = true;

                if (counter > self.pagesize)
                    break;

                //Check if it can be displayed
                if (this.filter.length) {
                    for (let i = 0; i < this.columns.length; i++) {
                        column = this.columns[i];

                        if (column.name) {
                            handle = false;

                            for (let k = 0; k < this.filter.length; k++) {
                                if (this.filter[k].column === column.name) {
                                    handle = true;
                                    break;
                                }
                            }

                            if (handle) {
                                cell = this.data[j][column.name];

                                if (typeof cell === 'object') {
                                    if ("name" in cell)
                                        cell = cell.name;

                                    if ("text" in cell)
                                        cell = cell.text;

                                    if ("value" in cell)
                                        cell = cell.value;
                                }

                                if (cell) {
                                    if (cell.name)
                                        cell = cell.name;

                                    else if (cell.text)
                                        cell = cell.text;

                                    for (let k = 0; k < this.filter.length; k++) {
                                        for (let m = 0; m < this.filter[k].values.length; m++) {
                                            if (this.filter[k].partial) {
                                                if (cell.toLowerCase().indexOf(this.filter[k].values[m]) !== -1) {
                                                    handle = false;
                                                    break;
                                                }

                                            } else if (cell === this.filter[k].values[m]) {
                                                handle = false;
                                                break;
                                            }
                                        }

                                        if (!handle)
                                            break;
                                    }
                                }

                                if (handle)
                                    add = false;
                            }
                        }
                    }
                }

                this.data[j].visible = add;

                if (add) {
                    end = j;
                    counter++;

                    if (self.readonly) {
                        text = "<div class='body-row'>";
                        text += "<div class='body-cell column-header'>" + (counter) + "</div>";

                        for (let i = 0; i < this.columns.length; i++) {
                            column = this.columns[i];
                            text += "<div class='body-cell' data-row='" + j + "' data-column='" + i + "'>";

                            if (column.name)
                                cell = this.data[j][column.name];
                            else
                                cell = this.data[j][column];

                            if (cell) {
                                if (cell.Show)
                                    text += cell.value;
                                else
                                    text += cell;
                            }

                            text += "</div>";
                        }

                        text += "</div>";
                        body.append(text);

                    } else {
                        row = $("<div class='body-row'></div>");
                        body.append(row);

                        for (let i = 0; i < this.columns.length; i++) {
                            column = this.columns[i];

                            item = $("<div class='body-cell' data-row='" + j + "' data-column='" + i + "'></div>");
                            row.append(item);

                            if (column.name)
                                cell = this.data[j][column.name];
                            else
                                cell = this.data[j][column];

                            if (cell) {
                                if (cell.Show) {
                                    if (self.readonly)
                                        item.append(cell.value);
                                    else
                                        cell.Show(item);
                                } else
                                    item.append(cell);
                            }
                        }
                    }
                }
            }
        }
    };

    this.RefreshFooter = function () {
        footer.empty();
    };

    this.AutoResizeColumns = function () {
        let th = header.find(".header-cell");
        let cells = body.find(".body-cell");
        let searchcell;

        if (self.showsearch)
            searchcell = search.find(".search-cell");

        let cell;

        for (let i = 0; i < cells.length; i++) {
            cell = $(cells[i]);
            cells[i].row = parseInt(cell.attr("data-row"));
            cells[i].column = parseInt(cell.attr("data-column"));
        }

        let widths = [];
        let width;

        if (!resized) {
            //Get column width
            for (let i = 0; i < self.columns.length; i++) {
                width = 0;

                for (let j = 0; j < cells.length; j++) {
                    if (cells[j].column === i) {
                        if (width < cells[j].scrollWidth)
                            width = cells[j].scrollWidth;
                    }
                }

                widths.push(width + 60);
            }

            //Resize column width to fit the current view
            let total = 0;

            for (let i = 0; i < widths.length; i++)
                total += widths[i];

            let ratio = total / (content.width() - 84);

            for (let i = 0; i < widths.length; i++)
                widths[i] /= ratio;

            for (let i = 0; i < widths.length; i++) {
                width = widths[i];

                if (width < 120)
                    width = 120;

                self.columns[i].width = width;
                th[i].style.width = width + 'px';

                if (self.showsearch)
                    searchcell[i].style.width = width + 'px';

                for (let j = 1; j < cells.length; j++)
                    if (cells[j].column === i)
                        cells[j].style.width = width + 'px';
            }

            resized = true;

        } else {
            for (let i = 0; i < self.columns.length; i++) {
                searchcell[i].style.width = self.columns[i].width + 'px';

                for (let j = 0; j < cells.length; j++)
                    if (cells[j].column === i) {
                        cells[j].style.width = self.columns[i].width + 'px';
                    }
            }
        }

        //Column headers
        let rows = body.find(".body-row");
        let headers = columnheader.find(".column-header-cell");
        let columnheaders = body.find(".column-header");

        columnheaders.removeAttr("style");

        //Height
        let count = 0;

        for (let i = start; i <= end; i++) {
            if (self.data[i].visible) {
                $(headers[count]).css({ height: rows[count].offsetHeight - 2 });
                $(columnheaders[count]).css({ height: rows[count].offsetHeight - 10 });
                count++;
            }
        }

        let bodyobject = self.object.find(".body");
        let scrolltop = bodyobject[0].scrollTop;

        //Position
        count = 0;

        for (let i = start; i <= end; i++) {
            $(headers[i]).css({ top: -1000 });

            if (self.data[i].visible)
                $(headers[count]).css({ top: rows[count++].offsetTop - scrolltop });
        }
    };

    this.Events = function () {
        let th = header.find(".header-cell");
        let rows = body.find(".body-row");

        let cells;
        let searchcells;

        if (!self.readonly)
            cells = body.find(".body-cell");

        if (self.showsearch)
            searchcells = search.find(".search-cell input");

        self.Click(th, function () {
            let index = $(this).attr("data-index");
            let column = self.columns[index];

            if (column.showsort) {
                if (column.sort === 0)
                    column.sort = 1;
                else if (column.sort === 1)
                    column.sort = -1;
                else
                    column.sort = 1;

                let sort = column.sort;
                let negsort = -sort;

                self.ClearSort();
                column.sort = sort;

                column = column.name;

                if (sort === 1)
                    mobiwork.SortAscending(self.data, column);
                else
                    mobiwork.SortDescending(self.data, column);

                resized = true;
                self.Refresh();
            }
        });

        if (self.showsearch) {
            let timer;

            searchcells.on("input", function (e) {
                let parent = $(this).parent();
                let column = parseInt(parent.attr("data-index"));
                let value = this.value;

                if (timer)
                    clearTimeout(timer);

                timer = setTimeout(function () {
                    self.Filter(self.columns[column].name, [value.toLowerCase()], true);
                    clearTimeout(timer);
                }, 500);
            });
        }

        if (!self.readonly) {
            self.Click(cells, function () {
                let cell = $(this);
                let row = parseInt(cell.attr("data-row"));
                let column = parseInt(cell.attr("data-column"));

                if (self.data[row].onclick) {
                    self.data[row].onclick(self.data[row], row, column);
                }

                if (self.readonly) {
                    let rows = body.find(".body-row");
                    rows.removeClass("selected");

                    let parent = cell.parent();
                    parent.addClass("selected");

                    self.selectedrowindex = row;
                }
            });
        }

        let filter = header.find(".filter");

        self.Click(filter, function (e) {
            e.stopPropagation();

            let index = $(this).attr("data-index");
            let column = self.columns[index];

            if (self.onfilter) {
                self.onfilter(column);
            } else {
                let object = $(this);
                let left = object.offset().left;
                let top = object.offset().top;
                let width = object[0].offsetWidth;
                let height = object[0].offsetHeight;

                let form = new mobiwork.Form({
                    height: 400,
                    width: 200,
                    opacity: 0,
                    onok: function () {
                        let values = [];

                        for (let i = 0; i < list.children.length; i++) {
                            if (list.children[i].checked)
                                values.push(list.children[i].text);
                        }

                        self.Filter(column.name, values);
                    }
                });

                let unique = [];
                let uniquelist = [];
                let value;

                for (let i = 0; i < self.data.length; i++) {
                    if (self.data[i][column.name] !== undefined) {
                        value = self.data[i][column.name];
                        if (value.value) {
                            if (!unique[value.value]) {
                                uniquelist.push(value.value);
                                unique[value.value] = 1;
                            }
                        } else {
                            if (!unique[value]) {
                                uniquelist.push(value);
                                unique[value] = 1;
                            }
                        }
                    }
                }

                //Sort
                uniquelist.sort(function (a, b) {
                    if (a > b)
                        return 1;
                    else if (a < b)
                        return -1;
                    else
                        return 0;
                });

                let scroll = new mobiwork.ScrollContainer();
                let list = scroll.Add(new mobiwork.CheckList());
                let columnname = column.name;
                let handle;
                let filter;
                let name;

                for (let x = 0; x < uniquelist.length; x++) {
                    name = uniquelist[x];
                    handle = false;

                    for (let i = 0; i < self.filter.length; i++) {
                        if (self.filter[i].column === columnname) {
                            handle = true;
                            break;
                        }
                    }

                    if (handle) {
                        for (let i = 0; i < self.filter.length; i++) {
                            filter = self.filter[i];

                            if (filter.column === columnname) {

                                for (let j = 0; j < filter.values.length; j++) {
                                    if (filter.values[j] === name) {
                                        list.Add({ text: name, checked: true });
                                        handle = false;
                                        break;
                                    }
                                }

                            }

                            if (!handle)
                                break;
                            else {
                                list.Add({ text: name });
                            }
                        }


                    } else {
                        list.Add({ text: name });
                    }
                }

                form.Add(scroll);
                form.Show();
                form.Location(left - 200 + width, top + height);
            }
        });

        let grip = header.find(".grip");

        //Resize
        grip.draggable({
            axis: "x",
            stop: function () {
                let object = $(this);
                let index = parseInt(object.attr("data-index"));

                if (self.showcolumnheader)
                    index++;

                let cells = body.find(".body-cell:nth-child(" + (index + 1) + ")");
                let searchcell = search.find(".search-cell:nth-child(" + index + ")");

                let parent = object.parent();
                let width = object[0].offsetLeft - 4;

                parent.width(width);
                cells.width(width);
                searchcell.width(width);

                if (self.showcolumnheader)
                    index--;

                self.columns[index].width = width;

                self.AutoResizeColumns();
                object.removeAttr("style");
            },
            start: function () {
                let object = $(this);
                object.css({ height: "1000px", "z-index": 1 });
            }
        });

        //Vertical scroll
        //Update column header location
        let headers = columnheader.find(".column-header-cell");
        let columnheaders = body.find(".column-header");

        let bodyobject = self.object.find(".body");

        let headershidden = true;

        bodyobject.scroll(function () {
            if (!headershidden) {
                for (let i = start; i <= end; i++) {
                    $(headers[i]).css({ top: rows[i].offsetTop - this.scrollTop });
                }
            }
        });

        content.scroll(function () {
            body.css({ right: -this.scrollLeft });

            columnheaders.css({
                position: "absolute",
                top: 0,
                left: this.scrollLeft

            })

            // if (this.scrollLeft !== 0) {
            //     headers.removeClass("hidden");
            //     headershidden = false;
            // }
            // else {
            //     headers.addClass("hidden");
            //     headershidden = true;
            // }
        });
    };

    this.Filter = function (column, values, partial) {
        self.filter = [];

        if (values.length)
            self.filter.push({ column: column, values: values, partial: partial });

        self.RefreshBody();
        self.AutoResizeColumns();
        self.Events();
    };

    this.ClearSort = function () {
        for (let i = 0; i < this.columns.length; i++) {
            if (this.columns[i].sort)
                this.columns[i].sort = 0;
        }
    };
};


//Containers

mobiwork.Panel = function (param) {
    param.modal = false;

    mobiwork.Form.call(this, param);

    let self = this;

    this.showclose = false;
    this.showfooter = false;
    this.class = "form panel";

    if (param.class)
        this.class += " " + param.class;

    this.onload = function () {
        self.Maximize();
    };

    //Destroy object and remove from DOM
    //Must be call when removing object to clear memory
    this.Dispose = function () {
        //Remove DOM
        if (self.object) {
            self.object.remove();

            //Dispose children
            for (let i = 0; i < self.children.length; i++) {
                if (self.children[i].Dispose)
                    self.children[i].Dispose();
            }

            self.children = [];

            //Remove all references
            for (let name in self) {
                self[name] = undefined;
            }
        }

        //Raise ondispose event
        if (self.ondispose)
            self.ondispose();
    };
};

mobiwork.Container = function (param) {
    mobiwork.call(this, param, "container");
};

mobiwork.FixedContainer = function (param) {
    mobiwork.call(this, param, "fixed");
};

mobiwork.OverflowContainer = function (param) {
    mobiwork.call(this, param, "overflow fixed");
};

mobiwork.ScrollContainer = function (param) {
    mobiwork.call(this, param, "scroll fixed");
};

mobiwork.SplitContainer = function (param) {
    mobiwork.call(this, param, "splitter fixed");

    let self = this;
    let orientation = ORIENTATION.HORIZONTAL;
    let gap = 0;
    let gapobject;
    let resizable = false;
    let panel1size;
    let panel2size;

    this.children[0] = Object.assign(new mobiwork.FixedContainer(), this.children[0]);
    this.children[1] = Object.assign(new mobiwork.FixedContainer(), this.children[1]);

    if (param) {
        if (param.gap !== undefined)
            gap = param.gap;

        if (param.resizable !== undefined)
            resizable = param.resizable;

        if (param.orientation !== undefined)
            orientation = param.orientation;

        if (param.children) {
            if (param.children[0].size !== undefined)
                panel1size = param.children[0].size;

            if (param.children[1].size !== undefined)
                panel2size = param.children[1].size;
        }
    }

    this.onload = function () {
        self.Resize();
    };

    this.Set = function (index, control) {
        if (self.object) {
            let children = self.object.children(".children").children();

            self.children[index].Clear();
            self.children[index].Add(control);

            let child = $(children[index]);
            child.empty();
            control.Show(child);

        } else {
            self.children[index].Clear();
            self.children[index].Add(control);
        }

        return control;
    };

    this.Append = function (index, control) {
        if (self.object) {
            let children = self.object.children(".children").children();
            self.children[index].Add(control);

            let child = $(children[index]);
            control.Show(child);

        } else {
            this.children[index].Add(control);
        }

        return control;
    };

    this.Resize = function () {
        let children = self.object.children(".children").children();
        let child1 = $(children[0]);
        let child2 = $(children[1]);

        panel1size = self.children[0].size;
        panel2size = self.children[1].size;

        if (orientation === ORIENTATION.HORIZONTAL) {
            if (!gapobject && gap) {
                let children = self.object.children(".children");
                gapobject = $("<div class='gap fixed'></div>");
                children.append(gapobject);
            }

            if (panel1size !== undefined) {
                child1.css({
                    left: 0,
                    top: 0,
                    right: "inherit",
                    bottom: 0,
                    width: panel1size
                });

                child2.css({
                    left: panel1size + gap,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    width: "inherit"
                });

                if (gapobject)
                    gapobject.css({
                        left: panel1size,
                        top: 0,
                        right: "inherit",
                        bottom: 0,
                        width: gap
                    });

            } else if (panel2size !== undefined) {
                child1.css({
                    left: 0,
                    top: 0,
                    right: panel2size + gap,
                    bottom: 0,
                    width: "inherit"
                });

                child2.css({
                    left: "inherit",
                    right: 0,
                    top: 0,
                    bottom: 0,
                    width: panel2size
                });

                if (gapobject)
                    gapobject.css({
                        left: "inherit",
                        top: 0,
                        right: panel2size,
                        bottom: 0,
                        width: gap
                    });

            } else {
                child1.css({
                    left: 0,
                    top: 0,
                    right: "inherit",
                    bottom: 0,
                    width: "50%"
                });

                child2.css({
                    left: "inherit",
                    right: 0,
                    top: 0,
                    bottom: 0,
                    width: "50%"
                });

                if (gapobject)
                    gapobject.css({
                        left: "50%",
                        top: 0,
                        bottom: 0,
                        width: gap
                    });
            }

            if (resizable) {
                gapobject.draggable({
                    axis: "x",
                    stop: function () {
                        gapobject.css({ width: gap, "margin-left": 0 });
                        self.children[0].size = gapobject[0].offsetLeft;

                        self.onload();

                        if (self.children[0].Resize)
                            self.children[0].Resize();

                        if (self.children[1].Resize)
                            self.children[1].Resize();
                    },
                    start: function () {
                        gapobject.css({ width: 10, "margin-left": -5 });
                    }
                });
            }

        } else {
            if (!gapobject && (gap)) {
                let children = self.object.children(".children");
                gapobject = $("<div class='gap fixed vertical'></div>");
                children.append(gapobject);
            }

            if (panel1size !== undefined) {
                child1.css({
                    left: 0,
                    top: 0,
                    right: 0,
                    bottom: "inherit",
                    height: panel1size
                });

                child2.css({
                    left: 0,
                    top: panel1size + gap,
                    right: 0,
                    bottom: 0,
                    height: "inherit"
                });

                if (gapobject)
                    gapobject.css({
                        left: 0,
                        top: panel1size,
                        right: 0,
                        bottom: "inherit",
                        height: gap
                    });

            } else if (panel2size !== undefined) {
                child1.css({
                    left: 0,
                    top: 0,
                    right: 0,
                    bottom: panel2size + gap,
                    height: "inherit"
                });

                child2.css({
                    left: 0,
                    top: "inherit",
                    right: 0,
                    bottom: 0,
                    height: panel2size
                });

                if (gapobject)
                    gapobject.css({
                        left: 0,
                        top: "inherit",
                        right: 0,
                        bottom: panel2size,
                        height: gap
                    });

            } else {
                child1.css({
                    left: 0,
                    top: 0,
                    right: 0,
                    bottom: "inherit",
                    height: "50%"
                });

                child2.css({
                    left: 0,
                    top: "inherit",
                    right: 0,
                    bottom: 0,
                    height: "50%"
                });

                if (gapobject)
                    gapobject.css({
                        top: "50%",
                        bottom: "inherit",
                        height: gap
                    });
            }

            if (resizable) {
                gapobject.draggable({
                    axis: "y",
                    stop: function () {
                        gapobject.css({ height: gap, "margin-top": 0 });
                        self.children[0].size = gapobject[0].offsetTop;

                        self.onload();

                        if (self.children[0].Resize)
                            self.children[0].Resize();

                        if (self.children[1].Resize)
                            self.children[1].Resize();
                    },
                    start: function () {
                        gapobject.css({ height: 40, "margin-top": -20 });
                    }
                });
            }
        }

        if (self.children[0].Resize)
            self.children[0].Resize();

        if (self.children[1].Resize)
            self.children[1].Resize();
    };
};

mobiwork.SlidePanel = function (param) {
    mobiwork.call(this, param, "slidepanel");

    let self = this;
    let position = POSITION.LEFT;

    if (param) {
        if (param.position === POSITION.RIGHT) {
            position = POSITION.RIGHT;
            this.class += " sliderightin";
        } else
            this.class += " slideleftin";
    } else
        this.class += " slideleftin";

    //Show background
    let background = new mobiwork.ModalBackground({
        parent: this
    });

    background.Show();

    this.onclickchild = function () {
        self.Dispose();
    };

    this.onload = function () {
        self.object.css({
            "z-index": _COUNTER_++,
        });

        mobiwork.eventescape.push({ type: "SLIDE", action: self.Dispose });
        //location.hash = "$$$" + ++_HASH_;
    };

    //Must be called when removing object to clear memory
    this.Dispose = function () {
        if (background && background.Dispose)
            background.Dispose();

        if (position === POSITION.RIGHT) {
            self.object.removeClass("sliderightin");
            self.object.addClass("sliderightout");
        } else {
            self.object.removeClass("slideleftin");
            self.object.addClass("slideleftout");
        }

        let timer = setTimeout(function () {
            clearTimeout(timer);

            //Remove DOM
            self.object.remove();

            //Dispose children
            for (let i = 0; i < self.children.length; i++) {
                self.children[i].Dispose();
            }

            //Remove all references
            for (let name in self) {
                self[name] = undefined;
            }

            //Raise ondispose event
            if (self.ondispose)
                self.ondispose();

        }, 250);
    };
};

mobiwork.DockPanel = function (param) {
    mobiwork.call(this, param, "dock fixed");

    let self = this;

    this.Events = function () {
        self.object.droppable({
            drop: function (event, ui) {
                $(this)
                    .addClass("ui-state-highlight")
                    .find("p")
                    .html("Dropped!");
            }
        });
    };
};

mobiwork.ToolbarContainer = function (param) {
    mobiwork.call(this, param, "toolbar-container");
};

mobiwork.ThumbnailContainer = function (param) {
    mobiwork.call(this, param, "thumbnail-container");
};

mobiwork.MenuContainer = function (param) {
    mobiwork.call(this, param, "menu-container");
};

mobiwork.Tab = function (param) {
    mobiwork.call(this, param, "tab");

    let self = this;
    this.selectedindex = 0;

    let tabs = param.children;
    this.children = [];

    for (let i = 0; i < tabs.length; i++)
        this.children.push(new mobiwork({
            text: tabs[i].text,
            icon: tabs[i].icon,
            data: { index: i, onclick: tabs[i].onclick, tab: tabs[i] },
            onclick: function (object) {
                self.selectedindex = object.data.index;
                self.ShowActiveTab();

                if (object.data.onclick)
                    object.data.onclick();
            }
        }));

    if (param) {
        if (param.selectedindex !== undefined)
            this.selectedindex = param.selectedindex;

        if (param.position !== undefined) {
            switch (param.position) {
                case POSITION.TOP:
                    this.class += " top";
                    break;

                case POSITION.BOTTOM:
                    this.class += " bottom";
                    break;

                case POSITION.LEFT:
                    this.class += " left";
                    break;

                case POSITION.RIGHT:
                    this.class += " right";
                    break;
            }
        }
    }

    this.Refresh = function () {
        this.object.empty();

        //Render Header
        let header = $("<div class='tab-header'></div>");
        this.object.append(header);

        for (let i = 0; i < this.children.length; i++) {
            this.children[i].Show(header);
            this.children[i].object.attr("data-index", i);
        }

        //Set selected tab
        this.children[this.selectedindex].object.addClass("selected");

        //Render Body
        let body = $("<div class='tab-body'></div>");
        this.object.append(body);
        let content = "";

        for (let i = 0; i < this.children.length; i++) {
            content += "<div class='tab-content'></div>";
        }

        body.append(content);

        self.ShowTab(self.selectedindex);
        this.Events();
    };

    //Add chilren
    this.Add = function (child) {
        child = new mobiwork({
            text: child.text,
            icon: child.icon,
            data: { index: self.children.length, onclick: child.onclick },
            onclick: function (object) {
                self.selectedindex = object.data.index;
                self.ShowTab(self.selectedindex);

                if (object.data.onclick)
                    object.data.onclick();
            }
        });

        self.children.push(child);
        return child;
    };

    this.Events = function () {
        let header = self.object.find(".tab-header > div");

        self.Click(header, function () {
            let tab = $(this);
            let index = tab.attr("data-index");

            header.removeClass("selected");
            tab.addClass("selected");

            self.selectedindex = parseInt(index);
            self.ShowTab(self.selectedindex);
        });
    };

    this.ShowTab = function (index) {
        let body = self.object.find(".tab-body");
        let content = self.object.find(".tab-content");

        if (index < 0)
            self.selectedindex = 0;
        else
            self.selectedindex = index;

        for (let i = 0; i < content.length; i++) {
            if (i !== index)
                $(content[i]).addClass("hidden");
            else
                $(content[i]).removeClass("hidden");
        }

        // if (mobiwork.mobile) {
        //     let width = body[0].clientWidth;

        //     for (let i = 0; i < content.length; i++) {
        //         $(content[i]).css({
        //             left: (i - index) * width,
        //             width: width
        //         });
        //     }
        // } else {
        //     for (let i = 0; i < content.length; i++) {
        //         if (i !== index)
        //             $(content[i]).addClass("hidden");
        //         else
        //             $(content[i]).removeClass("hidden");
        //     }
        // }

        if (self.onclick)
            self.onclick(self);
    };

    this.Set = function (index, control) {
        let children = self.object.find(".tab-content");
        let child = $(children[index]);
        child.empty();

        control.Show(child);
        return control;
    };
};

mobiwork.Grid = function (param) {
    mobiwork.call(this, param, "grid");

    let self = this;

    this.onload = function () {
        let width = 100 / self.children.length;
        let space = self.children.length * 4;

        for (let i = 0; i < self.children.length; i++) {
            if (i !== self.children.length - 1)
                self.children[i].object.css({ "margin-right": "16px" });

            self.children[i].object.css({ width: "calc(" + width + "% - " + space + "px)" });
        }
    };

    this.Set = function (index, object) {
        if (self.children[index]) {
            self.children[index].Clear();
            self.children[index].Add(object);
            self.children[index].Refresh();
        }
    };
};

mobiwork.iFrame = function (param) {
    mobiwork.call(this, param, "grid");

    var self = this;

    this.class = "iframe";
    this.src = param.src;
    this.modal = true;
    this.autodispose = true;

    if (param) {
        this.onok = param.onok;
        this.oncancel = param.oncancel;

        if (param.modal !== undefined)
            this.modal = param.modal;

        if (param.autodispose !== undefined)
            this.autodispose = param.autodispose;
    }

    this.Refresh = function () {
        this.object.empty();
        this.frame = $("<iframe src='" + this.src + "'></iframe>");
        this.object.append(this.frame);
    };

    this.Close = function () {
        this.object.remove();
    };
};



//Menu and Toolbar

mobiwork.Menu = function (param) {
    mobiwork.call(this, param, "menu");

    if (param.shortcut)
        this.tools.push(new mobiwork({ text: param.shortcut }));

    if (param.separator)
        this.class += " separator";
};

mobiwork.Toolbar = function (param) {
    mobiwork.call(this, param, "toolbar");
};


//Controls

mobiwork.Header = function (param) {
    mobiwork.call(this, param, "header");
};

mobiwork.Button = function (param) {
    mobiwork.call(this, param, "button");
};

mobiwork.Label = function (param) {
    mobiwork.call(this, param, "label");

    this.Refresh = function () {
        this.object.append(this.text);
    };
};

mobiwork.FloatingButton = function (param) {
    mobiwork.call(this, param, "floating-button button");
};

mobiwork.ToolbarButton = function (param) {
    mobiwork.call(this, param, "toolbar-button button");

    if (param.separator)
        this.class += " separator";
};

mobiwork.List = function (param) {
    mobiwork.call(this, param, "list");

    let self = this;

    this.Select = function () {
        self.ClearHighlight();
        self.Highlight(true);
    };
};

mobiwork.CheckList = function (param) {
    mobiwork.call(this, param, "checklist");

    let self = this;

    this.Add = function (child) {
        self.children.push({ text: child.text, checked: child.checked, name: child.name });
    };

    this.Render = function () {
        let child;

        for (let i = 0; i < self.children.length; i++) {
            child = self.children[i];

            //Add header icon
            let control;

            if (child.checked)
                control = $("<div class='checked control' data-index='" + i + "'></div>");
            else
                control = $("<div class='control' data-index='" + i + "'></div>");

            self.object.append(control);

            //Add header text
            if (child.text) {
                if (child.text.Show)
                    child.text.Show(control);
                else
                    control.append("<div class='text'>" + child.text + "</div>");
            }

            if (child.checked)
                control.append("<div class='icon'>" + mobiwork.FormatIcon("checkbox-marked-outline") + "</div>");
            else
                control.append("<div class='icon'>" + mobiwork.FormatIcon("checkbox-blank-outline") + "</div>");
        }
    };

    this.Events = function () {
        if (!self.readonly) {
            let boxes = self.object.find(".control");

            self.Click(boxes, function (e) {
                let object = $(this);
                let index = object.attr("data-index");

                if (self.children[index].checked) {
                    self.children[index].checked = false;
                    object.removeClass("checked");

                    object = object.find(".icon");
                    object.html(mobiwork.FormatIcon("checkbox-blank-outline"));
                } else {
                    self.children[index].checked = true;
                    object.addClass("checked");

                    object = object.find(".icon");
                    object.html(mobiwork.FormatIcon("checkbox-marked-outline"));
                }
            });
        }
    };
};

mobiwork.Image = function (param) {
    mobiwork.call(this, param, "image");

    let self = this;
    this.src = param.src;
    this.details = param.details;

    if (this.text)
        this.class += " has-text";

    if (this.details)
        this.class += " has-details";

    this.Render = function () {
        if (this.src) {
            this.object.append("<div class='image-container'><img src='" + this.src + "'/></div>");
        }
        else
            this.object.append("<div class='image-container no-picture'>Drop or <br/> attached picture</div>");

        if (this.text)
            this.object.append("<div class='text'>" + this.text + "</div>");

        if (this.details && this.details.Show) {
            let details = $("<div class='details'></div>");
            this.object.append(details);

            this.details.Show(details);
        } else if (this.details)
            this.object.append("<div class='details'>" + this.details + "</div>");

        //Tools
        if (self.showcontrols || self.tools.length !== 0) {
            self.controls = $("<div class='tools'></div>");
            this.object.append(self.controls);
            self.RenderTools();
        }
    };
};

mobiwork.File = function (param) {
    mobiwork.call(this, param, "file");

    let self = this;
    this.src = param.src;
    this.details = param.details;

    if (this.text)
        this.class += " has-text";

    if (this.details)
        this.class += " has-details";

    this.Render = function () {
        if (this.src) {
            this.object.append("<div class='file-container'><img src='" + this.src + "'/></div>");
        }
        else
            this.object.append("<div class='file-container no-file'><div class='icon has-text'><i class='mdi mdi-cloud-upload-outline'></i><br>Upload File<br></div>");

        if (this.text)
            this.object.append("<div class='text'>" + this.text + "</div>");

        if (this.details && this.details.Show) {
            let details = $("<div class='details'></div>");
            this.object.append(details);

            this.details.Show(details);
        } else if (this.details)
            this.object.append("<div class='details'>" + this.details + "</div>");

        //Tools
        if (self.showcontrols || self.tools.length !== 0) {
            self.controls = $("<div class='tools'></div>");
            this.object.append(self.controls);
            self.RenderTools();
        }
    };
};

mobiwork.Thumbnail = function (param) {
    mobiwork.Image.call(this, param);

    this.class += " thumbnail";
};

mobiwork.Calendar = function (param) {
    mobiwork.call(this, param, "calendar dock");

    let self = this;

    let year;
    let month;
    let date;

    this.value = new Date();
    let todayyear = this.value.getFullYear();
    let todaymonth = this.value.getMonth();
    let todaydate = this.value.getDate();

    this.full = false;
    this.mini = false;
    this.showeditor = true;
    this.showheader = true;

    this.events = [];

    if (param) {
        if (param.value)
            this.value = param.value;

        if (param.readonly !== undefined)
            this.readonly = param.readonly;

        if (param.participants)
            this.participants = param.participants;

        if (param.full !== undefined)
            this.full = param.full;

        if (param.mini !== undefined)
            this.mini = param.mini;

        if (param.events)
            this.events = param.events;

        if (param.showeditor !== undefined)
            this.showeditor = param.showeditor;

        if (param.showheader !== undefined)
            this.showheader = param.showheader;

        this.onclick = param.onclick;
        this.onedit = param.onedit;
        this.ondelete = param.ondelete;

        if (this.mini)
            this.class += " mini";
    }

    if (!this.showheader)
        this.class += " no-header";

    this.header = new mobiwork.Container();
    this.header.class += " calendar-header";

    if (!self.readonly) {

        let todaybutton = this.header.Add(new mobiwork({
            text: "Today",
            onclick: function () {
                self.value = new Date();
                self.Refresh();
            }
        }));

        todaybutton.class = "calendar-today";

        let previousbutton = this.header.Add(new mobiwork({
            text: "<i class='mdi mdi-chevron-left'></i><div class='tooltip'>Previous Month</div>",
            onclick: function () {
                self.value = new Date(self.value.getFullYear(), self.value.getMonth() - 1, self.value.getDate());
                self.Refresh();
            }
        }));

        previousbutton.class = "calendar-previous";

        let nextbutton = this.header.Add(new mobiwork({
            text: "<i class='mdi mdi-chevron-right'></i><div class='tooltip'>Next Month</div>",
            onclick: function () {
                self.value = new Date(self.value.getFullYear(), self.value.getMonth() + 1, self.value.getDate());
                self.Refresh();
            }
        }));

        nextbutton.class = "calendar-next";

    } else {
        this.class += " readonly";
    }

    let monthtext = this.header.Add(new mobiwork({
        onload: function () {
            monthtext.text = months[month] + " " + year;
            monthtext.Refresh();
        }
    }));

    monthtext.class = "calendar-text";

    this.Refresh = function () {
        self.object.empty();

        let previousmonth;
        let nextmonth;

        if (mobiwork.mobile) {
            previousmonth = $("<div class='calendar-month calendar-previous-month'>");
            nextmonth = $("<div class='calendar-month calendar-next-month'>");
        }

        let currentmonth = $("<div class='calendar-month calendar-current-month'>");

        if (mobiwork.mobile && !self.readonly)
            this.object.append(previousmonth);

        this.object.append(currentmonth);

        if (mobiwork.mobile && !self.readonly)
            this.object.append(nextmonth);

        let previous = new Date(this.value);
        previous.setMonth(previous.getMonth() - 1);

        let next = new Date(this.value);
        next.setMonth(next.getMonth() + 1);

        this.RenderMonth(currentmonth, this.value, true);

        if (mobiwork.mobile) {
            let timer = setTimeout(function () {
                clearTimeout(timer);

                self.RenderMonth(previousmonth, previous);
                self.RenderMonth(nextmonth, next);

                year = self.value.getFullYear();
                month = self.value.getMonth();
            }, 100);
        }

        if (!self.readonly)
            this.Events();
    };

    this.RenderMonth = function (container, value, showheader) {
        year = value.getFullYear();
        month = value.getMonth();
        date = value.getDate();

        let day = new Date(value.getFullYear(), value.getMonth(), 1).getDay();
        let previousdays = new Date(value.getFullYear(), value.getMonth(), 0).getDate();
        let days = new Date(value.getFullYear(), value.getMonth() + 1, 0).getDate();

        if (this.showheader && showheader) {
            this.header.Show(this.object);
        }

        if (showheader) {
            monthtext.text = months[month] + " " + year;
            monthtext.Refresh();
        }

        //Week Header
        let columns;

        if (this.full)
            columns = [
                { name: "su", text: "Sunday" },
                { name: "mo", text: "Monday" },
                { name: "tu", text: "Tuesday" },
                { name: "we", text: "Wednesday" },
                { name: "th", text: "Thursday" },
                { name: "fr", text: "Friday" },
                { name: "sa", text: "Saturday" },
            ];
        else
            columns = [
                { name: "su", text: "Sun" },
                { name: "mo", text: "Mon" },
                { name: "tu", text: "Tue" },
                { name: "we", text: "Wed" },
                { name: "th", text: "Thu" },
                { name: "fr", text: "Fri" },
                { name: "sa", text: "Sat" },
            ];

        //Body
        let calendar = [];
        let data = [];
        let text;
        let event;
        let column;
        let listevent;

        let cellyear, cellmonth, cellday;

        //Previous Month
        for (let i = 0; i < day; i++) {
            cellday = previousdays - day + i + 1;

            if (month === 0)
                cellyear = year - 1;
            else
                cellyear = year;

            if (month === 0)
                cellmonth = 12;
            else
                cellmonth = month;

            data.push(self.AddDay(cellyear, cellmonth - 1, cellday, year, month));

            if (data.length === 7) {
                calendar.push(data);
                data = [];
            }
        }

        //Current Month
        for (let i = 1; i <= days; i++) {
            data.push(self.AddDay(year, month, i, year, month));

            if (data.length === 7) {
                calendar.push(data);
                data = [];
            }
        }

        let j = 1;

        //Next Month
        for (let i = data.length; i <= 7; i++) {
            cellday = j++;

            if (month === 11)
                cellyear = year + 1;
            else
                cellyear = year;

            if (month === 11)
                cellmonth = 0;
            else
                cellmonth = month;

            data.push(self.AddDay(cellyear, cellmonth + 1, cellday, year, month));

            if (data.length === 7) {
                calendar.push(data);
                data = [];
            }
        }

        let table = new mobiwork.Table({
            showheader: true,
            columns: columns,
            data: calendar,
            indexed: true,
            onclick: function (object, cell) {
                var data = cell.children[0];
                var td = object.object.find("td");
                td.removeClass("active");

                cell.parent.addClass("active");

                if (data) {
                    self.EditEvent(year, month, data.text);
                }
            }
        });

        table.Show(container);
    };

    this.AddDay = function (year, month, day, currentyear, currentmonth) {
        let cellyear, cellmonth, cellday;
        let listevent;

        let container = new mobiwork.Container({});
        cellday = day;

        let text = container.Add(new mobiwork({ text: cellday }));
        text.class = "calendar-day";

        if (year !== currentyear || month !== currentmonth)
            text.class += " disable";

        cellyear = year;

        if (month < 9)
            cellmonth = "0" + (month + 1);
        else
            cellmonth = month + 1;

        if (cellday < 10)
            cellday = "0" + cellday;

        container.celldata = cellyear + "-" + cellmonth + "-" + cellday;

        //Highlight current date
        if (todaydate === day && todaymonth === month && todayyear === year) {
            container.cellclass = "current";
        }

        //Add events
        let icon;

        for (let j = 0; j < this.events.length; j++) {
            event = this.events[j];
            event.index = j;

            if (event.year === year && event.month === (month + 1) && event.day === day) {
                if (event.text && event.text.Show)
                    container.Add(event.text);
                else {
                    icon = "circle";

                    if (event.time)
                        icon = new mobiwork({ class: "calendar-event-time", text: event.time });

                    listevent = container.Add(new mobiwork.List({
                        icon: icon,
                        data: event,
                        text: event.text,
                        onclick: function (object) {
                            let day = $(this.parent[0].parentElement.parentElement);
                            let date = day.attr("data-cell");

                            if (self.onclick) {
                                self.onclick(object);

                            } else if (self.showeditor) {
                                self.ShowEditor(new Date(date));
                            }

                        }
                    }));
                }


                if (event.icon) {
                    listevent.class += " has-icon";
                    listevent.icon = event.icon;
                }

                listevent.Add(new mobiwork({
                    class: "tooltip",
                    text: event.text
                }));

                listevent.class += " calendar-event";

                //Past events
                if (event.class === "holiday") {
                    listevent.class += " calendar-event-holiday";

                } else if (((todaymonth + 1) === event.month && todaydate > event.day) || (todaymonth + 1) > event.month)
                    listevent.class += " calendar-event-expired";

                if (event.class)
                    container.cellclass = event.class;
            }
        }

        return container;
    };

    this.Events = function () {
        let parent = self.object.parent();
        let width = parent[0].clientWidth;
        let height = parent[0].clientHeight;

        let previousmonth = self.object.find(".calendar-previous-month");
        let currentmonth = self.object.find(".calendar-current-month");
        let nextmonth = self.object.find(".calendar-next-month");

        if (mobiwork.mobile) {
            previousmonth.css({ left: -width, right: width });
            nextmonth.css({ left: width * 2, right: -width });
        }

        currentmonth.css({ left: 0, right: 0 });

        let tds = this.object.find("td");

        tds.unbind();
        self.Click(tds, function (e) {
            let day = $(this);
            let date = day.attr("data-cell");

            if (self.showeditor) {
                self.ShowEditor(new Date(date));

            } else if (self.onclick) {
                self.onclick(date);
            }
        });

        self.object.unbind();
        self.object.on("mousewheel", function (e) {
            e.stopPropagation();
            e.preventDefault();

            if (e.originalEvent.deltaY >= 100) {
                self.value = new Date(self.value.getFullYear(), self.value.getMonth() + 1, self.value.getDate());
                self.Refresh();

            } else if (e.originalEvent.deltaY <= -100) {
                self.value = new Date(self.value.getFullYear(), self.value.getMonth() - 1, self.value.getDate());
                self.Refresh();
            }
        });

        let touchstart;
        let touchmove;
        let touchprevious;
        let currentleft;

        currentmonth.unbind();
        currentmonth.on("touchstart", function (event) {
            let e = event.originalEvent;
            touchstart = { x: e.touches[0].pageX, y: e.touches[0].pageY };
            touchprevious = touchstart;

            currentleft = currentmonth[0].offsetLeft;
        });

        currentmonth.on("touchmove", function (event) {
            let e = event.originalEvent;
            touchmove = { x: e.touches[0].pageX, y: e.touches[0].pageY };

            let left = currentleft + touchmove.x - touchstart.x;
            let right = currentleft + touchstart.x - touchmove.x;

            previousmonth.css({ left: left - width, right: right - width });
            currentmonth.css({ left: left, right: right });
            nextmonth.css({ left: left + width, right: right + width });
        });

        currentmonth.on("touchend", function (event) {
            if (touchmove) {
                // let left = currentleft + touchmove.x - touchstart.x;
                // let right = currentleft + touchstart.x - touchmove.x;

                if (Math.abs(touchstart.x - touchmove.x) > parent[0].clientWidth * 0.33) {
                    // let interval = -2;
                    // let count = Math.abs(width - left);;

                    // if (touchstart.x - touchmove.x > 0) {
                    //     count = Math.abs(width + left);
                    //     interval = 2;
                    // }

                    // let timer = setInterval(function () {
                    //     left -= interval;
                    //     right += interval;

                    //     count -= 2;

                    //     if (count <= 0) {
                    //         clearInterval(timer);
                    if (touchstart.x - touchmove.x > 0) {
                        self.value = new Date(self.value.getFullYear(), self.value.getMonth() + 1, self.value.getDate());
                        self.Refresh();

                    } else {
                        self.value = new Date(self.value.getFullYear(), self.value.getMonth() - 1, self.value.getDate());
                        self.Refresh();
                    }
                    //     } else {
                    //         previousmonth.css({ left: left - width, right: right - width });
                    //         currentmonth.css({ left: left, right: right });
                    //         nextmonth.css({ left: left + width, right: right + width });
                    //     }
                    // }, 1);

                } else {
                    // let interval = 2;
                    // let count = Math.abs(left);

                    // if (touchstart.x - touchmove.x > 0) {
                    //     interval = -2;
                    // }

                    // let timer = setInterval(function () {
                    //     left -= interval;
                    //     right += interval;

                    //     count -= 2;

                    //     if (count <= 0) {
                    //         clearInterval(timer);
                    //     } else {

                    previousmonth.css({ left: -width, right: -width });
                    currentmonth.css({ left: 0, right: 0 });
                    nextmonth.css({ left: width, right: width });
                    //     }
                    // }, 1);
                }
            }
        });

        //Disable content menu
        self.object.bind('contextmenu', function (e) {
            return false;
        });
    };

    this.ShowEditor = function (eventdate) {
        let width = 500;
        let height = 420;

        if (width > window.innerWidth)
            width = window.innerWidth - 32;

        if (height > window.innerHeight)
            height = window.innerHeight - 32;

        let form = new mobiwork.Form({
            draggable: true,
            text: "Add Event",
            width: width,
            height: height,
            onok: function () {
                if (self.onedit)
                    self.onedit({
                        type: type,
                        title: title,
                        description: description,
                        date: date,
                        time: time,
                        wholeday: wholeday,
                        venue: venue,
                        participants: participants
                    });
            },
            footer: [
                new mobiwork.Button({
                    text: "More options",
                    onclick: function () {
                        form.Size(width < window.innerWidth ? width : window.innerWidth,
                            736 < window.innerHeight ? 736 : window.innerHeight);
                        form.Center();
                        options.Visible(true);
                    }
                })
            ]
        });

        if (!eventdate)
            eventdate = new Date();

        let scroll = form.Add(new mobiwork.ScrollContainer());
        let title = scroll.Add(new mobiwork.InputText({ placeholder: "Title" }));
        let date = scroll.Add(new mobiwork.InputCalendarRange({ start: eventdate, end: eventdate }));
        let wholeday = scroll.Add(new mobiwork.InputBoolean({
            text: "All Day",
            value: false,
            onchange: function (object) {
                time.Visible(!object.value);
            }
        }));

        let time = scroll.Add(new mobiwork.InputTimeRange({}));

        let venue = scroll.Add(new mobiwork.InputDataList({
            placeholder: "Add venue",
            list: ["AITCC", "AITS", "Library"]
        }));

        let type = scroll.Add(new mobiwork.InputCombobox({
            value: "Meeting",
            list: [
                "Meeting",
                "Event",
                "Conference"
            ]
        }));

        let options = scroll.Add(new mobiwork.Container({ visible: false }));

        let description = options.Add(new mobiwork.InputTextArea({ placeholder: "Add description" }));
        let header = options.Add(new mobiwork.Header({ text: "Participants" }));

        let participants = [];
        let guest = options.Add(new mobiwork.InputDataList({
            list: self.participants,
            placeholder: "Add participants",
            onchange: function (object) {
                if (participants.indexOf(object.value) === -1) {
                    guestcontainer.Add(new mobiwork.List({
                        text: object.value.name,
                        tools: [
                            new mobiwork({
                                data: object.value,
                                icon: "close",
                                onclick: function (object) {
                                    let index = participants.indexOf(object.data);

                                    guestcontainer.children[index].Dispose();
                                    guestcontainer.children.splice(index, 1);

                                    participants.splice(index, 1);
                                }
                            })
                        ]
                    }));

                    participants.push(object.value);
                    guestcontainer.Refresh();
                }

                guest.Value("");
                guest.Focus();
            }
        }));

        let guestcontainer = scroll.Add(new mobiwork.Container());

        form.Show();
    };
};


//Input

mobiwork.InputText = function (param) {
    mobiwork.call(this, param, "input input-text");

    let self = this;

    this.required = false;
    this.value = param.value;
    this.placeholder = param.placeholder;

    this.type = "text";

    if (param.type)
        this.type = param.type;

    if (param.required !== undefined)
        this.required = param.required;

    if (param.onenter !== undefined)
        this.onenter = param.onenter;

    if (param.onchange !== undefined)
        this.onchange = param.onchange;

    if (param.onupdate !== undefined)
        this.onupdate = param.onupdate;

    this.Render = function () {
        let content = "";

        if (this.text)
            content = "<div class='text'>" + this.text + "</div>";

        if (this.readonly) {
            if (this.value)
                content += "<div class='value readonly'><div>" + this.value + "<div";
            else
                content += "<div class='value readonly'><div>NA<div";

        } else {
            if (this.placeholder)
                content += "<div class='value'><input type='" + this.type + "' placeholder='" + this.placeholder + "'";
            else
                content += "<div class='value'><input type='" + this.type + "'";
        }

        if (this.value && !this.readonly)
            content += " value='" + this.value + "'";

        content += "/></div>";

        this.object.append(content);
    };

    this.Events = function () {
        let input = self.object.find("input");

        input.on('input', function (e) {
            self.value = this.value;

            if (self.onupdate)
                self.onupdate(self);
        });

        input.change(function (e) {
            self.value = this.value;

            if (self.onchange)
                self.onchange(self);
        });

        if (self.onenter) {
            input.keypress(function (e) {
                if (e.which == 13) {
                    self.onenter(self);
                }
            });
        }
    };

    this.Focus = function () {
        let input = self.object.find("input");
        input.focus();
    };
};

mobiwork.InputTextArea = function (param) {
    mobiwork.call(this, param, "input input-text-area");

    let self = this;

    this.rows = 4;
    this.required = false;

    this.value = param.value;
    this.placeholder = param.placeholder;

    this.onchange = param.onchange;

    if (param.rows !== undefined)
        this.rows = param.rows;

    if (param.required !== undefined)
        this.required = param.required;

    this.Render = function () {
        let content = "";

        if (this.text)
            content = "<div class='text'>" + this.text + "</div>";

        if (this.readonly) {
            if (this.value)
                content += "<div>" + this.value + "</div>";
            else
                content += "<div>NA</div>";

        } else {
            if (this.placeholder)
                content += "<div class='value'><textarea rows='" + this.rows + "' placeholder='" + this.placeholder + "'>";
            else
                content += "<div class='value'><textarea rows='" + this.rows + "'>";

            if (this.value)
                content += this.value;

            content += "</textarea></div>";
        }

        this.object.append(content);
    };

    this.Events = function () {
        let input = self.object.find("textarea");

        input.on('input', function (e) {
            self.value = this.value;

            if (self.onchange)
                self.onchange(self);
        });
    };
};

mobiwork.InputDataList = function (param) {
    mobiwork.call(this, param, "input input-data-list");

    let self = this;
    let inblur;

    this.value = param.value;
    this.placeholder = param.placeholder;
    this.list = param.list;

    this.onchange = param.onchange;
    this.onlistrender = param.onlistrender;

    this.Render = function () {
        let content = "";

        if (this.text)
            content = "<div class='text'>" + this.text + "</div>";

        if (this.readonly) {
            content += "<div class='readonly-value'>";

            if (this.value) {
                content += "<div>";

                if (this.value.text)
                    content += this.value.text;

                else if (this.value.name)
                    content += this.value.name;

                else
                    content += this.value;
            }

            content += "<div/></div>";

        } else {
            content += "<div class='value'>";

            if (this.placeholder)
                content += "<input readonly='readonly' placeholder='" + this.placeholder + "'";
            else
                content += "<input readonly='readonly'";

            if (this.value) {
                if (this.value.text)
                    content += " value='" + this.value.text + "'";

                else if (this.value.name)
                    content += " value='" + this.value.name + "'";

                else
                    content += " value='" + this.value + "'";
            }

            content += "/>" + mobiwork.FormatIcon("menu-down") + "</div>";
        }


        this.object.append(content);
    };

    this.Events = function () {
        let input = self.object.find("input");
        let button = self.object.find(".value i");
        let form;
        let background;

        input.on('input', function (e) {
            if (form && form.Clear) {
                form.Clear();

                let height;
                let count = 0;
                let list;
                let filter = this.value.toLowerCase();
                let offset = $(this).offset();
                let top = offset.top + input[0].offsetHeight + 4;
                let text;

                let container = form.Add(new mobiwork.ScrollContainer());

                //First characters
                for (let i = 0; i < self.list.length; i++) {
                    self.list[i].added = false;

                    if (self.list[i].Show || self.list[i].text)
                        text = self.list[i].text.toLowerCase();

                    else if (self.list[i].name)
                        text = self.list[i].name.toLowerCase();

                    else
                        text = self.list[i].toLowerCase();

                    if (text.substring(0, filter.length) === filter) {
                        self.list[i].added = true;
                        count++;

                        container.Add(new mobiwork.List({
                            icon: self.list[i].icon,
                            text: text.split(filter).join("<span class='highlight'>" + filter + "</span>"),
                            data: self.list[i],
                            onclick: function (object) {
                                self.value = object.data;
                                self.Refresh();

                                if (form) {
                                    form.Dispose();
                                    form = undefined;
                                }

                                if (self.onchange)
                                    self.onchange(self);
                            }
                        }));
                    }

                    //Limit to 10 items only
                    if (count === 10)
                        break;
                }

                //Anywhere
                if (count !== 10) {
                    for (let i = 0; i < self.list.length; i++) {
                        if (!self.list[i].added) {
                            if (self.list[i].text)
                                text = self.list[i].text.toLowerCase();

                            else if (self.list[i].name)
                                text = self.list[i].name.toLowerCase();

                            else
                                text = self.list[i].toLowerCase();

                            if (text.indexOf(filter) !== -1) {
                                self.list[i].added = true;
                                count++;

                                container.Add(new mobiwork.List({
                                    icon: self.list[i].icon,
                                    text: text.split(filter).join("<span class='highlight'>" + filter + "</span>"),
                                    data: self.list[i],
                                    onclick: function (object) {
                                        self.value = object.data;
                                        self.Refresh();
                                        form.Dispose();
                                        form = undefined;

                                        if (self.onchange)
                                            self.onchange(self);
                                    }
                                }));
                            }

                            //Limit to 10 items only
                            if (count === 10)
                                break;
                        }
                    }
                }

                height = 0;

                if (count === 0) {
                    self.value = this.value;
                    form.Height(height);

                } else {
                    form.Refresh();

                    for (let i = 0; i < container.children.length; i++)
                        height += container.children[i].object[0].clientHeight + 1;

                    if (window.innerHeight - top < 120)
                        top = top - height;

                    if (height + top > window.innerHeight - 16)
                        height = window.innerHeight - top - 16;

                    form.Height(height);
                    form.Location(offset.left - 4, top);
                }


            } else if (this.value !== "") {
                let object = $(this);
                form = self.ShowList(object, this.value, false);
            }
        });

        input.blur(function () {
            inblur = true;

            let timer = setTimeout(function () {
                if (inblur) {
                    if (form) {
                        if (form.Dispose)
                            form.Dispose();

                        form = undefined;
                    }

                    if (background) {
                        if (background.Dispose)
                            background.Dispose();

                        background = undefined;
                    }

                    if (mobiwork.mobile) {
                        input.parent().removeAttr("style");
                    }
                }

                clearTimeout(timer);
            }, 100);
        });

        self.Click(button, function () {
            input.focus();
            let object = $(this).parent();
            form = self.ShowList(object, "", false);
        });
    };

    this.Value = function (value) {
        self.value = value;
        let input = self.object.find("input");

        if (value.text)
            input[0].value = value.text;
        else if (value.name)
            input[0].value = value.name;
        else
            input[0].value = value;
    };

    this.Focus = function () {
        let input = self.object.find("input");
        input.focus();
    };

    this.ShowList = function (input, filter, modal) {
        let offset = input.offset();
        let height = 34 * self.list.length;
        let width = input[0].offsetWidth;
        let top = offset.top + input[0].offsetHeight + 4;

        if (filter) {
            filter = filter.toLowerCase();

            let count = 0;

            for (let i = 0; i < self.list.length; i++) {
                if (self.list[i].Show || self.list[i].text) {
                    //Filter list
                    if (filter)
                        if (self.list[i].text.toLowerCase().indexOf(filter) !== -1)
                            count++;

                } else if (self.list[i].name) {
                    //Filter list
                    if (self.list[i].name.toLowerCase().indexOf(filter) !== -1)
                        count++;

                } else {
                    //Filter list
                    if (filter)
                        if (self.list[i].toLowerCase().indexOf(filter) !== -1)
                            count++;
                }
            }

            height = 34 * count;
        }

        if (height > window.innerHeight) {
            height = window.innerHeight - top;

        } else if (top + height > window.innerHeight) {
            height = window.innerHeight - top;

            if (height < 34 * 3) //Minimum 3 items
                top = offset.top - height;

            if (top < 0)
                top = 0;
        }

        if (width > 300)
            width = 300;

        let form = new mobiwork.Form({
            class: "form-editor",
            showheader: false,
            showfooter: false,
            height: height,
            modal: modal,
            width: width
        });

        form.class += " form-combobox";

        let scroll = form.Add(new mobiwork.ScrollContainer());

        for (let i = 0; i < self.list.length; i++) {
            if (self.list[i].Show || self.list[i].text) {
                //Filter list
                if (filter)
                    if (self.list[i].text.toLowerCase().indexOf(filter) === -1)
                        continue;

                if (self.onlistrender) {
                    list = self.onlistrender(self.list[i]);
                    list.onclick = function (object) {
                        inblur = false;

                        self.Value(object.data);
                        form.Dispose();
                        form = undefined;

                        if (self.onchange)
                            self.onchange(self);

                        self.Focus();
                    };

                    scroll.Add(list);

                } else {
                    scroll.Add(new mobiwork.List({
                        icon: self.list[i].icon,
                        text: self.list[i].text,
                        data: self.list[i],
                        onclick: function (object) {
                            inblur = false;

                            self.Value(object.data);
                            form.Dispose();
                            form = undefined;

                            if (self.onchange)
                                self.onchange(self);

                            self.Focus();
                        }
                    }));
                }

            } else if (self.list[i].name) {
                //Filter list
                if (filter)
                    if (self.list[i].name.toLowerCase().indexOf(filter) === -1)
                        continue;

                if (self.onlistrender) {
                    list = self.onlistrender(self.list[i]);
                    list.onclick = function (object) {
                        inblur = false;

                        self.Value(object.data);
                        form.Dispose();
                        form = undefined;

                        if (self.onchange)
                            self.onchange(self);

                        self.Focus();
                    };

                    scroll.Add(list);

                } else {
                    scroll.Add(new mobiwork.List({
                        icon: self.list[i].icon,
                        text: self.list[i].name,
                        data: self.list[i],
                        onclick: function (object) {
                            inblur = false;

                            self.Value(object.data);
                            form.Dispose();
                            form = undefined;

                            if (self.onchange)
                                self.onchange(self);

                            self.Focus();
                        }
                    }));
                }

            } else {
                //Filter list
                if (filter)
                    if (self.list[i].toLowerCase().indexOf(filter) === -1)
                        continue;

                form.Add(new mobiwork.List({
                    text: self.list[i],
                    data: self.list[i],
                    onclick: function (object) {
                        inblur = false;

                        self.Value(object.data);
                        form.Dispose();
                        form = undefined;

                        if (self.onchange)
                            self.onchange(self);

                        self.Focus();
                    }
                }));
            }
        }

        form.Show();
        form.Location(offset.left - 4, top);

        return form;
    };
};

mobiwork.InputCalendar = function (param) {
    mobiwork.call(this, param, "input input-calendar");

    let self = this;

    if (param) {
        this.value = param.value;
        this.onchange = param.onchange;
        this.readonly = param.readonly;

    } else {
        this.value = new Date();
    }

    if (!this.value)
        this.value = new Date();

    this.Render = function () {
        let content = "";

        if (this.text)
            content = "<div class='text'>" + this.text + "</div>";

        if (this.value instanceof Date && !isNaN(this.value))
            content += "<div class='value'>" + dateFormat(this.value, "ddd, d mmm yyyy");

        if (!self.readonly)
            content += "<span class='select'>" + mobiwork.FormatIcon("menu-down") + "</span>";

        content += "</div>";

        this.object.append(content);
    };

    this.Events = function () {
        let value = self.object.find(".value");

        if (!self.readonly) {
            self.Click(value, function () {
                let day = $(this);
                let offset = day.offset();

                let form = new mobiwork.Form({
                    class: "form-editor",
                    showheader: false,
                    showfooter: false,
                    height: 360,
                    width: 360
                });

                form.Add(new mobiwork.Calendar({
                    showeditor: false,
                    value: self.value,
                    onclick: function (date) {
                        form.Dispose();
                        self.value = new Date(date);
                        self.Refresh();

                        if (self.onchange)
                            self.onchange(self);
                    }
                }));

                form.Show();

                if (window.innerWidth < 500) {
                    let left = (window.innerWidth - 360) / 2;
                    let top = (window.innerHeight - 360) / 2;
                    form.Location(left, top);
                } else
                    form.Location(offset.left, offset.top + day[0].offsetHeight);
            });
        }
    };
};

mobiwork.InputCalendarRange = function (param) {
    mobiwork.call(this, param, "input input-calendar-range input-range");

    let self = this;

    this.start = new mobiwork.InputCalendar({
        value: new Date(),
        onchange: function (object) {
            if (self.end.value < self.start.value) {
                self.end.value = self.start.value;
                self.end.Refresh();
            }

            if (self.onchange)
                self.onchange(self);
        }
    });

    this.end = new mobiwork.InputCalendar({
        value: new Date(),
        onchange: function (object) {
            if (self.end.value < self.start.value) {
                self.start.value = self.end.value;
                self.start.Refresh();
            }

            if (self.onchange)
                self.onchange(self);
        }
    });

    if (param) {
        this.start.readonly = param.readonly;
        this.end.readonly = param.readonly;

        if (param.start)
            this.start.value = param.start;

        if (param.end)
            this.end.value = param.end;

        this.onchange = param.onchange;
    }


    this.Refresh = function () {
        this.object.empty();

        this.start.Show(this.object);
        this.object.append("<div class='arrow'></div>");
        this.end.Show(this.object);
    };
};

mobiwork.InputTime = function (param) {
    mobiwork.call(this, param, "input input-time");

    let self = this;

    if (param) {
        this.readonly = param.readonly;
        this.value = param.value;
        this.onchange = param.onchange;
    } else {
        this.value = "08:00 AM";
    }

    if (!this.value) {
        let value = new Date();
        value.setHours(value.getHours() + 1);
        value.setMinutes(0);

        //Include 'js/others/dateformat.js'
        this.value = dateFormat(value, "hh:MM TT");
    }

    this.Render = function () {
        let content = "";

        if (this.text)
            content = "<div class='text'>" + this.text + "</div>";

        let split = this.value.split(":");
        let minute = split[1].split(" ");

        content += "<div class='value'><span class='hour'>" + split[0] + "</span>:<span class='minute'>" + minute[0] + "</span> <span class='ampm'>" + minute[1] + "</span>";

        if (!self.readonly)
            content += "<span class='select'>" + mobiwork.FormatIcon("menu-down") + "</span>";

        content += "</div>";

        this.object.append(content);
    };

    this.Events = function () {
        if (!self.readonly) {
            let value = self.object.find(".value");
            let hour = self.object.find(".hour");
            let minute = self.object.find(".minute");
            let ampm = self.object.find(".ampm");

            self.Click(value, function () {
                let time = [
                    "12:00 AM", "12:30 AM",
                    "01:00 AM", "01:30 AM",
                    "02:00 AM", "02:30 AM",
                    "03:00 AM", "03:30 AM",
                    "04:00 AM", "04:30 AM",
                    "05:00 AM", "05:30 AM",
                    "06:00 AM", "06:30 AM",
                    "07:00 AM", "07:30 AM",
                    "08:00 AM", "08:30 AM",
                    "09:00 AM", "09:30 AM",
                    "10:00 AM", "10:30 AM",
                    "11:00 AM", "11:30 AM",
                    "12:00 PM", "12:30 PM",
                    "01:00 PM", "01:30 PM",
                    "02:00 PM", "02:30 PM",
                    "03:00 PM", "03:30 PM",
                    "04:00 PM", "04:30 PM",
                    "05:00 PM", "05:30 PM",
                    "06:00 PM", "06:30 PM",
                    "07:00 PM", "07:30 PM",
                    "08:00 PM", "08:30 PM",
                    "09:00 PM", "09:30 PM",
                    "10:00 PM", "10:30 PM",
                    "11:00 PM", "11:30 PM",
                ];

                let input = $(this);

                let form = new mobiwork.Form({
                    class: "form-editor",
                    showheader: false,
                    height: 430,
                    width: 320,
                    onok: function () {
                        self.value = hour + ":" + minute + " " + ampm;
                        self.Refresh();

                        if (self.onchange)
                            self.onchange(self);
                    }
                });
                let row;
                let value = self.value.split(":");

                let ampm = value[1].split(" ");
                let hour = value[0];
                let minute = ampm[0];
                ampm = ampm[1];

                let hours = [
                    "01", "02", "03", "04",
                    "05", "06", "07", "08",
                    "09", "10", "11", "12"
                ];

                let minutes = [
                    "00", "10", "15", "20",
                    "30", "40", "45", "50"
                ];

                row = form.Add(new mobiwork.Container());
                row.class += " input-time-ampm";

                let am = row.Add(new mobiwork.Button({
                    text: "AM",
                    onclick: function (object) {
                        am.object.addClass("selected");
                        pm.object.removeClass("selected");

                        ampm = "AM";
                        RefreshHour();
                        RefreshMinute();
                    }
                }));

                if (ampm === "AM")
                    am.class += " selected";

                let pm = row.Add(new mobiwork.Button({
                    text: "PM",
                    onclick: function (object) {
                        am.object.removeClass("selected");
                        pm.object.addClass("selected");

                        ampm = "PM";
                        RefreshHour();
                        RefreshMinute();
                    }
                }));

                if (ampm === "PM")
                    pm.class += " selected";

                let hourcontainer = form.Add(new mobiwork.Container());
                let minutecontainer = form.Add(new mobiwork.Container());

                form.Show();

                RefreshHour();
                RefreshMinute();

                function RefreshHour() {
                    let row;
                    let button;

                    hourcontainer.Clear();

                    for (let i = 0; i < hours.length; i++) {
                        if (i % 4 === 0) {
                            row = hourcontainer.Add(new mobiwork.Container());
                            row.class += " input-time-row input-time-hour";
                        }

                        button = row.Add(new mobiwork.Button({
                            data: hours[i],
                            text: hours[i] + " " + ampm,
                            onclick: function (object) {
                                hourcontainer.object.find(".button").removeClass("selected");
                                object.object.addClass("selected");

                                hour = object.data;
                                RefreshMinute();
                            }
                        }));

                        if (hour === hours[i])
                            button.class += " selected";
                    }

                    hourcontainer.Refresh();
                }

                function RefreshMinute() {
                    let row;
                    let button;

                    minutecontainer.Clear();

                    for (let i = 0; i < minutes.length; i++) {
                        if (i % 4 === 0) {
                            row = minutecontainer.Add(new mobiwork.Container());
                            row.class += " input-time-row input-time-minute";
                        }

                        button = row.Add(new mobiwork.Button({
                            data: minutes[i],
                            text: hour + ":" + minutes[i] + " " + ampm,
                            onclick: function (object) {
                                minutecontainer.object.find(".button").removeClass("selected");
                                object.object.addClass("selected");

                                minute = object.data;
                            }
                        }));

                        if (minute === minutes[i])
                            button.class += " selected";
                    }

                    minutecontainer.Refresh();
                }
            });

            self.Click(hour, function (e) {
                e.stopPropagation();

                let hours = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];

                let input = $(this).parent();
                self.GetInput(input, hours, function (value) {
                    let split = self.value.split(":");
                    let minute = split[1].split(" ");

                    self.value = value + ":" + split[1];
                    self.Refresh();

                    if (self.onchange)
                        self.onchange(self);
                });
            });

            self.Click(minute, function (e) {
                e.stopPropagation();

                let minutes = [];

                for (let i = 0; i < 60; i++) {
                    if (i < 10)
                        minutes.push("0" + i);
                    else
                        minutes.push(i);
                }

                let input = $(this).parent();
                self.GetInput(input, minutes, function (value) {
                    let split = self.value.split(":");
                    let minute = split[1].split(" ");

                    self.value = split[0] + ":" + value + " " + minute[1];
                    self.Refresh();

                    if (self.onchange)
                        self.onchange(self);
                });
            });

            self.Click(ampm, function (e) {
                e.stopPropagation();

                let split = self.value.split(":");
                let minute = split[1].split(" ");

                if (minute[1] === "AM")
                    self.value = split[0] + ":" + minute[0] + " PM";
                else
                    self.value = split[0] + ":" + minute[0] + " AM";

                self.Refresh();

                if (self.onchange)
                    self.onchange(self);
            });
        }
    };

    this.GetInput = function (input, list, ret) {
        let offset = input.offset();
        let width = input[0].offsetWidth;
        let height = 34 * list.length;
        let top = offset.top + input[0].offsetHeight;

        if (width < 50)
            width = 50;

        if (height > 600) {
            height = window.innerHeight - 32;
            if (height > 600)
                height = 600;

            top = (window.innerHeight - height) / 2;


        } else if (top + height > window.innerHeight) {
            height = window.innerHeight - top - 16;

            if (height < 34 * 3) //Minimum 3 items
                top = offset.top - height;

            if (top < 0)
                top = 0;
        }

        let form = new mobiwork.Form({
            class: "form-editor",
            showheader: false,
            showfooter: false,
            height: height,
            width: width
        });

        form.class += " form-combobox";

        let scroll = form.Add(new mobiwork.ScrollContainer());

        for (let i = 0; i < list.length; i++) {
            if (list[i].Show || list[i].text) {
                scroll.Add(new mobiwork.List({
                    icon: list[i].icon,
                    text: list[i].text,
                    data: list[i],
                    onclick: function (object) {
                        form.Dispose();
                        ret(object.data);
                    }
                }));
            } else {
                scroll.Add(new mobiwork.List({
                    text: list[i],
                    data: list[i],
                    onclick: function (object) {
                        form.Dispose();
                        ret(object.data);
                    }
                }));
            }
        }

        form.Show();
        form.Location(offset.left, top);
    };
};

mobiwork.InputTimeRange = function (param) {
    mobiwork.call(this, param, "input input-time-range input-range");

    let self = this;

    let start = new Date();
    start.setHours(start.getHours() + 1);
    start.setMinutes(0);

    this.start = new mobiwork.InputTime({
        value: dateFormat(start, "hh:MM TT"),
        onchange: function (object) {
            if (self.onchange)
                self.onchange(self);
        }
    });

    let end = new Date();
    end.setHours(end.getHours() + 2);
    end.setMinutes(0);

    this.end = new mobiwork.InputTime({
        value: dateFormat(end, "hh:MM TT"),
        onchange: function (object) {
            if (self.onchange)
                self.onchange(self);
        }
    });

    if (param) {
        this.start.readonly = param.readonly;
        this.end.readonly = param.readonly;

        if (param.start)
            this.start.value = param.start;

        if (param.end)
            this.end.value = param.end;

        this.onchange = param.onchange;
    }

    this.Refresh = function () {
        this.object.empty();
        this.start.Show(this.object);
        this.object.append("<div class='arrow'></div>");
        this.end.Show(this.object);
    };
};

mobiwork.InputBoolean = function (param) {
    mobiwork.call(this, param, "input input-boolean");

    let self = this;
    this.value = param.value;
    this.onchange = param.onchange;

    this.Render = function () {
        let content = "";

        if (this.text)
            content = "<div class='text'>" + this.text + "</div>";

        content += "<div class='input-value'><div class='input-boolean-switch'>";

        if (this.value)
            content += "<div class='on'>";
        else
            content += "<div class='off'>";

        content += "</div></div></div>";

        this.object.append(content);
    };

    this.Events = function () {
        let input = self.object.find(".input-boolean-switch");

        self.Click(input, function () {
            self.value = !self.value;
            self.Refresh();

            if (self.onchange)
                self.onchange(self);
        });
    };
};

mobiwork.InputCombobox = function (param) {
    mobiwork.call(this, param, "input input-combobox");

    let self = this;

    this.onchange = param.onchange;
    this.value = param.value;
    this.list = param.list;

    this.selectedindex = 0;

    if (param.selectedindex !== undefined) {
        this.selectedindex = param.selectedindex;

        this.value = this.list[this.selectedindex];
    }

    this.type = "text";

    this.Render = function () {
        let content = "";

        if (this.text)
            content = "<div class='text'>" + this.text + "</div>";

        if (this.readonly) {
            if (this.value) {
                if (this.value.text)
                    content += "<div class='readonly-value'>" + this.value.text + "</div>";
                else if (this.value.name)
                    content += "<div class='readonly-value'>" + this.value.name + "</div>";
                else
                    content += "<div class='readonly-value'>" + this.value + "</div>";
            } else {
                content += "<div class='readonly-value'>&nbsp;" + "</div>";
            }

        } else {
            if (this.value) {
                if (this.value.text)
                    content += "<div class='value'>" + this.value.text + mobiwork.FormatIcon("menu-down") + "</div>";
                else if (this.value.name)
                    content += "<div class='value'>" + this.value.name + mobiwork.FormatIcon("menu-down") + "</div>";
                else
                    content += "<div class='value'>" + this.value + mobiwork.FormatIcon("menu-down") + "</div>";
            } else {
                content += "<div class='value'>&nbsp;" + mobiwork.FormatIcon("menu-down") + "</div>";
            }
        }

        this.object.append(content);
    };

    this.Events = function () {
        let value = self.object.find(".value");

        self.Click(value, function () {
            let input = $(this);
            let offset = input.offset();
            let height = 36 * self.list.length;
            let top = offset.top + input[0].offsetHeight + 4;

            //For non-array list
            if (!height) {
                height = 0;

                for (let i in self.list) {
                    height += 34;
                }
            }

            if (height > window.innerHeight) {
                height = window.innerHeight - top - 16;

                if (height > 500)
                    height = 500;

            } else if (top + height > window.innerHeight) {
                height = window.innerHeight - top;

                if (height < 34 * 3) //Minimum 3 items
                    top = offset.top - height;

                if (top < 0)
                    top = 0;
            }

            let form = new mobiwork.Form({
                showheader: false,
                showfooter: false,
                height: height,
                width: input[0].offsetWidth
            });

            form.class += " form-combobox";

            let scroll = form.Add(new mobiwork.ScrollContainer());

            for (let i in self.list) {
                if (self.list[i].Show || self.list[i].text) {
                    scroll.Add(new mobiwork.List({
                        icon: self.list[i].icon,
                        text: self.list[i].text,
                        data: { data: self.list[i], index: i },
                        onclick: function (object) {
                            self.value = object.data.data;
                            self.selectedindex = object.data.index;
                            self.Refresh();
                            form.Dispose();

                            if (self.onchange)
                                self.onchange(self);
                        }
                    }));

                } else if (self.list[i].name) {
                    scroll.Add(new mobiwork.List({
                        icon: self.list[i].icon,
                        text: self.list[i].name,
                        data: { data: self.list[i], index: i },
                        onclick: function (object) {
                            self.value = object.data.data;
                            self.selectedindex = object.data.index;
                            self.Refresh();
                            form.Dispose();

                            if (self.onchange)
                                self.onchange(self);
                        }
                    }));

                } else {
                    scroll.Add(new mobiwork.List({
                        text: self.list[i],
                        data: { data: self.list[i], index: i },
                        onclick: function (object) {
                            self.value = object.data.data;
                            self.selectedindex = object.data.index;
                            self.Refresh();
                            form.Dispose();

                            if (self.onchange)
                                self.onchange(self);
                        }
                    }));
                }
            }

            form.Show();
            form.Location(offset.left, top - 4);
        });
    };
};

mobiwork.InputDataTable = function (param) {
    mobiwork.call(this, param, "input input-datatable");

    let self = this;

    this.value = param.value;
    this.data = param.data;
    this.columns = param.columns;

    this.Render = function () {
        let content = "";

        if (this.text)
            content = "<div class='text'>" + this.text + "</div>";

        if (this.value) {
            if (this.value.text)
                content += "<div class='value'>" + this.value.text + mobiwork.FormatIcon("menu-down") + "</div>";
            else if (this.value.name)
                content += "<div class='value'>" + this.value.name + mobiwork.FormatIcon("menu-down") + "</div>";
            else
                content += "<div class='value'>" + this.value + mobiwork.FormatIcon("menu-down") + "</div>";
        } else {
            content += "<div class='value'>&nbsp;" + mobiwork.FormatIcon("menu-down") + "</div>";
        }

        this.object.append(content);
    };

    this.Events = function () {
        let value = self.object.find(".value");

        self.Click(value, function () {
            let input = $(this);
            let offset = input.offset();
            let top = offset.top + input[0].offsetHeight + 8;

            let form = new mobiwork.Form({
                class: "show-border"
            });

            let table = form.Add(new mobiwork.DataTable({
                columns: self.columns,
                data: self.data,
                showsearch: true
            }));

            form.Show();
            form.Location(offset.left - 4, top);
        });
    };
};

mobiwork.InputColor = function (param) {
    mobiwork.call(this, param, "input input-color");

    let self = this;
    this.value = param.value;
    this.onchange = param.onchange;

    this.Render = function () {
        let content = "";

        if (this.text)
            content = "<div class='text'>" + this.text + "</div>";

        content += "<div class='input-value'><div class='control control-switch' style='background-color:" + this.value + "'></div></div>";
        this.object.append(content);
    };

    this.Events = function () {
        let input = this.object.find(".control-switch");

        self.Click(input, function () {
            let form = new mobiwork.Form({
                text: "Select Color",
                height: 565,
                width: 264,
                showfooter: false
            });

            form.class += " form-color";

            let scroll = form.Add(new mobiwork.ScrollContainer());

            for (let name in COLORS)
                scroll.Add(new mobiwork.Color({
                    data: COLORS[name],
                    value: COLORS[name].name,
                    onclick: function (data) {
                        self.value = data.data.name;
                        self.Refresh();

                        form.Close();

                        if (self.onproperty)
                            self.onproperty(this);
                    }
                }));

            form.Show();
        });
    };
};


//Tree

mobiwork.Tree = function (param) {
    mobiwork.call(this, param, "tree fixed");
};

mobiwork.Node = function (param) {
    mobiwork.call(this, param, "node collapsed");

    let self = this;
    let collapse = true;

    if (param) {
        if (param.collapse)
            collapse = param.collapse;
    }

    if (!collapse)
        self.class = "node";

    this.RenderIcon = function () {
        if (!this.iconobject) {
            this.iconobject = $("<div class='icon'></div>");

            let control = this.object.children(".control");
            control.append(this.iconobject);
        }

        this.iconobject.empty();

        if (this.icon) {

            if (this.icon.Show)
                this.icon.Show(this.iconobject);
            else {
                if (self.children.length) {
                    let icon = "menu-right";

                    if (!collapse)
                        icon = "menu-down";

                    this.iconobject.append(mobiwork.FormatIcon(icon) + mobiwork.FormatIcon(this.icon));
                } else
                    this.iconobject.append(mobiwork.FormatIcon(this.icon));
            }
        } else {
            if (self.children.length) {
                let icon = "menu-right";

                if (!collapse)
                    icon = "menu-down";

                this.iconobject.append(mobiwork.FormatIcon(icon));
            }
        }
    };

    this.Events = function () {
        if (self.children.length === 0) {
            self.object.addClass("no-children");
        }

        if (self.children.length) {
            this.Click(this.object, function (e) {
                e.stopPropagation();

                collapse = !collapse;
                self.RenderIcon();

                if (collapse)
                    self.object.addClass("collapsed");
                else
                    self.object.removeClass("collapsed");

                if (self.onclick)
                    self.onclick(self, self.data);
            });

        } else {
            this.Click(this.object, function (e) {
                e.stopPropagation();

                let tree = self.object.closest(".tree");
                let nodes = tree.find(".node");
                nodes.removeClass("selected");

                self.object.addClass("selected");

                if (self.onclick)
                    self.onclick(self, self.data);
            });
        }
    };

    this.Expand = function () {
        collapse = false;
        self.object.removeClass("collapsed");
    };
};


//Viewer

mobiwork.DocumentViewer = function (param) {
    mobiwork.call(this, param, "document-viewer");

    mobiwork.call(this, param);

    let self = this;

    this.columns = ["filename", "date"];
    this.data = param.data;

    if (param.columns)
        this.columns = param.columns;

    this.Show = function (parent) {
        let form = new mobiwork.Form({
            class: "document-viewer",
            text: "Document Viewer",
            draggable: true,
            width: 1024,
            height: 768
        });

        form.Add(new mobiwork.DataTable({
            columns: this.columns,
            data: this.data
        }));

        form.Show();
    };
};

mobiwork.ImageViewer = function (param) {
    mobiwork.call(this, param, "image-viewer dock");

    let self = this;
    this.data = param.data;
    this.directory = param.directory;

    this.Refresh = function () {
        let container = new mobiwork.ThumbnailContainer();
        let images = [];

        for (let i = 0; i < this.data.length; i++) {
            images.push(this.directory + this.data[i].filename);

            container.Add(new mobiwork.Thumbnail({
                text: this.data[i].name,
                details: this.data[i].details,
                src: this.directory + "thumbnail_" + this.data[i].filename,
                data: i,
                onclick: function (object) {
                    let viewer = new mobiwork.PhotoViewer({
                        current: object.data,
                        data: images
                    });

                    viewer.Show();
                }
            }));
        }

        container.Show(this.object);
    };
};

mobiwork.PresentationViewer = function (param) {
    mobiwork.call(this, param, "presentation");

    let self = this;

    let spinner = new mobiwork.Spinner();

    this.current = 1;
    this.data = param.data;
    this.onchange = param.onchange;

    this.count = param.count;
    this.src = param.src;
    this.filename = param.filename;

    if (param.current)
        this.current = param.current;

    this.Refresh = function () {
        this.object.empty();

        let content = "<div class='presentation-image'></div>";
        content += "<div class='previous'><i class='mdi mdi-chevron-left'></i></div>";
        content += "<div class='next'><i class='mdi mdi-chevron-right'></i></div>";

        content += "<div class='presentation-control'>";
        content += "<div class='presentation-button presentation-control-previous'><i class='mdi mdi-chevron-left'></i></div>";
        // content += "<div class='presentation-control-text'>" + self.current + " of " + self.data.length + "</div>";
        content += "<div class='presentation-control-text'>" + self.current + " of " + self.count + "</div>";
        content += "<div class='presentation-button presentation-control-next'><i class='mdi mdi-chevron-right'></i></div>";
        content += "</div>";

        this.object.append(content);
        this.slide = this.object.find(".presentation-image");

        this.Events();
        this.RefreshSlide();
    };

    this.RefreshSlide = function () {
        // let image = self.data[self.current];
        var image = self.src + "/" + self.filename.replace("%", self.current);
        let content = $("<img src='" + image + "' style='visibility: hidden;'/>");

        self.slide.empty();
        self.slide.append(content);

        self.Resize();

        let text = self.object.find(".presentation-control-text");
        // text.html((self.current + 1) + " of " + self.data.length);
        text.html((self.current) + " of " + self.count);

        if (self.onchange)
            self.onchange(self.current);
    };

    this.Resize = function () {
        if (spinner && spinner.Dispose)
            spinner.Dispose();

        spinner = new mobiwork.Spinner();
        spinner.Show();

        let img = self.slide.find("img");

        if (img.prop('complete')) {
            Resize(img[0]);
            if (spinner.Dispose)
                spinner.Dispose();
        } else {
            img.on('load', function () {
                Resize(this);
                if (spinner.Dispose)
                    spinner.Dispose();
            });
        }
    };

    this.Events = function () {
        this.object.unbind();

        let previous = this.object.find(".previous");
        let next = this.object.find(".next");
        let max = this.object.find(".max");

        self.Click(previous, function (e) {
            e.stopPropagation();

            self.Previous();
        });

        self.Click(next, function (e) {
            e.stopPropagation();

            self.Next();
        });

        previous = this.object.find(".presentation-control-previous");
        next = this.object.find(".presentation-control-next");

        self.Click(previous, function (e) {
            e.stopPropagation();

            self.Previous();
        });

        self.Click(next, function (e) {
            e.stopPropagation();

            self.Next();
        });

        self.Click(max, function (e) {
            e.stopPropagation();

            // Supports most browsers and their versions.
            let element = document.body;

            if (self.fullscreen) {
                self.fullscreen = false;

                if (document.exitFullscreen)
                    document.exitFullscreen();

                else if (document.webkitExitFullscreen)
                    document.webkitExitFullscreen();

                else if (document.mozCancelFullScreen)
                    document.mozCancelFullScreen();

                else if (document.msExitFullscreen)
                    document.msExitFullscreen();

                else if (typeof window.ActiveXObject !== "undefined") { // Older IE.
                    let wscript = new ActiveXObject("WScript.Shell");
                    if (wscript !== null) {
                        wscript.SendKeys("{F11}");
                    }
                }
            } else {
                self.fullscreen = true;

                let requestMethod = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || element.msRequestFullScreen;

                if (requestMethod) { // Native full screen.
                    requestMethod.call(element);

                } else if (typeof window.ActiveXObject !== "undefined") { // Older IE.
                    let wscript = new ActiveXObject("WScript.Shell");
                    if (wscript !== null) {
                        wscript.SendKeys("{F11}");
                    }
                }
            }

            if (this.innerHTML.indexOf("expand") !== -1) {
                $(e.currentTarget).html("<i class='mdi mdi-arrow-collapse'></i>");
                self.object.addClass("maximize");
            } else {
                $(e.currentTarget).html("<i class='mdi mdi-arrow-expand'></i>");
                self.object.removeClass("maximize");
            }

            self.Resize();
        });
    };

    this.Previous = function () {
        if (self.current > 1) {
            self.current--;

            self.RefreshSlide();
        }
    };

    this.Next = function () {
        // if (self.current < self.data.length - 1) {
        if (self.current < self.count) {
            self.current++;

            self.RefreshSlide();
        }
    };

    this.Dispose = function () {
        if (spinner && spinner.Dispose)
            spinner.Dispose();

        if (self.object) {
            self.object.remove();

            //Dispose children
            for (let i = 0; i < self.children.length; i++) {
                if (self.children[i].Dispose)
                    self.children[i].Dispose();
            }

            //Remove all references
            for (let name in self) {
                self[name] = undefined;
            }
        }
    };

    function Resize(img) {
        let timer = setTimeout(function () {
            let wo = img.width;
            let ho = img.height;

            let wc = self.object.width();
            let hc = self.object.height() - 50;

            if (wc / hc < wo / ho) {
                let w = wc - 40;
                let h = ho * w / wo;

                let l = 20;
                let t = (hc - h) / 2;

                let img = self.slide.find("img");
                img.css({ width: w, height: h, left: l, top: t, visibility: "visible" });
            } else {
                let h = hc - 40;
                let w = wo * h / ho;

                let t = 20;
                let l = (wc - w) / 2;

                let img = self.slide.find("img");
                img.css({ width: w, height: h, left: l, top: t, visibility: "visible" });
            }
        }, 1);
    }
};

mobiwork.PhotoViewer = function (param) {
    mobiwork.call(this, param, "presentation photo");

    let self = this;

    let spinner = new mobiwork.Spinner();
    let canvas;

    this.current = 0;
    this.data = param.data;
    this.onchange = param.onchange;

    if (param.current)
        this.current = param.current;

    this.Refresh = function () {
        this.object.empty();
        canvas = new mobiwork.Canvas2D();
        canvas.settings.SHOWGRID = false;
        canvas.settings.SHOWRULER = false;
        canvas.settings.SHOWAXIS = false;
        canvas.settings.BlackTheme();

        canvas.model.action = CANVASACTIONS.PAN;

        canvas.Show(this.object);

        canvas.object.bind('contextmenu', function (e) {
            return false;
        });

        let content = "<div class='previous'><i class='mdi mdi-chevron-left'></i></div>";
        content += "<div class='next'><i class='mdi mdi-chevron-right'></i></div>";

        content += "<div class='presentation-control'>";
        content += "<div class='presentation-button presentation-control-previous'><i class='mdi mdi-chevron-left'></i></div>";
        content += "<div class='presentation-control-text'>" + self.current + " of " + self.data.length + "</div>";
        content += "<div class='presentation-button presentation-control-next'><i class='mdi mdi-chevron-right'></i></div>";
        content += "<div class='presentation-button presentation-zoom-in'><i class='mdi mdi-magnify-plus-outline'></i></div>";
        content += "<div class='presentation-button presentation-zoom-out'><i class='mdi mdi-magnify-minus-outline'></i></div>";
        content += "<div class='presentation-button presentation-zoom-all'><i class='mdi mdi-magnify-close'></i></div>";
        content += "</div>";

        content += mobiwork.FormatIcon("close-circle-outline");

        this.object.append(content);
        this.slide = this.object.find(".presentation-image");

        this.Events();
        this.RefreshSlide();
    };

    this.RefreshSlide = function () {
        spinner = new mobiwork.Spinner();
        spinner.Show();

        let image = self.data[self.current];

        if (image.filename)
            image = image.filename;

        if (self.directory)
            image = self.directory + image

        canvas.model.Clear();
        canvas.model.Add(new canvasgraphics.Image({
            source: image,
            onload: function () {
                canvas.ZoomAll();
                spinner.Dispose();
            }
        }));

        let text = self.object.find(".presentation-control-text");
        text.html((self.current + 1) + " of " + self.data.length);

        if (self.onchange)
            self.onchange(self.current);
    };

    this.Resize = function () {
        if (spinner && spinner.Dispose)
            spinner.Dispose();

        spinner = new mobiwork.Spinner();
        spinner.Show();

        let img = self.slide.find("img");

        if (img.prop('complete')) {
            Resize(img[0]);
            if (spinner.Dispose)

                spinner.Dispose();
        } else {
            img.on('load', function () {
                Resize(this);
                if (spinner.Dispose)
                    spinner.Dispose();
            });
        }
    };

    this.Events = function () {
        this.object.unbind();

        let previous = this.object.find(".previous");
        let next = this.object.find(".next");
        let max = this.object.find(".max");
        let close = this.object.find(".mdi-close-circle-outline");

        let zoomin = this.object.find(".presentation-zoom-in");
        let zoomout = this.object.find(".presentation-zoom-out");
        let zoomall = this.object.find(".presentation-zoom-all");

        self.Click(zoomin, function (e) {
            e.stopPropagation();
            canvas.ZoomIn();
        });

        self.Click(zoomout, function (e) {
            e.stopPropagation();
            canvas.ZoomOut();
        });

        self.Click(zoomall, function (e) {
            e.stopPropagation();
            canvas.ZoomAll();
        });


        self.Click(close, function (e) {
            e.stopPropagation();
            self.Dispose();
        });

        self.Click(previous, function (e) {
            e.stopPropagation();
            self.Previous();
        });

        self.Click(next, function (e) {
            e.stopPropagation();
            self.Next();
        });

        previous = this.object.find(".presentation-control-previous");
        next = this.object.find(".presentation-control-next");

        self.Click(previous, function (e) {
            e.stopPropagation();

            self.Previous();
        });

        self.Click(next, function (e) {
            e.stopPropagation();

            self.Next();
        });

        self.Click(max, function (e) {
            e.stopPropagation();

            // Supports most browsers and their versions.
            let element = document.body;

            if (self.fullscreen) {
                self.fullscreen = false;

                if (document.exitFullscreen)
                    document.exitFullscreen();

                else if (document.webkitExitFullscreen)
                    document.webkitExitFullscreen();

                else if (document.mozCancelFullScreen)
                    document.mozCancelFullScreen();

                else if (document.msExitFullscreen)
                    document.msExitFullscreen();

                else if (typeof window.ActiveXObject !== "undefined") { // Older IE.
                    let wscript = new ActiveXObject("WScript.Shell");
                    if (wscript !== null) {
                        wscript.SendKeys("{F11}");
                    }
                }
            } else {
                self.fullscreen = true;

                let requestMethod = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || element.msRequestFullScreen;

                if (requestMethod) { // Native full screen.
                    requestMethod.call(element);

                } else if (typeof window.ActiveXObject !== "undefined") { // Older IE.
                    let wscript = new ActiveXObject("WScript.Shell");
                    if (wscript !== null) {
                        wscript.SendKeys("{F11}");
                    }
                }
            }

            if (this.innerHTML.indexOf("expand") !== -1) {
                $(e.currentTarget).html("<i class='mdi mdi-arrow-collapse'></i>");
                self.object.addClass("maximize");
            } else {
                $(e.currentTarget).html("<i class='mdi mdi-arrow-expand'></i>");
                self.object.removeClass("maximize");
            }

            self.Resize();
        });
    };

    this.Previous = function () {
        if (self.current > 0) {
            self.current--;

            self.RefreshSlide();
        }
    };

    this.Next = function () {
        if (self.current < self.data.length - 1) {
            self.current++;

            self.RefreshSlide();
        }
    };

    this.Dispose = function () {
        if (spinner && spinner.Dispose)
            spinner.Dispose();

        if (self.object) {
            self.object.remove();

            //Dispose children
            for (let i = 0; i < self.children.length; i++) {
                if (self.children[i].Dispose)
                    self.children[i].Dispose();
            }

            //Remove all references
            for (let name in self) {
                self[name] = undefined;
            }
        }
    };

    function Resize(img) {
        let timer = setTimeout(function () {
            let wo = img.width;
            let ho = img.height;

            let wc = self.object.width();
            let hc = self.object.height() - 50;

            if (wc / hc < wo / ho) {
                let w = wc - 40;
                let h = ho * w / wo;

                let l = 20;
                let t = (hc - h) / 2;

                let img = self.slide.find("img");
                img.css({ width: w, height: h, left: l, top: t, visibility: "visible" });
            } else {
                let h = hc - 40;
                let w = wo * h / ho;

                let t = 20;
                let l = (wc - w) / 2;

                let img = self.slide.find("img");
                img.css({ width: w, height: h, left: l, top: t, visibility: "visible" });
            }
        }, 1);
    }
};


//Others

mobiwork.Spinner = function (param) {
    mobiwork.call(this, param);

    this.type = SPINNERTYPE.DOUBLEBOUNCE;

    if (param && param.type)
        this.type = param.type;

    this.class = "spinner-" + this.type;

    this.Refresh = function () {
        this.object.empty();

        switch (this.type) {
            case SPINNERTYPE.DOUBLEBOUNCE:
                let content = '<div class="spinner large">';
                content += '<div class="spinner-wrapper">';
                content += '<div class="rotator">';
                content += '<div class="inner-spin"></div>';
                content += '<div class="inner-spin"></div>';
                content += '</div>';
                content += '</div>';
                content += '</div>';

                this.object.append(content);
                break;
        }

        if (this.parent[0].tagName === "BODY") {
            this.object.css({
                left: window.innerWidth / 2 - 20,
                top: window.innerHeight / 2 - 20
            });
        } else {
            this.object.css({
                left: this.parent.width() / 2 - 20,
                top: this.parent.height() / 2 - 20
            });

        }
    };
};

mobiwork.Account = function (param) {
    let self = this;
    let onok;
    let onerror;
    let numattemp = 0;

    if (param)
        onok = param.onok;

    if (param)
        onerror = param.onerror;

    this.user;
    this.fingerprint;
    this.token;

    this.Show = function (nologin) {
        let user = localStorage.getItem($BUNDLEID);

        if (user)
            user = JSON.parse(user);

        if (!user || !user.token) {
            if (nologin) {
                if (onerror)
                    onerror();
            } else
                self.ShowLogin();
        } else {
            self.user = { _id: user.userid };

            self.Verify(user, function (response) {
                if (response && !response.error) {
                    if (onok)
                        onok();

                } else if (mobiwork.mobile && response.error) {
                    if (onerror)
                        onerror();
                } else {
                    if (nologin) {
                        if (onerror)
                            onerror();
                    } else
                        self.ShowLogin();
                }
            });
        }
    };

    this.ShowLogin = function () {
        let width = 500;
        let height = 890;

        let _nationality_ = [];
        for (let i = 0; i < nationality.length; i++) {
            _nationality_.push({ text: nationality[i] });
        }

        let _country_ = [];
        for (let ii = 0; ii < country.length; ii++) {
            _country_.push({ text: country[ii] });
        }

        if (window.innerWidth < 612)
            height = 540;

        if (width > window.innerWidth)
            width = window.innerWidth - 32;

        let form = new mobiwork.Form({
            autodispose: false,
            showheader: false,
            showfooter: false,
            height: height,
            width: width,
            class: "login-form",
            modalclass: "login-background"
        });

        form.class += " form-login";

        let image = form.Add(new mobiwork.Image({ src: "res/banner.jpg" }));

        let container = form.Add(new mobiwork.Container());

        let email = container.Add(new mobiwork.InputText({ text: "Email", type: "email" }));
        let password = container.Add(new mobiwork.InputText({ type: "password", text: "Password" }));

        let toolbar1 = container.Add(new mobiwork.Toolbar({ class: "login" }));
        let toolbar2 = container.Add(new mobiwork.Toolbar({ class: "login" }));
        let toolbar3 = container.Add(new mobiwork.Toolbar({ class: "login" }));

        let forgot = toolbar2.Add(new mobiwork.Button({
            text: "Forgot Password?",
            onclick: function () {
                self.ResetPassword();
            }
        }));

        forgot.class += " button-forgot";

        let copyright = toolbar3.Add(new mobiwork.Button({
            text: "Copyright © 2022 learnED V 0.1"

        }));
        copyright.class += " button-version";

        let login = toolbar1.Add(new mobiwork.Button({
            text: "Login",
            onclick: function () {
                self.Login(email.value, password.value);
            }
        }));

        login.class += " button-login";



        let register = toolbar1.Add(new mobiwork.Button({
            text: "Register",
            onclick: function () {
                container.Visible(false);
                register.Visible(false);
                regcontainer.Visible(true);

                form.height = 790;
                form.Resize();

                back.Visible(true);
                regbutton.Visible(true);

            }
        }));

        register.class += " button-register";

        // let regcontainer = form.Add(new mobiwork.Container({ visible: false }));
        let regcontainer = form.Add(new mobiwork.ScrollContainer({ visible: false, class: "reg-form-scontainer" }));

        let regname = regcontainer.Add(new mobiwork.InputText({ text: "Name" }));
        let regemail = regcontainer.Add(new mobiwork.InputText({ text: "Email", type: "email" }));
        let regpassword = regcontainer.Add(new mobiwork.InputText({ type: "password", text: "Password" }));
        let regverpassword = regcontainer.Add(new mobiwork.InputText({
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
        let org = regcontainer.Add(new mobiwork.InputText({ text: "Organization" }));
        let pos = regcontainer.Add(new mobiwork.InputText({ text: "Current position" }));
        let ccountry = regcontainer.Add(new mobiwork.InputDataList({
            list: _country_,
            placeholder: "Select country",
            text: "Country"
        }));
        let nnationality = regcontainer.Add(new mobiwork.InputDataList({
            list: _nationality_,
            placeholder: "Select nationality",
            text: "Nationality"
        }));
        let gender = regcontainer.Add(new mobiwork.InputDataList({
            list: [{ text: "Man" }, { text: "Woman" }, { text: "Other" }, { text: "Prefer not to say" }],
            placeholder: "Select gender",
            text: "Gender"
        }));
        let involvement = regcontainer.Add(new mobiwork.InputBoolean({
            text: "Are you currently involved in the development of a concept note for the GCF?",
            class: "involvement"
        }));
        let expectation = regcontainer.Add(new mobiwork.InputTextArea({
            text: "Tell us what do you hope to gain from taking this course."
        }));

        // let regtoolbar = regcontainer.Add(new mobiwork.Toolbar({ class: "register-form" }));
        let regtoolbar = form.Add(new mobiwork.Toolbar({ class: "register-form" }));

        let back = regtoolbar.Add(new mobiwork({
            class: "back-icon register", icon: "mdi-arrow-left", onclick: function () {
                container.Visible(true);
                register.Visible(true);
                regcontainer.Visible(false);

                form.height = height;
                form.Resize();

                back.Visible(false);
                regbutton.Visible(false);
            }
        }));


        let regbutton = regtoolbar.Add(new mobiwork.Button({
            text: "Register",
            class: " register-form",
            visibility: false,
            onclick: function () {
                if (regname.value && regemail.value && regpassword.value && regverpassword.value && org.value && pos.value && ccountry.value && nnationality.value && gender.value) {
                    let name = regname.value.trim();
                    let email = regemail.value.trim();
                    let password = regpassword.value.trim();

                    let forg = org.value;
                    let fpos = pos.value;
                    let fccountry = ccountry.value;
                    let fnnationality = nnationality.value;
                    let fgender = gender.value;
                    let finvolvement = " ";
                    let fexpectation = " ";

                    if (involvement.value)
                        finvolvement = involvement.value;

                    if (expectation.value)
                        fexpectation = expectation.value;

                    if (mobiwork.ValidateEmail(email)) {
                        if (password !== "" && password === regverpassword.value.trim())
                            self.Register(name, email, password, forg, fpos, fccountry, fnnationality, fgender, finvolvement, fexpectation);
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
                }
                else {
                    let message = new mobiwork.MessageBox({
                        text: "Error",
                        message: "Please fill-up all the required information.",
                        icon: "alert-circle-outline"
                    });

                    message.Show();
                }

            }
        }));

        // regbutton.class += " button-register";

        form.Show();

        let info = new mobiwork.Button();
        info.Show(regverpassword);

        back.Visible(false);
        regbutton.Visible(false);
    };

    this.Login = function (email, password) {
        mobiwork.FingerPrint(function (fingerprint) {
            mobiwork.POST($API + "users/Login", JSON.stringify({
                email: email,
                password: password,
                fingerprint: fingerprint

            })).then(function (response) {
                if (response && !response.err) {
                    //Set user
                    self.user = response.user;

                    //Store
                    response.userid = response.user._id;
                    response.user = self.user;

                    delete response.fingerprint;

                    self.userid = self.user._id;
                    self.token = response.token;
                    self.fingerprint = fingerprint;

                    localStorage.setItem($BUNDLEID, JSON.stringify(response));
                    location.reload();
                } else {
                    let error = response.err || "Wrong username or password!";

                    let message = new mobiwork.MessageBox({
                        text: "Error",
                        message: error,
                        icon: "alert-circle-outline"
                    });

                    numattemp++;

                    if (numattemp >= 5) {
                        self.ResetPassword();
                    } else {
                        message.Show();
                    }
                }
            }, function () {
                let message = new mobiwork.MessageBox({
                    text: "Error",
                    message: "Unable to connect to the server. Please try again later.",
                    icon: "alert-circle-outline"
                });

                message.Show();
            });
        });
    }

    this.Register = function (name, email, password, forg, fpos, fccountry, fnnationality, fgender, finvolvement, fexpectation) {
        mobiwork.FingerPrint(function (fingerprint) {
            mobiwork.POST($API + "users/Register", JSON.stringify({
                name: name,
                email: email,
                password: password,
                organization: forg,
                position: fpos,
                country: fccountry.text,
                nationality: fnnationality.text,
                gender: fgender.text,
                involvement: finvolvement,
                expectation: fexpectation,
                fingerprint: fingerprint

            })).then(function (response) {
                if (response && !response.err) {
                    let message = new mobiwork.MessageBox({
                        text: "Successful",
                        message: "You have been registered!, Go back to Login Page",
                        icon: "alert-circle-outline"
                    });
                    message.Show();
                    //Set user
                    self.user = response;

                    //Store
                    response.userid = response._id;
                    response.user = self.user;

                    delete response.fingerprint;

                    self.userid = self.user._id;
                    self.token = response.token;
                    self.fingerprint = fingerprint;

                    localStorage.setItem($BUNDLEID, JSON.stringify(response));
                    location.reload();

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

    this.ResetPassword = function () {
        let form = new mobiwork.Form({
            text: "Reset Password",
            width: 400,
            height: 240,
            onok: function () {
                if (forgotemail.value) {
                    let email = forgotemail.value.trim();

                    if (mobiwork.ValidateEmail(email)) {
                        mobiwork.POST($API + "users/ResetPassword", JSON.stringify({
                            email: email

                        })).then(function (response) {
                            if (response && !response.err) {
                                let message = new mobiwork.MessageBox({
                                    text: "Reset Password",
                                    message: "Please check your email.",
                                    icon: "alert-circle-outline"
                                });

                                message.Show();

                            } else {
                                let error = response.err || "Unable to reset password!";

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
                    }
                }
            }
        });

        let forgotemail = form.Add(new mobiwork.InputText({ text: "Enter a valid email address" }));

        form.Show();
    };

    this.Logout = function () {
        localStorage.removeItem($BUNDLEID);
        location.reload();
    };

    this.Verify = function (user, ret) {
        mobiwork.FingerPrint(function (fingerprint) {
            mobiwork.POST($API + "users/Verify", JSON.stringify({
                userid: user.userid,
                token: user.token,
                fingerprint: fingerprint

            })).then(function (response) {
                if (response) {
                    //Set user
                    self.token = user.token;
                    self.fingerprint = fingerprint;
                    self.user = response;
                    self.userid = self.user._id;

                    ret(true);

                } else
                    ret(false);

            }, function (err) {
                ret({ error: err });
            });
        });
    };

    this.AddCredentials = function (data) {
        data.credentials = {
            userid: self.user._id,
            fingerprint: self.fingerprint,
            token: self.token
        };
    };

    this.GetCredentials = function () {
        return {
            credentials: {
                userid: self.user._id,
                fingerprint: self.fingerprint,
                token: self.token
            }
        };
    };
};

mobiwork.ResetPassword = function (param) {
    let self = this;
    let onok;
    let onerror;
    let form;

    if (param)
        onok = param.onok;

    if (param)
        onerror = param.onerror;

    this.email = param.email;
    this.reset = param.reset;

    this.Show = function () {
        let width = 500;
        let height = 536;

        if (width > window.innerWidth)
            width = window.innerWidth - 32;

        form = new mobiwork.Form({
            autodispose: false,
            showheader: false,
            showfooter: false,
            height: height,
            width: width,
            class: "reset-form",
            modalclass: "login-background"
        });

        form.class += " form-login";

        let image = form.Add(new mobiwork.Image({ src: "res/banner.jpg" }));

        form.Add(new mobiwork.Header({ text: "Reset Password" }));
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

        let regbutton = form.Add(new mobiwork.Button({
            text: "Reset",
            onclick: function () {
                if (regemail.value && regpassword.value && regverpassword.value) {
                    if (self.email === regemail.value) {
                        let email = regemail.value.trim();
                        let password = regpassword.value.trim();

                        if (mobiwork.ValidateEmail(email)) {
                            if (password !== "" && password === regverpassword.value.trim())
                                self.UpdatePassword(self.email, password, self.reset);
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
                            message: "Please don't edit the email address.",
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
        }));

        regbutton.class += " button-register";

        form.Show();

        let info = new mobiwork.Button();
        info.Show(regverpassword);
    };

    this.UpdatePassword = function (email, password, reset) {
        mobiwork.POST($API + "users/UpdatePassword", JSON.stringify({
            email: email,
            password: password,
            reset: reset

        })).then(function (response) {
            if (response && !response.err) {
                form.Dispose();

                let message = new mobiwork.MessageBox({
                    text: "Reset Password",
                    message: "Your password has been reset successfully.",
                    icon: "alert-outline",
                    onok: function () {
                        window.location.href = window.location.href.split("?")[0];
                    },
                    oncancel: function () {
                        window.location.href = window.location.href.split("?")[0];
                    }
                });

                message.Show();

            } else {
                form.Dispose();

                if (onok)
                    onok();

                let error = response.err || "Unable to reset password!";

                let message = new mobiwork.MessageBox({
                    text: "Error",
                    message: error,
                    icon: "alert-circle-outline",
                    onok: function () {
                        window.location.href = window.location.href.split("?")[0];
                    },
                    oncancel: function () {
                        window.location.href = window.location.href.split("?")[0];
                    }
                });

                message.Show();
            }
        }, function () {
            form.Dispose();

            let message = new mobiwork.MessageBox({
                text: "Unable to connect to the server. Please try again later.",
                icon: "alert-circle-outline",
                onok: function () {
                    window.location.href = window.location.href.split("?")[0];
                },
                oncancel: function () {
                    window.location.href = window.location.href.split("?")[0];
                }
            });

            message.Show();
        });
    };
};


mobiwork.AppContainer = function (param) {
    mobiwork.call(this, param, "app-container");

    let self = this;
    this.src = param.src;
    let form;

    mobiwork.externalappevent = function () {
        self.Close();

        if (self.onok)
            self.onok(JSON.parse(window.data));
    };

    if (param) {
        this.onok = param.onok;
        this.oncancel = param.oncancel;

        if (param.modal !== undefined)
            this.modal = param.modal;

        if (param.autodispose !== undefined)
            this.autodispose = param.autodispose;

        if (param.width !== undefined)
            this.width = param.width;

        if (param.height !== undefined)
            this.height = param.height;
    }

    this.Refresh = function () {
        self.background = new mobiwork.ModalBackground({
            parent: self
        });
        self.background.Show();

        self.object.append("<iframe src='" + self.src + "'></iframe>");
        self.Events();
    };

    this.Hide = function () {
        self.background.Dispose();
        self.object.addClass("hidden");
    };

    this.Unhide = function () {
        self.background = new mobiwork.ModalBackground({
            parent: self
        });

        self.background.Show();
        self.object.removeClass("hidden");
    };

    this.Dispose = function () {
        self.Hide();
    };
};


//Supporting functions

mobiwork.Events = function () {
    var list = [];

    this.Subscribe = function (event, func) {
        //Add event if it doesn't exists yet
        if (!list[event])
            list[event] = [];

        //Get existing subscribers
        var subscribers = list[event];

        if (subscribers) {
            var subscribe = true;

            //Check if it is a duplicate subscriber
            for (var i = 0; i < subscribers.length; i++)
                if (subscribers[i] === func) {
                    subscribe = false;
                    break;
                }

            //Add subscriber
            if (subscribe)
                subscribers.push(func);
        }
    };

    this.UnSubscribe = function (func) {
        //Add event if it doesn't exists yet
        if (!list[event])
            list[event] = [];

        //Get existing subscribers
        var subscribers = list[event];

        if (subscribers) {
            for (var i = 0; i < subscribers.length; i++)
                if (subscribers[i] === func) {
                    subscribers.splice(i, 1);
                    break;
                }
        }
    };

    this.Fire = function (event, response) {
        var subscribers = list[event];

        //Call all subscribers
        if (subscribers) {
            for (var i = 0; i < subscribers.length; i++)
                if (subscribers[i])
                    subscribers[i](response);
        }
    };
};

mobiwork.SortAscending = function (data, field) {
    data.sort(function (a, b) {
        let ca, cb;

        if (a[field] && b[field]) {
            if (typeof a[field] === "object") {
                if (a[field].name) {
                    ca = a[field].name;
                    cb = b[field].name;

                } else if (a[field].text) {
                    ca = a[field].text;
                    cb = b[field].text;

                } else if (a[field].value) {
                    ca = a[field].value;
                    cb = b[field].value;

                }

            } else {
                ca = a[field];
                cb = b[field];
            }

            if (ca > cb)
                return 1;
            else if (ca < cb)
                return -1;
            else
                return 0;

        } else if (ca && !cb)
            return -1;
        else if (!ca && cb)
            return 1;
        else
            return 0;
    });
};

mobiwork.SortDescending = function (data, field) {
    data.sort(function (a, b) {
        let ca, cb;

        if (a[field] && b[field]) {
            if (a[field].name) {
                ca = a[field].name;
                cb = b[field].name;

            } else if (a[field].text) {
                ca = a[field].text;
                cb = b[field].text;

            } else if (a[field].value) {
                ca = a[field].value;
                cb = b[field].value;

            } else {
                ca = a[field];
                cb = b[field];
            }

            if (ca > cb)
                return -1;
            else if (ca < cb)
                return 1;
            else
                return 0;

        } else if (ca && !cb)
            return 1;
        else if (!ca && cb)
            return -1;
        else
            return 0;
    });
};

mobiwork.FormatIcon = function (icon) {
    if (icon) {
        if (icon.indexOf("mdi-") !== -1)
            return "<i class='mdi " + icon + "'></i>";

        else if (icon.indexOf("fa-") !== -1)
            return "<i class='fa " + icon + "'></i>";

        else if (icon.indexOf(".jpg") !== -1 || icon.indexOf(".JPG") !== -1 || icon.indexOf(".jpeg") !== -1 || icon.indexOf(".JPEG") !== -1 || icon.indexOf(".png") !== -1 || icon.indexOf(".bmp") !== -1 || icon.indexOf(".svg") !== -1 || icon.indexOf(";base64,") !== -1)
            return "<image src='" + icon + "' alt='" + icon + "'/>";

        else
            return "<i class='mdi mdi-" + icon + "'></i>";
    }

    return "";
};

mobiwork.FormatDate = function (date, format) {
    var months = [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
    ];

    var day = date.getDate();
    var month = date.getMonth();
    var year = date.getFullYear();

    if (format.indexOf("mmmm") !== -1)
        format = format.replace("mmmm", months[month]);

    if (format.indexOf("mmm") !== -1)
        format = format.replace("mmm", months[month].substring(0, 3));

    if (format.indexOf("mm") !== -1) {
        let mo = month + 1;

        if (mo < 9)
            mo = "0" + mo;
        format = format.replace("mm", mo);
    }

    if (format.indexOf(" m") !== -1)
        format = format.replace(" m", " " + months[month].substring(0, 0));

    if (format.indexOf("m ") !== -1)
        format = format.replace("m ", months[month].substring(0, 0) + " ");

    if (format.indexOf("-m") !== -1)
        format = format.replace("-m", "-" + months[month].substring(0, 0));

    if (format.indexOf("m-") !== -1)
        format = format.replace("m-", months[month].substring(0, 0) + "-");

    if (format.indexOf("yyyy") !== -1)
        format = format.replace("yyyy", year);

    if (format.indexOf("yy") !== -1)
        format = format.replace("yy", year.substring(2, 3));

    if (day < 10)
        day = "0" + day;

    if (format.indexOf("dd ") !== -1)
        format = format.replace("dd ", day + " ");

    if (format.indexOf("dd-") !== -1)
        format = format.replace("dd-", day + "-");

    if (format.indexOf(" dd") !== -1)
        format = format.replace(" dd", " " + day);

    if (format.indexOf("-dd") !== -1)
        format = format.replace("-dd", "-" + day);


    if (format.indexOf("d ") !== -1)
        format = format.replace("d ", day + " ");

    if (format.indexOf("d-") !== -1)
        format = format.replace("d-", day + "-");

    if (format.indexOf(" d") !== -1)
        format = format.replace(" d", " " + day);

    if (format.indexOf("-d") !== -1)
        format = format.replace("-d", "-" + day);

    return format;
};

mobiwork.DayDifference = function (first, second) {
    let diff = first - second;
    return Math.ceil(diff / 86400000);
};

mobiwork.FormatDateDifference = function (first, second) {
    let diff = first - second;
    let firstmonth = first.getMonth();
    let secondmonth = second.getMonth();

    let firstweek = first.getWeek();
    let secondweek = second.getWeek();

    let firstday = first.getDate();
    let secondday = second.getDate();
    let date = firstday - secondday;

    let day = diff / 86400000;

    if (day < 7) {
        if (date === 0) {
            return "Today";

        } else if (date === 1) {
            return "Tomorrow";

        } else if (date === -1) {
            return "Yesterday";

        } else if (date > 0) {
            let weekday = days[first.getDay()];
            return "On " + weekday;

        } else if (date > -7) {
            let weekday = days[first.getDay()];
            return "Last " + weekday;

        } else {
            return Math.abs(date) + " days ago";
        }

    } else {
        if (firstweek === secondweek + 1)
            return "Next Week";

        else if (firstweek === secondweek + 2)
            return "In 2 Weeks";

        else if (firstmonth === secondmonth + 1)
            return "Next Month";

        else if (firstmonth > secondmonth)
            return "In " + (firstmonth - secondmonth) + " months";
    }
};

mobiwork.GUID = function () {
    //https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

mobiwork.POST = function (url, data, source) {
    return new Promise(function (resolve, reject) {
        $.support.cors = true;
        $.ajax({
            type: 'POST',
            method: 'POST',
            crossDomain: true,
            contentType: 'application/json; charset=utf-8',
            data: data,
            url: url,
            async: true,
            cache: false,
            success: function (data) {
                resolve(data, source);
            },
            error: function (error) {
                reject(error, source);
            }
        });
    });
};

mobiwork.GET = function (url, source) {
    return new Promise(function (resolve, reject) {
        $.ajax({
            type: 'GET',
            url: url,
            contentType: 'application/json; charset=utf-8',
            async: true,
            cache: false,
            success: function (data) {
                resolve(data, source);
            },
            error: function (data) {
                reject(data, source);
            }
        });
    });
};

mobiwork.GET_0 = function (url) {
    return new Promise(function (resolve, reject) {
        $.get(url, function (data) {
            resolve(data);
        }).fail(function (e) {
            reject(e);
        });
    });
};

mobiwork.UploadFile = function (param) {
    var content = "<form method='post' action='' enctype='multipart/form-data'>";
    content += "<input class='hidden' type='text' name='options' value='" + JSON.stringify(param.options) + "'>";
    content += "</form>";
    content += "</div>";

    var form = $(content);

    $("body").append(form);

    var ajaxData = new FormData(form.get(0));

    $.each(param.files, function (i, file) {
        ajaxData.append(param.name, file);
    });

    $.ajax({
        url: param.url,
        type: "POST",
        data: ajaxData,
        dataType: 'json',
        cache: false,
        contentType: false,
        processData: false,
        xhr: function () {
            var xhr = new window.XMLHttpRequest();

            xhr.upload.addEventListener("progress", function (evt) {
                if (evt.lengthComputable) {
                    var percentComplete = evt.loaded / evt.total;
                    percentComplete = parseInt(percentComplete);

                    if (param.progress)
                        param.progress(percentComplete);

                    if (percentComplete >= 1 && param.onfinish) {
                        param.onfinish();
                    }
                }
            }, false);

            return xhr;
        },
        success: function (data) {
            if (param.onsuccess)
                param.onsuccess(data);

            form.remove();
        },
        error: function (e) {
            // Log the error, show an alert, whatever works for you
            if (param.onerror)
                param.onerror(e);

            form.remove();
        }
    });
};

mobiwork.DownloadFile = function (url, name, progress) {
    return new Promise(function (resolve, reject) {
        var directory = cordova.file.externalDataDirectory;

        window.resolveLocalFileSystemURL(directory, function (fileEntry) {
            var filepath = fileEntry.toURL() + name;

            var fileTransfer = new FileTransfer();

            fileTransfer.onprogress = function (progressEvent) {
                if (progressEvent.lengthComputable) {
                    if (progress) {
                        var ratio = progressEvent.loaded / progressEvent.total;
                        progress(Math.round(ratio * 50) + "%");
                    }
                }
            };

            fileTransfer.download(url, filepath,
                function (fileEntry) {
                    resolve(fileEntry);
                },
                function (error) {
                    reject(error);
                },
                true, {}
            );
        });
    });
};

mobiwork.OpenFile = function (res, format) {
    var content = $("<input class='hidden' type='file' name='options'>");
    $("body").append(content);

    content.click();

    content.bind('change', function (e, data) {
        let files = [];

        $(this.files).each(function (i, file) {
            if (format === FILEFORMAT.TEXT) {
                var reader = new FileReader();
                reader.readAsText(this);

                reader.onload = function (readEvent) {
                    res(readEvent.target.result, file.name);
                }
            } else if (format === FILEFORMAT.ZIP) {
                var zip = new JSZip();
                zip.loadAsync(this)
                    .then(function (zip) {
                        //Success
                        res(zip, file.name);
                    }, function () {
                        //Error
                    });
            } else {
                res(file, content[0].files[0]);
            }
        });

        content.remove();
    });
};

mobiwork.SaveFile = function (data, filename, type) {
    var file = new Blob([data], { type: type });
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);

    else { // Others
        var a = document.createElement("a"),
            url = URL.createObjectURL(file);

        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();

        setTimeout(function () {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}

mobiwork.ReadFile = function (fileEntry) {
    return new Promise(function (resolve, reject) {
        try {
            fileEntry.file(function (file) {
                var reader = new FileReader();

                reader.onloadend = function () {
                    resolve(this.result);
                };

                reader.readAsText(file);
            });

        } catch (error) {
            reject(error);
        }
    });
};

mobiwork.FingerPrint = function (ret) {
    Fingerprint2.get(function (components) {
        var values = components.map(function (component) { return component.value })
        var murmur = Fingerprint2.x64hash128(values.join(''), 31)
        ret(murmur);
    });
};

mobiwork.Measure = function (param) {
    let page = $("body").children(".measure");

    if (page.length === 0) {
        page = $("<div class='measure invisible'></div>");
        $("body").append(page);
    }

    if (param) {
        page.css({
            "font-family": param.font,
            "font-size": param.fontsize,
            "line-height": "100%"
        });
    } else {
        page.css({
            "line-height": "100%"
        });
    }

    this.Dimension = function (text) {
        page.html(text);
        return {
            width: page[0].scrollWidth,
            height: page[0].scrollHeight
        };
    };
};

mobiwork.ValidateEmail = function (email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

mobiwork.GetParameterByName = function (name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');

    let regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);

    if (!results) return null;
    if (!results[2]) return '';

    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
mobiwork.HexToRGB = function (hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b;
    });

    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

var COLORS = {
    GREY: { value: 0x9E9E9E, name: '#9E9E9E' },
    GREY1: { value: 0xFAFAFA, name: '#FAFAFA' },
    GREY2: { value: 0xF5F5F5, name: '#F5F5F5' },
    GREY3: { value: 0xEEEEEE, name: '#EEEEEE' },
    GREY4: { value: 0xE0E0E0, name: '#E0E0E0' },
    GREY5: { value: 0xBDBDBD, name: '#BDBDBD' },
    GREY6: { value: 0x9E9E9E, name: '#9E9E9E' },
    GREY7: { value: 0x757575, name: '#757575' },
    GREY8: { value: 0x616161, name: '#616161' },
    GREY9: { value: 0x424242, name: '#424242' },
    GREY10: { value: 0x212121, name: '#212121' },
    BLUEGREY: { value: 0x607D8B, name: '#607D8B' },
    BLUEGREY1: { value: 0xECEFF1, name: '#ECEFF1' },
    BLUEGREY2: { value: 0xCFD8DC, name: '#CFD8DC' },
    BLUEGREY3: { value: 0xB0BEC5, name: '#B0BEC5' },
    BLUEGREY4: { value: 0x90A4AE, name: '#90A4AE' },
    BLUEGREY5: { value: 0x78909C, name: '#78909C' },
    BLUEGREY6: { value: 0x607D8B, name: '#607D8B' },
    BLUEGREY7: { value: 0x546E7A, name: '#546E7A' },
    BLUEGREY8: { value: 0x455A64, name: '#455A64' },
    BLUEGREY9: { value: 0x37474F, name: '#37474F' },
    BLUEGREY10: { value: 0x263238, name: '#263238' },
    RED: { value: 0xF44336, name: '#F44336' },
    RED1: { value: 0xFFEBEE, name: '#FFEBEE' },
    RED2: { value: 0xFFCDD2, name: '#FFCDD2' },
    RED3: { value: 0xEF9A9A, name: '#EF9A9A' },
    RED4: { value: 0xE57373, name: '#E57373' },
    RED5: { value: 0xEF5350, name: '#EF5350' },
    RED6: { value: 0xF44336, name: '#F44336' },
    RED7: { value: 0xE53935, name: '#E53935' },
    RED8: { value: 0xD32F2F, name: '#D32F2F' },
    RED9: { value: 0xC62828, name: '#C62828' },
    RED10: { value: 0xB71C1C, name: '#B71C1C' },
    PINK: { value: 0xE91E63, name: '#E91E63' },
    PINK1: { value: 0xFCE4EC, name: '#FCE4EC' },
    PINK2: { value: 0xF8BBD0, name: '#F8BBD0' },
    PINK3: { value: 0xF48FB1, name: '#F48FB1' },
    PINK4: { value: 0xF06292, name: '#F06292' },
    PINK5: { value: 0xEC407A, name: '#EC407A' },
    PINK6: { value: 0xE91E63, name: '#E91E63' },
    PINK7: { value: 0xD81B60, name: '#D81B60' },
    PINK8: { value: 0xC2185B, name: '#C2185B' },
    PINK9: { value: 0xAD1457, name: '#AD1457' },
    PINK10: { value: 0x880E4F, name: '#880E4F' },
    PURPLE: { value: 0x9C27B0, name: '#9C27B0' },
    PURPLE1: { value: 0xF3E5F5, name: '#F3E5F5' },
    PURPLE2: { value: 0xE1BEE7, name: '#E1BEE7' },
    PURPLE3: { value: 0xCE93D8, name: '#CE93D8' },
    PURPLE4: { value: 0xBA68C8, name: '#BA68C8' },
    PURPLE5: { value: 0xAB47BC, name: '#AB47BC' },
    PURPLE6: { value: 0x9C27B0, name: '#9C27B0' },
    PURPLE7: { value: 0x8E24AA, name: '#8E24AA' },
    PURPLE8: { value: 0x7B1FA2, name: '#7B1FA2' },
    PURPLE9: { value: 0x6A1B9A, name: '#6A1B9A' },
    PURPLE10: { value: 0x4A148C, name: '#4A148C' },
    DEEPPURPLE: { value: 0x673AB7, name: '#673AB7' },
    DEEPPURPLE1: { value: 0xEDE7F6, name: '#EDE7F6' },
    DEEPPURPLE2: { value: 0xD1C4E9, name: '#D1C4E9' },
    DEEPPURPLE3: { value: 0xB39DDB, name: '#B39DDB' },
    DEEPPURPLE4: { value: 0x9575CD, name: '#9575CD' },
    DEEPPURPLE5: { value: 0x7E57C2, name: '#7E57C2' },
    DEEPPURPLE6: { value: 0x673AB7, name: '#673AB7' },
    DEEPPURPLE7: { value: 0x5E35B1, name: '#5E35B1' },
    DEEPPURPLE8: { value: 0x512DA8, name: '#512DA8' },
    DEEPPURPLE9: { value: 0x4527A0, name: '#4527A0' },
    DEEPPURPLE10: { value: 0x311B92, name: '#311B92' },
    INDIGO: { value: 0x3F51B5, name: '#3F51B5' },
    INDIGO1: { value: 0xE8EAF6, name: '#E8EAF6' },
    INDIGO2: { value: 0xC5CAE9, name: '#C5CAE9' },
    INDIGO3: { value: 0x9FA8DA, name: '#9FA8DA' },
    INDIGO4: { value: 0x7986CB, name: '#7986CB' },
    INDIGO5: { value: 0x5C6BC0, name: '#5C6BC0' },
    INDIGO6: { value: 0x3F51B5, name: '#3F51B5' },
    INDIGO7: { value: 0x3949AB, name: '#3949AB' },
    INDIGO8: { value: 0x303F9F, name: '#303F9F' },
    INDIGO9: { value: 0x283593, name: '#283593' },
    INDIGO10: { value: 0x1A237E, name: '#1A237E' },
    BLUE: { value: 0x2196F3, name: '#2196F3' },
    BLUE1: { value: 0xE3F2FD, name: '#E3F2FD' },
    BLUE2: { value: 0xBBDEFB, name: '#BBDEFB' },
    BLUE3: { value: 0x90CAF9, name: '#90CAF9' },
    BLUE4: { value: 0x64B5F6, name: '#64B5F6' },
    BLUE5: { value: 0x42A5F5, name: '#42A5F5' },
    BLUE6: { value: 0x2196F3, name: '#2196F3' },
    BLUE7: { value: 0x1E88E5, name: '#1E88E5' },
    BLUE8: { value: 0x1976D2, name: '#1976D2' },
    BLUE9: { value: 0x1565C0, name: '#1565C0' },
    BLUE10: { value: 0x0D47A1, name: '#0D47A1' },
    LIGHTBLUE: { value: 0x03A9F4, name: '#03A9F4' },
    LIGHTBLUE1: { value: 0xE1F5FE, name: '#E1F5FE' },
    LIGHTBLUE2: { value: 0xB3E5FC, name: '#B3E5FC' },
    LIGHTBLUE3: { value: 0x81D4FA, name: '#81D4FA' },
    LIGHTBLUE4: { value: 0x4FC3F7, name: '#4FC3F7' },
    LIGHTBLUE5: { value: 0x29B6F6, name: '#29B6F6' },
    LIGHTBLUE6: { value: 0x03A9F4, name: '#03A9F4' },
    LIGHTBLUE7: { value: 0x039BE5, name: '#039BE5' },
    LIGHTBLUE8: { value: 0x0288D1, name: '#0288D1' },
    LIGHTBLUE9: { value: 0x0277BD, name: '#0277BD' },
    LIGHTBLUE10: { value: 0x01579B, name: '#01579B' },
    CYAN: { value: 0x00BCD4, name: '#00BCD4' },
    CYAN1: { value: 0xE0F7FA, name: '#E0F7FA' },
    CYAN2: { value: 0xB2EBF2, name: '#B2EBF2' },
    CYAN3: { value: 0x80DEEA, name: '#80DEEA' },
    CYAN4: { value: 0x4DD0E1, name: '#4DD0E1' },
    CYAN5: { value: 0x26C6DA, name: '#26C6DA' },
    CYAN6: { value: 0x00BCD4, name: '#00BCD4' },
    CYAN7: { value: 0x00ACC1, name: '#00ACC1' },
    CYAN8: { value: 0x0097A7, name: '#0097A7' },
    CYAN9: { value: 0x00838F, name: '#00838F' },
    CYAN10: { value: 0x006064, name: '#006064' },
    TEAL: { value: 0x009688, name: '#009688' },
    TEAL1: { value: 0xE0F2F1, name: '#E0F2F1' },
    TEAL2: { value: 0xB2DFDB, name: '#B2DFDB' },
    TEAL3: { value: 0x80CBC4, name: '#80CBC4' },
    TEAL4: { value: 0x4DB6AC, name: '#4DB6AC' },
    TEAL5: { value: 0x26A69A, name: '#26A69A' },
    TEAL6: { value: 0x009688, name: '#009688' },
    TEAL7: { value: 0x00897B, name: '#00897B' },
    TEAL8: { value: 0x00796B, name: '#00796B' },
    TEAL9: { value: 0x00695C, name: '#00695C' },
    TEAL10: { value: 0x004D40, name: '#004D40' },
    GREEN: { value: 0x4CAF50, name: '#4CAF50' },
    GREEN1: { value: 0xE8F5E9, name: '#E8F5E9' },
    GREEN2: { value: 0xC8E6C9, name: '#C8E6C9' },
    GREEN3: { value: 0xA5D6A7, name: '#A5D6A7' },
    GREEN4: { value: 0x81C784, name: '#81C784' },
    GREEN5: { value: 0x66BB6A, name: '#66BB6A' },
    GREEN6: { value: 0x4CAF50, name: '#4CAF50' },
    GREEN7: { value: 0x43A047, name: '#43A047' },
    GREEN8: { value: 0x388E3C, name: '#388E3C' },
    GREEN9: { value: 0x2E7D32, name: '#2E7D32' },
    GREEN10: { value: 0x1B5E20, name: '#1B5E20' },
    LIGHTGREEN: { value: 0x8BC34A, name: '#8BC34A' },
    LIGHTGREEN1: { value: 0xF1F8E9, name: '#F1F8E9' },
    LIGHTGREEN2: { value: 0xDCEDC8, name: '#DCEDC8' },
    LIGHTGREEN3: { value: 0xC5E1A5, name: '#C5E1A5' },
    LIGHTGREEN4: { value: 0xAED581, name: '#AED581' },
    LIGHTGREEN5: { value: 0x9CCC65, name: '#9CCC65' },
    LIGHTGREEN6: { value: 0x8BC34A, name: '#8BC34A' },
    LIGHTGREEN7: { value: 0x7CB342, name: '#7CB342' },
    LIGHTGREEN8: { value: 0x689F38, name: '#689F38' },
    LIGHTGREEN9: { value: 0x558B2F, name: '#558B2F' },
    LIGHTGREEN10: { value: 0x33691E, name: '#33691E' },
    LIME: { value: 0xCDDC39, name: '#CDDC39' },
    LIME1: { value: 0xF9FBE7, name: '#F9FBE7' },
    LIME2: { value: 0xF0F4C3, name: '#F0F4C3' },
    LIME3: { value: 0xE6EE9C, name: '#E6EE9C' },
    LIME4: { value: 0xDCE775, name: '#DCE775' },
    LIME5: { value: 0xD4E157, name: '#D4E157' },
    LIME6: { value: 0xCDDC39, name: '#CDDC39' },
    LIME7: { value: 0xC0CA33, name: '#C0CA33' },
    LIME8: { value: 0xAFB42B, name: '#AFB42B' },
    LIME9: { value: 0x9E9D24, name: '#9E9D24' },
    LIME10: { value: 0x827717, name: '#827717' },
    YELLOW: { value: 0xFFEB3B, name: '#FFEB3B' },
    YELLOW1: { value: 0xFFFDE7, name: '#FFFDE7' },
    YELLOW2: { value: 0xFFF9C4, name: '#FFF9C4' },
    YELLOW3: { value: 0xFFF59D, name: '#FFF59D' },
    YELLOW4: { value: 0xFFF176, name: '#FFF176' },
    YELLOW5: { value: 0xFFEE58, name: '#FFEE58' },
    YELLOW6: { value: 0xFFEB3B, name: '#FFEB3B' },
    YELLOW7: { value: 0xFDD835, name: '#FDD835' },
    YELLOW8: { value: 0xFBC02D, name: '#FBC02D' },
    YELLOW9: { value: 0xF9A825, name: '#F9A825' },
    YELLOW10: { value: 0xF57F17, name: '#F57F17' },
    AMBER: { value: 0xFFC107, name: '#FFC107' },
    AMBER1: { value: 0xFFF8E1, name: '#FFF8E1' },
    AMBER2: { value: 0xFFECB3, name: '#FFECB3' },
    AMBER3: { value: 0xFFE082, name: '#FFE082' },
    AMBER4: { value: 0xFFD54F, name: '#FFD54F' },
    AMBER5: { value: 0xFFCA28, name: '#FFCA28' },
    AMBER6: { value: 0xFFC107, name: '#FFC107' },
    AMBER7: { value: 0xFFB300, name: '#FFB300' },
    AMBER8: { value: 0xFFA000, name: '#FFA000' },
    AMBER9: { value: 0xFF8F00, name: '#FF8F00' },
    AMBER10: { value: 0xFF6F00, name: '#FF6F00' },
    ORANGE: { value: 0xFF9800, name: '#FF9800' },
    ORANGE1: { value: 0xFFF3E0, name: '#FFF3E0' },
    ORANGE2: { value: 0xFFE0B2, name: '#FFE0B2' },
    ORANGE3: { value: 0xFFCC80, name: '#FFCC80' },
    ORANGE4: { value: 0xFFB74D, name: '#FFB74D' },
    ORANGE5: { value: 0xFFA726, name: '#FFA726' },
    ORANGE6: { value: 0xFF9800, name: '#FF9800' },
    ORANGE7: { value: 0xFB8C00, name: '#FB8C00' },
    ORANGE8: { value: 0xF57C00, name: '#F57C00' },
    ORANGE9: { value: 0xEF6C00, name: '#EF6C00' },
    ORANGE10: { value: 0xE65100, name: '#E65100' },
    DEEPORANGE: { value: 0xFF5722, name: '#FF5722' },
    DEEPORANGE1: { value: 0xFBE9E7, name: '#FBE9E7' },
    DEEPORANGE2: { value: 0xFFCCBC, name: '#FFCCBC' },
    DEEPORANGE3: { value: 0xFFAB91, name: '#FFAB91' },
    DEEPORANGE4: { value: 0xFF8A65, name: '#FF8A65' },
    DEEPORANGE5: { value: 0xFF7043, name: '#FF7043' },
    DEEPORANGE6: { value: 0xFF5722, name: '#FF5722' },
    DEEPORANGE7: { value: 0xF4511E, name: '#F4511E' },
    DEEPORANGE8: { value: 0xE64A19, name: '#E64A19' },
    DEEPORANGE9: { value: 0xD84315, name: '#D84315' },
    DEEPORANGE10: { value: 0xBF360C, name: '#BF360C' },
    BROWN: { value: 0x795548, name: '#795548' },
    BROWN1: { value: 0xEFEBE9, name: '#EFEBE9' },
    BROWN2: { value: 0xD7CCC8, name: '#D7CCC8' },
    BROWN3: { value: 0xBCAAA4, name: '#BCAAA4' },
    BROWN4: { value: 0xA1887F, name: '#A1887F' },
    BROWN5: { value: 0x8D6E63, name: '#8D6E63' },
    BROWN6: { value: 0x795548, name: '#795548' },
    BROWN7: { value: 0x6D4C41, name: '#6D4C41' },
    BROWN8: { value: 0x5D4037, name: '#5D4037' },
    BROWN9: { value: 0x4E342E, name: '#4E342E' },
    BROWN10: { value: 0x3E2723, name: '#3E2723' },
    BLACK: { value: 0x000000, name: '#000000' },
    WHITE: { value: 0xFFFFFF, name: '#FFFFFF' }
};

Date.prototype.Format = function (format) {
    return mobiwork.FormatDate(this, format);
};

Date.prototype.getWeek = function () {
    var d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
    var dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
};

mobiwork.mobile = false;
mobiwork.eventescape = [];

$(document).ready(function () {
    if (typeof MobileDetect !== 'undefined') {

        //Check type of device
        var md = new MobileDetect(window.navigator.userAgent);

        //Check if mobile
        if (md.tablet() !== null || md.phone() !== null || md.mobile() !== null)
            mobiwork.mobile = true;

        //Check OS
        if (md.os)
            mobiwork.os = md.os();

        if (mobiwork.mobile) {
            $("head").append('<link rel="stylesheet" href="css/mobile.css" />');

            //document.addEventListener("deviceready", function () {
            if (mobiwork.Main) {
                mobiwork.Main();
            }
            //}, false);

            document.addEventListener("backbutton", function (e) {
                e.preventDefault();

                if (mobiwork.eventescape.length === 0) {
                    navigator.notification.confirm(
                        'Are you sure you want to exit the app?', // message
                        function (index) {
                            if (index === 1)
                                navigator.app.exitApp();
                        },
                        'Exit Application', // title
                        ['Exit', 'Cancel'] // buttonLabels
                    );
                } else {
                    let view = mobiwork.eventescape.pop();

                    if (view.action)
                        view.action();
                    else
                        view();
                }

            }, false);
        }
    }

    if (!mobiwork.mobile) {
        if (mobiwork.Main) {
            mobiwork.Main();
        }
    }
});

function ExternalAppCallBack() {
    if (mobiwork.externalappevent)
        mobiwork.externalappevent();
}