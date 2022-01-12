/* global mobiwork, _COUNTER_ */

mobiwork.Text = function (param) {
    mobiwork.call(this, param, "app");

    if (param.class) {
        this.class = param.class;
    } else {
        this.class = "text";
    }

    this.text = param.text;

    this.Refresh = function () {
        //Remove first the content
        this.object.empty();

        //Convert Text Format
        let datasplit;
        let contenttext = "<div class='prescontent'>";
        let prevul = 0;
        let prevli = 0;
        let prevabc = 0;
        let prev123 = 0;

        datasplit = this.text.split("[");
        for (let i = 0; i < datasplit.length; i++) {
            if (datasplit[i].includes("H]")) {
                let dataH = datasplit[i].replace("H]", "");
                contenttext += "<div class='prescontenth'>" + dataH + "<br></br></div>";
            } else if (datasplit[i].includes("P]")) {
                let dataP = datasplit[i].replace("P]", "");
                contenttext += "<div class='prescontentp' style='display:inline'>" + dataP + " </div> ";
            } else if (datasplit[i].includes("i]")) {
                let datai = datasplit[i].replace("i]", "");
                contenttext += "<div class='prescontenti'>" + datai + " </div> ";
            } else if (datasplit[i].includes("b]")) {
                let datab = datasplit[i].replace("b]", "");
                contenttext += "<div class='prescontentb'>" + datab + " </div> ";
            } else if (datasplit[i].includes("elink]")) {
                let dataEL = datasplit[i].replace("elink]", "");
                contenttext += "<div class='prescontentel' style='display:none'> " + dataEL + " </div> ";
            } else if (datasplit[i].includes("link]")) {
                let dataL = datasplit[i].replace("link]", "");
                contenttext += "<div class='prescontentl' style='display:inline'><button class='buttonl'> " + dataL + " </button></div> ";
            } else if (datasplit[i].includes("BR]")) {
                let dataBR = datasplit[i].replace("BR]", "");
                contenttext += "<div><br></div> ";
            } else if (datasplit[i].includes("URL]")) {
                let dataLtext;
                let dataURL = datasplit[i].replace("URL]", "");
                if (datasplit[i - 1].includes("Ltext]")) {
                    dataLtext = datasplit[i - 1].replace("Ltext]", "");
                    contenttext += "<div class='prescontenturl' style='display:inline'><a class='btn btn-success' href=' " + dataURL + " ' target='_blank'>" + dataLtext + "</a></div> ";
                } else {
                    contenttext += "<div class='prescontenturl' style='display:inline'><a class='btn btn-success' href=' " + dataURL + " ' target='_blank'>" + "click here." + "</a></div> ";
                }
            } else if (datasplit[i].includes("UL]")) {
                let dataUL = datasplit[i].replace("UL]", "");

                if (prevul === 0) {
                    prevul++;
                    contenttext += "<ul class='prescontentul'><br><li>" + dataUL + " </li> ";
                } else {
                    contenttext += "<li>" + dataUL + " </li> ";
                }

                if (i + 1 !== datasplit.length) {
                    if (!datasplit[i + 1].includes("UL]")) {
                        contenttext += "</ul><br>";
                    }
                } else if (i === datasplit.length - 1) {
                    contenttext += "</ul><br>";
                }

            } else if (datasplit[i].includes("OL]")) {
                let dataOL = datasplit[i].replace("OL]", "");

                if (prevli === 0) {
                    prevli++;
                    contenttext += "<ol class='prescontentol'><br><li>" + dataOL + " </li> ";
                } else {
                    contenttext += "<li>" + dataOL + " </li> ";
                }

                if (i + 1 !== datasplit.length) {
                    if (!datasplit[i + 1].includes("OL]")) {
                        contenttext += "</ol><br>";
                    }
                } else if (i === datasplit.length - 1) {
                    contenttext += "</ol><br>";
                }
            } else if (datasplit[i].includes("ABC]")) {
                let dataABC = datasplit[i].replace("ABC]", "");

                if (prevabc === 0) {
                    prevabc++;
                    contenttext += "<ol class='prescontentabc' type='A'><br><li>" + dataABC + " </li> ";
                } else {
                    contenttext += "<li>" + dataABC + " </li> ";
                }

                if (i + 1 !== datasplit.length) {
                    if (!datasplit[i + 1].includes("ABC]")) {
                        contenttext += "</ol><br>";
                    }
                } else if (i === datasplit.length - 1) {
                    contenttext += "</ol><br>";
                }
            } else if (datasplit[i].includes("123]")) {
                let data123 = datasplit[i].replace("123]", "");

                if (prev123 === 0) {
                    prev123++;
                    contenttext += "<ol class='prescontentabc' type='1'><br><li>" + data123 + " </li> ";
                } else {
                    contenttext += "<li>" + data123 + " </li> ";
                }

                if (i + 1 !== datasplit.length) {
                    if (!datasplit[i + 1].includes("123]")) {
                        contenttext += "</ol><br>";
                    }
                } else if (i === datasplit.length - 1) {
                    contenttext += "</ol><br>";
                }
            }
            else {
                contenttext += "<div class='text'>" + datasplit[0] + "</div>";
            }

        }
        this.text = contenttext;

        //Add to the object
        this.object.append(this.text);
    };
};

mobiwork.ImageSignature = function (param) {
    mobiwork.call(this, param, "signature-image")

    let self = this;

    this.class = "signature";
    this.onclick = param.onclick;
    this.icon = param.icon;
    this.value = param.value;

    this.Refresh = function () {
        //Remove first the content
        this.object.empty();

        //Add to the object
        if (this.value) {
            var banner = "<div class='signature-img'><img src='" + this.value + "'/></div>";
            banner += "<div class='signature-icon-edit'>" + mobiwork.FormatIcon("image-edit") + "Edit Signature</div>";
            banner += "<div class='signature-text'>Signature</div>";
        }


        this.object.append(banner);
        this.Events();
    };

    this.Events = function () {
        this.object.click(function () {
            if (self.onclick)
                self.onclick();
        });
    };
};

