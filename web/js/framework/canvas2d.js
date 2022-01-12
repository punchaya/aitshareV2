/* global mobiwork, BABYLON, GET, THREE */

var VIEWTYPE = {
    XY: { value: 1 },
    XZ: { value: 2 },
    YZ: { value: 3 }
};

var canvassettings = function () {
    this.SHOWGRID = true;
    this.SHOWRULER = true;
    this.SHOWLABEL = false;

    this.SNAPGRID = true;
    this.SNAPPOINT = true;
    this.SNAPLINE = true;
    this.SHOWAXIS = true;
    this.FLOATAXIS = true;
    this.ALLOWPAN = true;
    this.ALLOWZOOM = true;
    this.ALLOWSELECT = true;
    this.SHOWDIMENSIONS = true;

    this.background = "#000";
    this.axis = "#444";
    this.major = "#222";
    this.minor = "#111";
    this.ruler = "#111";
    this.rulertext = "#888";
    this.rulerline = "#555";
    this.fontcolor = "#FFF";
    this.labelx = "X";
    this.labely = "Y";
    this.font = "sans-serif";
    this.guide;

    this.BlackTheme = function () {
        this.background = "#000";
        this.axis = "#444";
        this.major = "#333";
        this.minor = "#222";
        this.ruler = "#111";
        this.rulertext = "#888";
        this.rulerline = "#555";
        this.fontcolor = "#FFF";
        this.guide = "rgba(255, 255, 0, 0.5)";
    };

    this.WhiteTheme = function () {
        this.background = "#FFF";
        this.axis = "#CCC";
        this.major = "#DDD";
        this.minor = "#EEE";
        this.ruler = "#FFF";
        this.rulertext = "#555";
        this.rulerline = "#AAA";
        this.fontcolor = "#000";
        this.guide = "rgba(0, 0, 255, 0.5)";
    };

    this.WhiteTheme();
};

mobiwork.Mouse = function (c) {
    let canvas = c;
    this.ismousedown = false;
    this.down = { x: 0, y: 0 };
    this.downsnap = { x: 0, y: 0 };
    this.downsnaplist = [];
    this.current = { x: 0, y: 0 };
    this.currentsnap = { x: 0, y: 0 };
    this.previous = { x: 0, y: 0 };
    this.previoussnap = { x: 0, y: 0 };
    this.delta = 0;
    this.mousedowncount = 0;

    this.ToPoints = function () {
        return new graphicsentity.Bounds2F(
            canvas.ToPointX(this.down.x),
            canvas.ToPointY(this.down.y),
            canvas.ToPointX(this.current.x),
            canvas.ToPointY(this.current.y),
        );
    }

    this.ToBounds = function () {
        if (this.down.x < this.current.x) {
            if (this.down.y > this.current.y) {
                return new graphicsentity.Bounds2F(
                    canvas.ToPointX(this.down.x),
                    canvas.ToPointY(this.down.y),
                    canvas.ToPointX(this.current.x),
                    canvas.ToPointY(this.current.y),
                );
            }
            else {
                return new graphicsentity.Bounds2F(
                    canvas.ToPointX(this.down.x),
                    canvas.ToPointY(this.current.y),
                    canvas.ToPointX(this.current.x),
                    canvas.ToPointY(this.down.y),
                );
            }
        }
        else {
            if (this.down.y > this.current.y) {
                return new graphicsentity.Bounds2F(
                    canvas.ToPointX(this.current.x),
                    canvas.ToPointY(this.down.y),
                    canvas.ToPointX(this.down.x),
                    canvas.ToPointY(this.current.y),
                );
            }
            else {
                return new graphicsentity.Bounds2F(
                    canvas.ToPointX(this.current.x),
                    canvas.ToPointY(this.current.y),
                    canvas.ToPointX(this.down.x),
                    canvas.ToPointY(this.down.y),
                );
            }
        }
    }
};

