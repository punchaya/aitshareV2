var SIZINGHANDLE = {
    TOP: 1,
    BOTTOM: 2,
    LEFT: 3,
    RIGHT: 4
};

var SNAPTYPE = {
    NONE: 0,
    POINT: 1,
    MIDPOINT: 2,
    LINE: 3,
    GRID: 4,
    HORIZONTAL: 5,
    VERTICAL: 6,
    SNAPLINES: 7,
    GUIDES: 8
};

var OBJECTTYPE = {
    SECTION: 0,
    REBAR: 1,
    COLUMN: 2
};

var COLORSCALE = [
    [200, 0, 200], //Purple
    [255, 0, 0], //Red
    [255, 128, 0], //Orange
    [255, 255, 0], //Yellow
    [0, 255, 0], //Green
    [0, 255, 255], //Cyan
    [0, 0, 255]    //Blue
];

var UNITTYPELENGTH = {
    M: { name: 'm', value: 0.001 },
    KM: { name: 'km', value: 0.000001 },
    DM: { name: 'dm', value: 0.01 },
    CM: { name: 'cm', value: 0.1 },
    MM: { name: 'mm', value: 1 },
    UM: { name: 'µm', value: 1000 },
    NM: { name: 'nm', value: 1000000 },
    MI: { name: 'mi', value: 6.21371192237334E-07 },
    YD: { name: 'yd', value: 0.00109361329833771 },
    FT: { name: 'ft', value: 0.00328083989501312 },
    IN: { name: 'in', value: 0.0393700787401575 },
    LY: { name: 'ly', value: 1.0570008340247E-19 }
};

var canvasgraphics = function () {
    this.selected = false;
    this.property = new canvasgraphics.DrawProperties();
    this.selectedproperty = new canvasgraphics.DrawProperties({
        fillcolor: "rgba(153, 153, 0, 0.3)"
    });

    this.GetProperty = function () {
        if (this.selected)
            return this.selectedproperty;
        else
            return this.property;
    };

    this.ExportDXF = function () {
        return "";
    };

    this.Move = function (x, y) {
        this.x += x;
        this.y += y;
    };
};

canvasgraphics.DrawProperties = function (param) {
    this.transparency = 1;
    this.linecolor = "#000000";
    this.fillcolor = "rgba(152, 173, 190, " + this.transparency + ")";
    this.textcolor = "#000000";
    this.thickness = 1;
    this.scale = false;
    this.showfill = true;
    this.showline = true;

    if (param) {
        if (param.transparency)
            this.transparency = param.transparency;

        if (param.linecolor)
            this.linecolor = param.linecolor;

        if (param.fillcolor)
            this.fillcolor = param.fillcolor;

        if (param.textcolor)
            this.textcolor = param.textcolor;

        if (param.thickness)
            this.thickness = param.thickness;

        if (param.scale)
            this.scale = param.scale;

        if (param.showfill)
            this.showfill = param.showfill;

        if (param.showline)
            this.showline = param.showline;
    }
};


//Primitives

canvasgraphics.Image = function (param) {
    canvasgraphics.call(this);

    let self = this;
    let source = param.source;
    let width = param.width;
    let height = param.height;
    let x = param.x;
    let y = param.y;
    let onload = param.onload;

    let w = 100;
    let h = 100;

    let property = new canvasgraphics.DrawProperties();
    property.linecolor = "#FF0";
    property.showfill = false;

    let imageObj = new Image();
    imageObj.src = source;

    if (x === undefined)
        x = 0;

    if (y === undefined)
        y = 0;

    imageObj.onload = function () {
        w = this.naturalWidth;
        h = this.naturalHeight;

        if (width)
            this.width = width;

        if (height) {
            this.height = height;
        }
        else {
            this.height = h * this.width / w;
        }

        self.width = this.width / 100;
        self.height = this.height / 100;

        if (onload)
            onload();
    }

    this.Render = function (renderer) {
        renderer.DrawImage(imageObj, x, y);
        //renderer.DrawRectangle(x + self.width / 2, y - self.height / 2, self.width, self.height, property);
    };

    this.UpdateBounds = function (bounds) {
        if (bounds.x1 > x)
            bounds.x1 = x;

        let w = self.width;

        if (bounds.x2 < w)
            bounds.x2 = w;

        if (bounds.y1 > y)
            bounds.y1 = y;

        let h = -self.height;

        if (bounds.y2 < h)
            bounds.y2 = h;
    };
};

canvasgraphics.Text = function (param) {
    canvasgraphics.call(this);

    let self = this;

    this.textcolor = "#000000";

    this.x = param.x;
    this.y = param.y;
    this.text = param.text;

    this.horzalign = "left";
    this.vertalign = "top";

    if (param.horzalign)
        this.horzalign = param.horzalign;

    if (param.vertalign)
        this.vertalign = param.vertalign;

    this.angle = param.angle;

    this.font = "Arial";

    if (param.font)
        this.font = param.font;

    if (param.textcolor)
        this.textcolor = param.textcolor;

    this.fontsize = 12;

    if (param.fontsize)
        this.fontsize = param.fontsize;

    this.scale = true;

    this.Render = function (renderer) {
        let font;
        let fontsize;

        if (this.scale && !renderer.fontfactor) {

            if (this.fontsize)
                fontsize = this.fontsize * renderer.GetZoomValue();
            else
                fontsize = 20 * renderer.GetZoomValue();

            font = "normal " + fontsize + "px " + self.font;

        } else if (renderer.fontfactor) {
            fontsize = Math.round(this.fontsize * renderer.fontfactor);
            font = "normal " + " " + fontsize + "px " + self.font;

        } else {
            fontsize = this.fontsize;
            font = "normal " + " " + fontsize + "px " + self.font;
        }

        renderer.DrawText(this.text, this.x, this.y, font, this.textcolor, this.angle, this.horzalign, this.vertalign, fontsize);
    };

    self.RenderPDF = function (renderer) {
        renderer.setFontSize(this.fontsize);
        renderer.text(self.x + renderer.w / 2, renderer.h / 2 - self.y + this.fontsize / 96, self.text);
    };

    this.ExportDXF = function () {
        let s = '0\nTEXT\n';
        //s += '8\n' + this.layer.name+ '\n';
        s += '1\n' + this.text + '\n';
        s += '10\n' + this.x + '\n20\n' + this.y + '\n30\n0\n';
        s += '40\n' + this.fontsize / 120 + '\n50\n' + 0 + '\n';
        return s;
    };

    this.Move = function (x, y) {
        self.x += x;
        self.y += y;
    };

    this.Scale = function (x, y) {
        self.x *= x;
        self.y *= y;
    };
};

canvasgraphics.TextBox = function (param) {
    canvasgraphics.call(this);

    let self = this;
    let lines = [];

    this.textcolor = "#000000";

    this.x = param.x;
    this.y = param.y;
    this.w = param.w;
    this.text = param.text;
    this.height = 0;
    this.width = 0;

    this.horzalign = "left";
    this.vertalign = "top";

    if (param.horzalign)
        this.horzalign = param.horzalign;

    if (param.vertalign)
        this.vertalign = param.vertalign;

    this.font = "Arial";
    this.fontweight = "normal";
    this.fontsize = 12;

    if (param.font)
        this.font = param.font;

    if (param.fontsize)
        this.fontsize = param.fontsize;

    if (param.fontweight)
        this.fontweight = param.fontweight;

    this.canvas = param.canvas;

    this.scale = true;

    let font = self.fontweight + " " + self.fontsize + "px " + self.font;
    let loaded = false;

    let measure = new mobiwork.Measure({
        font: self.font,
        fontsize: self.fontsize
    });

    this.textheight = measure.Dimension("X").height;

    this.Render = function (renderer) {
        if (loaded) {
            let font;
            let fontsize;

            if (this.scale && !renderer.fontfactor) {

                if (this.fontsize)
                    fontsize = this.fontsize * renderer.GetZoomValue();
                else
                    fontsize = 20 * renderer.GetZoomValue();

                font = self.fontweight + " " + fontsize + "px " + self.font;

            } else if (renderer.fontfactor) {
                fontsize = Math.round(self.fontsize * renderer.fontfactor);
                font = self.fontweight + " " + fontsize + "px " + self.font;

            } else {
                fontsize = self.fontsize;
                font = self.fontweight + " " + fontsize + "px " + self.font;
            }

            for (let i = 0; i < lines.length; i++) {
                if (this.horzalign === "center")
                    renderer.DrawText(lines[i].text, lines[i].x + this.w / 2, lines[i].y, font, this.textcolor, this.angle, this.horzalign, this.vertalign, fontsize);
                else
                    renderer.DrawText(lines[i].text, lines[i].x, lines[i].y, font, this.textcolor, this.angle, this.horzalign, this.vertalign, fontsize);
            }

        } else {
            self.Refresh(renderer);

            loaded = true;
            self.Render(renderer);
        }
    };

    self.RenderPDF = function (renderer) {
        renderer.setFontSize(this.fontsize);

        for (let i = 0; i < lines.length; i++) {
            renderer.text(lines[i].x + renderer.w / 2, renderer.h / 2 - lines[i].y + this.textheight / 96, lines[i].text, {
                align: self.horzalign.toString()
            });
        }
    };

    this.UpdateBounds = function (bounds) {
        if (this.x < bounds.x1)
            bounds.x1 = this.x1;

        if (this.x > bounds.x2)
            bounds.x2 = this.x;

        if (this.y < bounds.y1)
            bounds.y1 = this.y;

        if (this.y > bounds.y2)
            bounds.y2 = this.y;
    };

    this.Refresh = function (renderer) {
        self.SplitByBreakandParagraph();
        self.SplitByLength(renderer);
    };

    this.SplitByBreakandParagraph = function () {
        let split = self.text.split("<br/>");
        lines = [];

        let splitline;
        let counter;

        for (let i = 0; i < split.length; i++) {
            //Split by paragraph
            splitline = split[i].split("<p/>");

            for (let j = 0; j < splitline.length; j++) {
                if (j !== 0) {
                    lines.push({
                        x: self.x,
                        y: self.y - counter++ * this.textheight / 96,
                        text: ""
                    });
                }

                lines.push({
                    x: self.x,
                    y: self.y - counter++ * this.textheight / 96,
                    text: splitline[j]
                });
            }
        }
    };

    this.SplitByLength = function (renderer) {
        //Use the canvas if renderer is not available
        if (!renderer)
            renderer = self.canvas;

        //If renderer is available, set loaded to true
        if (renderer)
            loaded = true;
        else
            return;

        let dimension;
        let boxwidth = self.w * 96;
        let split;
        let text;
        let linetext;
        let newline = [];

        for (let i = 0; i < lines.length; i++) {
            linetext = lines[i].text;
            dimension = renderer.MeasureText(linetext, font);

            if (dimension.width > boxwidth || dimension.height > this.textheight) {
                //Split by spaces
                split = linetext.split(" ");
                text = "";

                for (let j = 0; j < split.length; j++) {
                    if (j !== 0)
                        text += " ";

                    dimension = renderer.MeasureText(text + split[j], font);

                    if (dimension.width > boxwidth) {
                        if (text.trim() === "") {
                            newline.push({
                                text: split[j].trim()
                            });

                        } else {
                            newline.push({
                                text: text.trim()
                            });

                            j--;
                            text = "";
                        }

                    } else {
                        //Add text to the line
                        text += split[j];
                    }
                }

                newline.push({
                    text: text.trim()
                });

            } else {
                //Add text to the array
                newline.push(lines[i]);
            }
        }

        lines = newline;

        for (let i = 0; i < lines.length; i++) {
            lines[i].x = self.x;
            lines[i].y = self.y - i * this.textheight / 96;
        }

        this.height = lines.length * this.textheight / 96;
    };

    this.Refresh();
};

