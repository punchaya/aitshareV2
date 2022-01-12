"use strict";

var PAPERSIZE = {
    A1: { name: "A1", width: 33.1, height: 23.4 }
};

var drawingpad = function (param) {
    let self = this;

    // let onrefresh = param.onrefresh;
    let canvas = param.canvas;
    let currentx = 0, currenty = 0;
    let nextx = 0, nexty = 0;
    let factor = 2.54;  //Inch to cm
    let margin = 1 / factor;

    this.sheets = [];
    this.selectedindex = 0;

    this.Add = function (object) {
        if (object instanceof canvasgraphics.Table) {
            self.AddTable(object);

        } else {
            self.AddView(object);
        }

        return object;
    };

    this.AddSheet = function () {
        let object = new drawingsheet();

        this.sheets.push(object);
        this.selectedindex = this.sheets.length - 1;

        let sheet = self.ActiveSheet();
        currentx = margin;
        currenty = sheet.paper.height - margin;
        nextx = currentx;
        nexty = currenty;

        return sheet;
    };

    this.AddView = function (view) {
        let sheet = self.ActiveSheet();

        let bounds = view.Bounds();

        currentx = nextx;
        currenty = nexty;

        view.Move(sheet.TranslateX(currentx), sheet.TranslateY(currenty));

        if (nexty > bounds.Height()) {

        } else {
            view.Scale(0.5, 0.5);
        }

        sheet.Add(view);

        nextx = currentx + bounds.Width() + margin;
        nexty = currenty - bounds.Height() - margin;

        self.AddSheet();
    };

    //Table
    this.AddTable = function (table) {
        let sheet = self.ActiveSheet();
        let tables;

        if (nextx + table.w + margin < sheet.paper.width) {
            currentx = nextx;

            table.x = sheet.TranslateX(currentx);
            table.y = sheet.TranslateY(currenty);

            tables = table.SplitTableVertically(canvas, currenty - 6 / factor);
            sheet.Add(tables[0]);

            nextx = currentx + tables[0].w + margin;
            nexty = currenty - tables[0].h - margin;

        } else if (nexty > 7 / factor) {
            currenty = nexty;

            table.x = sheet.TranslateX(currentx);
            table.y = sheet.TranslateY(currenty);

            tables = table.SplitTableVertically(canvas, currenty - 6 / factor);
            sheet.Add(tables[0]);

            nextx = currentx + tables[0].w + margin;
            nexty = currenty - tables[0].h - margin;

        } else {
            currentx = margin;
            currenty = sheet.paper.height - margin;

            table.x = sheet.TranslateX(currentx);
            table.y = sheet.TranslateY(currenty);

            tables = table.SplitTableVertically(canvas, currenty - 6 / factor);
            sheet = self.AddSheet();

            sheet.Add(tables[0]);

            nextx = currentx + tables[0].w + margin;
            nexty = currenty - tables[0].h - margin;
        }

        if (tables.length > 1)
            tables[1].name = tables[0].name;

        sheet.name = tables[0].name;

        if (tables.length > 1) {
            self.AddTable(tables[1]);
        }
    };


    //Navigation

    this.PreviousPage = function () {
        this.selectedindex--;

        if (this.selectedindex < 0)
            this.selectedindex = 0;

        return this.sheets[this.selectedindex];
    };

    this.NextPage = function () {
        this.selectedindex++;

        if (this.selectedindex >= this.sheets.length)
            this.selectedindex = this.sheets.length - 1;

        return this.sheets[this.selectedindex];
    };

    this.ActiveSheet = function () {
        return this.sheets[this.selectedindex];
    };

    this.Count = function () {
        return this.sheets.length;
    };

    this.AddSheet();
};