mobiwork.DownloadForm = function (param) {
    mobiwork.call(this, param, "download-form")

    let self = this;

    this.src = param.src;
    this.filename = param.filename;
    this.type = param.type;

    this.text = param.text

    this.Refresh = function () {
        this.object.empty();

        var button = "<div><a href=" + this.src + " download =" + this.filename + " >";
        button += "<button type= 'button' class='download-form-button'>" + this.text + "</button> </a></div>";

        this.object.append(button);
    };
};

mobiwork.YoutubeContainer = function (param) {
    mobiwork.call(this, param, "youtube");

    var self = this;
    this.src = param.src;
    this.width = param.width;
    this.height = param.height;

    this.Refresh = function () {
        this.object.empty();
        this.object.append('<iframe width=' + this.width + '" height="' + this.height + '" src="https://www.youtube.com/embed/' + this.src + '" frameborder="0" allowfullscreen></iframe>');
    };
};

mobiwork.PresentationViewerRRCAP = function (param) {
    mobiwork.call(this, param, "presentation");

    let self = this;

    let spinner = new mobiwork.Spinner();

    this.current = 1;
    this.data = param.data;
    this.onchange = param.onchange;

    this.count = param.count;
    this.src = param.src;
    this.filename = param.filename;

    this.datalink;

    this.counter = 0;

    this.logtype = "slide";

    var image;

    if (param.changelog)
        this.changelog = param.changelog;

    if (param.onsubmit)
        this.onsubmit = param.onsubmit;

    if (param.current)
        this.current = param.current;

    if (param.counter) {
        this.counter = param.counter;
        this.current = param.counter + 1;
    }

    this.cont = new mobiwork.Container({ class: "dragdrop-container" });

    // this.counter = param.counter;

    this.Refresh = function () {
        this.object.empty();

        let content = "<div class='presentation-image'></div>";
        // content += "<div class='presentation-content'>" + self.data[self.counter].content + "</div>";

        content += "<div class='expert-tip'>" + "Expert Tip" + "</div>";
        // content += "<div class='previous'><i class='mdi mdi-chevron-left'></i></div>";
        // content += "<div class='next'><i class='mdi mdi-chevron-right'></i></div>";

        content += "<div class='presentation-control'>";
        content += "<div class='presentation-button presentation-control-previous'><i class='mdi mdi-chevron-left'></i></div>";
        // content += "<div class='presentation-control-text'>" + self.current + " of " + self.count + "</div>";
        content += "<div class='presentation-control-text'>" + self.current + " of " + self.count + "</div>";
        content += "<div class='presentation-button presentation-control-next'><i class='mdi mdi-chevron-right'></i></div>";
        content += "</div>";

        this.object.append(content);
        this.slide = this.object.find(".presentation-image");
        this.etbutton = this.object.find(".expert-tip");

        this.Events();
        this.RefreshSlide();
    };

    this.RefreshSlide = function () {
        let content;
        let headertextdata;

        // let ddcont = this.object.find(".dragdrop-container");
        // let ddcont = self.cont;

        // let dragdropcontent = "<div class='dragdop-content'></div>";
        // this.object.append(dragdropcontent);

        this.dragdrop = this.object.find(".dragdop-content");

        if (self.data[self.counter].image) {
            image = self.src + "/" + self.data[self.counter].image;
            content = $("<img src='" + image + "' />");
        }

        let contenttext = "<div class='prescontent'>";
        let prevul = 0;
        let prevli = 0;
        let prevabc = 0;
        let prev123 = 0;

        let countlink = 0;
        // let cont = new mobiwork.Container({ class: "dragdrop-container" });

        if (self.data[self.counter].content) {
            if (self.data[self.counter].experttip)
                self.etbutton.css({ visibility: "visible" });
            else
                self.etbutton.css({ visibility: "hidden" });

            if (self.data[self.counter].type !== "Exercise") {
                // console.log(cont);

                let datasplit = self.data[self.counter].content.split("[");

                for (let i = 0; i < datasplit.length; i++) {
                    if (datasplit[i].includes("H]")) {
                        let dataH = datasplit[i].replace("H]", "");
                        contenttext += "<div class='prescontenth'>" + dataH + "<br></br></div>";
                    } else if (datasplit[i].includes("P]")) {
                        let dataP = datasplit[i].replace("P]", "");
                        contenttext += "<div class='prescontentp' style='display:inline'>" + dataP + " </div> ";
                    } else if (datasplit[i].includes("i]")) {
                        let datai = datasplit[i].replace("i]", "");
                        contenttext += "<div class='prescontenti'>" + datai + " </div> ";
                    } else if (datasplit[i].includes("b]")) {
                        let datab = datasplit[i].replace("b]", "");
                        contenttext += "<div class='prescontentb'>" + datab + " </div> ";
                    } else if (datasplit[i].includes("elink]")) {
                        let dataEL = datasplit[i].replace("elink]", "");
                        contenttext += "<div class='prescontentel' style='display:none'> " + dataEL + " </div> ";
                    } else if (datasplit[i].includes("link]")) {
                        countlink++;
                        let dataL = datasplit[i].replace("link]", "");
                        contenttext += "<div class='prescontentl' style='display:inline'><button class='buttonl' data-index='" + countlink + "'> " + dataL + " </button></div> ";
                    } else if (datasplit[i].includes("BR]")) {
                        let dataBR = datasplit[i].replace("BR]", "");
                        contenttext += "<div><br></div> ";
                    } else if (datasplit[i].includes("URL]")) {
                        let dataLtext;
                        let dataURL = datasplit[i].replace("URL]", "");
                        if (datasplit[i - 1].includes("Ltext]")) {
                            dataLtext = datasplit[i - 1].replace("Ltext]", "");
                            contenttext += "<div class='prescontenturl' style='display:inline'><a class='btn btn-success' href=' " + dataURL + " ' target='_blank'>" + dataLtext + "</a></div> ";
                        } else {
                            contenttext += "<div class='prescontenturl' style='display:inline'><a class='btn btn-success' href=' " + dataURL + " ' target='_blank'>" + "click here." + "</a></div> ";
                        }
                    } else if (datasplit[i].includes("UL]")) {
                        let dataUL = datasplit[i].replace("UL]", "");

                        if (prevul === 0) {
                            prevul++;
                            contenttext += "<ul class='prescontentul'><br><li>" + dataUL + " </li> ";
                        } else {
                            contenttext += "<li>" + dataUL + " </li> ";
                        }

                        if (i + 1 !== datasplit.length) {
                            if (!datasplit[i + 1].includes("UL]")) {
                                contenttext += "</ul><br>";
                            }
                        } else if (i === datasplit.length - 1) {
                            contenttext += "</ul><br>";
                        }

                    } else if (datasplit[i].includes("OL]")) {
                        let dataOL = datasplit[i].replace("OL]", "");

                        if (prevli === 0) {
                            prevli++;
                            contenttext += "<ol class='prescontentol'><br><li>" + dataOL + " </li> ";
                        } else {
                            contenttext += "<li>" + dataOL + " </li> ";
                        }

                        if (i + 1 !== datasplit.length) {
                            if (!datasplit[i + 1].includes("OL]")) {
                                contenttext += "</ol><br>";
                            }
                        } else if (i === datasplit.length - 1) {
                            contenttext += "</ol><br>";
                        }
                    } else if (datasplit[i].includes("ABC]")) {
                        let dataABC = datasplit[i].replace("ABC]", "");

                        if (prevabc === 0) {
                            prevabc++;
                            contenttext += "<ol class='prescontentabc' type='A'><br><li>" + dataABC + " </li> ";
                        } else {
                            contenttext += "<li>" + dataABC + " </li> ";
                        }

                        if (i + 1 !== datasplit.length) {
                            if (!datasplit[i + 1].includes("ABC]")) {
                                contenttext += "</ol><br>";
                            }
                        } else if (i === datasplit.length - 1) {
                            contenttext += "</ol><br>";
                        }
                    } else if (datasplit[i].includes("123]")) {
                        let data123 = datasplit[i].replace("123]", "");

                        if (prev123 === 0) {
                            prev123++;
                            contenttext += "<ol class='prescontentabc' type='1'><br><li>" + data123 + " </li> ";
                        } else {
                            contenttext += "<li>" + data123 + " </li> ";
                        }

                        if (i + 1 !== datasplit.length) {
                            if (!datasplit[i + 1].includes("123]")) {
                                contenttext += "</ol><br>";
                            }
                        } else if (i === datasplit.length - 1) {
                            contenttext += "</ol><br>";
                        }
                    }
                }
            } else if (self.data[self.counter].type === "Exercise") {
                let edatasplit = self.data[self.counter].content.split("[");
                let ddarray = [];
                let aarray = [];
                let counter = 0;
                let dataQ;
                let dataA;
                let listAns = [];
                let store = false;

                for (let i = 0; i < edatasplit.length; i++) {

                    if (edatasplit[i].includes("Q]")) {
                        counter++;
                        dataQ = edatasplit[i].replace("Q]", counter + ". ");
                        dataQ = dataQ.replace(/\r?\n|\r/g, "");
                    } else if (edatasplit[i].includes("ANS]")) {
                        dataA = edatasplit[i].replace("ANS]", "");
                        dataA = dataA.replace(/\r?\n|\r/g, "");

                        listAns.push(dataA);
                        aarray.push(dataA);

                        if (i + 1 !== edatasplit.length) {
                            if (!edatasplit[i + 1].includes("ANS]")) {
                                store = true;
                            }
                        } else if (i + 1 === edatasplit.length) {
                            store = true;
                        }
                    }

                    if (store) {
                        if (dataQ !== undefined && dataA !== undefined) {
                            ddarray.push({ question: dataQ, answer: listAns });

                            // ddarray.push({ question: dataQ, answer: dataA });
                            // aarray.push(dataA);

                            dataQ = undefined;
                            dataA = undefined;

                            listAns = [];
                            store = false
                        }

                    }


                    if (i + 1 === edatasplit.length) {
                        // console.log(self.data[self.counter]);
                        this.cont.Add(new mobiwork.DragDrop({
                            data: ddarray,
                            choices: aarray,
                            presdata: self.data[self.counter],
                            slideindex: self.counter,
                            onsubmit: function () {
                                if (self.onsubmit)
                                    self.onsubmit(self.current);
                            }
                        }));
                    }
                }
                this.cont.Show(this.object);
            }
        } else {
            self.etbutton.css({ visibility: "hidden" });
        }

        if (self.data[self.counter].imageheader) {
            headertextdata = "<div class='headertext-container'>";
            headertextdata += "<div class='headertext'>" + self.data[self.counter].imageheader + "</div> ";
            headertextdata += "</div>";
        }

        if (self.data[self.counter].experttip)
            self.etbutton.css({ visibility: "visible" });
        else
            self.etbutton.css({ visibility: "hidden" });

        contenttext += "</div>";

        self.slide.empty();

        if (self.data[self.counter].type !== "Exercise") {
            self.cont.Clear();
            self.cont.Dispose();

            self.logtype = "slide";

            self.slide.append(headertextdata);
            self.slide.append(contenttext);
            self.slide.append(content);

            this.presimagecont = this.object.find(".prescontent");
            this.prescontentimg = this.object.find(".presentation-image > img");

            if (self.data[self.counter].image !== undefined) {
                self.presimagecont.removeClass("fullview");

                // self.etbutton.css({ visibility: "visible" });
            } else {
                self.presimagecont.addClass(" fullview");
                self.prescontentimg.css({ display: "none" });
            }

            if (self.data[self.counter].content === undefined) {
                self.presimagecont.css({ display: "none" });
                self.prescontentimg.css({ "max-width": "fit-content" });
            }


        } else {
            self.slide.empty();

            self.logtype = "exercise";


            this.nextN = this.object.find(".presentation-control-next");
            this.prevP = this.object.find(".presentation-control-previous");

            self.nextN.css({ visibility: "hidden" });
            self.prevP.css({ visibility: "hidden" });

            self.slide.append(self.dragdrop);
        }

        self.Resize();

        let text = self.object.find(".presentation-control-text");
        this.buttonl_ = self.object.find(".buttonl");
        this.buttonel_ = self.object.find(".prescontentel");
        text.html((self.current) + " of " + self.count);

        this.Events();

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
            //temporary as of 05-02-21
            spinner.Dispose();
        }
    };

    this.Events = function () {
        this.object.unbind();

        let previous = this.object.find(".previous");
        let next = this.object.find(".next");
        let max = this.object.find(".max");
        //expert tip
        let et = this.object.find(".expert-tip");
        //image
        let pimg = this.object.find(".presentation-image > img");



        let _buttonl_ = self.buttonl_;

        var h = window.innerHeight * 0.5;

        $(function () {
            $("#draggable").draggable();
            $("#droppable").droppable({
                drop: function (event, ui) {
                    $(this)
                        .addClass("ui-state-highlight")
                        .find("p")
                        .html("Dropped!");
                }
            });
        });

        self.Click(et, function (e) {
            let showet = new mobiwork.FormRRCAP({
                text: "",
                showfooter: false,
                height: h,
                left: 0
            });
            showet.class = "et-form";
            showet.Add(new mobiwork({ text: self.data[self.current - 1].experttip }));

            showet.Show();
        });

        self.Click(pimg, function (e) {


            let showimg = new mobiwork.ImageViwerRRCAP({
                text: "Preview",
                showfooter: false,
                left: 0
            });
            showimg.class = "img-form";
            showimg.Add(new mobiwork({ text: "<img src=" + image + "/>" }));

            showimg.Show();
        });

        self.Click(_buttonl_, function (e) {
            let showetl = new mobiwork.Form({
                text: "",
                showfooter: false,
                height: h,
                left: 0
            });
            // let cell = $(this);
            let index = $(this).attr("data-index");
            // let index = _buttonl_.index();

            showetl.class = "et-form";
            showetl.Add(new mobiwork({ text: self.buttonel_[index - 1].innerHTML }));

            showetl.Show();
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
        let tttype;

        if (self.current > 1) {
            self.current--;
            self.counter--;

            if (self.data[self.counter].type === "Presentation")
                tttype = "slide";
            else
                tttype = "exercise";

            let pushitems = { userid: $ACCOUNT.user._id, slideid: self.data[self.counter]._id, presentationid: self.data[self.counter].presentationid, complete: 1, type: tttype };
            mobiwork.POST($API + "userslidelog/Insert", JSON.stringify(pushitems)).then(function (response) {
                if (response) {
                    self.RefreshSlide();

                    if (self.changelog)
                        self.changelog(self.current);
                }
            });

        }
    };

    this.Next = function () {
        let tttype;


        if (self.current < self.count) {
            if (self.data[self.current].type !== "Exercise") {
                self.current++;
                self.counter++;

                if (self.data[self.counter].type === "Presentation")
                    tttype = "slide";
                else
                    tttype = "exercise";

                let pushitems = { userid: $ACCOUNT.user._id, slideid: self.data[self.counter]._id, presentationid: self.data[self.counter].presentationid, complete: 1, type: tttype };
                mobiwork.POST($API + "userslidelog/Insert", JSON.stringify(pushitems)).then(function (response) {
                    if (response) {
                        self.RefreshSlide();

                        if (self.changelog)
                            self.changelog(self.current);
                    }
                });
            } else {
                self.RefreshSlide();

                if (self.changelog)
                    self.changelog(self.current + 1);
            }
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
            // let wo = img.width;
            // let ho = img.height;

            // let wc = self.object.width();
            // let hc = self.object.height() - 50;

            // if (wc / hc < wo / ho) {
            //     // let w = wc - 40;
            //     let w = wc / 2;
            //     let h = ho * w / wo;

            //     // let l = 20;
            //     let r = 0;
            //     let t = (hc - h) / 2;

            //     let img = self.slide.find("img");
            //     img.css({ width: w, height: h, right: r, top: t, visibility: "visible", position: "absolute" });
            //     // img.css({ width: w, height: h, left: l, top: t, visibility: "visible" });

            //     let precont = self.slide.find("div");
            //     precont.css({ width: w, height: h, left: 0, top: t, visibility: "visible", position: "absolute", background: "white" });
            // } else {
            //     let h = hc - 40;
            //     let w = wo / 2;
            //     // let w = wo * h / ho;

            //     let t = 20;
            //     let r = 0;
            //     // let l = (wc - w) / 2;

            //     let img = self.slide.find("img");
            //     img.css({ width: w, height: h, right: r, top: t, visibility: "visible", position: "absolute" });
            //     // img.css({ width: w, height: h, left: l, top: t, visibility: "visible" });

            //     let precont = self.slide.find("div");
            //     precont.css({ width: w, height: h, left: 0, top: t, visibility: "visible", position: "absolute", background: "white"});
            // }
        }, 1);
    }
};