mobiwork.Canvas2D = function (param) {
    mobiwork.call(this, param);

    let self = this;

    this.class = "canvas";
    this.model = new canvasmodel();
    this.onfocus = true;

    let context;
    let contextbackup;
    let canvas;
    let buffer;
    let canvasobject;

    let left;
    let top;
    let width;
    let height;

    let center;
    let gridvalue;
    let middle;
    let gridsize;
    let defaultgridsize;
    let zoomvalue;
    let rulersize;

    let devicePixelRatio;

    const toradian = Math.PI / 180;
    const mouse = new mobiwork.Mouse(this);

    let coordinateproperties;
    let coordinatefont;

    this.settings = new canvassettings();
    this.scalefactor;

    this.Initialize = function () {
        gridvalue = { x: 1, y: 1 };
        middle = { x: 0, y: 0 };
        gridsize = 100;
        defaultgridsize = 100;
        zoomvalue = 1;
        rulersize = 30;

        center = {};
        center.x = rulersize + Math.round((width - rulersize) / 2);
        center.y = rulersize + Math.round((height - rulersize) / 2);

        coordinateproperties = new canvasgraphics.DrawProperties();
        coordinateproperties.linecolor = "#00F";
        coordinateproperties.fillcolor = "#00F";

        coordinatefont = "normal 12px " + self.settings.font;
        self.font = "normal 12px " + self.settings.font;
    };

    this.Refresh = function () {
        self.object.empty();
        self.object.append("<canvas></canvas>");
        canvasobject = self.object.find("canvas");

        canvas = self.object[0].querySelector("canvas");
        context = canvas.getContext('2d');

        //Children
        if (self.children.length !== 0) {
            let children = $("<div class='children'></div>");
            self.object.append(children);

            for (let i = 0; i < self.children.length; i++)
                if (self.children[i].Show) {
                    self.children[i].Show(children, self);
                }
        }

        self.Resize();
        self.Events();

        let timer = setTimeout(function () {
            clearTimeout(timer);

            if (canvas) {
                self.Resize();
                self.Events();
                self.Render();
            } else {
                self = undefined;
            }
        }, 10);

        $(window).resize(function () {
            if (canvas) {
                self.Resize();
                self.Events();
            }
        });
    };

    this.Dispose = function () {
        canvasobject.remove();
        self.object.remove();

        canvas = undefined;
        context = undefined;
        canvasobject = undefined;
        self.RemoveEventListeners();
    };

    //Rendering

    this.Render = function () {
        this.BasicRectangle(0, 0, width, height, this.settings.background, this.settings.background);

        if (this.settings.SHOWGRID)
            this.DrawGrid();

        //Render Model
        if (this.model)
            this.model.Render(this);

        if (this.settings.SHOWAXIS)
            this.DrawCoordinate();

        if (this.settings.SHOWRULER) {
            this.BasicRectangle(0, 0, rulersize, height, this.settings.ruler, this.settings.ruler);
            this.BasicRectangle(0, 0, width, rulersize, this.settings.ruler, this.settings.ruler);
            this.DrawAxis();
        }
    };

    this.RenderPDF = function (pdf) {
        if (this.model)
            this.model.RenderPDF(pdf);
    };

    this.ExportDXF = function () {
        return self.model.ExportDXF();
    };

    this.Invalidate = function () {
        this.Render();
        this.StoreBuffer();
    };

    this.StoreBuffer = function () {
        buffer = self.RenderToCanvas(width, height, function (_context) {
            context = _context;
            self.Render();

            contextbackup = context;
        });

        context = canvas.getContext('2d');
    };

    this.RestoreBuffer = function () {
        if (!buffer)
            self.StoreBuffer();

        context.imageSmoothingEnabled = false;
        context.drawImage(buffer, 0, 0);
    };

    this.RenderToCanvas = function (width, height, renderFunction) {
        let _canvas = document.createElement('canvas');
        _canvas.width = canvas.width;
        _canvas.height = canvas.height;

        let _context = _canvas.getContext('2d');

        renderFunction(_context);

        return _canvas;
    };


    //Drawings

    this.DrawGrid = function () {
        let root = Math.pow(10, Math.round(Math.log(gridsize * gridvalue.x) / Math.LN10)) / 100;
        let gridinterval = gridvalue.x / root;

        let x1 = this.ToCoordX(0);
        let x2 = x1;
        let y1 = this.ToCoordY(0);
        let y2 = y1;

        let axisx = x1;
        let axisy = y1;

        let minorinterval = gridsize * gridinterval / 10;
        let majorinterval = minorinterval * 10;

        if (minorinterval < 10) {
            minorinterval *= 10;
            majorinterval *= 10;
            gridinterval *= 10;
        }

        //Minor x
        if (minorinterval >= 10) {
            while (x1 > 0 || x2 < width) {
                this.BasicLine(x1, 0, x1, height, this.settings.minor);
                x1 -= minorinterval;
                x2 += minorinterval;
                this.BasicLine(x2, 0, x2, height, this.settings.minor);
            }

            //Minor Y
            while (y1 > 0 || y2 < height) {
                this.BasicLine(0, y1, width, y1, this.settings.minor);
                y1 -= minorinterval;
                y2 += minorinterval;
                this.BasicLine(0, y2, width, y2, this.settings.minor);
            }
        }

        x1 = axisx;
        x2 = x1;
        y1 = axisy;
        y2 = y1;

        //Major x
        while (x1 > 0 || x2 < width) {
            this.BasicLine(x1, 0, x1, height, this.settings.major);
            //this.BasicText(x1, x1, axisy, font, fontcolor);

            x1 -= majorinterval;
            x2 += majorinterval;

            this.BasicLine(x2, 0, x2, height, this.settings.major);
            //this.BasicText(x2, x2, axisy, font, fontcolor);
        }

        //Major Y
        while (y1 > 0 || y2 < height) {
            this.BasicLine(0, y1, width, y1, this.settings.major);
            y1 -= majorinterval;
            y2 += majorinterval;
            this.BasicLine(0, y2, width, y2, this.settings.major);
        }

        //Axis
        x1 = axisx;
        x2 = x1;
        y1 = axisy;
        y2 = y1;

        this.BasicLine(x1, 0, x1, height, this.settings.axis);
        this.BasicLine(0, y1, width, y1, this.settings.axis);
    };

    this.DrawAxis = function () {
        let font = "normal 10px sans-serif";
        let fontlabel = "bold 12px sans-serif";
        let fontcolor = this.settings.rulertext;

        let x1 = 0;
        let y1 = 0;
        let angle = Math.PI * 270 / 180;

        let root = Math.pow(10, Math.round(Math.log(gridsize) / Math.LN10)) / 100;
        let intervalx = gridvalue.x / root;
        let intervaly = gridvalue.y / root;
        let intervalsize = this.ToCoordWidth(intervalx);

        if (intervalsize <= 50) {
            intervalx *= 2;
            intervaly *= 2;
        }
        else if (intervalsize <= 25) {
            intervalx *= 5;
            intervaly *= 5;
        }
        else if (intervalsize <= 75) {
            intervalx *= 2;
            intervaly *= 2;
        }

        let x2 = x1 + intervalx;
        let y2 = y1 + intervaly;

        let round = 0;

        if (intervalx <= 10)
            round = 2;


        let x = rulersize;
        let y = rulersize;
        let cy = height - y;

        //Major x
        let px1 = this.ToCoordX(x1);
        let px2 = this.ToCoordX(x2);

        let labelpos = 10;

        while (px1 >= 0 || px2 < width) {
            if (gridvalue.x >= 1 && gridvalue.x <= 100) {
                if (px1 >= x && px1 < width) {
                    if (Math.abs(x1) >= 10000)
                        this.BasicText(x1.toExponential(1), px1, labelpos, font, fontcolor, 0, "center", "top");
                    else
                        this.BasicText(x1.toFixed(round), px1, labelpos, font, fontcolor, 0, "center", "top");

                    this.BasicLine(px1, rulersize - 5, px1, rulersize, this.settings.rulerline, 2);
                }

                if (px2 < width && px2 >= x) {
                    if (Math.abs(x2) >= 10000)
                        this.BasicText(x2.toExponential(1), px2, labelpos, font, fontcolor, 0, "center", "top");
                    else
                        this.BasicText(x2.toFixed(round), px2, labelpos, font, fontcolor, 0, "center", "top");

                    this.BasicLine(px2, rulersize - 5, px2, rulersize, this.settings.rulerline, 2);
                }
            } else {
                if (px1 >= x && px1 < width) {
                    if (Math.abs(x1) >= 10000 || gridvalue.x <= 0.01)
                        this.BasicText(x1.toExponential(1), px1, labelpos, font, fontcolor, 0, "center", "top");
                    else
                        this.BasicText(x1.toFixed(round), px1, labelpos, font, fontcolor, 0, "center", "top");

                    this.BasicLine(px1, rulersize - 5, px1, rulersize, this.settings.rulerline, 2);
                }

                if (px2 < width && px2 >= x) {
                    if (Math.abs(x2) >= 10000 || gridvalue.x <= 0.01)
                        this.BasicText(x2.toExponential(1), px2, labelpos, font, fontcolor, 0, "center", "top");
                    else
                        this.BasicText(x2.toFixed(round), px2, labelpos, font, fontcolor, 0, "center", "top");

                    this.BasicLine(px2, rulersize - 5, px2, rulersize, this.settings.rulerline, 2);
                }
            }

            x1 -= intervalx;
            x2 += intervalx;

            px1 = this.ToCoordX(x1);
            px2 = this.ToCoordX(x2);
        }

        //Major Y
        let py1 = this.ToCoordY(y1);
        let py2 = this.ToCoordY(y2);

        while (py2 > y || py1 <= height) {
            if (gridvalue.y >= 1 && gridvalue.y <= 100) {
                if (py1 > y && py1 <= height) {
                    if (Math.abs(y1) >= 10000)
                        this.BasicText(y1.toExponential(1), x - labelpos, py1, font, fontcolor, angle, "center", "bottom");
                    else
                        this.BasicText(y1.toFixed(round), x - labelpos, py1, font, fontcolor, angle, "center", "bottom");

                    this.BasicLine(x - 5, py1, x, py1, this.settings.rulerline, 2);
                }

                if (py2 <= height && py2 > y) {
                    if (Math.abs(y2) >= 10000)
                        this.BasicText(y2.toExponential(1), x - labelpos, py2, font, fontcolor, angle, "center", "bottom");
                    else
                        this.BasicText(y2.toFixed(round), x - labelpos, py2, font, fontcolor, angle, "center", "bottom");

                    this.BasicLine(x - 5, py2, x, py2, this.settings.rulerline, 2);
                }
            } else {
                if (py1 > y && py1 <= height) {
                    if (Math.abs(y1) >= 10000 || gridvalue.x <= 0.01)
                        this.BasicText(y1.toExponential(1), x - labelpos, py1, font, fontcolor, angle, "center", "bottom");
                    else
                        this.BasicText(y1.toFixed(round), x - labelpos, py1, font, fontcolor, angle, "center", "bottom");

                    this.BasicLine(x - 5, py1, x, py1, this.settings.rulerline, 2);
                }

                if (py2 <= height && py2 > y) {
                    if (Math.abs(y1) >= 10000 || gridvalue.x <= 0.01)
                        this.BasicText(y2.toExponential(1), x - labelpos, py2, font, fontcolor, angle, "center", "bottom");
                    else
                        this.BasicText(y2.toFixed(round), x - labelpos, py2, font, fontcolor, angle, "center", "bottom");

                    this.BasicLine(x - 5, py2, x, py2, this.settings.rulerline, 2);
                }
            }

            y1 -= intervaly;
            y2 += intervaly;

            py1 = this.ToCoordY(y1);
            py2 = this.ToCoordY(y2);
        }

        this.BasicLine(x, y, x, height, this.settings.rulerline, 2);
        this.BasicLine(x, y, width, y, this.settings.rulerline, 2);

        //Draw Label

        if (this.settings.SHOWLABEL) {
            this.BasicText(this.settings.labelx, width - 10, height - y - 10, fontlabel, fontcolor, 0, "right", "bottom");
            this.BasicText(this.settings.labely, x + 10, 10, fontlabel, fontcolor, angle, "right", "top");
        }

    };

    this.DrawCoordinate = function () {
        let height = this.ToPointWidth(100);
        let size = this.ToPointWidth(10);

        //X Arrow
        this.DrawArrow(0, 0, 0, height, size, size, coordinateproperties, false, true);

        //Y Arrow
        this.DrawArrow(0, 0, height, 0, size, size, coordinateproperties, false, true);

        //X Label
        this.DrawText(this.settings.labelx, height + size, 0, coordinatefont, "#000", undefined, "left", "middle");

        //Y Label
        this.DrawText(this.settings.labely, 0, height + size, coordinatefont, "#000", undefined, "center", "bottom");
    };

    this.DrawGuideLine = function (x, y) {
        let coordx = this.ToCoordX(x);
        let coordy = this.ToCoordY(y);

        this.GuideLine(0, coordy, width, coordy);
        this.GuideLine(coordx, 0, coordx, height);
    };

    this.BasicLine = function (x1, y1, x2, y2, color, linewidth) {
        context.beginPath();
        context.moveTo(x1 - 0.5, y1 - 0.5);
        context.lineTo(x2 - 0.5, y2 - 0.5);
        context.strokeStyle = color;

        if (linewidth === undefined)
            context.lineWidth = 1;
        else
            context.lineWidth = linewidth;

        context.stroke();
    };

    this.GuideLine = function (x1, y1, x2, y2) {
        context.save();

        context.beginPath();
        context.moveTo(x1 - 0.5, y1 - 0.5);
        context.lineTo(x2 - 0.5, y2 - 0.5);
        context.strokeStyle = this.settings.guide;
        context.lineWidth = 1;

        context.setLineDash([4, 2]);
        context.lineDashOffset = 2;
        context.stroke();

        context.restore();
    };

    this.BasicRectangle = function (x, y, w, h, fillcolor, linecolor) {
        let aw = w;
        let ah = h;
        let ax = x;
        let ay = y;

        context.fillStyle = fillcolor;
        context.strokeStyle = linecolor;
        context.lineWidth = 1;

        context.fillRect(ax, ay, aw, ah);
        context.strokeRect(ax, ay, aw, ah);
    };

    this.SelectRectangle = function (x, y, w, h, linecolor) {
        let aw = w;
        let ah = h;
        let ax = x;
        let ay = y;

        context.save();
        context.strokeStyle = linecolor;
        context.lineWidth = 1;

        context.setLineDash([4, 2]);
        context.lineDashOffset = 2;
        context.strokeRect(ax, ay, aw, ah);
        context.restore();
    };

    this.BasicCircle = function (x, y, radius, fillcolor, linecolor, thickness, scale) {
        let ar = radius;
        let ax = x;
        let ay = y;

        context.beginPath();
        context.fillStyle = fillcolor;
        context.strokeStyle = linecolor;
        context.lineWidth = 1;

        context.arc(ax, ay, ar, 0, Math.PI * 2, false);
        context.closePath();
        context.fill();
        context.stroke();
    };

    this.BasicText = function (text, x, y, font, color, a, ha, va) {
        if (a === null) {
            let ax = x;
            let ay = y;

            if (ha !== undefined)
                context.textAlign = ha;

            if (va !== undefined)
                context.textBaseline = va;

            context.fillStyle = color;
            context.font = font;
            context.fillText(text, ax, ay);
        } else {
            context.save();
            let ax = x;
            let ay = y;

            if (ha !== undefined)
                context.textAlign = ha;
            else
                context.textAlign = 'center';

            if (va !== undefined)
                context.textBaseline = va;
            else
                context.textBaseline = "bottom";

            context.fillStyle = color;
            context.font = font;
            context.translate(ax, ay);
            context.rotate(a);
            context.fillText(text, 0, 0);
            context.restore();
        }
    };

    this.DrawLine = function (x1, y1, x2, y2, property) {
        let ax1 = this.ToCoordX(x1);
        let ay1 = this.ToCoordY(y1);
        let ax2 = this.ToCoordX(x2);
        let ay2 = this.ToCoordY(y2);

        this.UpdateContextProperties(property);

        context.beginPath();

        if (property.dashline || property.linewidth) {
            context.save();

            let fc = gridsize / (defaultgridsize * gridvalue.x);

            if (property.dashline) {
                let linedash = [];
                for (let i = 0; i < property.dashline.length; i++) {
                    linedash.push(property.dashline[i] * fc * 2);
                }

                if (context.setLineDash)
                    context.setLineDash(linedash);
            }
        }

        context.moveTo(ax1, ay1);
        context.lineTo(ax2, ay2);
        context.stroke();

        if (property.dashline || property.linewidth)
            context.restore();
    };

    this.DrawRectangle = function (x, y, w, h, property) {
        let aw = gridsize * w / gridvalue.x;
        let ah = gridsize * h / gridvalue.x;
        let ax = this.ToCoordX(x) - aw / 2;
        let ay = this.ToCoordY(y) - ah / 2;

        this.UpdateContextProperties(property);

        if (property.showfill)
            context.fillRect(ax, ay, aw, ah);

        if (property.showline)
            context.strokeRect(ax, ay, aw, ah);
    };

    this.DrawPolyLine = function (points, property) {
        let x = this.ToCoordX(points[0].x);
        let y = this.ToCoordY(points[0].y);

        this.UpdateContextProperties(property);

        if (property.pointcolor) {
            let x2;
            let y2;

            //context.lineWidth = property.thickness * gridsize / (defaultgridsize * gridvalue.x);

            for (let i = 1; i < points.length; i++) {
                x = this.ToCoordX(points[i - 1].x);
                y = this.ToCoordY(points[i - 1].y);

                x2 = this.ToCoordX(points[i].x);
                y2 = this.ToCoordY(points[i].y);

                context.fillStyle = points[i].color;
                context.strokeStyle = points[i].color;

                context.beginPath();
                context.moveTo(x, y);
                context.lineTo(x2, y2);
                context.stroke();
            }
        } else {
            context.beginPath();
            context.moveTo(x, y);

            for (let i = 1; i < points.length; i++) {
                x = this.ToCoordX(points[i].x);
                y = this.ToCoordY(points[i].y);
                context.lineTo(x, y);
            }

            context.stroke();
        }
    };

    this.DrawPolygon = function (points, property) {
        if (points.length !== 0) {
            context.beginPath();

            this.UpdateContextProperties(property);

            //First point
            let x = this.ToCoordX(points[0].x);
            let y = this.ToCoordY(points[0].y);
            context.moveTo(x, y);

            //Second to the last point
            for (let i = 1; i < points.length; i++) {
                x = this.ToCoordX(points[i].x);
                y = this.ToCoordY(points[i].y);
                context.lineTo(x, y);
            }

            context.closePath();

            if (property.showfill)
                context.fill();

            if (property.showline)
                context.stroke();

            if (self.scalefactor) {
                context.beginPath();
                context.moveTo(x, y);

                x = this.ToCoordX(points[0].x);
                y = this.ToCoordY(points[0].y);
                context.lineTo(x, y);
                context.stroke();
            }
        }
    };

    this.DrawPolygonWithHoles = function (points, holes, property) {
        if (points && points.length !== 0) {
            context.beginPath();

            this.UpdateContextProperties(property);

            if (property.dashline) {
                context.save();

                let fc = gridsize / (defaultgridsize * gridvalue.x);

                let linedash = [];
                for (let i = 0; i < property.dashline.length; i++) {
                    linedash.push(property.dashline[i] * fc * 2);
                }

                if (context.setLineDash)
                    context.setLineDash(linedash);
            }

            //First point
            let x = this.ToCoordX(points[0].x);
            let y = this.ToCoordY(points[0].y);

            let r;

            context.moveTo(x, y);

            //Second to the last point
            for (let i = 1; i < points.length; i++) {
                x = this.ToCoordX(points[i].x);
                y = this.ToCoordY(points[i].y);
                context.lineTo(x, y);
            }

            context.closePath();


            //Holes
            for (let i = 0; i < holes.length; i++) {
                switch (holes[i].type) {
                    case "polygon":

                        if (holes[i].points.length != 0) {
                            x = this.ToCoordX(holes[i].points[0].x);
                            y = this.ToCoordY(holes[i].points[0].y);
                            context.moveTo(x, y);

                            for (let j = 1; j < holes[i].points.length; j++) {
                                x = this.ToCoordX(holes[i].points[j].x);
                                y = this.ToCoordY(holes[i].points[j].y);
                                context.lineTo(x, y);
                            }

                            context.closePath();
                        }
                        break;

                    case "circle":
                        x = this.ToCoordX(holes[i].x);
                        y = this.ToCoordY(holes[i].y);
                        r = this.ToCoordWidth(holes[i].r);

                        context.moveTo(x + r, y);
                        context.arc(x, y, r, 0, Math.PI * 2, true);
                        break;
                }
            }

            if (property.showfill)
                context.fill();

            if (property.showline)
                context.stroke();

            if (property.dashline)
                context.restore();
        }

    };

    this.DrawArc = function (x, y, radius, startangle, endangle, anti, property) {

        let ar = gridsize * radius / gridvalue.x;
        let ax = this.ToCoordX(x);
        let ay = this.ToCoordY(y);

        this.UpdateContextProperties(property);

        context.beginPath();

        if (property.showfill) {
            context.moveTo(ax, ay);
        }

        context.arc(ax, ay, ar, Math.PI * startangle / 180, Math.PI * endangle / 180, anti);

        if (property.showfill) {
            context.closePath();
            context.fill();
        }

        if (property.showline)
            context.stroke();

    };

    this.DrawSteelI = function (x, y, wt, wb, h, tw, tft, tfb, r1, r2, r3, slope, property) {
        let awb = gridsize * wb / gridvalue.x;
        let awt = gridsize * wt / gridvalue.x;
        let ah = gridsize * h / gridvalue.x;
        let atw = gridsize * tw / gridvalue.x;
        let atfb = gridsize * tfb / gridvalue.x;
        let atft = gridsize * tft / gridvalue.x;
        let ar1 = gridsize * r1 / gridvalue.x;
        let ar2 = gridsize * r2 / gridvalue.x;
        let ar3 = gridsize * r3 / gridvalue.x;
        let aslope = slope * Math.PI / 180;
        let ax = this.ToCoordX(x);
        let ay = this.ToCoordY(y);

        this.UpdateContextProperties(property);

        context.beginPath();

        context.moveTo(ax - awt / 2 + ar3, ay - ah / 2);
        context.arc(ax - awt / 2 + ar3, ay - ah / 2 + ar3, ar3, 3 * Math.PI / 2, Math.PI, true);
        context.lineTo(ax - awt / 2, ay - ah / 2 + atft - (Math.tan(aslope) * (awt / 4 - ar2) + ar2));
        context.arc(ax - awt / 2 + ar2, ay - ah / 2 + atft - (Math.tan(aslope) * (awt / 4 - ar2) + ar2), ar2, Math.PI, Math.PI / 2, true);
        context.lineTo(ax - atw / 2 - ar1, ay - ah / 2 + atft + (Math.tan(aslope) * ((ax - atw / 2 - ar1) - (ax - awt / 4))));
        context.arc(ax - atw / 2 - ar1, ay - ah / 2 + atft + (Math.tan(aslope) * ((ax - atw / 2 - ar1) - (ax - awt / 4))) + ar1, ar1, 3 * Math.PI / 2, 0, false);
        context.lineTo(ax - atw / 2, ay + ah / 2 - atfb - (Math.tan(aslope) * ((ax - atw / 2 - ar1) - (ax - awb / 4))) - ar1);
        context.arc(ax - atw / 2 - ar1, ay + ah / 2 - atfb - (Math.tan(aslope) * ((ax - atw / 2 - ar1) - (ax - awb / 4))) - ar1, ar1, 0, Math.PI / 2, false);
        context.lineTo(ax - awb / 2 + ar2, ay + ah / 2 - atfb + (Math.tan(aslope) * (awb / 4 - ar2)));
        context.arc(ax - awb / 2 + ar2, ay + ah / 2 - atfb + (Math.tan(aslope) * (awb / 4 - ar2) + ar2), ar2, 3 * Math.PI / 2, Math.PI, true);
        context.lineTo(ax - awb / 2, ay + ah / 2 - ar3);
        context.arc(ax - awb / 2 + ar3, ay + ah / 2 - ar3, ar3, Math.PI, Math.PI / 2, true);
        context.lineTo(ax + awb / 2 - ar3, ay + ah / 2);

        context.arc(ax + awb / 2 - ar3, ay + ah / 2 - ar3, ar3, Math.PI / 2, 0, true);
        context.lineTo(ax + awb / 2, ay + ah / 2 - atfb + (Math.tan(aslope) * (awb / 4 - ar2) + ar2));
        context.arc(ax + awb / 2 - ar2, ay + ah / 2 - atfb + (Math.tan(aslope) * (awb / 4 - ar2) + ar2), ar2, 0, 3 * Math.PI / 2, true);
        context.lineTo(ax + atw / 2 + ar1, ay + ah / 2 - atfb - (Math.tan(aslope) * ((ax - atw / 2 - ar1) - (ax - awb / 4))));
        context.arc(ax + atw / 2 + ar1, ay + ah / 2 - atfb - (Math.tan(aslope) * ((ax - atw / 2 - ar1) - (ax - awb / 4))) - ar1, ar1, Math.PI / 2, Math.PI, false);
        context.lineTo(ax + atw / 2, ay - ah / 2 + atft + (Math.tan(aslope) * ((ax - atw / 2 - ar1) - (ax - awt / 4))) + ar1);
        context.arc(ax + atw / 2 + ar1, ay - ah / 2 + atft + (Math.tan(aslope) * ((ax - atw / 2 - ar1) - (ax - awt / 4))) + ar1, ar1, Math.PI, 3 * Math.PI / 2, false);
        context.lineTo(ax + awt / 2 - ar2, ay - ah / 2 + atft - (Math.tan(aslope) * (awt / 4 - ar2)));
        context.arc(ax + awt / 2 - ar2, ay - ah / 2 + atft - (Math.tan(aslope) * (awt / 4 - ar2) + ar2), ar2, Math.PI / 2, 0, true);
        context.lineTo(ax + awt / 2, ay - ah / 2 + ar3);
        context.arc(ax + awt / 2 - ar3, ay - ah / 2 + ar3, ar3, 0, 3 * Math.PI / 2, true);

        context.closePath();

        if (property.showfill)
            context.fill();

        if (property.showline)
            context.stroke();
    };

    this.DrawSteelChannel = function (x, y, wt, wb, h, tw, tft, tfb, r1, r2, r3, r4, slope, property) {
        let awb = gridsize * wb / gridvalue.x;
        let awt = gridsize * wt / gridvalue.x;
        let ah = gridsize * h / gridvalue.x;
        let atw = gridsize * tw / gridvalue.x;
        let atfb = gridsize * tfb / gridvalue.x;
        let atft = gridsize * tft / gridvalue.x;
        let aslope = slope * Math.PI / 180;
        let ar1 = gridsize * r1 / gridvalue.x;
        let ar2 = gridsize * r2 / gridvalue.x;
        let ar3 = gridsize * r3 / gridvalue.x;
        let ar4 = gridsize * r4 / gridvalue.x;
        let ax = this.ToCoordX(x);
        let ay = this.ToCoordY(y);

        let aut = awb / 2;
        let aub = awt / 2;

        if (ah > 300) {
            aut = (awb - atw) / 2;
            aub = (awt - atw) / 2;
        }

        let awMax = Math.max(awb, awt);

        this.UpdateContextProperties(property);

        context.beginPath();

        context.moveTo(ax - awMax / 2 + ar4, ay - ah / 2);
        context.arc(ax - awMax / 2 + ar4, ay - ah / 2 + ar4, ar4, 3 * Math.PI / 2, Math.PI, true);
        context.lineTo(ax - awMax / 2, ay + ah / 2 - ar4);
        context.arc(ax - awMax / 2 + ar4, ay + ah / 2 - ar4, ar4, Math.PI, Math.PI / 2, true);
        context.lineTo(ax - awMax / 2 + awb - ar3, ay + ah / 2);
        context.arc(ax - awMax / 2 + awb - ar3, ay + ah / 2 - ar3, ar3, Math.PI / 2, 0, true);
        context.lineTo(ax - awMax / 2 + awb, ay + ah / 2 - atfb + (Math.tan(aslope) * (aut - ar2) + ar2));
        context.arc(ax - awMax / 2 + awb - ar2, ay + ah / 2 - atfb + (Math.tan(aslope) * (aut - ar2) + ar2), ar2, 0, 3 * Math.PI / 2, true);
        context.lineTo(ax - awMax / 2 + atw + ar1, ay + ah / 2 - atfb - (Math.tan(aslope) * ((ax - atw / 2 - ar1) - (ax - awb / 2 + aut))));
        context.arc(ax - awMax / 2 + atw + ar1, ay + ah / 2 - atfb - (Math.tan(aslope) * ((ax - atw / 2 - ar1) - (ax - awb / 2 + aut))) - ar1, ar1, Math.PI / 2, Math.PI, false);
        context.lineTo(ax - awMax / 2 + atw, ay - ah / 2 + atft + (Math.tan(aslope) * ((ax - atw / 2 - ar1) - (ax - awt / 2 + aub))) + ar1);
        context.arc(ax - awMax / 2 + atw + ar1, ay - ah / 2 + atft + (Math.tan(aslope) * ((ax - atw / 2 - ar1) - (ax - awt / 2 + aub))) + ar1, ar1, Math.PI, 3 * Math.PI / 2, false);
        context.lineTo(ax - awMax / 2 + awt - ar2, ay - ah / 2 + atft - (Math.tan(aslope) * (aub - ar2)));
        context.arc(ax - awMax / 2 + awt - ar2, ay - ah / 2 + atft - (Math.tan(aslope) * (aub - ar2) + ar2), ar2, Math.PI / 2, 0, true);
        context.lineTo(ax - awMax / 2 + awt, ay - ah / 2 + ar3);
        context.arc(ax - awMax / 2 + awt - ar3, ay - ah / 2 + ar3, ar3, 0, 3 * Math.PI / 2, true);

        context.closePath();

        if (property.showfill)
            context.fill();

        if (property.showline)
            context.stroke();
    };

    this.DrawSteelAngle = function (x, y, w, h, tw, tf, r1, r2, r3, r4, property) {
        let aw = gridsize * w / gridvalue.x;
        let ah = gridsize * h / gridvalue.x;
        let atw = gridsize * tw / gridvalue.x;
        let atf = gridsize * tf / gridvalue.x;
        let ar1 = gridsize * r1 / gridvalue.x;
        let ar2 = gridsize * r2 / gridvalue.x;
        let ar3 = gridsize * r3 / gridvalue.x;
        let ar4 = gridsize * r4 / gridvalue.x;
        let ax = this.ToCoordX(x);
        let ay = this.ToCoordY(y);

        this.UpdateContextProperties(property);

        context.beginPath();

        context.moveTo(ax - aw / 2 + ar4, ay + ah / 2);
        context.arc(ax - aw / 2 + ar4, ay + ah / 2 - ar4, ar4, Math.PI / 2, Math.PI, false);
        context.lineTo(ax - aw / 2, ay - ah / 2 + ar3);
        context.arc(ax - aw / 2 + ar3, ay - ah / 2 + ar3, ar3, Math.PI, 3 * Math.PI / 2, false);
        context.lineTo(ax - aw / 2 + atw - ar2, ay - ah / 2);
        context.arc(ax - aw / 2 + atw - ar2, ay - ah / 2 + ar2, ar2, 3 * Math.PI / 2, 0, false);
        context.lineTo(ax - aw / 2 + atw, ay + ah / 2 - atf - ar1);
        context.arc(ax - aw / 2 + atw + ar1, ay + ah / 2 - atf - ar1, ar1, Math.PI, Math.PI / 2, true);
        context.lineTo(ax + aw / 2 - ar2, ay + ah / 2 - atf);
        context.arc(ax + aw / 2 - ar2, ay + ah / 2 - atf + ar2, ar2, 3 * Math.PI / 2, 0, false);
        context.lineTo(ax + aw / 2, ay + ah / 2 - ar3);
        context.arc(ax + aw / 2 - ar3, ay + ah / 2 - ar3, ar3, 0, Math.PI / 2, false);

        context.closePath();

        if (property.showfill)
            context.fill();

        if (property.showline)
            context.stroke();
    };

    this.DrawCircle = function (x, y, radius, property) {
        let ar = gridsize * radius / gridvalue.x;
        let ax = this.ToCoordX(x);
        let ay = this.ToCoordY(y);

        this.UpdateContextProperties(property);

        context.beginPath();
        context.arc(ax, ay, ar, 0, Math.PI * 2, false);
        context.closePath();

        if (property.showfill)
            context.fill();

        if (property.showline)
            context.stroke();
    };

    this.DrawText = function (text, x, y, font, color, angle, horzalign, vertalign, fontsize) {
        if (!angle) {
            let ax = this.ToCoordX(x);
            let ay = this.ToCoordY(y);

            context.fillStyle = color;
            context.font = font;

            if (self.scalefactor) {
                switch (horzalign) {
                    case "center":
                        let size = self.MeasureText(text, font);
                        ax -= size.width / 2;
                        break;
                }

                switch (vertalign) {
                    case "top":
                        ay += fontsize * self.scalefactor;
                        break;

                    case "center":
                    case "middle":
                        ay += fontsize * self.scalefactor;
                        break;
                }
            } else {
                if (horzalign)
                    context.textAlign = horzalign;
                else
                    context.textAlign = "center";

                if (vertalign)
                    context.textBaseline = vertalign;
                else
                    context.textBaseline = "bottom";
            }

            context.fillText(text, ax, ay);

        } else {
            context.save();
            let ax = this.ToCoordX(x);
            let ay = this.ToCoordY(y);

            if (horzalign)
                context.textAlign = horzalign;
            else
                context.textAlign = "center";

            if (vertalign)
                context.textBaseline = vertalign;
            else
                context.textBaseline = "bottom";

            context.fillStyle = color;
            context.font = font;
            context.translate(ax, ay);
            context.rotate(angle * toradian);
            context.fillText(text, 0, 0);
            context.restore();
        }
    };

    this.DrawArrow = function (x1, y1, x2, y2, w, h, property, arrow1, arrow2) {
        let line = new graphicsentity.Line2F(x1, y1, x2, y2);
        let angle = -line.GetAngle();

        let ax1 = this.ToCoordX(x1);
        let ay1 = this.ToCoordY(y1);
        let ax2 = this.ToCoordX(x2);
        let ay2 = this.ToCoordY(y2);

        this.UpdateContextProperties(property);

        context.beginPath();
        context.moveTo(Math.round(ax1), Math.round(ay1));
        context.lineTo(Math.round(ax2), Math.round(ay2));

        context.stroke();

        //Arrow 1
        if (arrow1 === undefined || arrow1) {
            let point1 = [];
            point1[0] = new graphicsentity.Point2F(x1, y1);
            point1[1] = new graphicsentity.Point2F(x1 + w, y1 + h / 2);
            point1[2] = new graphicsentity.Point2F(x1 + w, y1 - h / 2);

            if (angle !== 0)
                for (let i = 0; i < point1.length; i++)
                    point1[i].Rotate(x1, y1, angle);

            this.DrawPolygon(point1, property);
        }

        //Arrow 2
        if (arrow2 === undefined || arrow2) {
            let point2 = [];
            point2[0] = new graphicsentity.Point2F(x2, y2);
            point2[1] = new graphicsentity.Point2F(x2 - w, y2 + h / 2);
            point2[2] = new graphicsentity.Point2F(x2 - w, y2 - h / 2);

            if (angle !== 0)
                for (let i = 0; i < point2.length; i++)
                    point2[i].Rotate(x2, y2, angle);

            this.DrawPolygon(point2, property);
        }
    };

    this.DrawPipe = function (x, y, radius, innerradius, property) {
        let ar = gridsize * radius / gridvalue.x;
        let ir = gridsize * innerradius / gridvalue.x;

        let ax = this.ToCoordX(x);
        let ay = this.ToCoordY(y);

        this.UpdateContextProperties(property);

        context.beginPath();
        context.arc(ax, ay, ar, 0, Math.PI * 2, false);
        context.arc(ax, ay, ir, 0, Math.PI * 2, true);
        context.fill();

        context.beginPath();
        context.arc(ax, ay, ar, 0, Math.PI * 2, false);
        context.stroke();

        context.beginPath();
        context.arc(ax, ay, ir, 0, Math.PI * 2, false);
        context.stroke();
    };

    this.DrawTube = function (x, y, w, h, twl, twr, tft, tfb, property) {
        let aw = gridsize * w / gridvalue.x;
        let ah = gridsize * h / gridvalue.x;

        let atf1 = gridsize * tft / gridvalue.x;
        let atf2 = gridsize * tfb / gridvalue.x;

        let atw1 = gridsize * twl / gridvalue.x;
        let atw2 = gridsize * twr / gridvalue.x;

        let rx = x - w / 2 + twl;
        let ry = y + h / 2 - tft;

        let rw = aw - (atw1 + atw2);
        let rh = ah - (atf1 + atf2);

        rx = this.ToCoordX(rx);
        ry = this.ToCoordY(ry);

        let ax = this.ToCoordX(x);
        let ay = this.ToCoordY(y);

        context.beginPath();
        this.UpdateContextProperties(property);

        context.moveTo(ax - aw / 2 - 0.5, ay - ah / 2 - 0.5);
        context.lineTo(ax - aw / 2 - 0.5, ay + ah / 2 - 0.5);
        context.lineTo(ax + aw / 2 - 0.5, ay + ah / 2 - 0.5);
        context.lineTo(ax + aw / 2 - 0.5, ay - ah / 2 - 0.5);
        context.lineTo(ax - aw / 2 - 0.5, ay - ah / 2 - 0.5);

        context.rect(rx, ry, rw, rh);
        context.fill();
        context.stroke();
    };

    this.DrawMoment = function (x, y, radius, startangle, endangle, clockwise, property) {
        let w = 0.1;
        let w4 = 0.02;

        let points = [];
        let x1 = x + w;

        if (startangle > endangle)
            clockwise = false;

        if (!clockwise)
            x1 = x - w;

        let y1 = y + radius;

        points[0] = { x: x1, y: y1 };
        points[1] = { x: x, y: y1 + w4 };
        points[2] = { x: x, y: y1 - w4 };
        points[3] = { x: x1, y: y1 };

        this.DrawPolygon(points, property);
        this.DrawArc(x, y, radius, startangle, endangle, undefined, property);
    };

    this.DrawImage = function (image, x, y) {
        let ax = this.ToCoordX(x);
        let ay = this.ToCoordY(y);
        let scale = gridsize / (defaultgridsize * gridvalue.x);

        let width = image.width * scale;
        let height = image.height * scale;
        context.drawImage(image, ax, ay, width, height);
    };

    this.SaveImage = function () {
        let strMime = "image/jpeg";
        let strDownloadMime = "image/octet-stream";
        imgData = canvas.toDataURL(strMime);

        let strData = imgData.replace(strMime, strDownloadMime);
        let filename = "detailer.jpg";

        let link = document.createElement('a');

        if (typeof link.download === 'string') {
            document.body.appendChild(link); //Firefox requires the link to be in the body
            link.download = filename;
            link.href = strData;
            link.click();
            document.body.removeChild(link); //remove the link when done
        } else {
            location.replace(uri);
        }
    };

    this.CaptureThumbnail = function (_width_, _height_) {
        let offset = this.object.offset();
        top = offset.top;
        left = offset.left;

        width = _width_;
        height = _height_;

        canvas.width = width;
        canvas.height = height;

        center.x = Math.round(width / 2);
        center.y = Math.round(height / 2);

        self.UpdateCanvasScaleRatio();

        let showruler = self.settings.SHOWRULER;

        self.settings.SHOWRULER = false;
        self.settings.SHOWDIMENSIONS = false;

        self.ZoomAll(undefined, 1.1);

        let image = canvas.toDataURL();
        self.Resize();

        self.settings.SHOWRULER = showruler;
        self.settings.SHOWDIMENSIONS = true;

        self.ZoomAll();

        return image;
    };


    //Draw

    this.Select = function () {
        this.model.action = CANVASACTIONS.SELECT;
        this.model.drawobject = undefined;
    };

    this.StartDraw = function (graphic) {
        canvasobject.css({ cursor: "crosshair" });
        this.model.StartDraw(graphic);
    };

    this.ResetIcon = function () {
        canvasobject.css({ cursor: "default" });
    };


    //Events

    this.MouseDown = function (x, y, button) {
        mouse.down.x = x;
        mouse.down.y = y;
        mouse.previous.x = x;
        mouse.previous.y = y;

        this.model.MouseDown(this, mouse, button);
    };

    this.MouseMove = function (x, y, button) {
        mouse.current.x = x;
        mouse.current.y = y;

        this.model.MouseMove(this, mouse, button);

        mouse.previous.x = x;
        mouse.previous.y = y;
    };

    this.MouseUp = function (x, y, button) {
        mouse.current.x = x;
        mouse.current.y = y;
        this.model.MouseUp(this, mouse, button);
    };

    this.MouseWheel = function (x, y, delta) {
        if (self.settings.ALLOWZOOM) {
            //Set current mouse position
            mouse.current.x = x;
            mouse.current.y = y;
            mouse.delta = delta * 10;

            //Zoom
            this.Zoom(mouse.current.x, mouse.current.y, mouse.delta);
            this.model.MouseWheel(this);

            this.StoreBuffer();
        }
    };

    this.KeyDown = function (event) {
        this.model.KeyDown(event, this);
    };

    this.KeyUp = function (event) {
        this.model.KeyUp(event);
    };


    //Conversions

    this.ToCoordX = function (pointX) {
        return center.x + (pointX / gridvalue.x - middle.x) * gridsize;
    };

    this.ToCoordY = function (pointY) {
        return center.y - (pointY / gridvalue.y - middle.y) * gridsize;
    };

    this.ToPointX = function (coordX) {
        return (middle.x - (center.x - coordX) / gridsize) * gridvalue.x;
    };

    this.ToPointY = function (coordY) {
        return (middle.y + (center.y - coordY) / gridsize) * gridvalue.y;
    };

    this.ToCoordX_2 = function (pointX) {
        return center.x + (pointX / gridvalue.x - middle.x) * gridsize;
    };

    this.ToCoordY_2 = function (pointY) {
        return center.y - (pointY / gridvalue.y - middle.y) * gridsize;
    };

    this.ToPointWidth = function (pointWidth) {
        return (pointWidth / gridsize) * gridvalue.y;
    };

    this.ToCoordWidth = function (coordWidth) {
        return (coordWidth * gridsize) / gridvalue.x;
    };


    //Zoom and Panning

    this.ZoomAll = function (inbounds, infactor) {
        let bounds;
        let factor = Math.pow(1.10, devicePixelRatio);

        if (infactor)
            factor = infactor;

        if (inbounds)
            //From parameter
            bounds = inbounds;
        else
            //Compute bounds
            bounds = self.model.Bounds();

        //Resize first
        self.Resize();

        //Check if width and height is already available
        if (width && height && bounds.x1 < 1000000000) {
            let x1 = bounds.x1;
            let y1 = bounds.y1;

            let x2 = bounds.x2;
            let y2 = bounds.y2;

            let mid = new graphicsentity.Point2F((x1 + x2) / 2, (y1 + y2) / 2);
            let difference = new graphicsentity.Point2F(Math.abs(x1 - x2) / gridvalue.x, Math.abs(y1 - y2) / gridvalue.y);

            if (((difference.x / difference.y) >= (width / height))) {
                if (difference.x === 0)
                    return;

                gridsize = width / (factor * difference.x * devicePixelRatio);
            } else {
                if (difference.y === 0)
                    return;

                gridsize = height / (factor * difference.y * devicePixelRatio);
            }

            if (gridsize > 1000) {
                gridsize /= 10;
                gridvalue.x /= 10;
                gridvalue.y /= 10;

            } else if (gridsize >= 10) {

            } else if (gridsize >= 1) {
                gridsize *= 5;
                gridvalue.x *= 5;
                gridvalue.y *= 5;

            } else {
                gridsize *= 10;
                gridvalue.x *= 10;
                gridvalue.y *= 10;
            }

            // if (this.settings.SHOWRULER) {
            //     middle.x = mid.x / gridvalue.x;
            //     middle.y = mid.y / gridvalue.y;
            // } else {
            //     middle.x = mid.x / gridvalue.x + rulersize / (2 * gridsize);
            //     middle.y = mid.y / gridvalue.y - rulersize / (2 * gridsize);
            // }

            middle.x = mid.x / gridvalue.x;
            middle.y = mid.y / gridvalue.y;

            zoomvalue = gridsize / (defaultgridsize * gridvalue.x);
            this.Render();
        }
    };

    this.Zoom = function (x, y, d) {
        let prev = { x: this.ToPointX(x), y: this.ToPointY(y) };
        this.ZoomRealtime(d);

        let curr = { x: this.ToPointX(x), y: this.ToPointY(y) };
        this.MoveByPoint(curr, prev);

        zoomvalue = gridsize / (defaultgridsize * gridvalue.x);
        this.Render();
    };

    this.ZoomIn = function () {
        gridsize *= 1.15;
        zoomvalue = gridsize / (defaultgridsize * gridvalue.x);

        self.Render();
    };

    this.ZoomOut = function () {
        gridsize /= 1.15;
        zoomvalue = gridsize / (defaultgridsize * gridvalue.x);
        self.Render();
    };

    this.ZoomRealtime = function (d) {
        let mult = gridsize * d;
        let size = gridsize + (mult / defaultgridsize);

        if (size > 1000) {
            gridsize = Math.round(size) / 10;
            gridvalue.x /= 10;
            gridvalue.y /= 10;
        } else if (size >= 10)
            gridsize = Math.round(size);
        else {
            gridsize = size * 10;
            gridvalue.x *= 10;
            gridvalue.y *= 10;
        }
    };

    this.ZoomFactor = function (factor) {
        gridsize *= factor;
        zoomvalue = gridsize / (defaultgridsize * gridvalue.x);
        this.Render();
    };

    this.MoveByPoint = function (current, previous) {
        if (!((current.x === previous.x) && (current.y === previous.y))) {
            middle.x -= (current.x - previous.x) / gridvalue.x;
            middle.y -= (current.y - previous.y) / gridvalue.y;
        }
    };

    this.Pan = function (x, y) {
        middle.x -= x / gridsize;
        middle.y -= y / gridsize;
    };


    //Other functionalities

    this.Resize = function () {
        let offset = this.object.offset();
        top = offset.top;
        left = offset.left;

        width = this.parent.width();
        height = this.parent.height();

        if (!height) {
            width = canvas.clientWidth;
            height = canvas.clientHeight;
        }

        canvas.width = width;
        canvas.height = height;

        if (this.settings.SHOWRULER) {
            center.x = rulersize + Math.round((width - rulersize * devicePixelRatio) / 2) / devicePixelRatio;
            center.y = rulersize + Math.round((height - rulersize * devicePixelRatio) / 2) / devicePixelRatio;

        } else {
            center.x = Math.round((width) / 2) / devicePixelRatio;
            center.y = Math.round((height) / 2) / devicePixelRatio;
        }

        self.UpdateCanvasScaleRatio();
        self.Render();
    };

    this.Reset = function () {
        this.Initialize();
        this.Invalidate();
    };

    this.Events = function () {
        let button = 0;
        let ontouch = 0;
        let onenter = false;

        self.onfocus = true;


        document.body.onkeydown = function (event) {
            self.KeyDown(event);
        };

        document.body.onkeyup = function (event) {
            self.KeyUp(event);
        };

        canvasobject.unbind();

        canvasobject.mouseenter(function (event) {
            onenter = true;
            self.onfocus = true;
            self.RemoveEventListeners();
            self.AddEventListeners();
        });

        canvasobject.mouseleave(function (event) {
            self.onfocus = false;
            self.RemoveEventListeners();
        });

        canvasobject.mousedown(function (event) {
            event.preventDefault();
            onmousedown = true;
            button = event.which;

            let pixelratio = window.devicePixelRatio || 1;

            let x = (event.pageX - left) / pixelratio;
            let y = (event.pageY - top) / pixelratio;

            self.MouseDown(x, y, button);

            self.onfocus = true;

        });

        canvasobject.mousemove(function (event) {
            if (self.onfocus) {
                if (!onenter) {
                    onenter = true;
                    self.onfocus = true;
                    self.RemoveEventListeners();
                    self.AddEventListeners();
                }

                event.preventDefault();

                let pixelratio = window.devicePixelRatio || 1;

                let x = (event.pageX - left) / pixelratio;
                let y = (event.pageY - top) / pixelratio;

                self.MouseMove(x, y, button);
            }
        });

        canvasobject.mouseup(function (event) {
            event.preventDefault();
            onmousedown = false;
            let movebutton = button;

            button = 0;

            let pixelratio = window.devicePixelRatio || 1;

            let x = (event.pageX - left) / pixelratio;
            let y = (event.pageY - top) / pixelratio;

            self.MouseUp(x, y, movebutton);
        });

        canvasobject.on("touchstart", function (event) {
            event.preventDefault();
            event.stopPropagation();

            self.onfocus = true;


            onmousedown = true;

            let e = event.originalEvent;

            let pixelratio = window.devicePixelRatio || 1;

            downx = (e.touches[0].pageX - left) / pixelratio;
            downy = (e.touches[0].pageY - top) / pixelratio;


            if (e.targetTouches.length > 2) {
                self.MouseDown(downx, downy, 2);
                ontouch = 2;
            } else if (e.targetTouches.length > 1) {
                touch0x = (e.targetTouches[0].pageX - left) / pixelratio;
                touch0y = (e.targetTouches[0].pageY - top) / pixelratio;

                touch1x = (e.targetTouches[1].pageX - left) / pixelratio;
                touch1y = (e.targetTouches[1].pageY - top) / pixelratio;

                let dx = touch0x - touch1x;
                let dy = touch0y - touch1y;

                pointerdist = Math.sqrt(dx * dx + dy * dy);
                ontouch = 1;
            } else {
                ontouch = 0;
                pointerdist = 0;
                start = 0;
                self.MouseDown(downx, downy, 1);
            }
        });

        canvasobject.on("touchmove", function (event) {
            if (self.onfocus) {
                event.preventDefault();
                event.stopPropagation();

                let e = event.originalEvent;
                let pixelratio = window.devicePixelRatio || 1;

                curx = (e.touches[0].pageX - left) / pixelratio;
                cury = (e.touches[0].pageY - top) / pixelratio;

                if (e.targetTouches.length > 2) {
                    self.MouseMove(curx, cury, 2);

                } else if (e.targetTouches.length > 1) {
                    if (ontouch === 1) {
                        if (pointerdist === 0) {
                            touch0x = (e.targetTouches[0].pageX - left) / pixelratio;
                            touch0y = (e.targetTouches[0].pageY - top) / pixelratio;

                            touch1x = (e.targetTouches[1].pageX - left) / pixelratio;
                            touch1y = (e.targetTouches[1].pageY - top) / pixelratio;

                            let dx = touch0x - touch1x;
                            let dy = touch0y - touch1y;

                            pointerdist = Math.sqrt(dx * dx + dy * dy);

                        } else {
                            touch0x = (e.targetTouches[0].pageX - left) / pixelratio;
                            touch0y = (e.targetTouches[0].pageY - top) / pixelratio;

                            touch1x = (e.targetTouches[1].pageX - left) / pixelratio;
                            touch1y = (e.targetTouches[1].pageY - top) / pixelratio;

                            let dx = touch0x - touch1x;
                            let dy = touch0y - touch1y;

                            let dist = Math.sqrt(dx * dx + dy * dy);

                            let centerx = (touch0x + touch1x) / 2;
                            let centery = (touch0y + touch1y) / 2;

                            let delta = dist - pointerdist;
                            self.MouseWheel(centerx, centery, (delta) / 20);

                            pointerdist = dist;
                        }
                    }
                } else {
                    if (ontouch === 0)
                        self.MouseMove(curx, cury, 1);
                }

                start = 1;
            }
        });

        canvasobject.on("touchend", function (event) {
            event.preventDefault();
            event.stopPropagation();

            self.onfocus = false;
            onmousedown = false;

            if (start === 1) {
                self.MouseUp(curx, cury, 1);
            } else {
                self.MouseUp(downx, downy, 1);
            }

            if (ontouch > 0)
                if (event.targetTouches.length === 0)
                    ontouch = 0;

            start = 0;
        });

        canvasobject.on("touchcancel", function (event) {
            event.preventDefault();
            event.stopPropagation();

            start = 0;
            ontouch = 0;
        });
    }

    this.AddEventListeners = function () {
        let event = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel" //FF doesn't recognize mousewheel as of FF3.x

        //Add event
        if (document.attachEvent) //if IE (and Opera depending on user setting)
            document.attachEvent("on" + event, self.WindowMouseWheel);

        else if (document.addEventListener) //WC3 browsers
            document.addEventListener(event, self.WindowMouseWheel);

        window.onmousewheel = document.onmousewheel = self.WindowMouseWheel;
    };

    this.RemoveEventListeners = function () {
        let event = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel" //FF doesn't recognize mousewheel as of FF3.x

        if (document.attachEvent) //if IE (and Opera depending on user setting)
            document.removeEventListener("on" + event, self.WindowMouseWheel);

        else if (document.addEventListener) //WC3 browsers
            document.removeEventListener(event, self.WindowMouseWheel);

        window.onmousewheel = document.onmousewheel = undefined;
    };

    this.WindowMouseWheel = function (event) {
        if (self.onfocus) {
            if (!event)
                event = window.event;

            let delta = event.detail ? -event.detail / 4 : event.wheelDelta / 240
            let pixelratio = window.devicePixelRatio || 1;

            if (event.wheelDelta)
                delta = event.wheelDelta / 240;

            let x = (event.pageX - left) / pixelratio;
            let y = (event.pageY - top) / pixelratio;

            self.MouseWheel(x, y, delta);
        }
    }

    this.UpdateCanvasScaleRatio = function () {
        devicePixelRatio = window.devicePixelRatio || 1,
            backingStoreRatio = context.webkitBackingStorePixelRatio ||
            context.mozBackingStorePixelRatio ||
            context.msBackingStorePixelRatio ||
            context.oBackingStorePixelRatio ||
            context.backingStorePixelRatio || 1,
            ratio = devicePixelRatio / backingStoreRatio;

        // ensure we have a value set for auto.
        // If auto is set to false then we
        // will simply not upscale the canvas
        // and the default behaviour will be maintained
        if (typeof auto === 'undefined') {
            auto = true;
        }

        // upscale the canvas if the two ratios don't match
        if (auto && devicePixelRatio !== backingStoreRatio) {
            let oldWidth = width;
            let oldHeight = height;

            canvas.width = oldWidth * ratio;
            canvas.height = oldHeight * ratio;

            // now scale the context to counter
            // the fact that we've manually scaled
            // our canvas element
            context.scale(ratio, ratio);
        }
    };

    this.UpdateContextProperties = function (property) {
        if (property.gradientpoint1 && property.gradientpoint2) {
            let gradient = context.createLinearGradient(this.ToCoordX_2(property.gradientpoint1.x), this.ToCoordY_2(property.gradientpoint1.y), this.ToCoordX_2(property.gradientpoint2.x), this.ToCoordY_2(property.gradientpoint2.y));
            gradient.addColorStop(0, property.gradientcolor1);
            gradient.addColorStop(1, property.gradientcolor2);

            context.fillStyle = gradient;
            context.strokeStyle = gradient;

        } else if (property.pattern) {
            //Sample pattern - Don't Delete !!!

            // property.pattern = document.createElement("canvas")
            // property.pattern.width=32;
            // property.pattern.height=16;
            // let pctx = property.pattern.getContext('2d');

            // let x0=36;
            // let x1=-4;
            // let y0=-2;
            // let y1=18;
            // let offset=32;

            // pctx.strokeStyle = "#FF0000";
            // pctx.lineWidth=2;
            // pctx.beginPath();
            // pctx.moveTo(x0,y0);
            // pctx.lineTo(x1,y1);
            // pctx.moveTo(x0-offset,y0);
            // pctx.lineTo(x1-offset,y1);
            // pctx.moveTo(x0+offset,y0);
            // pctx.lineTo(x1+offset,y1);
            // pctx.stroke();

            context.fillStyle = context.createPattern(property.pattern, "repeat");
            context.strokeStyle = property.linecolor;

        } else {
            context.fillStyle = property.fillcolor;
            context.strokeStyle = property.linecolor;
        }

        if (property.scale) {
            context.lineWidth = property.thickness * gridsize / (defaultgridsize * gridvalue.x);

            if (context.lineWidth < 1)
                context.lineWidth = 1;

        } else if (this.scalefactor) {
            context.lineWidth = property.thickness * this.scalefactor;

        } else {
            context.lineWidth = property.thickness;

            if (context.lineWidth < 1)
                context.lineWidth = 1;
        }
    };

    this.GridInterval = function () {
        if (gridvalue.x > 1) {
            if (gridsize >= 100)
                return gridvalue.x / 10;
            else
                return gridvalue.x;
        }
        else {
            if (gridsize >= 100)
                return gridvalue.x / 10;
            else
                return gridvalue.x;
        }
    };

    this.GetZoomValue = function () {
        return zoomvalue;
    }

    this.Width = function () {
        return width;
    };

    this.Height = function () {
        return height;
    };

    this.SetContext = function (contxt) {
        context = contxt;
    };

    this.SetGridValue = function (value) {
        gridvalue = value;
    };

    this.SetGridSize = function (value) {
        gridsize = value;
    };

    this.SetCenter = function (value) {
        center = value;
    };

    this.SetMiddle = function (value) {
        middle = value;
    };

    this.SetMouseCursor = function (cursor) {
        canvasobject[0].style.cursor = cursor;
    };

    this.MeasureText = function (text, font) {
        context.font = font;
        return context.measureText(text);
    };

    this.Initialize();
};