var drawingsheet = function (param) {
    canvasmodel.call(this);

    let self = this;

    let notes;
    let title;
    let contract;
    let scale;
    let date;
    let no;
    let showtitleblock = true;

    if (param) {
        notes = param.notes;
        title = param.title;
        contract = param.contract;
        scale = param.scale;
        date = param.date;
        no = param.no;

        if (!param.showtitleblock)
            showtitleblock = param.showtitleblock;
    }

    let size = PAPERSIZE.A1;

    let factor = 2.54;  //Inch to cm
    let margin = 2 / factor;

    let titlebottom = 6 / factor;
    let titleright = 10 / factor;

    this.paper;

    this.Refresh = function () {
        self.ShowPaper();

        if (showtitleblock)
            self.ShowTitleBlock();
    };

    this.ShowPaper = function () {
        self.Clear();

        //Drawable area of the self.paper
        self.paper = {
            width: size.width - margin * 2,
            height: size.height - margin * 2,
            aheight: size.height - margin * 2 - titlebottom,
            awidth: size.width - margin * 2 - titleright
        };

        var model = new canvasmodel();
        model.allowselect = false;

        let shape = new canvasgraphics.Rectangle_2({
            w: size.width,
            h: size.height
        });

        shape.property.showline = false;
        shape.property.fillcolor = "#FFF";

        model.Add(shape);

        //Border
        let drawing = model.Add(new canvasgraphics.Rectangle_2({
            w: self.paper.width,
            h: self.paper.height
        }));

        drawing.property.showfill = false;

        self.Add(model);
    };

    this.ShowTitleBlock = function () {
        self.ShowTitleBlockBottom();
        self.ShowTitleBlockRight();
    };

    this.ShowTitleBlockBottom = function () {
        var model = new canvasmodel();
        model.allowselect = false;

        //Top line
        model.Add(new canvasgraphics.Line({
            x1: self.TranslateX(0),
            y1: self.TranslateY(6 / factor),
            x2: self.TranslateX(self.paper.width),
            y2: self.TranslateY(6 / factor)
        }));

        //1 - Vertical line
        model.Add(new canvasgraphics.Line({
            x1: self.TranslateX(10 / factor),
            y1: self.TranslateY(0),
            x2: self.TranslateX(10 / factor),
            y2: self.TranslateY(6 / factor)
        }));


        let right = self.paper.width - titleright;

        //2 - Vertical line
        model.Add(new canvasgraphics.Line({
            x1: self.TranslateX(right - 22.15 / factor),
            y1: self.TranslateY(0),
            x2: self.TranslateX(right - 22.15 / factor),
            y2: self.TranslateY(6 / factor)
        }));

        model.Add(new canvasgraphics.Line({
            x1: self.TranslateX(right - 21.15 / factor),
            y1: self.TranslateY(1.2 / factor),
            x2: self.TranslateX(right - 21.15 / factor),
            y2: self.TranslateY(5.2 / factor)
        }));

        //Vertical line
        model.Add(new canvasgraphics.Line({
            x1: self.TranslateX(right - 16.15 / factor),
            y1: self.TranslateY(1.2 / factor),
            x2: self.TranslateX(right - 16.15 / factor),
            y2: self.TranslateY(6 / factor)
        }));


        //Vertical line
        model.Add(new canvasgraphics.Line({
            x1: self.TranslateX(right - 15.15 / factor),
            y1: self.TranslateY(1.2 / factor),
            x2: self.TranslateX(right - 15.15 / factor),
            y2: self.TranslateY(6 / factor)
        }));


        //Vertical line
        model.Add(new canvasgraphics.Line({
            x1: self.TranslateX(right - 14.15 / factor),
            y1: self.TranslateY(1.2 / factor),
            x2: self.TranslateX(right - 14.15 / factor),
            y2: self.TranslateY(6 / factor)
        }));


        //Vertical line
        model.Add(new canvasgraphics.Line({
            x1: self.TranslateX(right - 13.15 / factor),
            y1: self.TranslateY(1.2 / factor),
            x2: self.TranslateX(right - 13.15 / factor),
            y2: self.TranslateY(6 / factor)
        }));

        //Vertical line
        model.Add(new canvasgraphics.Line({
            x1: self.TranslateX(right - 12.15 / factor),
            y1: self.TranslateY(1.2 / factor),
            x2: self.TranslateX(right - 12.15 / factor),
            y2: self.TranslateY(6 / factor)
        }));

        //Vertical line
        model.Add(new canvasgraphics.Line({
            x1: self.TranslateX(right - 11.15 / factor),
            y1: self.TranslateY(1.2 / factor),
            x2: self.TranslateX(right - 11.15 / factor),
            y2: self.TranslateY(6 / factor)
        }));

        //Vertical line
        model.Add(new canvasgraphics.Line({
            x1: self.TranslateX(right - 11 / factor),
            y1: self.TranslateY(1.2 / factor),
            x2: self.TranslateX(right - 11 / factor),
            y2: self.TranslateY(6 / factor)
        }));

        //Vertical line
        model.Add(new canvasgraphics.Line({
            x1: self.TranslateX(right - 10 / factor),
            y1: self.TranslateY(1.2 / factor),
            x2: self.TranslateX(right - 10 / factor),
            y2: self.TranslateY(5.2 / factor)
        }));

        //Vertical line
        model.Add(new canvasgraphics.Line({
            x1: self.TranslateX(right - 5 / factor),
            y1: self.TranslateY(1.2 / factor),
            x2: self.TranslateX(right - 5 / factor),
            y2: self.TranslateY(6 / factor)
        }));

        //Vertical line
        model.Add(new canvasgraphics.Line({
            x1: self.TranslateX(right - 4 / factor),
            y1: self.TranslateY(1.2 / factor),
            x2: self.TranslateX(right - 4 / factor),
            y2: self.TranslateY(6 / factor)
        }));


        //Vertical line
        model.Add(new canvasgraphics.Line({
            x1: self.TranslateX(right - 3 / factor),
            y1: self.TranslateY(1.2 / factor),
            x2: self.TranslateX(right - 3 / factor),
            y2: self.TranslateY(6 / factor)
        }));

        //Vertical line
        model.Add(new canvasgraphics.Line({
            x1: self.TranslateX(right - 2 / factor),
            y1: self.TranslateY(1.2 / factor),
            x2: self.TranslateX(right - 2 / factor),
            y2: self.TranslateY(6 / factor)
        }));

        //Vertical line
        model.Add(new canvasgraphics.Line({
            x1: self.TranslateX(right - 1 / factor),
            y1: self.TranslateY(1.2 / factor),
            x2: self.TranslateX(right - 1 / factor),
            y2: self.TranslateY(6 / factor)
        }));




        //1 - Horizontal line
        model.Add(new canvasgraphics.Line({
            x1: self.TranslateX(right - 22.15 / factor),
            y1: self.TranslateY(1.2 / factor),
            x2: self.TranslateX(right),
            y2: self.TranslateY(1.2 / factor)
        }));

        model.Add(new canvasgraphics.Line({
            x1: self.TranslateX(right - 22.15 / factor),
            y1: self.TranslateY(2 / factor),
            x2: self.TranslateX(right),
            y2: self.TranslateY(2 / factor)
        }));


        model.Add(new canvasgraphics.Line({
            x1: self.TranslateX(right - 22.15 / factor),
            y1: self.TranslateY(2.8 / factor),
            x2: self.TranslateX(right),
            y2: self.TranslateY(2.8 / factor)
        }));

        model.Add(new canvasgraphics.Line({
            x1: self.TranslateX(right - 22.15 / factor),
            y1: self.TranslateY(3.6 / factor),
            x2: self.TranslateX(right),
            y2: self.TranslateY(3.6 / factor)
        }));

        model.Add(new canvasgraphics.Line({
            x1: self.TranslateX(right - 22.15 / factor),
            y1: self.TranslateY(4.4 / factor),
            x2: self.TranslateX(right),
            y2: self.TranslateY(4.4 / factor)
        }));

        model.Add(new canvasgraphics.Line({
            x1: self.TranslateX(right - 22.15 / factor),
            y1: self.TranslateY(5.2 / factor),
            x2: self.TranslateX(right),
            y2: self.TranslateY(5.2 / factor)
        }));



        let font = "helvetica";
        let fontsize = 8;

        //NOTES
        model.Add(new canvasgraphics.Text({
            text: "NOTES:",
            font: font,
            x: self.TranslateX(0.25 / factor),
            y: self.TranslateY(5.75 / factor)
        }));

        //AMENDMENT
        model.Add(new canvasgraphics.Text({
            text: "AMENDMENT",
            font: font,
            x: self.TranslateX(right - 21.95 / factor),
            y: self.TranslateY(5.75 / factor)
        }));


        //DATE
        model.Add(new canvasgraphics.TextBox({
            text: "DATE",
            font: font,
            x: self.TranslateX(right - 16.15 / factor),
            y: self.TranslateY(5.75 / factor),
            w: 1 / factor,
            h: 1 / factor,
            horzalign: "center",
            vertalign: "top"
        }));

        //DRAWN BY
        model.Add(new canvasgraphics.TextBox({
            text: "DRAWN BY",
            font: font,
            x: self.TranslateX(right - 15.15 / factor),
            y: self.TranslateY(5.80 / factor),
            w: 1 / factor,
            h: 1 / factor,
            horzalign: "center",
            vertalign: "top",
            fontsize: fontsize
        }));

        //CHECKED BY
        model.Add(new canvasgraphics.TextBox({
            text: "CHECKED BY",
            font: font,
            x: self.TranslateX(right - 14.15 / factor),
            y: self.TranslateY(5.80 / factor),
            w: 1 / factor,
            h: 1 / factor,
            horzalign: "center",
            vertalign: "top",
            fontsize: fontsize
        }));

        //DESIGN ENGR.
        model.Add(new canvasgraphics.TextBox({
            text: "DESIGN ENGR",
            font: font,
            x: self.TranslateX(right - 13.15 / factor),
            y: self.TranslateY(5.80 / factor),
            w: 1 / factor,
            h: 1 / factor,
            horzalign: "center",
            vertalign: "top",
            fontsize: fontsize
        }));

        //QP
        model.Add(new canvasgraphics.TextBox({
            text: "QP",
            font: font,
            x: self.TranslateX(right - 12.15 / factor),
            y: self.TranslateY(5.75 / factor),
            w: 1 / factor,
            h: 1 / factor,
            horzalign: "center",
            vertalign: "top"
        }));



        //AMENDMENT
        model.Add(new canvasgraphics.Text({
            text: "AMENDMENT",
            font: font,
            x: self.TranslateX(right - 10.80 / factor),
            y: self.TranslateY(5.75 / factor)
        }));


        //DATE
        model.Add(new canvasgraphics.TextBox({
            text: "DATE",
            font: font,
            x: self.TranslateX(right - 5 / factor),
            y: self.TranslateY(5.75 / factor),
            w: 1 / factor,
            h: 1 / factor,
            horzalign: "center",
            vertalign: "top"
        }));

        //DRAWN BY
        model.Add(new canvasgraphics.TextBox({
            text: "DRAWN BY",
            font: font,
            x: self.TranslateX(right - 4 / factor),
            y: self.TranslateY(5.80 / factor),
            w: 1 / factor,
            h: 1 / factor,
            horzalign: "center",
            vertalign: "top",
            fontsize: fontsize
        }));

        //CHECKED BY
        model.Add(new canvasgraphics.TextBox({
            text: "CHECKED BY",
            font: font,
            x: self.TranslateX(right - 3 / factor),
            y: self.TranslateY(5.80 / factor),
            w: 1 / factor,
            h: 1 / factor,
            horzalign: "center",
            vertalign: "top",
            fontsize: fontsize
        }));

        //DESIGN ENGR.
        model.Add(new canvasgraphics.TextBox({
            text: "DESIGN ENGR",
            font: font,
            x: self.TranslateX(right - 2 / factor),
            y: self.TranslateY(5.80 / factor),
            w: 1 / factor,
            h: 1 / factor,
            horzalign: "center",
            vertalign: "top",
            fontsize: fontsize
        }));

        //QP
        model.Add(new canvasgraphics.TextBox({
            text: "QP",
            font: font,
            x: self.TranslateX(right - 1 / factor),
            y: self.TranslateY(5.75 / factor),
            w: 1 / factor,
            h: 1 / factor,
            horzalign: "center",
            vertalign: "top"
        }));




       
        //Image
        model.Add(new canvasgraphics.Image({
            source: "hdb/res/logo.jpg",
            x: self.TranslateX(7 * self.paper.width / 8 + 0.5),
            y: self.TranslateY(1.5 - 0.23),
            width: (self.paper.width / 8 - 1) * 96,
            onload: function () {
                if (self.onrefresh)
                    self.onrefresh();
            }
        }));




        self.Add(model);
    };

    this.ShowTitleBlockRight = function () {
        var model = new canvasmodel();
        model.allowselect = false;

        //1 - Main Vertical line
        model.Add(new canvasgraphics.Line({
            x1: self.TranslateX(self.paper.width - titleright),
            y1: self.TranslateY(self.paper.height),
            x2: self.TranslateX(self.paper.width - titleright),
            y2: self.TranslateY(0)
        }));

        self.Add(model);
    };

    this.TranslateX = function (x) {
        return -size.width / 2 + margin + x;
    };

    this.TranslateY = function (y) {
        return -size.height / 2 + margin + y;
    };

    this.Refresh();
};