mobiwork.FormRRCAP = function (param) {
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
        let datasplit;
        let contenttext = "<div class='prescontent'>";
        let prevul = 0;
        let prevli = 0;
        let prevabc = 0;
        let prev123 = 0;

        for (let i = 0; i < this.children.length; i++) {
            datasplit = this.children[i].text.split("[");
            for (let i = 0; i < datasplit.length; i++) {
                if (datasplit[i].includes("H]")) {
                    let dataH = datasplit[i].replace("H]", "");
                    contenttext += "<div class='prescontenth'>" + dataH + "<br></br></div>";
                } else if (datasplit[i].includes("P]")) {
                    let dataP = datasplit[i].replace("P]", "");
                    contenttext += "<div class='prescontentp' style='display:inline'>" + dataP + " </div> ";
                } else if (datasplit[i].includes("i]")) {
                    let datai = datasplit[i].replace("i]", "");
                    contenttext += "<div class='prescontenti'>" + datai + " </div> ";
                } else if (datasplit[i].includes("b]")) {
                    let datab = datasplit[i].replace("b]", "");
                    contenttext += "<div class='prescontentb'>" + datab + " </div> ";
                } else if (datasplit[i].includes("elink]")) {
                    let dataEL = datasplit[i].replace("elink]", "");
                    contenttext += "<div class='prescontentel' style='display:none'> " + dataEL + " </div> ";
                } else if (datasplit[i].includes("link]")) {
                    let dataL = datasplit[i].replace("link]", "");
                    contenttext += "<div class='prescontentl' style='display:inline'><button class='buttonl'> " + dataL + " </button></div> ";
                } else if (datasplit[i].includes("BR]")) {
                    let dataBR = datasplit[i].replace("BR]", "");
                    contenttext += "<div><br></div> ";
                } else if (datasplit[i].includes("URL]")) {
                    let dataLtext;
                    let dataURL = datasplit[i].replace("URL]", "");
                    if (datasplit[i - 1].includes("Ltext]")) {
                        dataLtext = datasplit[i - 1].replace("Ltext]", "");
                        contenttext += "<div class='prescontenturl' style='display:inline'><a class='btn btn-success' href=' " + dataURL + " ' target='_blank'>" + dataLtext + "</a></div> ";
                    } else {
                        contenttext += "<div class='prescontenturl' style='display:inline'><a class='btn btn-success' href=' " + dataURL + " ' target='_blank'>" + "click here." + "</a></div> ";
                    }
                } else if (datasplit[i].includes("UL]")) {
                    let dataUL = datasplit[i].replace("UL]", "");

                    if (prevul === 0) {
                        prevul++;
                        contenttext += "<ul class='prescontentul'><br><li>" + dataUL + " </li> ";
                    } else {
                        contenttext += "<li>" + dataUL + " </li> ";
                    }

                    if (i + 1 !== datasplit.length) {
                        if (!datasplit[i + 1].includes("UL]")) {
                            contenttext += "</ul><br>";
                        }
                    } else if (i === datasplit.length - 1) {
                        contenttext += "</ul><br>";
                    }

                } else if (datasplit[i].includes("OL]")) {
                    let dataOL = datasplit[i].replace("OL]", "");

                    if (prevli === 0) {
                        prevli++;
                        contenttext += "<ol class='prescontentol'><br><li>" + dataOL + " </li> ";
                    } else {
                        contenttext += "<li>" + dataOL + " </li> ";
                    }

                    if (i + 1 !== datasplit.length) {
                        if (!datasplit[i + 1].includes("OL]")) {
                            contenttext += "</ol><br>";
                        }
                    } else if (i === datasplit.length - 1) {
                        contenttext += "</ol><br>";
                    }
                } else if (datasplit[i].includes("ABC]")) {
                    let dataABC = datasplit[i].replace("ABC]", "");

                    if (prevabc === 0) {
                        prevabc++;
                        contenttext += "<ol class='prescontentabc' type='A'><br><li>" + dataABC + " </li> ";
                    } else {
                        contenttext += "<li>" + dataABC + " </li> ";
                    }

                    if (i + 1 !== datasplit.length) {
                        if (!datasplit[i + 1].includes("ABC]")) {
                            contenttext += "</ol><br>";
                        }
                    } else if (i === datasplit.length - 1) {
                        contenttext += "</ol><br>";
                    }
                } else if (datasplit[i].includes("123]")) {
                    let data123 = datasplit[i].replace("123]", "");

                    if (prev123 === 0) {
                        prev123++;
                        contenttext += "<ol class='prescontentabc' type='1'><br><li>" + data123 + " </li> ";
                    } else {
                        contenttext += "<li>" + data123 + " </li> ";
                    }

                    if (i + 1 !== datasplit.length) {
                        if (!datasplit[i + 1].includes("123]")) {
                            contenttext += "</ol><br>";
                        }
                    } else if (i === datasplit.length - 1) {
                        contenttext += "</ol><br>";
                    }
                } else {
                    contenttext += "<div class='text'>" + datasplit[0] + "</div>";
                }
            }
            this.children[i].text = contenttext;
            this.children[i].Show(body);
        }

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

mobiwork.Editor = function (param) {
    param = param || {};
    param.element = "textarea";
    mobiwork.call(this, param, "gre");

    this.value = param.value || "";

    var self = this;

    this.Refresh = function () {
        this.object.empty();
        this.object.append(this.value);
        this.Events();
    };

    this.Events = function () {
        $(function () {
            $('.gre').gre();
        });
    };

    this.GetValue = function () {
        let input = this.object[0].nextElementSibling.contentDocument.all[0].innerText;

        return input;
    };
};

mobiwork.TextPresentationDetails = function (param) {
    mobiwork.call(this, param, "details");

    var self = this;

    this.icon = param.icon;
    this.title = param.title;
    this.description = param.description;
    this.authorname = param.authorname;
    this.authortitle = param.authortitle;
    this.noofpresentation = param.noofpresentation;
    this.isvideo = param.isvideo;

    this.data = param.data;

    this.Refresh = function () {
        this.object.empty();

        var content = "";
        content += "<div class='textpresdetail-container'>";

        if (this.icon)
            content += FormatImage(this.icon);

        if (this.title)
            content += "<div class='detail-title'>" + this.title + "</div>";

        if (this.authorname)
            content += "<div class='detail-authorname'>" + this.authorname + "</div>";

        if (this.isvideo)
            content += "<div class='detail-play'>" + FormatImage("play-circle") + "</div>";

        if (this.data)
            content += "<div class='data-detail'>" + this.data + "</div>";

        content += "</div>";

        if (this.description) {
            content += "<div class='detail-container'>";
            content += "<div class='detail-description'>" + this.description + "</div>";
            content += "</div>";
        }

        this.object.append(content);

        this.Events();
    };

    this.Events = function () {
        this.object.click(function () {
            if (self.onclick)
                self.onclick(self);
        });
    };
};

mobiwork.DragDrop = function (param) {
    mobiwork.call(this, param, "drag-drop")

    this.dragtext = param.dragtext;
    this.droptext = param.droptext;
    this.text = param.text;
    this.answer = param.ans;

    this.data = param.data;
    this.onsubmit = param.onsubmit;

    shuffle(param.choices);
    // console.log(param.choices);
    this.choices = param.choices;

    // if (param.choices)
    //     this.choices = param.choices;

    var self = this;
    let content = "";

    this.Refresh = function () {
        this.object.empty();
        let h;

        content = "<div class='exercise'>";
        content += "<div class='choices'>";
        for (let i = 0; i < self.choices.length; i++) {
            content += "<div class='draggable ui-widget-content'><p>" + self.choices[i] + "</p></div>";
        }
        content += "</div>";

        content += "<div class='questions'>";
        for (let i = 0; i < self.data.length; i++) {
            h = self.data[i].answer.length * 4;
            content += "<div class='dragdrop-text'>" + self.data[i].question + "</div>";
            content += "<div class='droppable ui-widget-header' style='height:" + h + "rem;''><p>Drop your answers here!</p><div class='hide_item' style='display:none'></div></div>";
            content += "<div class='list-of-answer' style='visibility:hidden'>Answer: " + self.data[i].answer.toString() + "</div>";
        }

        content += "</div>";

        content += "<div class='exe-submit-button'><input type='submit'/></div>";

        content += "</div>";

        this.object.append(content);

        this.choices_ = this.object.find(".choices");

        this.droppable_ = this.object.find(".ui-widget-header");

        for (let i = 0; i < self.data.length; i++) {
            let arrans = [];
            let hidethisitem;
            for (let ii = 0; ii < self.data[i].answer.length; ii++) {
                arrans.push(self.data[i].answer[ii]);
            }
            self.droppable_[i].childNodes[1].innerText = arrans;
        }

        this.Events();
    };

    this.Events = function () {
        let ans_ = this.object.find(".answer");

        let submitbutton = this.object.find(".exe-submit-button");

        // console.log(self.tempsitems);

        let draggable_ = this.object.find(".ui-widget-content"); // draggable text
        draggable_.draggable();

        self.droppable_.droppable({
            drop: function (event, ui) {

                let anstext = event.target.childNodes[1].innerText;

                if (anstext.includes(ui.draggable[0].innerText)) {
                    $(this)
                        .find("p")
                        .html("You got it right!");

                    ui.draggable.draggable('disable');

                    if (ui.helper[0].className.includes("ui_wrong"))
                        ui.helper.removeClass("ui_wrong");

                    ui.helper.addClass(" ui_correct");
                } else {
                    $(this)
                        .find("p")
                        .html("Please try again!");

                    ui.helper.addClass(" ui_wrong");
                }
            }
        });

        //Submit
        self.Click(submitbutton, function () {
            self.Submit();
        });
    };

    this.Submit = function () {
        let stype_;
        let showitems = this.object.find(".hide_item");
        let listofanswer = this.object.find(".list-of-answer");
        let hidedroppable = this.object.find(".droppable p");

        for (let i = 0; i < showitems.length; i++) {
            showitems[i].style = "display: block;";
            listofanswer[i].style = "display: block;";
            hidedroppable[i].style = "display: none;";
        }

        if (param.presdata.type === "Presentation")
            stype_ = "slide";
        else
            stype_ = "exercise";

        let pushitems_ = { userid: $ACCOUNT.user._id, slideid: param.presdata._id, presentationid: param.presdata.presentationid, complete: 1, type: stype_ };

        mobiwork.POST($API + "userslidelog/Insert", JSON.stringify(pushitems_)).then(function (response) {
            if (response) {
                // let studpres = new studentpresentationview({ _id: param.presdata.presentationid, slideindex: param.slideindex, clog: true });
                // // // studpres.Show();
                // studpres.Show($VIEW);
                // studpres.GetPresentationIDLog(param.presdata.presentationid);

                if (self.onsubmit)
                    self.onsubmit();
            }
        });
    };
};

mobiwork.QuizContainer = function (param) {
    mobiwork.call(this, param);

    var self = this;
    let userid = param.userid;
    let presentationid = param.presentationid;
    let slideno = param.slideno;
    let insertonly = param.insertonly;

    this.class = "quiz-container";
    this.oncomplete = param.oncomplete;
    this.allowback = true;
    this.number = 0;
    this.time = 0;

    if (param.number)
        this.number = param.number;

    if (param.time)
        this.time = param.time;

    if (param.allowback !== undefined)
        this.allowback = param.allowback;

    this.Refresh = function () {
        this.object.empty();

        var content = "";
        var counter = this.number;

        this.children.forEach(function (child) {
            counter++;
            child.number = counter;
            child.Show(this.object);
        }, this);
    };

    this.GetScore = function () {
        let score = 0;

        for (let i = 0; i < self.children.length; i++) {
            score += self.children[i].value;
        }

        return score;
    };

    this.Save = function (i, time, success, slideno, attempt) {
        let filter = {};
        let output = true;
        let counter = 0;

        if (!self.allowback && !self.children[i].answered) {
            if (!self.allowback) {
                let message = "";

                if (self.children.length === 1)
                    message = "Please answer the question before you can view the next one.";
                else
                    message = "One of the questions is not answered. Please answer the questions before you can view the next one.";

                let form = new mobiwork.MessageBox({
                    type: MESSAGETYPE.ERROR,
                    text: "AIT RRCAP",
                    message: message
                });

                form.Show();

                output = false;
            } else {
                return true;
            }
        }

        // let model = new userquizmodel();

        // if (slideno) {
        //     model.SaveSlideQuiz(
        //         userid,
        //         presentationid,
        //         self.children[i].quizid,
        //         self.children[i].useranswer,
        //         time - self.time,
        //         slideno,
        //         attempt
        //     ).then(function () {
        //         counter++;

        //         if (counter === self.children.length) {
        //             if (success)
        //                 success();
        //         }
        //     });

        //     self.time = time;

        // } else {
        //     model.Save(
        //         userid,
        //         presentationid,
        //         self.children[i].quizid,
        //         self.children[i].useranswer,
        //         self.time - time,
        //         time,
        //         insertonly
        //     ).then(function () {
        //         counter++;

        //         if (counter === self.children.length) {
        //             if (success)
        //                 success();
        //         }
        //     });

        //     self.time = time;
        // }

        return output;
    };

};

mobiwork.Quiz = function (param) {
    mobiwork.call(this, param);

    var self = this;

    this.class = "quiz";
    this.number = 0;
    this.value = 0;
    this.useranswer;

    if (param) {
        this.type = param.type;
        this.question = param.question;
        this.answer = param.answer;
        this.correct = param.correct;
        this.wrong = param.wrong;
        this.quizid = param.quizid;
        this.showanswer = param.showanswer;
    }

    this.Correct = function () {
        if (self.showanswer)
            self.object.append("<div class='quiz-check'><i class='correct mdi mdi-check-circle'></i></div>");

        if (self.correct)
            self.correct.Show(self.object);
    };

    this.Wrong = function () {
        if (self.showanswer)
            self.object.append("<div class='quiz-check'><i class='wrong mdi mdi-close-circle'></i></div>");

        if (self.wrong)
            self.wrong.Show(self.object);
    };
};

mobiwork.QuizMultipleChoice = function (param) {
    mobiwork.Quiz.call(this, param, "multiple-choice");

    var self = this;
    this.number = 0;
    this.answered = false;
    this.choices = param.choices;
    this.useranswer = -1;
    this.result = 0;

    if (param.value !== undefined)
        this.value = parseInt(param.value);

    if (param.useranswer)
        this.useranswer = parseInt(param.useranswer);

    this.Refresh = function () {
        this.object.empty();

        var content = "";

        //Question
        content += "<div class='quiz-question'>" + this.number + ". " + this.question + "</div>";

        //Choices
        for (var i = 0; i < this.choices.length; i++) {
            if (this.choices[i] === null)
                content += "<div style='visibility:hidden' class='quiz-choice quiz-choice-" + this.number + "-" + i + "'>";
            else
                content += "<div class='quiz-choice quiz-choice-" + this.number + "-" + i + "'>";

            if (this.useranswer === i)
                content += "<input type='radio' id='radio-" + this.number + "-" + i + "' name='radio-" + this.number + "' value='" + i + "' checked/>";
            // content += "<input type='radio' id='radio-" + _COUNTER_ + "-" + i + "' name='radio-" + _COUNTER_ + "' value='" + i + "' checked/>";
            else
                content += "<input type='radio' id='radio-" + this.number + "-" + i + "' name='radio-" + this.number + "' value='" + i + "'/>";
            // content += "<input type='radio' id='radio-" + _COUNTER_ + "-" + i + "' name='radio-" + _COUNTER_ + "' value='" + i + "'/>";

            content += "<label for='radio-" + this.number + "-" + i + "'>" + this.choices[i] + "</label></div>";
            content += "</div>";
        }

        this.object.append(content);

        this.Events();
    };

    this.Events = function () {
        if (self.onclick) {
            let choice = self.object.find("input:radio");

            choice.change(
                function () {
                    var answer = $(this).attr("value");
                    self.useranswer = answer;
                    if (self.answer === self.useranswer) {
                        self.result = 1;
                    } else {
                        self.result = 0;
                    }

                    if (self.onclick)
                        self.onclick(self);
                });
        }
    };

};

mobiwork.ProgressBarRRCAP = function (param) {
    mobiwork.call(this, param);

    let self = this;

    this.class = "progress-bar-rrcap";
    this.percentage = param.percentage;

    this.Refresh = function () {
        this.object.empty();

        let content = "<div class='text'>" + Math.round(this.percentage) + "% Completed</div>";
        content += "<div class='progress-container'><div class='progress' style='width: " + this.percentage + "%'></div></div>";

        this.object.append(content);
    };
};

// mobiwork.Comments = function (param) {
//     mobiwork.call(this, param);


//     var self = this;

//     this.Refresh = function () {
//         this.object.empty();

//         this.items = param.items;

//         var content = "";

//         if (!self.userimage)
//             self.userimage = "user-circle";

//         content += "<div class='comment-item-container'>";

//         for (var i = 0; i < this.items.length; i++) {
//             content += "<div class='comment-item'>";

//             if (this.items[i].type === "topic") {
//                 content += "<div class='topic'>";

//                 if (this.items[i].dateentered)
//                     content += "<div class='list-info list-date'>" + FormatDate(this.items[i].dateentered) + "</div>";

//                 if (!this.items[i].userimage)
//                     this.items[i].userimage = "user-circle";

//                 if (this.items[i].userimage && (this.items[i].userimage.indexOf(".png") !== -1 || this.items[i].userimage.indexOf(".jpg") !== -1)) {
//                     if (this.items[i].userimage.indexOf("http") !== -1)
//                         content += "<div class='comment-image'><img src='" + this.items[i].userimage + "' /></div>";
//                     else
//                         content += "<div class='comment-image'><img src='" + self.imagepath + this.items[i].userimage + "' /></div>";
//                 } else
//                     content += "<div class='comment-image'><i class='fa fa-" + this.items[i].userimage + "'></i></div>";

//                 content += "<div class='comment-name'>" + this.items[i].username + "</div>";
//                 content += "<div class='comment-text'>" + this.items[i].text + "</div>";
//                 content += "</div>"; // class: topic
//             }


//             // if (this.items[i].dateentered)
//             //     content += "<div class='list-info list-date'>" + FormatDate(this.items[i].dateentered) + "</div>";

//             // if (!this.items[i].userimage)
//             //     this.items[i].userimage = "user-circle";

//             // if (this.items[i].userimage && (this.items[i].userimage.indexOf(".png") !== -1 || this.items[i].userimage.indexOf(".jpg") !== -1)) {
//             //     if (this.items[i].userimage.indexOf("http") !== -1)
//             //         content += "<div class='comment-image'><img src='" + this.items[i].userimage + "' /></div>";
//             //     else
//             //         content += "<div class='comment-image'><img src='" + self.imagepath + this.items[i].userimage + "' /></div>";
//             // } else
//             //     content += "<div class='comment-image'><i class='fa fa-" + this.items[i].userimage + "'></i></div>";

//             // content += "<div class='comment-name'>" + this.items[i].username + "</div>";
//             // content += "<div class='comment-text'>" + this.items[i].message + "</div>";
//             // content += "</div>";
//         }

//         content += "</div>";

//         content += "<div class='comment-input-container'>";

//         //Input
//         content += "<div class='comment-item'>";

//         if (self.userimage && (self.userimage.indexOf(".png") !== -1 || self.userimage.indexOf(".jpg") !== -1)) {
//             if (self.userimage.indexOf("http") !== -1)
//                 content += "<div class='comment-image'><img src='" + self.userimage + "' /></div>";
//             else
//                 content += "<div class='comment-image'><img src='" + self.imagepath + self.userimage + "' /></div>";

//         } else
//             content += "<div class='comment-image'><i class='fa fa-" + self.userimage + "'></i></div>";

//         content += "<div class='comment-input'><input type='text'/></div>";
//         content += "</div>";
//         content += "</div>";

//         this.object.append(content);

//         var data = { sourceid: self.sourceid };

//         if (onload) {
//             POST(self.controller + "/Filter", JSON.stringify(data), function (response) {
//                 self.items = response;

//                 if (self.onupdate)
//                     self.onupdate(self.items);

//                 onload = false;
//                 self.Refresh();
//             });
//         }

//         this.Events();
//     };

//     this.Events = function () {
//         var input = this.object.find("input");

//         input.keypress(function (e) {
//             if (e.which === 13) {
//                 var message = this.value;

//                 self.Add({ userimage: self.userimage, username: self.username, message: message, dateentered: new Date().toUTCString() });
//                 self.Refresh();

//                 var data = { sourceobject: self.sourceobject, sourceid: self.sourceid, userid: self.userid, username: self.username, userimage: self.userimage, message: message };

//                 POST(self.controller + "/Insert", JSON.stringify(data), function (response) {
//                     if (self.onupdate)
//                         self.onupdate(self.items);

//                     input.focus();
//                 });
//             }
//         });
//     };
// };

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

function SummaryLogs(logdata) {
    // SLIDES LOG -----------------------------------

    let slidepecent = { presentationid: logdata.presentationid };
    let totalslidepercent;

    mobiwork.POST($API + "userslidelog/SummaryLog", JSON.stringify(slidepecent)).then(function (response) {
        if (response) {
            return response;
        }
    });
    // ---------------------------------------------

}

function FormatDate(date) {
    // date = new Date.parse(date);
    date = new Date(Date.parse(date));

    var diff = Math.abs(new Date() - date) / 60000;

    if (diff < 1)
        return "Just Now";

    else if (diff <= 30) {
        return Math.ceil(diff) + " minutes ago";

    } else {
        diff /= 60;

        if (diff <= 1)
            return "An hour ago";

        else if (diff < 24)
            return Math.ceil(diff) + " hours ago";

        else {
            diff /= 24;

            if (diff <= 2)
                return "Yesterday";

            else if (diff < 7)
                return Math.ceil(diff) + " days ago";

            else {
                var monthNames = [
                    "January", "February", "March",
                    "April", "May", "June", "July",
                    "August", "September", "October",
                    "November", "December"
                ];

                var day = date.getDate();
                var monthIndex = date.getMonth();
                var year = date.getFullYear();

                return day + ' ' + monthNames[monthIndex] + ' ' + year;
            }
        }
    }
}

// function UserActivityLog(data) {
//     // console.log(data);

//     // mobiwork.POST($API + "userslidelog/Get", JSON.stringify(data)).then(function (response) {
//     //     if (response.length !== 0) {

//     //     } else {
//     //         mobiwork.POST($API + "userslidelog/Insert", JSON.stringify(data)).then(function (response) {
//     //             if (response) {


//     //             }
//     //         });
//     //     }
//     // });

//     if (data.length === 2) {
//         for (let i = 0; i < data.length; i++) {
//             mobiwork.POST($API + "userslidelog/Get", JSON.stringify(data[i])).then(function (response) {
//                 if (response) {
//                     if (response.length !== 0) {

//                     } else {
//                         mobiwork.POST($API + "userslidelog/Insert", JSON.stringify(data[i])).then(function (response) {
//                             if (response) {

//                             }
//                         });
//                     }
//                 }
//             });
//         }
//     } else {
//         mobiwork.POST($API + "userslidelog/Get", JSON.stringify(data)).then(function (response) {
//             if (response) {
//                 if (response.length !== 0) {
//                     // slidesitems.Refresh();
//                 } else {
//                     mobiwork.POST($API + "userslidelog/Insert", JSON.stringify(data)).then(function (response) {
//                         if (response) {
//                             // slidesitems.Refresh();
//                         }
//                     });
//                 }
//             }
//         });
//     }
// };