canvasgraphics.Table = function (param) {
    canvasgraphics.call(this);

    let self = this;

    this.x = param.x;
    this.y = param.y;
    this.h = param.h;
    this.w = param.w;
    this.name = param.name;

    this.x1;
    this.y1;
    this.x2;
    this.y2;

    this.headerheight;

    let showheader = true;

    this.font = "Arial";

    if (param.font)
        this.font = param.font;

    this.fontsize = 12;

    let bounds;

    if (param.fontsize)
        this.fontsize = param.fontsize;

    let columns = param.columns;
    let data = param.data;
    let options = param.options;

    if (param.showheader !== undefined)
        showheader = param.showheader;

    let objects;
    let loaded = false;

    this.Render = function (renderer) {
        if (loaded) {
            for (let i = 0; i < objects.length; i++)
                objects[i].Render(renderer);
        } else {
            loaded = true;
            this.Refresh(renderer);
            this.Render(renderer);
        }
    };

    this.RenderPDF = function (renderer) {
        for (let i = 0; i < objects.length; i++)
            objects[i].RenderPDF(renderer);
    };

    this.Refresh = function (renderer, splitbyheight) {
        let object;
        let x = 0;

        //Initialize objects
        objects = [];

        //Measure text height
        let measure = new mobiwork.Measure({
            font: self.font,
            fontsize: self.fontsize
        });

        let textheight = measure.Dimension("X").height / 96;
        let padding = textheight;

        if (options && options.padding)
            padding = options.padding;

        //Header
        let width = this.MeasureHeaderColumnWidth(columns);
        let height = this.MeasureHeaderHeight(renderer, columns, padding);
        let y = this.y - height;
        let yo = this.y;
        let wo;
        let ho;

        let totalh = height;
        this.headerheight = height;

        //Row header text and border
        for (let i = 0; i < columns.length; i++) {
            if (Array.isArray(columns[i])) {
                x = 0;

                for (let j = 0; j < columns[i].length; j++) {
                    if (columns[i][j].columnoverflow)
                        continue;

                    //Span in more than 1 column
                    if (columns[i][j].colspan) {
                        wo = 0;

                        for (let k = 0; k < columns[i][j].colspan; k++) {
                            wo += columns[i][j + k].width;

                            if (k !== 0)
                                columns[i][j + k].columnoverflow = true;
                        }

                    } else {
                        wo = columns[i][j].width;
                    }

                    if (columns[i][j].rowoverflow) {
                        x += wo;
                        continue;
                    }

                    //Span in more than 1 row
                    if (columns[i][j].rowspan) {
                        ho = 0;

                        for (let k = 0; k < columns[i][j].rowspan; k++) {
                            if (columns[i + k]) {
                                ho += columns[i + k].height;

                                if (k !== 0)
                                    columns[i + k][j].rowoverflow = true;
                            }
                        }
                    } else {
                        ho = columns[i].height;
                    }

                    object = new canvasgraphics.TextBox({
                        x: this.x + x,
                        y: yo + textheight / 2 - ho / 2,
                        w: wo,
                        text: columns[i][j].text,
                        horzalign: "center",
                        fontweight: "bold",
                        font: self.font
                    });

                    objects.push(object);

                    x += wo;

                    //Right border
                    object = new canvasgraphics.Line({
                        x1: this.x + x,
                        y1: yo,
                        x2: this.x + x,
                        y2: yo - ho,
                    });

                    objects.push(object);

                    //Bottom border
                    objects.push(
                        new canvasgraphics.Line({
                            x1: this.x + x - wo,
                            y1: yo - ho,
                            x2: this.x + x,
                            y2: yo - ho
                        })
                    );
                }

                yo -= columns[i].height;

            } else {
                object = new canvasgraphics.TextBox({
                    x: this.x + x,
                    y: this.y - padding,
                    w: columns[i].width,
                    text: columns[i].text,
                    horzalign: "center"
                });

                objects.push(object);

                x += columns[i].width;

                //Right border
                object = new canvasgraphics.Line({
                    x1: this.x + x,
                    y1: this.y,
                    x2: this.x + x,
                    y2: y,
                });

                objects.push(object);

                //Bottom border
                objects.push(
                    new canvasgraphics.Line({
                        x1: this.x,
                        y1: y,
                        x2: this.x + this.w,
                        y2: y
                    })
                );
            }
        }

        //Cells
        if (data) {
            x = 0;

            if (splitbyheight)
                splitbyheight -= height;

            let rowheight = textheight + padding * 2;

            for (let j = 0; j < data.length; j++) {
                for (let i = 0; i < columns.length; i++) {
                    if (Array.isArray(columns[i])) {
                        x = 0;

                        for (let k = 0; k < columns[i].length; k++) {
                            if (data[j][k]) {
                                if (!(data[j][k] instanceof Object))
                                    data[j][k] = new canvasgraphics.TextBox({
                                        text: data[j][k],
                                        horzalign: "center",
                                        font: self.font
                                    });

                                data[j][k].x = this.x + x;
                                data[j][k].y = y - padding;
                                data[j][k].w = columns[i][k].width;
                                data[j][k].h = rowheight;
                                objects.push(data[j][k]);
                            }

                            x += columns[i][k].width;
                        }

                        //Bottom border
                        objects.push(
                            new canvasgraphics.Line({
                                x1: this.x,
                                y1: y - rowheight,
                                x2: this.x + x,
                                y2: y - rowheight
                            })
                        );

                        break;

                    } else {
                        if (data[j][i]) {
                            if (!(data[j][i] instanceof Object))
                                data[j][i] = new canvasgraphics.TextBox({
                                    text: data[j][i],
                                    horzalign: "center"
                                });

                            data[j][i].x = this.x + x;
                            data[j][i].y = this.y - height;
                            data[j][i].w = columns[i].width;
                            data[j][i].h = this.h - height;
                            objects.push(data[j][i]);
                        }

                        x += columns[i].width;
                    }
                }

                y -= rowheight;
                totalh += rowheight;

                if (splitbyheight) {
                    splitbyheight -= rowheight;

                    //Split table
                    if (splitbyheight - rowheight <= 0) {
                        DrawBorder();

                        let splice = data.splice(j, data.length);
                        return splice;
                    }
                }
            }

            DrawBorder();
        }

        DrawBorder();

        function DrawBorder() {
            //Table outer border
            let border = new canvasgraphics.Rectangle({
                x1: self.x,
                y1: self.y,
                x2: self.x + self.w,
                y2: y
            })

            self.x1 = self.x;
            self.y1 = self.y;
            self.x2 = self.x + self.w;
            self.y2 = y;
            self.h = totalh;

            border.property.showfill = false;
            objects.push(border);

            let y1 = self.y - height;
            let y2 = y;

            //Column border
            x = 0;

            for (let i = 0; i < columns.length; i++) {
                if (Array.isArray(columns[i])) {
                    x = 0;

                    for (let j = 0; j < columns[i].length; j++) {
                        x += columns[i][j].width;

                        object = new canvasgraphics.Line({
                            x1: self.x + x,
                            y1: y1,
                            x2: self.x + x,
                            y2: y2,
                        });

                        objects.push(object);
                    }

                } else {
                    x += columns[i].width;

                    object = new canvasgraphics.Line({
                        x1: self.x + x,
                        y1: y1,
                        x2: self.x + x,
                        y2: y2,
                    });

                    objects.push(object);
                }
            }
        }
    };

    this.MeasureHeaderColumnWidth = function (columns) {
        let width = 0;
        let fixcount = 0;
        let x = this.x;
        let columnlength = columns.length;

        for (let i = 0; i < columns.length; i++) {
            if (Array.isArray(columns[i])) {
                //NOTE: Measure width of the last header row only.
                //NOTE: Fixed width must be assigned to the last row only.
                if (i === columns.length - 1) {
                    for (let j = 0; j < columns[i].length; j++) {
                        if (columns[i][j].width) {
                            fixcount++;
                            width += columns[i][j].width;
                        }
                    }

                    columnlength = columns[i].length;
                }
            } else {
                if (columns[i].width) {
                    fixcount++;
                    width += columns[i].width;
                }
            }
        }

        if ((columnlength - fixcount) !== 0) {
            width = (this.w - width) / (columnlength - fixcount);

            for (let i = 0; i < columns.length; i++) {
                if (Array.isArray(columns[i])) {
                    for (let j = 0; j < columns[i].length; j++) {
                        if (columns[i] instanceof Object) {
                            if (!columns[i][j].width)
                                columns[i][j].width = width;
                        } else {
                            columns[i][j] = {
                                text: columns[i][j],
                                width: width
                            };
                        }
                    }

                } else {
                    if (columns[i] instanceof Object) {
                        if (!columns[i].width)
                            columns[i].width = width;
                    } else {
                        columns[i] = {
                            text: columns[i],
                            width: width
                        };
                    }
                }
            }
        }

        return width;
    };

    this.MeasureHeaderHeight = function (renderer, columns, textheight) {
        let height = 0;
        let textbox;
        let fh;
        let wo;

        //Calculate header height
        for (let i = 0; i < columns.length; i++) {
            if (Array.isArray(columns[i])) {
                fh = 0;

                //Measure each row header
                for (let j = 0; j < columns[i].length; j++) {
                    if (columns[i][j].columnoverflow)
                        continue;

                    //Span in more than 1 column
                    if (columns[i][j].colspan) {
                        wo = 0;

                        for (let k = 0; k < columns[i][j].colspan; k++) {
                            wo += columns[i][j + k].width;

                            if (k !== 0)
                                columns[i][j + k].columnoverflow = true;
                        }

                    } else {
                        wo = columns[i][j].width;
                    }

                    textbox = new canvasgraphics.TextBox({
                        x: 0,
                        y: 0,
                        w: wo,
                        text: columns[i][j].text
                    });

                    textbox.Refresh(renderer);

                    if (textbox.height > fh)
                        fh = textbox.height;
                }

                columns[i].height = fh + textheight * 2;
                height += columns[i].height;

                if (i === columns.length - 1)
                    return height;

            } else {
                textbox = new canvasgraphics.TextBox({
                    x: 0,
                    y: 0,
                    w: columns[i].width,
                    text: columns[i].text
                });

                textbox.Refresh(renderer);

                if (textbox.height > height)
                    height = textbox.height;
            }
        }

        return height + textheight * 2;;
    };

    this.SplitTableVertically = function (canvas, splitbyheight) {
        let tables = [self];
        let part = self.Refresh(canvas, splitbyheight);

        if (part) {
            let table = new canvasgraphics.Table({
                x: 0,
                y: 0,
                w: self.w,
                h: self.h,
                columns: columns,
                data: part,
                options: options
            });

            table.headerheight = self.headerheight;
            tables.push(table);
        }

        return tables;
    };

    this.CreateNewTable = function (canvas, splitbyheight, tables, part) {
        param.data = part;

        let newtable = new canvasgraphics.Table(param);
        tables.push(newtable);

        part = newtable.Refresh(canvas, splitbyheight);

        if (part)
            self.CreateNewTable(canvas, splitbyheight, tables, part);
    };

    this.UpdateBounds = function (bounds) {
        if (this.x1 < bounds.x1)
            bounds.x1 = this.x1;

        if (this.x1 > bounds.x2)
            bounds.x2 = this.x1;

        if (this.x2 < bounds.x1)
            bounds.x1 = this.x2;

        if (this.x2 > bounds.x2)
            bounds.x2 = this.x2;

        if (this.y1 < bounds.y1)
            bounds.y1 = this.y1;

        if (this.y1 > bounds.y2)
            bounds.y2 = this.y1;

        if (this.y2 < bounds.y1)
            bounds.y1 = this.y2;

        if (this.y2 > bounds.y2)
            bounds.y2 = this.y2;
    };
};

