var CANVASACTIONS = {
    PAN: 1,
    SELECT: 2,
    SELECTPOINT: 3,
    WINDOWZOOM: 4,
    DRAW: 5
}

var canvasmodel = function (param) {
    let self = this;

    var list = [];
    var counter = 0;

    this.previous;
    this.intersectiontolerance = 0.1;
    this.mergetolerance = 0.01;
    this.snaptolerance = 1;

    this.action = CANVASACTIONS.SELECT;
    this.drawobject;
    this.onsnap = true;
    this.oncontrol = false;
    this.onselect = false;
    this.ondraw = false;
    this.mousedowncount;

    this.allowselect = true;
    this.allowmove = false;

    this.highlight;
    this.snappoints;

    if (param) {
        if (param.name)
            this.name = param.name;

        this.onselected = param.onselected;
    }

    //Render

    this.Render = function (renderer) {
        if (this.highlight)
            this.highlight.Render(renderer);

        for (var i = 0; i < list.length; i++)
            list[i].Render(renderer);

        //Render draw object
        if (this.drawobject)
            this.drawobject.Render(renderer);
    };

    this.RenderPDF = function (renderer) {
        for (var i = 0; i < list.length; i++)
            if (list[i].RenderPDF)
                list[i].RenderPDF(renderer);
    };


    //To DXF
    this.ExportDXF = function () {
        let s = '';

        //start section
        s += '0\nSECTION\n';

        //name section as TABLES section
        s += '2\nTABLES\n';

        //s += this._getDxfLtypeTable();
        //s += this._getDxfLayerTable();

        //end section
        s += '0\nENDSEC\n';


        //ENTITES section
        s += '0\nSECTION\n';
        s += '2\nENTITIES\n';


        for (var i = 0; i < list.length; i++)
            s += list[i].ExportDXF();

        s += '0\nENDSEC\n';

        //close file
        s += '0\nEOF';

        return s;
    };


    //Selection

    this.SelectByRectangle = function (x1, y1, x2, y2) {
        let selected = false;

        for (var i = 0; i < list.length; i++)
            if (list[i].SelectByRectangle && list[i].SelectByRectangle(x1, y1, x2, y2)) {
                list[i].selected = true;
                selected = true;
            }

        return selected;
    };

    this.SelectByPoint = function (x, y) {
        let selected = false;
        let bounds, rect;
        let select;

        if (self.allowselect) {
            for (var i = 0; i < list.length; i++)
                if (list[i] instanceof canvasmodel) {
                    bounds = list[i].Bounds();
                    rect = new canvasgraphics.Rectangle(bounds);

                    if (rect.SelectByPoint(x, y)) {
                        selected = true;
                        list[i].selected = true;
                        list[i].highlight = new canvasgraphics.Rectangle(bounds);
                        list[i].highlight.property.fillcolor = "rgba(0, 0, 0, 0.05)";
                        list[i].highlight.property.linecolor = "#CCC";
                    }

                } else {
                    if (list[i].SelectByPoint) {
                        select = list[i].selected;
                        
                        if (list[i].SelectByPoint(x, y)) {
                            if (select) 
                                list[i].selected = false;
                            else
                                selected = true;

                        } else if (select) {
                            list[i].selected = true;
                        }
                    }
                }
        }

        return selected;
    };

    this.TestSelectByPoint = function (canvas, mouse) {
    };

    this.GetSelected = function () {
        let selected = [];

        for (let i = 0; i < list.length; i++) {
            if (list[i].selected)
                selected.push(list[i]);
        }

        return selected;
    };

    this.InitializePoints = function () {
        self.snappoints = [];

        let points;

        for (let i = 0; i < list.length; i++)
            if (list[i].GetPoints) {
                points = list[i].GetPoints();

                for (let j = 0; j < points.length; j++)
                    self.snappoints.push({ x: points[j].x, y: points[j].y });

                points = list[i].GetMidPoints();
                
                for (let j = 0; j < points.length; j++)
                    self.snappoints.push({ x: points[j].x, y: points[j].y });
            }
    };


    //List management

    this.Add = function (drawing) {
        list[list.length] = drawing;
        return drawing;
    };

    this.Clone = function () {
        var model = new canvasmodel();

        for (i = 0; i < list.length; i++) {
            model.list.push(list[i].Clone());
        }

        return model;
    };

    this.Clear = function () {
        list = [];
    };

    this.Dispose = function () {
        for (var i = list.length - 1; i >= 0; i--) {
            delete list[i];
            list.pop();
        }
    };

    this.Bounds = function (bounds) {
        if (!bounds)
            bounds = new graphicsentity.Bounds2F();

        for (var i = 0; i < list.length; i++)
            if (list[i].UpdateBounds)
                list[i].UpdateBounds(bounds);

        return bounds;
    };

    this.UpdateBounds = function (bounds) {
        self.Bounds(bounds);
    };

    //Transformation
    this.Move = function (x, y) {
        for (var i = 0; i < list.length; i++) {
            list[i].Move(x, y);
        }
    };

    this.Scale = function (x, y) {
        for (var i = 0; i < list.length; i++) {
            if (list[i].Scale)
                list[i].Scale(x, y);
        }
    };


    //Draw
    this.StartDraw = function (graphic) {
        this.action = CANVASACTIONS.DRAW;
        this.drawobject = graphic;
        this.mousedowncount = 0;
    };


    //Mouse, Touch, and Key Events

    this.MouseDown = function (canvas, mouse, button) {
        let x = canvas.ToPointX(mouse.down.x);
        let y = canvas.ToPointY(mouse.down.y);

        if (self.onsnap) {
            let point = this.Snap(canvas, x, y);

            mouse.downsnap.x = point.x;
            mouse.downsnap.y = point.y;
        } else {
            mouse.downsnap.x = x;
            mouse.downsnap.y = y;
        }

        mouse.previoussnap.x = mouse.downsnap.x;
        mouse.previoussnap.y = mouse.downsnap.y;

        this.HandleMouseDown(canvas, mouse, button);
    };

    this.HandleMouseDown = function (canvas, mouse, button) {
        //Check if
        // if (this.action === CANVASACTIONS.PAN && button === 1) {
        //     if (this.TestSelectByPoint(canvas.ToPointX(mouse.down.x), canvas.ToPointY(mouse.down.y))) {
        //         this.onselect = true;
        //         this.UpdateSnapPoints();
        //     }
        // }

        switch (this.action) {
            case CANVASACTIONS.SELECT:
            case CANVASACTIONS.WINDOWZOOM:
                if (button === 1) {
                    self.previous = { x: mouse.down.x, y: mouse.down.y };
                    canvas.StoreBuffer();

                    self.ResetOnMouseMove();
                    //self.TestSelectByPoint(canvas, mouse);
                }

                break;

            case CANVASACTIONS.DRAW:
                if (button === 1) {
                    this.mousedowncount++;

                    this.ondraw = true;
                    let factor = 1;

                    if (window.units)
                        factor = units.length.value.value;

                    this.drawobject.AddPoint(mouse.downsnap.x / factor, mouse.downsnap.y / factor);
                    canvas.Invalidate();
                }

                break;
        }
    };

    this.MouseMove = function (canvas, mouse, button) {
        let x = canvas.ToPointX(mouse.current.x);
        let y = canvas.ToPointY(mouse.current.y);

        if (self.onsnap) {
            let point = this.Snap(canvas, x, y);
            mouse.currentsnap.x = point.x;
            mouse.currentsnap.y = point.y;
        } else {
            mouse.currentsnap.x = x;
            mouse.currentsnap.y = y;
        }

        mouse.handled = true;

        switch (button) {
            case 0: //No button
                this.HandleMouseMoveNoButton(canvas, mouse);
                break;

            case 1: //Left Button
                this.HandleMouseMoveLeftButton(canvas, mouse);
                break;

            case 2: //Middle Button
                this.HandleMouseMoveMiddleButton(canvas, mouse);
                break;

            case 3: //Right Button
                this.HandleMouseMoveRightButton(canvas, mouse);
                break;
        }

        //if (mouse.handled) {
        mouse.previoussnap.x = mouse.currentsnap.x;
        mouse.previoussnap.y = mouse.currentsnap.y;
        //}
    };

    this.HandleMouseMoveNoButton = function (canvas, mouse) {
        switch (self.action) {
            case CANVASACTIONS.DRAW:
                if (this.drawobject.drawpoints > 1) {
                    let factor = 1;

                    if (window.units)
                        factor = units.length.value.value;

                    this.drawobject.UpdateLastPoint(mouse.currentsnap.x / factor, mouse.currentsnap.y / factor);

                    this.drawobject.Refresh();
                    canvas.Invalidate();
                }
                break;
        }
    };

    this.HandleMouseMoveLeftButton = function (canvas, mouse) {
        switch (self.action) {
            case CANVASACTIONS.PAN:
                if (canvas.settings.ALLOWPAN)
                    this.Pan(canvas, mouse);
                break;

            case CANVASACTIONS.SELECT:
            case CANVASACTIONS.WINDOWZOOM:
                if (canvas.settings.ALLOWSELECT)
                    this.Select(canvas, mouse);
                break;

            case CANVASACTIONS.DRAW:
                this.ondraw = true;
                let bounds = mouse.ToBounds();
                let factor = 1;

                if (window.units)
                    factor = units.length.value.value;

                this.drawobject.UpdateLastPoint(mouse.currentsnap.x / factor, mouse.currentsnap.y / factor);
                canvas.Invalidate();
                break;
        }
    };

    this.HandleMouseMoveMiddleButton = function (canvas, mouse) {
        if (canvas.settings.ALLOWPAN)
            this.Pan(canvas, mouse);
    };

    this.HandleMouseMoveRightButton = function (canvas, mouse) {
        if (canvas.settings.ALLOWPAN)
            this.Pan(canvas, mouse);
    };

    this.MouseUp = function (canvas, mouse, button) {
        this.onselect = false;
        this.Snap(canvas, mouse);

        switch (this.action) {
            case CANVASACTIONS.PAN:
                if (button === 1 && canvas.settings.ALLOWSELECT && this.SelectByPoint(canvas.ToPointX(mouse.down.x), canvas.ToPointY(mouse.down.y))) {
                    counter = 0;
                    canvas.Render();
                }
                return true;

            case CANVASACTIONS.SELECT:
                if (button === 1) {
                    canvas.SetMouseCursor("default");

                    if (canvas.settings.ALLOWSELECT)
                        this.SelectObject(canvas, mouse);
                }

                return true;

            case CANVASACTIONS.WINDOWZOOM:
                if (button === 1) {
                    mouse.down.x = self.previous.x;
                    mouse.down.y = self.previous.y;

                    var bounds = mouse.ToBounds();
                    canvas.ZoomAll(bounds);

                    canvas.Render();
                }

                return true;
        }

        this.HandleMouseUp(canvas, mouse, button);
    };

    this.HandleMouseUp = function (canvas, mouse, button) {
        // switch (button) {
        //     case 3: //Right button
        //         if (this.drawobject.drawpoints > 100) {
        //             self.Add(this.drawobject);

        //             let newobject = new self.drawobject.constructor({});
        //             newobject.property = self.drawobject.property;
        //             self.drawobject = newobject;

        //             canvas.Invalidate();
        //         }

        //         break;
        // }

        // this.onselect = false;

        // switch (this.action) {
        //     case CANVASACTIONS.PAN:
        //         if (button === 1 && this.SelectByPoint(canvas.ToPointX(mouse.down.x), canvas.ToPointY(mouse.down.y))) {
        //             counter = 0;
        //             canvas.Render();
        //         }
        //         break;

        //     case CANVASACTIONS.SELECT:
        //         if (button === 1) {
        //             if (self.previous && canvas.settings.ALLOWSELECT) {
        //                 mouse.down.x = self.previous.x;
        //                 mouse.down.y = self.previous.y;

        //                 var bounds = mouse.ToBounds();

        //                 if (Math.abs(bounds.x1 - bounds.x2) < 5 && Math.abs(bounds.y1 - bounds.y2) < 5)
        //                     this.SelectByPoint(canvas.ToPointX(mouse.down.x), canvas.ToPointY(mouse.down.y));
        //                 else
        //                     this.SelectByRectangle(bounds.x1, bounds.y1, bounds.x2, bounds.y2);

        //                 canvas.Render();
        //             }
        //         }

        //         break;

        //     case CANVASACTIONS.WINDOWZOOM:
        //         if (button === 1) {
        //             mouse.down.x = previous.x;
        //             mouse.down.y = previous.y;

        //             var bounds = mouse.ToBounds();
        //             canvas.ZoomAll(bounds);

        //             canvas.Render();
        //         }

        //         break;
        // }
    };

    this.MouseWheel = function (canvas) {
    };

    this.KeyDown = function (event, canvas) {
        if (event.key.toLowerCase() === "enter" && this.ondraw) {
            if (this.drawobject.drawpoints > 100 && self.drawobject.points.length > 2) {
                this.drawobject.RemoveLastPoint();
                self.Add(this.drawobject);

                let newobject = new self.drawobject.constructor({});
                newobject.property = self.drawobject.property;
                self.drawobject = newobject;

            } else {
                self.drawobject = undefined;
                this.ondraw = false;
                this.action = CANVASACTIONS.SELECT;
            }
            canvas.Render();

        } else if (event.key.toLowerCase() === "escape" && this.ondraw) {
            if (this.drawobject.drawpoints > 100) {
                if (this.drawobject.RemoveLastPoint) {
                    //Remove 2 points
                    this.drawobject.RemoveLastPoint();
                    this.drawobject.RemoveLastPoint();
                }
                
                canvas.Render();
            }
        }

        this.HandleKeyDown(event);
    };

    this.HandleKeyDown = function (event) {
        var shortcut = "";

        if (event.ctrlKey)
            shortcut += "ctrl";

        this.oncontrol = event.ctrlKey;

        if (event.shiftKey)
            shortcut += "shift";

        if (event.key) {
            shortcut += event.key.toLowerCase();

            console.log(shortcut);

            if (mobiwork.shortcuts && mobiwork.shortcuts[shortcut]) {
                mobiwork.shortcuts[shortcut]();
            }

            if (self.shortcuts && self.shortcuts[shortcut]) {
                self.shortcuts[shortcut]();
                return true;
            }
        }

        return false;
    };

    this.KeyUp = function (event) {
        this.HandleKeyUp();
    };

    this.HandleKeyUp = function () {
        this.oncontrol = event.ctrlKey;
    };


    //Snap
    this.Snap = function (canvas, x, y) {
        let point = this.SnapPoints(x, y);
        return point;
    };

    this.SnapPoints = function (xo, yo) {
        if (self.snappoints) {
            let points = [];
            let x, y, length;

            for (let i = 0; i < self.snappoints.length; i++) {
                x = self.snappoints[i].x;
                y = self.snappoints[i].y;
                length = Math.sqrt((x - xo) * (x - xo) + (y - yo) * (y - yo));

                if (length < self.snaptolerance) {
                    points.push({ point: self.snappoints[i], length: length });
                }
            }

            if (points.length) {
                let min = points[0];

                for (let i = 1; i < points.length; i++) {
                    if (points[i].length < min.length)
                        min = points[i];
                }

                return min.point;
            } else
                return { x: xo, y: yo };

        } else
            return { x: xo, y: yo };
    };


    //Actions

    this.Pan = function (canvas, mouse) {
        canvas.Pan(mouse.current.x - mouse.previous.x, mouse.previous.y - mouse.current.y);
        canvas.Render();
    };

    this.ResetOnMouseMove = function () {
        for (var i = 0; i < list.length; i++)
            if (list[i].OnMouseMove) {
                list[i].pivotpoint = undefined;
            }
    };

    this.Select = function (canvas, mouse) {
        //Render others
        for (var i = 0; i < list.length; i++)
            if (list[i].OnMouseMove && list[i].OnMouseMove(canvas, mouse)) {
                canvas.Invalidate();
                return;
            }

        canvas.RestoreBuffer();
        canvas.SelectRectangle(
            mouse.down.x,
            mouse.down.y,
            mouse.current.x - mouse.down.x,
            mouse.current.y - mouse.down.y,
            "#2196F3"
        );
    };

    this.OnMouseMove = function (canvas, mouse) {
        if (self.allowmove && self.selected) {
            let x = mouse.currentsnap.x;
            let y = mouse.currentsnap.y;

            let px = mouse.previoussnap.x;
            let py = mouse.previoussnap.y;

            let dx = x - px;
            let dy = y - py;

            self.highlight.Move(dx, dy);
            self.Move(dx, dy);

            return true;
        }
    };

    this.SelectObject = function (canvas, mouse) {
        //Render others
        for (var i = 0; i < list.length; i++)
            if (list[i].OnMouseUp && list[i].OnMouseUp(canvas, mouse)) {
                canvas.Render();
                return;
            }

        if (self.previous) {
            mouse.down.x = self.previous.x;
            mouse.down.y = self.previous.y;

            var bounds = mouse.ToBounds();
            let selected;

            if (Math.abs(bounds.x1 - bounds.x2) < 0.01 && Math.abs(bounds.y1 - bounds.y2) < 0.01)
                selected = this.SelectByPoint(canvas.ToPointX(mouse.down.x), canvas.ToPointY(mouse.down.y));
            else
                selected = this.SelectByRectangle(bounds.x1, bounds.y1, bounds.x2, bounds.y2);

            canvas.Render();

            if (self.onselected && selected) {
                selected = [];

                for (var i = 0; i < list.length; i++)
                    if (list[i].selected) {
                        selected.push(list[i]);
                    }

                self.onselected(selected);
            }
        }
    };


    //Other functionalities

    this.UpdateSnapPoints = function () {
    };

    this.SetList = function (param) {
        list = param;
    };

    this.GetList = function () {
        return list;
    };
};