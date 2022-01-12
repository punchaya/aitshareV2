mobiwork.Report = function (param) {
    mobiwork.call(this, param);

    this.class = "report dock";
    this.page;
    this.width;
    this.currenty = 0;
    this.height = 9 * 96;

    this.pages = [];

    this.toc = []; //Table of Contents
    this.lot = []; //List of Tables

    let sectionnum = 0;
    let headernum = 0;
    let subheadernum = 0;
    let pagenumber = 0;
    let spaceheight;

    if (param.header)
        this.header = param.header;

    if (param.footer)
        this.footer = param.footer;

    if (param.showpagenumber)
        this.showpagenumber = param.showpagenumber;

    if (param.showdate)
        this.showdate = param.showdate;

    if (param.showcoverpage)
        this.showcoverpage = param.showcoverpage;

    this.Refresh = function () {
        this.object.empty();
        if (this.showcoverpage)
            this.TitlePage();
        else
            this.NewPage();
    };

    this.TitlePage = function () {
        // pagenumber++;
        this.currenty = 0;

        this.page = $("<div class='page'><div class='page-inner'></div></div>");
        this.object.append(this.page);
        this.pages.push(this.page);

        //Body
        this.measure = this.page.find(".page-inner");

        //Header
        // if (this.header)
        //     this.page.append("<div class='page-header'>" + this.header + "</div>");

        // if (this.showdate) {
        //     let date = new Date();
        //     this.page.append("<div class='page-date'>" + FormatDate_2(date) + "</div>");
        // }

        //Footer
        // if (this.footer)
        //     this.page.append("<div class='page-footer'>" + this.footer + "</div>");

        //Page Number
        // if (this.showpagenumber)
        //     this.page.append("<div class='page-number'>" + pagenumber + "</div>");
    };

    this.NewPage = function () {
        pagenumber++;
        this.currenty = 0;

        this.page = $("<div class='page'><div class='page-inner'></div></div>");
        this.object.append(this.page);
        this.pages.push(this.page);

        //Body
        this.measure = this.page.find(".page-inner");

        //if (pagenumber !== 1) {
        //Header
        if (this.header)
            this.page.append("<div class='page-header'>" + this.header + "</div>");

        if (this.showdate) {
            let date = new Date();
            this.page.append("<div class='page-date'>" + FormatDate_2(date) + "</div>");

        }

        //Footer
        if (this.footer)
            this.page.append("<div class='page-footer'>" + this.footer + "</div>");

        //Page Number
        if (this.showpagenumber)
            this.page.append("<div class='page-number'>" + pagenumber + "</div>");
        //}
    };

    this.GenerateContentPage = function () {
        let columns = [" ", "<div class='toc-title'>Table of Contents</div>", "<div class='toc-page'>Page</div>"];
        let data = [];
        let level;
        let content;
        let page;

        for (let i = 0; i < this.toc.length; i++) {
            if (this.toc[i].section) {
                level = "<div class='toc-section'>" + this.toc[i].level + "</div>";
                content = "<div class='toc-section'>" + this.toc[i].section + "</div>";
                page = "<div class='toc-section toc-pagenumber'>" + this.toc[i].page + "</div>";

                data.push([level, content, page]);

                if (this.toc[i].headers) {
                    for (let j = 0; j < this.toc[i].headers.length; j++) {

                        level = "<div class='toc-header'>" + this.toc[i].headers[j].level + "</div>";
                        content = "<div class='toc-header'>" + this.toc[i].headers[j].header + "</div>";
                        page = "<div class='toc-pagenumber'>" + this.toc[i].headers[j].page + "</div>";


                        data.push([level, content, page]);

                        if (this.toc[i].headers[j].subheaders) {
                            for (let k = 0; k < this.toc[i].headers[j].subheaders.length; k++) {
                                level = "<div class='toc-subheader'>" + this.toc[i].headers[j].subheaders[k].level + "</div>";
                                content = "<div class='toc-subheader'>" + this.toc[i].headers[j].subheaders[k].subheader + "</div>";
                                page = "<div class='toc-pagenumber'>" + this.toc[i].headers[j].subheaders[k].page + "</div>";

                                data.push([level, content, page]);
                            }
                        }
                    }
                }
            }
        }

        this.AddTable(columns, data);
    };

    //Text
    this.Add = function (text, nomeasure) {
        let y = 0;

        if (text === "<div>&nbsp;</div>") {
            if (!spaceheight) {
                this.measure.html(text);
                spaceheight = this.measure[0].scrollHeight;
            }

            y = spaceheight;

        } else if (!nomeasure) {
            this.measure.html(text);
            y = this.measure[0].scrollHeight;
        }

        if (this.currenty + y >= this.height) {
            this.NewPage();
        }

        //Fits the page
        this.page.append(text);
        this.currenty += y;
    };

    this.AddImage = function (text, height) {
        let y = height;

        if (this.currenty + y >= this.height) {
            this.NewPage();
        }

        //Fits the page
        this.page.append("<div class='image-container'>" + text + "</div>");
        this.currenty += y;
    };

    //Section
    this.AddSection = function (text) {
        sectionnum++;
        headernum = 0;
        subheadernum = 0;

        let string = sectionnum.toString() + ". " + text;

        let section = "<h2 style='text-decoration: underline'>" + string + "</h2>";

        this.measure.html(section);
        let y = this.measure[0].scrollHeight;

        if (this.currenty + y >= this.height) {
            this.NewPage();
        }

        //Fits the page
        this.page.append(section);
        this.currenty += y;

        this.toc.push({
            level: sectionnum.toString() + ". ",
            section: text,
            page: pagenumber,
            headers: []
        });
    };

    //Header
    this.AddHeader = function (text) {
        headernum++;
        subheadernum = 0;

        let string = sectionnum.toString() + "." + headernum.toString() + ". " + text;

        let header = "<h3 style='text-decoration: underline'>" + string + "</h3>";

        this.measure.html(header);
        let y = this.measure[0].scrollHeight;

        if (this.currenty + y >= this.height) {
            this.NewPage();
        }

        //Fits the page
        this.page.append(header);
        this.currenty += y;

        this.toc[sectionnum - 1].headers.push({
            level: sectionnum.toString() + "." + headernum.toString() + ". ",
            header: text,
            page: pagenumber,
            subheaders: []
        });
    };

    //Subheader
    this.AddSubheader = function (text) {
        subheadernum++;

        let string = sectionnum.toString() + "." + headernum.toString() + ". " + subheadernum.toString() + ". " + text;

        let subheader = "<h4 style='text-decoration: underline'>" + string + "</h4>";

        this.measure.html(subheader);
        let y = this.measure[0].scrollHeight;

        if (this.currenty + y > this.height) {
            this.NewPage();
        }

        //Fits the page
        this.page.append(subheader);
        this.currenty += y;

        this.toc[sectionnum - 1].headers[headernum - 1].subheaders.push({
            level: sectionnum.toString() + "." + headernum.toString() + ". " + subheadernum.toString() + ". ",
            subheader: text,
            page: pagenumber
        });
    };

    //Paragraph
    this.AddParagraph = function (text) {
        if (text) {
            let split = text.split("</p>");
            let y;

            for (let i = 0; i < split.length; i++) {
                text = split[i] + "</p>";

                this.measure.html(text);
                y = this.measure[0].scrollHeight;

                if (this.currenty + y <= this.height) {
                    //Fits the page
                    this.page.append(text);
                    this.currenty += y;
                } else {
                    //Remove added paragraphs
                    split.splice(0, i);

                    //Split into words
                    split[0] = split[0].replace("<p>", "");

                    let words = split[0].split(" ");
                    let include = "";
                    let sentence = "";

                    for (let j = 0; j < words.length; j++) {
                        sentence += " " + words[j];

                        this.measure.html(sentence.trim());
                        y = this.measure[0].scrollHeight;

                        if (this.currenty + y < this.height) {
                            include += " " + words[j];
                        } else {
                            //Removed included words
                            words.splice(0, j);

                            //Append included words
                            this.page.append("<p>" + include.trim() + "</p>");

                            //Update the remaining text
                            split[0] = "<p>" + words.join(" ") + "</p>";
                            break;
                        }
                    }

                    this.NewPage();
                    this.AddParagraph(split.join("</p>"));
                    break;
                }
            }
        }
    };

    //Table
    this.AddTable = function (columns, data, measurefirst, classname) {
        let text = "<table>";

        if (classname)
            text = "<table class='" + classname + "'>";

        let header = "<tr>";
        let row;
        let y;

        for (let i = 0; i < columns.length; i++) {
            header += "<th>" + columns[i] + "</th>";
        }

        header += "</tr>";

        this.measure.html(text + "</table>");
        this.currenty += this.measure[0].scrollHeight;

        //Add header
        text += header;

        for (let i = 0; i < data.length; i++) {
            if (data[i] !== undefined) {

                //Generate row
                row = "<tr>";

                for (let j = 0; j < data[i].length; j++) {
                    row += "<td>" + data[i][j] + "</td>";
                }

                row += "</tr>";

                //Test if adding row will fit the page
                if (measurefirst) {
                    if (i === 0) {
                        if (classname)
                            this.measure.html("<table class='" + classname + "'>" + row + "</table>");
                        else
                            this.measure.html("<table>" + row + "</table>");

                        y = this.measure[0].scrollHeight;
                    }

                } else {
                    if (classname)
                        this.measure.html("<table class='" + classname + "'>" + row + "</table>");
                    else
                        this.measure.html("<table>" + row + "</table>");

                    y = this.measure[0].scrollHeight;
                }


                if (this.currenty + y >= this.height) {
                    //Didn't fit
                    if (i !== 0) {
                        //Push previous content only if it is not the first row
                        text += "</table>";

                        this.page.append(text);
                        this.currenty = 0;

                        // i--;
                    }

                    //Add new page
                    this.NewPage();

                    //If not the last row, then create a new table
                    if (classname)
                        text = "<table class='" + classname + "'>";
                    else
                        text = "<table>";

                    text += header;
                    text += row;


                } else {
                    //Fits
                    text += row;
                    this.currenty += y;
                }
            }
        }

        text += "</table>";
        this.page.append(text);
        this.currenty += y;

        this.Add("<div>&nbsp;</div>");
        this.currenty += spaceheight;

        this.lot.push({
            table: "TODO: Add table caption",
            page: pagenumber
        });
    };

    this.AddCaption = function (caption) {
        let text = "<div class='table-caption'>" + caption + "</div>";
        this.Add(text);
    };

    this.AddPageElement = function (page) {
        this.object.append(page);
    };

    this.UpdatePageNumbers = function () {
        let numbers = this.object.find(".page-number");

        for (let i = 0; i < numbers.length; i++) {
            numbers[i].innerText += "/" + numbers.length;
        }
    };
};