canvasgraphics.Line = function (param) {
    canvasgraphics.call(this, param);

    this.x1 = param.x1;
    this.y1 = param.y1;
    this.x2 = param.x2;
    this.y2 = param.y2;

    this.Render = function (renderer) {
        renderer.DrawLine(this.x1, this.y1, this.x2, this.y2, this.GetProperty());
    };

    this.RenderPDF = function (renderer) {
        renderer.line(this.x1 + renderer.w / 2, renderer.h / 2 - this.y1, this.x2 + renderer.w / 2, renderer.h / 2 - this.y2);
    };

    this.ExportDXF = function () {
        let s = '0\nLINE\n';
        //s += '8\n' + this.layer.name+ '\n';
        s += '10\n' + this.x1 + '\n20\n' + this.y1 + '\n30\n0\n';
        s += '11\n' + this.x2 + '\n21\n' + this.y2 + '\n31\n0\n';
        return s;
    };

    this.SelectByRectangle = function (bounds) {
        if (bounds.Inside && bounds.Inside(this.x1, this.y1))
            if (bounds.Inside(this.x2, this.y2))
                return true;

        return false;
    };

    this.SelectByPoint = function (x, y) {
    };

    this.Move = function (x, y) {
        this.x1 += x;
        this.y1 += y;

        this.x2 += x;
        this.y2 += y;
    };

    this.Scale = function (x, y) {
        this.x1 *= x;
        this.y1 *= y;

        this.x2 *= x;
        this.y2 *= y;

        if (self.updateevent !== undefined && self.updateevent !== null)
            self.updateevent();
    };

    this.UpdateBounds = function (bounds) {
        if (this.x1 < bounds.x1)
            bounds.x1 = this.x1;

        if (this.x2 > bounds.x2)
            bounds.x2 = this.x2;

        if (this.y1 < bounds.y1)
            bounds.y1 = this.y1;

        if (this.y2 > bounds.y2)
            bounds.y2 = this.y2;
    };
};

canvasgraphics.Polyline = function (param) {
    canvasgraphics.call(this, param);

    if (param)
        this.points = param.points;

    this.Render = function (renderer) {
        renderer.DrawPolyLine(this.points, this.GetProperty());
    };

    this.UpdateBounds = function (bounds) {
        for (let i = 0; i < this.points.length; i++) {
            if (bounds.x1 > this.points[i].x)
                bounds.x1 = this.points[i].x;

            if (bounds.y1 > this.points[i].y)
                bounds.y1 = this.points[i].y;

            if (bounds.x2 < this.points[i].x)
                bounds.x2 = this.points[i].x;

            if (bounds.y2 < this.points[i].y)
                bounds.y2 = this.points[i].y;
        }
    };
};

canvasgraphics.Polygon = function (param) {
    canvasgraphics.call(this);

    let self = this;

    self.points = param.points || [];
    self.holes = [];
    self.a = param.a;
    self.drawpoints = 10000;

    if (param.holes)
        self.holes = param.holes;

    this.Render = function (renderer) {
        renderer.DrawPolygonWithHoles(self.points, self.holes, self.GetProperty());
    };

    self.Refresh = function () {
    };

    this.ExportDXF = function () {
        let s = '0\nPOLYLINE\n';
        // s += '8\n' + this.layer.name + '\n';
        s += '66\n1\n70\n0\n';

        for (let i = 0; i < self.points.length; i++) {
            s += '0\nVERTEX\n';
            // s += '8\n' + this.layer.name + '\n';
            s += '70\n0\n';
            s += '10\n' + self.points[i].x + '\n20\n' + self.points[i].y + '\n';
        }

        s += '0\nSEQEND\n';
        return s;
    };

    this.GetPoints = function () {
        return self.points;
    };

    this.GetMidPoints = function () {
        let points = [];
        let x, y;

        if (self.points.length > 2) {
            for (let i = 0; i < self.points.length - 1; i++) {
                x = (self.points[i].x + self.points[i + 1].x) / 2;
                y = (self.points[i].y + self.points[i + 1].y) / 2;

                points.push({ x: x, y: y });
            }

            i = self.points.length - 1;
            x = (self.points[0].x + self.points[i].x) / 2;
            y = (self.points[0].y + self.points[i].y) / 2;

            points.push({ x: x, y: y });
        }

        return points;
    };

    this.SelectByPoint = function (x, y) {
        let polygon = new graphicsentity.Polygon(self.points);
        self.selected = polygon.IsInside(x, y);

        let inside = false;
        let poly;

        for (let i = 0; i < self.holes.length; i++) {
            poly = new graphicsentity.Polygon(self.holes[i].points);
            if (poly.IsInside(x, y)) {
                inside = true;
                break;
            }
        }

        if (inside)
            self.selected = false;

        return self.selected;
    };

    this.SelectByRectangle = function (x1, y1, x2, y2) {
        let bounds = new graphicsentity.Bounds2F(x1, y1, x2, y2);

        for (let i = 0; i < self.points.length; i++)
            if (!bounds.Inside(self.points[i].x, self.points[i].y)) {
                return false;
            }

        return true;
    };

    this.Move = function (x, y) {
        for (let i = 0; i < self.points.length; i++) {
            self.points[i].x += x;
            self.points[i].y += y;
        }
        self.Refresh();

        if (self.updateevent !== undefined && self.updateevent !== null)
            self.updateevent();
    };

    this.Scale = function (x, y) {
        for (let i = 0; i < self.points.length; i++) {
            self.points[i].x *= x;
            self.points[i].y *= y;
        }

        self.Refresh();

        if (self.updateevent !== undefined && self.updateevent !== null)
            self.updateevent();
    };

    this.Rotate = function (a) {
        if (self.points) {
            let bounds = new graphicsentity.Bounds2F();
            self.UpdateBounds(bounds);

            let midx = bounds.MidX();
            let midy = bounds.MidY();
            let point;

            //Points
            for (let i = 0; i < self.points.length; i++) {
                point = Rotate(self.points[i].x, self.points[i].y, midx, midy, a);
                self.points[i].x = point.x;
                self.points[i].y = point.y;
            }

            //Holes

            let pt;

            for (let i = 0; i < self.holes.length; i++) {
                for (let j = 0; j < self.holes[i].points.length; j++) {
                    pt = self.holes[i].points[j];
                    point = Rotate(pt.x, pt.y, midx, midy, a);
                    pt.x = point.x;
                    pt.y = point.y;
                }
            }
        }
    };

    this.UpdateBounds = function (bounds) {
        let polygon = new graphicsentity.Polygon(self.points);
        return polygon.UpdateBounds(bounds);
    };

    this.AddPoint = function (x, y) {
        self.points.push({ x: x, y: y });
    };

    this.UpdateLastPoint = function (x, y) {
        if (self.points.length) {
            let point = self.points[self.points.length - 1];
            point.x = x;
            point.y = y;
        }
    };

    this.RemoveLastPoint = function () {
        self.points.pop();
    };

    self.Refresh();
};

canvasgraphics.Rectangle = function (param) {
    canvasgraphics.Line.call(this, param);

    let points;

    this.Render = function (renderer) {
        renderer.DrawPolygon(points, this.GetProperty());
    };

    this.RenderPDF = function (renderer) {
        renderer.rect(this.x1 + renderer.w / 2, renderer.h / 2 - this.y1, this.x2 + renderer.w / 2, renderer.h / 2 - this.y2);
    };

    this.SelectByPoint = function (x, y) {
        let line = new graphicsentity.Line2F(this.x1, this.y1, this.x2, this.y2);

        if (line.InBetweenX(x) && line.InBetweenY(y))
            return true;

        return false;
    };

    this.GetModel = function () {
        let model = {
            x1: this.x1,
            y1: this.y1,
            x2: this.x2,
            y2: this.y2
        };

        return model;
    };

    this.Refresh = function () {
        points = [
            { x: this.x1, y: this.y1, parent: this },
            { x: this.x1, y: this.y2, parent: this },
            { x: this.x2, y: this.y2, parent: this },
            { x: this.x2, y: this.y1, parent: this }
        ];
    };

    this.GetPoints = function () {
        return points;
    };

    this.GetMidPoints = function () {
        let line;
        let midpoints = [];

        for (let i = 0; i < points.length - 1; i++) {
            line = new graphicsentity.Line2F(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
            midpoints.push(line.GetMidPoint());
        }

        for (let i = 0; i < midpoints.length; i++)
            midpoints[i].parent = this;

        return midpoints;
    };

    this.Move = function (dx, dy) {
        this.x1 += dx;
        this.y1 += dy;
        this.x2 += dx;
        this.y2 += dy;

        for (let i = 0; i < points.length; i++) {
            points[i].x += dx;
            points[i].y += dy;
        }
    };

    this.Resize = function (x, y, type) {
        switch (type) {
            case SIZINGHANDLE.LEFT:
                this.x1 = x;
                points[0].x = x;
                points[1].x = x;

                break;

            case SIZINGHANDLE.RIGHT:
                this.x2 = x;
                points[2].x = x;
                points[3].x = x;

                break;

            case SIZINGHANDLE.TOP:
                this.y2 = y;
                points[1].y = y;
                points[2].y = y;

                break;

            case SIZINGHANDLE.BOTTOM:
                this.y1 = y;
                points[0].y = y;
                points[3].y = y;

                break;
        }
    }

    this.UpdateBounds = function (bounds) {
        for (let i = 0; i < points.length; i++) {
            if (bounds.x1 > points[i].x)
                bounds.x1 = points[i].x;

            if (bounds.x2 < points[i].x)
                bounds.x2 = points[i].x;

            if (bounds.y1 > points[i].y)
                bounds.y1 = points[i].y;

            if (bounds.y2 < points[i].y)
                bounds.y2 = points[i].y;
        }
    };

    this.Refresh();
};

canvasgraphics.Rectangle_2 = function (param) {
    canvasgraphics.call(this, param);

    let self = this;

    self.points;
    self.x = 0;
    self.y = 0;

    if (param.x !== undefined)
        self.x = param.x;

    if (param.y !== undefined)
        self.y = param.y;

    self.w = param.w;
    self.h = param.h;
    self.a = param.a;

    self.Render = function (renderer) {
        if (self.w && self.h)
            renderer.DrawPolygon(self.points, self.GetProperty());
    };

    self.RenderPDF = function (renderer) {
        renderer.rect(renderer.w / 2 + self.x - self.w / 2, renderer.h / 2 - self.y - self.h / 2, self.w, self.h);
    };

    self.SelectByPoint = function (x, y) {
        let line = new graphicsentity.Line2F(self.x1, self.y1, self.x2, self.y2);
        self.selected = false;

        if (line.InBetweenX(x) && line.InBetweenY(y)) {
            self.selected = true;
        }

        return self.selected;
    };

    self.GetModel = function () {
        let model = {
            x1: self.x1,
            y1: self.y1,
            x2: self.x2,
            y2: self.y2
        };

        return model;
    };

    self.Refresh = function () {
        self.x1 = self.x - self.w / 2;
        self.x2 = self.x + self.w / 2;

        self.y1 = self.y - self.h / 2;
        self.y2 = self.y + self.h / 2;

        self.points = [
            { x: self.x1, y: self.y1, parent: self },
            { x: self.x1, y: self.y2, parent: self },
            { x: self.x2, y: self.y2, parent: self },
            { x: self.x2, y: self.y1, parent: self }
        ];

        if (self.a) {
            self.Rotate(self.a);
        }
    };

    self.Rotate = function (a) {
        let bounds = new graphicsentity.Bounds2F();
        self.UpdateBounds(bounds);

        let midx = bounds.MidX();
        let midy = bounds.MidY();
        let point;

        for (let i = 0; i < self.points.length; i++) {
            point = Rotate(self.points[i].x, self.points[i].y, midx, midy, a);
            self.points[i].x = point.x;
            self.points[i].y = point.y;
        }
    };

    self.GetPoints = function () {
        return self.points;
    };

    self.GetMidPoints = function () {
        let line;
        let midpoints = [];

        for (let i = 0; i < self.points.length - 1; i++) {
            line = new graphicsentity.Line2F(self.points[i].x, self.points[i].y, self.points[i + 1].x, self.points[i + 1].y);
            midpoints.push(line.GetMidPoint());
        }

        for (let i = 0; i < midpoints.length; i++)
            midpoints[i].parent = self;

        return midpoints;
    };

    self.Move = function (dx, dy) {
        self.x1 += dx;
        self.y1 += dy;
        self.x2 += dx;
        self.y2 += dy;

        for (let i = 0; i < self.points.length; i++) {
            self.points[i].x += dx;
            self.points[i].y += dy;
        }
    };

    self.Resize = function (x, y, type) {
        switch (type) {
            case SIZINGHANDLE.LEFT:
                self.x1 = x;
                self.points[0].x = x;
                self.points[1].x = x;

                break;

            case SIZINGHANDLE.RIGHT:
                self.x2 = x;
                self.points[2].x = x;
                self.points[3].x = x;

                break;

            case SIZINGHANDLE.TOP:
                self.y2 = y;
                self.points[1].y = y;
                self.points[2].y = y;

                break;

            case SIZINGHANDLE.BOTTOM:
                self.y1 = y;
                self.points[0].y = y;
                self.points[3].y = y;

                break;
        }
    };

    self.UpdateBounds = function (bounds) {
        for (let i = 0; i < self.points.length; i++) {
            if (bounds.x1 > self.points[i].x)
                bounds.x1 = self.points[i].x;

            if (bounds.x2 < self.points[i].x)
                bounds.x2 = self.points[i].x;

            if (bounds.y1 > self.points[i].y)
                bounds.y1 = self.points[i].y;

            if (bounds.y2 < self.points[i].y)
                bounds.y2 = self.points[i].y;
        }
    };

    self.Refresh();
};

canvasgraphics.Circle = function (param) {
    canvasgraphics.Polygon.call(this, param);

    let self = this;

    this.x = param.x;
    this.y = param.y;
    this.r = param.r;
    this.points;

    self.Render = function (renderer) {
        renderer.DrawCircle(self.x, self.y, self.r, self.GetProperty());
    };

    self.Refresh = function () {
        self.points = new graphicsentity.Circle(self.x, self.y, self.r).GetPoints();
    };

    self.GetPoints = function () {
        return self.points;
    };

    this.Move = function (x, y) {
        this.x += x;
        this.y += y;
    };

    this.Scale = function (x, y) {
        this.x *= x;
        this.y *= y;
        this.r *= x;

        self.Refresh();

        if (self.updateevent !== undefined && self.updateevent !== null)
            self.updateevent();
    };

    this.ExportDXF = function () {
        let s = '0\nCIRCLE\n';
        //s += '8\n' + this.layer.name + '\n';
        s += '10\n' + this.x + '\n20\n' + this.y + '\n30\n0\n';
        s += '40\n' + this.r + '\n';
        return s;
    };

    self.Refresh();
};

canvasgraphics.Arc = function (param) {
    canvasgraphics.call(this, param);

    let self = this;

    self.x = param.x;
    self.y = param.y;
    self.r = param.r;
    self.s = param.s;
    self.e = param.e;
    self.anti = param.anti;
    self.points;

    self.Render = function (renderer) {
        renderer.DrawArc(self.x, self.y, self.r, self.s, self.e, self.anti, self.GetProperty());
    };

    this.ExportDXF = function () {
        let s = '0\nARC\n';
        // s += '8\n' + this.layer.name + '\n';
        s += '10\n' + this.x + '\n20\n' + this.y + '\n30\n0\n';
        s += '40\n' + this.r + '\n50\n' + this.s + '\n51\n' + this.e + '\n';
        return s;
    };

    this.UpdateBounds = function (bounds) {
    };
};

canvasgraphics.RegularPolygon = function (param) {
    canvasgraphics.Polygon.call(this, param);

    let self = this;

    self.x = param.x;
    self.y = param.y;
    self.r = param.r;
    self.n = param.n;
    self.a = param.a;

    self.Refresh = function () {
        let x = self.x;
        let y = self.y;
        let r = self.r;
        let n = self.n;

        self.points = [];

        let theta = 2 * 3.1415926 / n;
        let tfactor = Math.tan(theta);//calculate the tangential factor
        let rfactor = Math.cos(theta);//calculate the radial factor

        let x1 = 0;
        let y1 = r;

        let tx;
        let ty;

        for (let i = 0; i < n; i++) {
            self.points.push({ x: x1 + x, y: y1 + y, parent: self });

            tx = -y1;
            ty = x1;

            //add the tangential vector
            x1 += tx * tfactor;
            y1 += ty * tfactor;

            //correct using the radial factor
            x1 *= rfactor;
            y1 *= rfactor;
        }

        if (self.a) {
            self.Rotate(self.a);
        }
    };

    self.Refresh();
};

canvasgraphics.Tee = function (param) {
    canvasgraphics.Polygon.call(this, param);

    let points;
    let self = this;

    self.x = param.x;
    self.y = param.y;
    self.w = param.w;
    self.h = param.h;
    self.tw = param.tw;
    self.tf = param.tf;
    self.a = param.a;

    self.Refresh = function () {
        let x = self.x;
        let y = self.y;
        let w = self.w;
        let h = self.h;
        let tw = self.tw;
        let tf = self.tf;

        self.points = [
            { x: x - tw / 2, y: y - h / 2 }, //1
            { x: x - tw / 2, y: y + h / 2 - tf }, //2
            { x: x - w / 2, y: y + h / 2 - tf }, //3
            { x: x - w / 2, y: y + h / 2 }, //4
            { x: x + w / 2, y: y + h / 2 }, //5
            { x: x + w / 2, y: y + h / 2 - tf }, //6
            { x: x + tw / 2, y: y + h / 2 - tf }, //7
            { x: x + tw / 2, y: y - h / 2 } //8
        ];

        if (self.a) {
            self.Rotate(self.a);
        }
    };

    self.Refresh();
};

canvasgraphics.SlopedTee = function (param) {
    canvasgraphics.Polygon.call(this, param);

    let points;
    let self = this;

    self.x = param.x;
    self.y = param.y;
    self.w = param.w;
    self.h = param.h;
    self.tw = param.tw;
    self.tf = param.tf;
    self.of = param.of;
    self.ow = param.ow;
    self.a = param.a;

    self.Refresh = function () {
        let x = self.x;
        let y = self.y;
        let w = self.w;
        let h = self.h;
        let tw = self.tw;
        let tf = self.tf;
        let of = self.of;
        let ow = self.ow;

        self.points = [
            { x: x - tw / 2, y: y - h / 2 }, //1
            { x: x - tw / 2 - ow, y: y + h / 2 - tf - of }, //2
            { x: x - w / 2, y: y + h / 2 - tf }, //3
            { x: x - w / 2, y: y + h / 2 }, //4
            { x: x + w / 2, y: y + h / 2 }, //5
            { x: x + w / 2, y: y + h / 2 - tf }, //6
            { x: x + tw / 2 + ow, y: y + h / 2 - tf - of }, //7
            { x: x + tw / 2, y: y - h / 2 } //8
        ];

        if (self.a) {
            self.Rotate(self.a);
        }
    };

    self.Refresh();
};

canvasgraphics.I = function (param) {
    canvasgraphics.Polygon.call(this, param);

    let points;
    let self = this;

    self.x = param.x;
    self.y = param.y;
    self.wt = param.wt;
    self.wb = param.wb;
    self.h = param.h;
    self.tw = param.tw;
    self.tft = param.tft;
    self.tfb = param.tfb;
    self.a = param.a;

    self.Refresh = function () {
        let x = self.x;
        let y = self.y;
        let wt = self.wt;
        let wb = self.wb;
        let h = self.h;
        let tw = self.tw;
        let tft = self.tft;
        let tfb = self.tfb;

        self.points = [
            { x: x - wb / 2, y: y - h / 2 }, //1
            { x: x - wb / 2, y: y - h / 2 + tfb }, //2
            { x: x - tw / 2, y: y - h / 2 + tfb }, //3
            { x: x - tw / 2, y: y + h / 2 - tft }, //4
            { x: x - wt / 2, y: y + h / 2 - tft }, //5
            { x: x - wt / 2, y: y + h / 2 }, //6
            { x: x + wt / 2, y: y + h / 2 }, //7
            { x: x + wt / 2, y: y + h / 2 - tft }, //8
            { x: x + tw / 2, y: y + h / 2 - tft }, //9
            { x: x + tw / 2, y: y - h / 2 + tfb }, //10
            { x: x + wb / 2, y: y - h / 2 + tfb }, //11
            { x: x + wb / 2, y: y - h / 2 } //12
        ];

        if (self.a) {
            self.Rotate(self.a);
        }
    };

    self.Refresh();
};

canvasgraphics.SteelI = function (param) {
    canvasgraphics.Polygon.call(this, param);

    let self = this;

    self.property.fillcolor = "rgba(152, 173, 190, 0.6)";
    self.selectedproperty.fillcolor = "rgba(153, 153, 0, 0.6)";

    self.x = param.x;
    self.y = param.y;
    self.wt = param.wt;
    self.wb = param.wb;
    self.h = param.h;
    self.tw = param.tw;
    self.tft = param.tft;
    self.tfb = param.tfb;
    self.r1 = param.r1;
    self.r2 = param.r2;
    self.r3 = param.r3;
    self.slope = param.slope;
    self.a = param.a;

    self.points;

    self.Render = function (renderer) {
        renderer.DrawSteelI(self.x, self.y, self.wt, self.wb, self.h, self.tw, self.tft, self.tfb, self.r1, self.r2, self.r3, self.slope, self.GetProperty());
    };

    self.Refresh = function () {
        let x = self.x;
        let y = self.y;
        let wt = self.wt;
        let wb = self.wb;
        let h = self.h;
        let tw = self.tw;
        let tft = self.tft;
        let tfb = self.tfb;
        let r1 = self.r1;
        let r2 = self.r2;
        let r3 = self.r3;
        let slope = self.slope * Math.PI / 180;

        let ax, ay, points;

        self.points = [];

        ax = x - wb / 2 + r3;
        ay = y - h / 2 + r3;
        points = new graphicsentity.Arc(ax, ay, r3, Math.PI * 0.5, Math.PI * 1).GetPoints();
        self.points.push(...points);

        ax = x - wb / 2 + r2;
        ay = y - h / 2 + tfb - (Math.tan(slope) * (wb / 4 - r2) + r2);
        points = new graphicsentity.Arc(ax, ay, r2, Math.PI * 1, Math.PI * 1.5).GetPoints();
        self.points.push(...points);

        ax = x - tw / 2 - r1;
        ay = y - h / 2 + tfb + (Math.tan(slope) * ((x - tw / 2 - r1) - (x - wb / 4))) + r1;
        points = new graphicsentity.Arc(ax, ay, r1, Math.PI * 0.5, Math.PI * 0, true).GetPoints();
        self.points.push(...points);

        ax = x - tw / 2 - r1;
        ay = y + h / 2 - tft - (Math.tan(slope) * ((x - tw / 2 - r1) - (x - wt / 4))) - r1;
        points = new graphicsentity.Arc(ax, ay, r1, Math.PI * 2, Math.PI * 1.5, true).GetPoints();
        self.points.push(...points);

        ax = x - wt / 2 + r2;
        ay = y + h / 2 - tft + (Math.tan(slope) * (wt / 4 - r2) + r2);
        points = new graphicsentity.Arc(ax, ay, r2, Math.PI * 0.5, Math.PI * 1).GetPoints();
        self.points.push(...points);

        ax = x - wt / 2 + r3;
        ay = y + h / 2 - r3;
        points = new graphicsentity.Arc(ax, ay, r3, Math.PI * 1, Math.PI * 1.5).GetPoints();
        self.points.push(...points);

        ax = x + wt / 2 - r3;
        ay = y + h / 2 - r3;
        points = new graphicsentity.Arc(ax, ay, r3, Math.PI * 1.5, Math.PI * 2).GetPoints();
        self.points.push(...points);

        ax = x + wt / 2 - r2;
        ay = y + h / 2 - tft + (Math.tan(slope) * (wt / 4 - r2) + r2);
        points = new graphicsentity.Arc(ax, ay, r2, Math.PI * 0, Math.PI * 0.5).GetPoints();
        self.points.push(...points);

        ax = x + tw / 2 + r1;
        ay = y + h / 2 - tft - (Math.tan(slope) * ((x - tw / 2 - r1) - (x - wt / 4))) - r1;
        points = new graphicsentity.Arc(ax, ay, r1, Math.PI * 1.5, Math.PI * 1, true).GetPoints();
        self.points.push(...points);

        ax = x + tw / 2 + r1;
        ay = y - h / 2 + tfb + (Math.tan(slope) * ((x - tw / 2 - r1) - (x - wb / 4))) + r1;
        points = new graphicsentity.Arc(ax, ay, r1, Math.PI * 1, Math.PI * 0.5, true).GetPoints();
        self.points.push(...points);

        ax = x + wb / 2 - r2;
        ay = y - h / 2 + tfb - (Math.tan(slope) * (wb / 4 - r2) + r2);
        points = new graphicsentity.Arc(ax, ay, r2, Math.PI * 1.5, Math.PI * 2).GetPoints();
        self.points.push(...points);

        ax = x + wb / 2 - r3;
        ay = y - h / 2 + r3;
        points = new graphicsentity.Arc(ax, ay, r3, Math.PI * 0, Math.PI * 0.5).GetPoints();
        self.points.push(...points);

        if (self.a) {
            self.Rotate(self.a);
        }
    };

    self.Refresh();
};

canvasgraphics.SlopedI = function (param) {
    canvasgraphics.Polygon.call(this, param);

    let points;
    let self = this;

    self.x = param.x;
    self.y = param.y;
    self.wt = param.wt;
    self.wb = param.wb;
    self.h = param.h;
    self.tw = param.tw;
    self.tft = param.tft;
    self.tfb = param.tfb;
    self.oft = param.oft;
    self.ofb = param.ofb;
    self.a = param.a;

    self.Refresh = function () {
        let x = self.x;
        let y = self.y;
        let wt = self.wt;
        let wb = self.wb;
        let h = self.h;
        let tw = self.tw;
        let tft = self.tft;
        let tfb = self.tfb;
        let oft = self.oft;
        let ofb = self.ofb;

        self.points = [
            { x: x - wb / 2, y: y - h / 2 }, //1
            { x: x - wb / 2, y: y - h / 2 + tfb }, //2
            { x: x - tw / 2, y: y - h / 2 + tfb + ofb }, //3
            { x: x - tw / 2, y: y + h / 2 - tft - oft }, //4
            { x: x - wt / 2, y: y + h / 2 - tft }, //5
            { x: x - wt / 2, y: y + h / 2 }, //6
            { x: x + wt / 2, y: y + h / 2 }, //7
            { x: x + wt / 2, y: y + h / 2 - tft }, //8
            { x: x + tw / 2, y: y + h / 2 - tft - oft }, //9
            { x: x + tw / 2, y: y - h / 2 + tfb + ofb }, //10
            { x: x + wb / 2, y: y - h / 2 + tfb }, //11
            { x: x + wb / 2, y: y - h / 2 } //12
        ];

        if (self.a) {
            self.Rotate(self.a);
        }
    };

    self.Refresh();
};

canvasgraphics.Angle = function (param) {
    canvasgraphics.Polygon.call(this, param);

    let points;
    let self = this;

    self.x = param.x;
    self.y = param.y;
    self.w = param.w;
    self.h = param.h;
    self.tw = param.tw;
    self.tf = param.tf;
    self.a = param.a;

    self.Refresh = function () {
        let x = self.x;
        let y = self.y;
        let w = self.w;
        let h = self.h;
        let tw = self.tw;
        let tf = self.tf;

        self.points = [
            { x: x - w / 2, y: y - h / 2 }, //1
            { x: x - w / 2, y: y + h / 2 }, //2
            { x: x - w / 2 + tw, y: y + h / 2 }, //3
            { x: x - w / 2 + tw, y: y - h / 2 + tf }, //4
            { x: x + w / 2, y: y - h / 2 + tf }, //5
            { x: x + w / 2, y: y - h / 2 }, //6
        ];

        if (self.a) {
            self.Rotate(self.a);
        }
    };

    self.Refresh();
};

canvasgraphics.SteelAngle = function (param) {
    canvasgraphics.Polygon.call(this, param);

    let points;
    let self = this;

    self.property.fillcolor = "rgba(152, 173, 190, 0.6)";
    self.selectedproperty.fillcolor = "rgba(153, 153, 0, 0.6)";

    self.x = param.x;
    self.y = param.y;
    self.w = param.w;
    self.h = param.h;
    self.tw = param.tw;
    self.tf = param.tf;
    self.r1 = param.r1;
    self.r2 = param.r2;
    self.r3 = param.r3;
    self.r4 = param.r4;
    self.a = param.a;

    self.Render = function (renderer) {
        renderer.DrawSteelAngle(self.x, self.y, self.w, self.h, self.tw, self.tf, self.r1, self.r2, self.r3, self.r4, self.GetProperty());
    };

    self.Refresh = function () {
        let x = self.x;
        let y = self.y;
        let w = self.w;
        let h = self.h;
        let tw = self.tw;
        let tf = self.tf;
        let r1 = self.r1;
        let r2 = self.r2;
        let r3 = self.r3;
        let r4 = self.r4;

        let ax, ay, points;

        self.points = [];

        ax = x - w / 2 + r4;
        ay = y - h / 2 + r4;
        points = new graphicsentity.Arc(ax, ay, r4, Math.PI * 0.5, Math.PI).GetPoints();
        self.points.push(...points);

        ax = x - w / 2 + r3;
        ay = y + h / 2 - r3;
        points = new graphicsentity.Arc(ax, ay, r3, Math.PI * 1, Math.PI * 1.5).GetPoints();
        self.points.push(...points);

        ax = x - w / 2 + tw - r2;
        ay = y + h / 2 - r2;
        points = new graphicsentity.Arc(ax, ay, r2, Math.PI * 1.5, Math.PI * 2).GetPoints();
        self.points.push(...points);

        ax = x - w / 2 + tw + r1;
        ay = y - h / 2 + tf + r1;
        points = new graphicsentity.Arc(ax, ay, r1, Math.PI * 1, Math.PI * 0.5, true).GetPoints();
        self.points.push(...points);

        ax = x + w / 2 - r2;
        ay = y - h / 2 + tf - r2;
        points = new graphicsentity.Arc(ax, ay, r2, Math.PI * 1.5, Math.PI * 2).GetPoints();
        self.points.push(...points);

        ax = x + w / 2 - r3;
        ay = y - h / 2 + r3;
        points = new graphicsentity.Arc(ax, ay, r3, Math.PI * 0, Math.PI * 0.5).GetPoints();
        self.points.push(...points);

        if (self.a) {
            self.Rotate(self.a);
        }
    };

    self.Refresh();
};

canvasgraphics.Channel = function (param) {
    canvasgraphics.Polygon.call(this, param);

    let points;
    let self = this;

    self.x = param.x;
    self.y = param.y;
    self.wt = param.wt;
    self.wb = param.wb;
    self.h = param.h;
    self.tw = param.tw;
    self.tft = param.tft;
    self.tfb = param.tfb;
    self.a = param.a;

    self.Refresh = function () {
        let x = self.x;
        let y = self.y;
        let wt = self.wt;
        let wb = self.wb;
        let h = self.h;
        let tw = self.tw;
        let tft = self.tft;
        let tfb = self.tfb;

        let wMax = Math.max(wt, wb);

        self.points = [
            { x: x - wMax / 2, y: y - h / 2 }, //1
            { x: x - wMax / 2, y: y + h / 2 }, //2
            { x: x - wMax / 2 + wt, y: y + h / 2 }, //3
            { x: x - wMax / 2 + wt, y: y + h / 2 - tft }, //4
            { x: x - wMax / 2 + tw, y: y + h / 2 - tft }, //5
            { x: x - wMax / 2 + tw, y: y - h / 2 + tfb }, //6
            { x: x - wMax / 2 + wb, y: y - h / 2 + tfb }, //7
            { x: x - wMax / 2 + wb, y: y - h / 2 }, //8
        ];

        if (self.a) {
            self.Rotate(self.a);
        }
    };

    self.Refresh();
};

canvasgraphics.SteelChannel = function (param) {
    canvasgraphics.Polygon.call(this, param);

    let self = this;

    self.property.fillcolor = "rgba(152, 173, 190, 0.6)";
    self.selectedproperty.fillcolor = "rgba(153, 153, 0, 0.6)";

    self.x = param.x;
    self.y = param.y;
    self.wt = param.wt;
    self.wb = param.wb;
    self.h = param.h;
    self.tw = param.tw;
    self.tft = param.tft;
    self.tfb = param.tfb;
    self.r1 = param.r1;
    self.r2 = param.r2;
    self.r3 = param.r3;
    self.r4 = param.r4;
    self.slope = param.slope;
    self.a = param.a;

    self.points;

    self.Render = function (renderer) {
        renderer.DrawSteelChannel(self.x, self.y, self.wt, self.wb, self.h, self.tw, self.tft, self.tfb, self.r1, self.r2, self.r3, self.r4, self.slope, self.GetProperty());
    }

    self.Refresh = function () {
        let x = self.x;
        let y = self.y;
        let wt = self.wt;
        let wb = self.wb;
        let h = self.h;
        let tw = self.tw;
        let tft = self.tft;
        let tfb = self.tfb;
        let r1 = self.r1;
        let r2 = self.r2;
        let r3 = self.r3;
        let r4 = self.r4;
        let slope = self.slope * Math.PI / 180;

        let ax, ay, points;

        let ut = wb / 2;
        let ub = wt / 2;

        if (h > 300) {
            ut = (wb - tw) / 2;
            ub = (wt - tw) / 2;
        }

        let wMax = Math.max(wt, wb);

        self.points = [];

        ax = x - wMax / 2 + r4;
        ay = y - h / 2 + r4;
        points = new graphicsentity.Arc(ax, ay, r4, Math.PI * 0.5, Math.PI * 1).GetPoints();
        self.points.push(...points);

        ax = x - wMax / 2 + r4;
        ay = y + h / 2 - r4;
        points = new graphicsentity.Arc(ax, ay, r4, Math.PI * 1, Math.PI * 1.5).GetPoints();
        self.points.push(...points);

        ax = x - wMax / 2 + wt - r3;
        ay = y + h / 2 - r3;
        points = new graphicsentity.Arc(ax, ay, r3, Math.PI * 1.5, Math.PI * 2).GetPoints();
        self.points.push(...points);

        ax = x - wMax / 2 + wt - r2;
        ay = y + h / 2 - tft + (Math.tan(slope) * (ub - r2) + r2);
        points = new graphicsentity.Arc(ax, ay, r2, Math.PI * 0, Math.PI * 0.5).GetPoints();
        self.points.push(...points);

        ax = x - wMax / 2 + tw + r1;
        ay = y + h / 2 - tft - (Math.tan(slope) * ((x - tw / 2 - r1) - (x - wt / 2 + ub))) - r1;
        points = new graphicsentity.Arc(ax, ay, r1, Math.PI * 1.5, Math.PI * 1, true).GetPoints();
        self.points.push(...points);

        ax = x - wMax / 2 + tw + r1;
        ay = y - h / 2 + tfb + (Math.tan(slope) * ((x - tw / 2 - r1) - (x - wb / 2 + ut))) + r1;
        points = new graphicsentity.Arc(ax, ay, r1, Math.PI * 1, Math.PI * 0.5, true).GetPoints();
        self.points.push(...points);

        ax = x - wMax / 2 + wb - r2;
        ay = y - h / 2 + tfb - (Math.tan(slope) * (ut - r2) + r2);
        points = new graphicsentity.Arc(ax, ay, r2, Math.PI * 1.5, Math.PI * 2).GetPoints();
        self.points.push(...points);

        ax = x - wMax / 2 + wb - r3;
        ay = y - h / 2 + r3;
        points = new graphicsentity.Arc(ax, ay, r3, Math.PI * 0, Math.PI * 0.5).GetPoints();
        self.points.push(...points);

        if (self.a) {
            self.Rotate(self.a);
        }
    };

    self.Refresh();
};

canvasgraphics.SlopedChannel = function (param) {
    canvasgraphics.Polygon.call(this, param);

    let points;
    let self = this;

    self.x = param.x;
    self.y = param.y;
    self.wt = param.wt;
    self.wb = param.wb;
    self.h = param.h;
    self.tw = param.tw;
    self.tft = param.tft;
    self.tfb = param.tfb;
    self.oft = param.oft;
    self.ofb = param.ofb;
    self.a = param.a;

    self.Refresh = function () {
        let x = self.x;
        let y = self.y;
        let wt = self.wt;
        let wb = self.wb;
        let h = self.h;
        let tw = self.tw;
        let tft = self.tft;
        let tfb = self.tfb;
        let oft = self.oft;
        let ofb = self.ofb;

        let wMax = Math.max(wt, wb);

        self.points = [
            { x: x - wMax / 2, y: y - h / 2 }, //1
            { x: x - wMax / 2, y: y + h / 2 }, //2
            { x: x - wMax / 2 + wt, y: y + h / 2 }, //3
            { x: x - wMax / 2 + wt, y: y + h / 2 - tft }, //4
            { x: x - wMax / 2 + tw, y: y + h / 2 - tft - oft }, //5
            { x: x - wMax / 2 + tw, y: y - h / 2 + tfb + ofb }, //6
            { x: x - wMax / 2 + wb, y: y - h / 2 + tfb }, //7
            { x: x - wMax / 2 + wb, y: y - h / 2 }, //8
        ];

        if (self.a) {
            self.Rotate(self.a);
        }
    };

    self.Refresh();
};

canvasgraphics.Tube = function (param) {
    canvasgraphics.Polygon.call(this, param);

    let points;
    let self = this;

    self.x = param.x;
    self.y = param.y;
    self.w = param.w;
    self.h = param.h;
    self.t = param.t;
    self.a = param.a;

    self.Refresh = function () {
        self.x1 = self.x - self.w / 2;
        self.x2 = self.x + self.w / 2;

        self.y1 = self.y - self.h / 2;
        self.y2 = self.y + self.h / 2;

        self.points = [
            { x: self.x1, y: self.y1, parent: self }, //1
            { x: self.x1, y: self.y2, parent: self }, //2
            { x: self.x2, y: self.y2, parent: self }, //3
            { x: self.x2, y: self.y1, parent: self } //4
        ];

        self.holes.push({
            type: "polygon",
            points: [
                { x: self.x + self.w / 2 - self.t, y: self.y - self.h / 2 + self.t, parent: self }, //8,
                { x: self.x + self.w / 2 - self.t, y: self.y + self.h / 2 - self.t, parent: self }, //7,
                { x: self.x - self.w / 2 + self.t, y: self.y + self.h / 2 - self.t, parent: self }, //6,
                { x: self.x - self.w / 2 + self.t, y: self.y - self.h / 2 + self.t, parent: self } //5
            ]
        });

        if (self.a) {
            self.Rotate(self.a);
        }
    };

    self.Refresh();
};

canvasgraphics.Pipe = function (param) {
    canvasgraphics.Polygon.call(this, param);

    let points;
    let self = this;

    self.x = param.x;
    self.y = param.y;
    self.r = param.r;
    self.t = param.t;
    self.a = param.a;

    self.Render = function (renderer) {
        renderer.DrawPipe(self.x, self.y, self.r, (self.r - self.t), self.GetProperty());
    };

    self.Refresh = function () {
        self.points = new graphicsentity.Circle(self.x, self.y, self.r).GetPoints();

        self.holes.push({
            type: "circle",
            x: self.x,
            y: self.y,
            r: self.r - self.t,
            points: new graphicsentity.Circle(self.x, self.y, self.r - self.t).GetPoints()
        });
    };

    self.Refresh();
};

//Dimensions
canvasgraphics.DimensionLine = function (param) {
    canvasgraphics.call(this);

    this.points;

    this.property.scale = false;
    this.property.linecolor = "#88F";
    this.property.fillcolor = "#88F";
    this.property.showfill = false;

    this.x1 = new mobiwork.PropertyDouble({ text: "X1", value: param.x1, unit: units.length });
    this.y1 = new mobiwork.PropertyDouble({ text: "Y1", value: param.y1, unit: units.length });

    this.x2 = new mobiwork.PropertyDouble({ text: "X2", value: param.x2, unit: units.length });
    this.y2 = new mobiwork.PropertyDouble({ text: "Y2", value: param.y2, unit: units.length });

    this.name = param.name;

    if (param.offset === undefined)
        param.offset = 150;

    this.offset = new mobiwork.PropertyDouble({ text: "Offset", value: param.offset, unit: units.length });

    this.cr;
    this.angle = 0;

    let o1;
    let o2;
    let text;

    let textcolor = "#000000";
    let position = "bottom";


    this.Render = function (renderer) {
        this.Refresh(renderer);

        renderer.DrawLine(this.points[0].x, this.points[0].y, this.points[1].x, this.points[1].y, this.property);
        renderer.DrawLine(this.points[2].x, this.points[2].y, this.points[3].x, this.points[3].y, this.property);
        renderer.DrawLine(this.points[4].x, this.points[4].y, this.points[5].x, this.points[5].y, this.property);

        renderer.DrawCircle(this.points[6].x, this.points[6].y, this.cr, this.property);
        renderer.DrawCircle(this.points[7].x, this.points[7].y, this.cr, this.property);

        let fontsize = 32 * renderer.GetZoomValue();
        fontsize = 12;

        let font = "normal " + fontsize + "px sans-serif";

        renderer.DrawText(text, this.points[8].x, this.points[8].y, font, this.property.textcolor, this.angle, undefined, position);
    };

    this.Refresh = function (renderer) {
        this.points = [];

        let offset = this.offset.GetValue();

        if (renderer) {
            o1 = renderer.ToPointWidth(15);
            o2 = o1;
            this.cr = renderer.ToPointWidth(4);
        } else {
            o1 = Math.abs(offset) * 0.15;
            o2 = o1;
            this.cr = Math.abs(offset) * 0.1;
        }

        let dir = 0;

        if (offset > 0)
            dir = 1;
        else
            dir = -1;

        let x1 = this.x1.GetValue();
        let y1 = this.y1.GetValue();

        let x2 = this.x2.GetValue();
        let y2 = this.y2.GetValue();

        let line = new graphicsentity.Line2F(x1, y1, x2, y2);
        this.angle = line.GetAngle();

        let length = line.GetLength();

        if (offset > 0)
            position = "bottom";
        else
            position = "top";

        x2 = x1 + length;

        //Top line (Main line)
        this.points.push({ x: x1 - o2, y: y1 + offset });
        this.points.push({ x: x2 + o2, y: y1 + offset });


        this.points.push({ x: x1, y: y1 + o1 * dir });
        this.points.push({ x: x1, y: y1 + offset + o2 * dir });

        this.points.push({ x: x2, y: y1 + o1 * dir });
        this.points.push({ x: x2, y: y1 + offset + o2 * dir });

        this.points.push({ x: x1, y: y1 + offset });
        this.points.push({ x: x2, y: y1 + offset });

        this.points.push({ x: (x1 + x2) / 2, y: y1 + offset });

        if (this.angle !== 0) {
            let a = Math.PI * this.angle / 180;
            let sina = Math.sin(a);
            let cosa = Math.cos(a);

            let cx = x1;
            let cy = y1;
            let x, y;

            for (let i = 0; i < this.points.length; i++) {
                x = this.points[i].x - cx;
                y = this.points[i].y - cy;

                this.points[i].x = cx + cosa * x + sina * y;
                this.points[i].y = cy - sina * x + cosa * y;
            }
        }

        //Text
        length = new mobiwork.PropertyDouble({
            value: Math.sqrt((this.x1.value - this.x2.value) * (this.x1.value - this.x2.value) + (this.y1.value - this.y2.value) * (this.y1.value - this.y2.value)),
            unit: units.length
        });

        text = this.name + " = " + length.DisplayValue();
    };

    this.UpdateBounds = function (bounds) {
        let x1 = this.points[0].x;
        let y1 = this.points[0].y;
        let x2 = this.points[1].x;
        let y2 = this.points[1].y;

        if (x1 < bounds.x1)
            bounds.x1 = x1;

        if (x2 > bounds.x2)
            bounds.x2 = x2;

        if (y1 < bounds.y1)
            bounds.y1 = y1;

        if (y2 > bounds.y2)
            bounds.y2 = y2;

    };

    this.GetModel = function () {
        return {
            name: this.name,
            x1: this.x1.value,
            y1: this.y1.value,
            x2: this.x2.value,
            y2: this.y2.value,
            offset: this.offset.value / units.length.value.value
        }
    };

    if (this.Refresh)
        this.Refresh();
};

canvasgraphics.VerticalDimensionLine = function (param) {
    canvasgraphics.DimensionLine.call(this, param);

    let text;
    let a = param.a;

    this.Refresh = function (renderer) {
        let o1;
        let o2;

        this.angle = 0;
        this.points = [];

        let offset = this.offset.GetValue();

        if (renderer) {
            o1 = renderer.ToPointWidth(15);
            o2 = o1;
            this.cr = renderer.ToPointWidth(4);
        } else {
            o1 = Math.abs(offset) * 0.15;
            o2 = o1;
            this.cr = Math.abs(offset) * 0.1; //renderer.ToPointWidth(4);
        }

        let dir = 0;

        if (offset > 0)
            dir = 1;
        else
            dir = -1;

        let x1 = this.x1.GetValue();
        let y1 = this.y1.GetValue();

        let x2 = this.x2.GetValue();
        let y2 = this.y2.GetValue();

        let line = new graphicsentity.Line2F(x1, y1, x2, y2);
        let langle = Math.PI * line.GetAngle() / 180;

        if (offset > 0)
            position = "bottom";
        else
            position = "top";

        if (x1 < x2) {
            //  /
            this.points.push({ x: x1 - offset, y: y1 });
            this.points.push({ x: x2 - offset - (x2 - x1), y: y2 });

            //Bottom
            this.points.push({ x: x1 - o1, y: y1 });
            this.points.push({ x: x1 - o2 - offset, y: y1 });

            //Top
            this.points.push({ x: x2 - o1, y: y2 });
            this.points.push({ x: x2 - o2 - offset - (x2 - x1), y: y2 });

            //Circle
            this.points.push({ x: x1 - offset, y: y1 });
            this.points.push({ x: x2 - offset - (x2 - x1), y: y2 });

        } else {
            //  \ or |
            this.points.push({ x: x1 - offset - (x1 - x2), y: y1 });
            this.points.push({ x: x2 - offset, y: y2 });

            //Bottom
            this.points.push({ x: x1 - o1, y: y1 });
            this.points.push({ x: x1 - o2 - offset - (x1 - x2), y: y1 });

            //Top
            this.points.push({ x: x2 - o1, y: y2 });
            this.points.push({ x: x2 - o2 - offset, y: y2 });

            //Circle
            this.points.push({ x: x1 - offset - (x1 - x2), y: y1 });
            this.points.push({ x: x2 - offset, y: y2 });
        }

        //Text
        this.points.push({ x: this.points[0].x, y: (this.points[0].y + this.points[1].y) / 2 });

        if (this.angle !== 0) {
            let angle = this.angle + langle + Math.PI / 2;
            let sina = Math.sin(angle);
            let cosa = Math.cos(angle);

            let cx = x1;
            let cy = y1;
            let x, y;

            for (let i = 0; i < this.points.length; i++) {
                x = this.points[i].x - cx;
                y = this.points[i].y - cy;

                this.points[i].x = cx + cosa * x + sina * y;
                this.points[i].y = cy - sina * x + cosa * y;
            }
        }

        //this.angle = a - 90;

        //Text
        let length = new mobiwork.PropertyDouble({
            value: Math.sqrt((this.x1.value - this.x2.value) * (this.x1.value - this.x2.value) + (this.y1.value - this.y2.value) * (this.y1.value - this.y2.value)),
            unit: units.length
        });

        text = this.name + " = " + length.DisplayValue();
    };
};

canvasgraphics.InclinedDimLine = function (param) {
    canvasgraphics.call(this);

    let points;

    this.property.scale = false;
    this.property.linecolor = "#88F";
    this.property.fillcolor = "#88F";
    this.property.showfill = false;

    this.x = new mobiwork.PropertyDouble({ text: "X", value: param.x, unit: units.length });
    this.y = new mobiwork.PropertyDouble({ text: "Y", value: param.y, unit: units.length });

    this.r = new mobiwork.PropertyDouble({ text: "R", value: param.r, unit: units.length });

    this.name = param.name;

    if (!param.offset)
        param.offset = 150;

    this.offset = new mobiwork.PropertyDouble({ text: "Offset", value: param.offset, unit: units.length });

    let o1;
    let o2;
    let cr;
    let text;

    let textcolor = "#000000";
    let position = "bottom";

    if (!param.a)
        param.a = 90;

    this.angle = new mobiwork.PropertyDouble({ text: "Angle", value: param.a, unit: units.angle });

    this.Render = function (renderer) {
        this.Refresh(renderer);

        renderer.DrawLine(points[0].x, points[0].y, points[1].x, points[1].y, this.property);
        renderer.DrawLine(points[2].x, points[2].y, points[3].x, points[3].y, this.property);
        renderer.DrawLine(points[4].x, points[4].y, points[5].x, points[5].y, this.property);

        renderer.DrawCircle(points[6].x, points[6].y, cr, this.property);
        renderer.DrawCircle(points[7].x, points[7].y, cr, this.property);

        let fontsize = 32 * renderer.GetZoomValue();
        fontsize = 12;

        let font = "normal " + fontsize + "px sans-serif";

        renderer.DrawText(text, points[8].x, points[8].y, font, this.property.textcolor, this.angle.value, undefined, position);
    };

    this.Refresh = function (renderer) {
        points = [];

        let offset = this.offset.GetValue();

        if (renderer) {
            o1 = renderer.ToPointWidth(15);
            o2 = o1;
            cr = renderer.ToPointWidth(4);
        } else {
            o1 = Math.abs(offset) * 0.15;
            o2 = o1;
            cr = Math.abs(offset) * 0.1; //renderer.ToPointWidth(4);
        }

        let dir = 0;

        if (offset > 0)
            dir = 1;
        else
            dir = -1;

        let x1 = this.x.GetValue();
        let y1 = this.y.GetValue();

        let x2 = this.x.GetValue() + this.r.GetValue();
        let y2 = this.y.GetValue();

        let angle = this.angle.value;

        if (offset > 0)
            position = "bottom";
        else
            position = "top";

        points.push({ x: x1 - o2, y: y1 + offset });
        points.push({ x: x2 + o2, y: y1 + offset });

        points.push({ x: x1, y: y1 + o1 * dir });
        points.push({ x: x1, y: y1 + offset + o2 * dir });

        points.push({ x: x2, y: y1 + o1 * dir });
        points.push({ x: x2, y: y1 + offset + o2 * dir });

        points.push({ x: x1, y: y1 + offset });
        points.push({ x: x2, y: y1 + offset });

        points.push({ x: (x1 + x2) / 2, y: y1 + offset });

        if (angle !== 0) {
            let a = Math.PI * angle / 180;
            let sina = Math.sin(a);
            let cosa = Math.cos(a);

            let cx = x1;
            let cy = y1;
            let x, y;

            for (let i = 0; i < points.length; i++) {
                x = points[i].x - cx;
                y = points[i].y - cy;

                points[i].x = cx + cosa * x + sina * y;
                points[i].y = cy - sina * x + cosa * y;
            }
        }

        //Text
        let length = new mobiwork.PropertyDouble({
            value: Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)),
            unit: units.length
        });

        text = this.name + " = " + length.DisplayValue();
    };

    this.UpdateBounds = function (bounds) {
        let x1 = points[0].x;
        let y1 = points[0].y;
        let x2 = points[1].x;
        let y2 = points[1].y;

        if (x1 < bounds.x1)
            bounds.x1 = x1;

        if (x2 > bounds.x2)
            bounds.x2 = x2;

        if (y1 < bounds.y1)
            bounds.y1 = y1;

        if (y2 > bounds.y2)
            bounds.y2 = y2;

    };

    this.GetModel = function () {
        return {
            name: this.name,
            x1: this.x1.value,
            y1: this.y1.value,
            x2: this.x2.value,
            y2: this.y2.value,
            offset: this.offset.value / units.length.value.value
        }
    };

    this.Refresh();
};

function Rotate(x, y, cx, cy, angle) {
    var a = angle;
    let x_ = cx + Math.cos(a) * (x - cx) - Math.sin(a) * (y - cy);
    let y_ = cy + Math.sin(a) * (x - cx) + Math.cos(a) * (y - cy);

    return { x: x_, y: y_ }
};
