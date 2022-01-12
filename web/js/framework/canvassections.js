//Concrete Sections
canvasgraphics.Section = function (param) {
    canvasgraphics.call(this, param);

    let self = this;
    let bounds;

    self.type = OBJECTTYPE.SECTION;
    self.shape;
    self.dimensions = [];
    self.objects;
    self.drawpoints = 1;

    self.sizinghandles = [];

    self.handleproperty = new canvasgraphics.DrawProperties();
    self.handleproperty.fillcolor = "#FFF";
    self.selectedhandleproperty = new canvasgraphics.DrawProperties();
    self.selectedhandleproperty.fillcolor = "#FF0";

    self.general = new mobiwork.PropertyHeader({ text: "General" });

    if (param.text) {
        self.text = new mobiwork.PropertyInlineInput({ text: "Name", value: param.text });
    } else {
        self.text = new mobiwork.PropertyInlineInput({ text: "Name", value: "Section" });
    }

    self.dimension = new mobiwork.PropertyHeader({ text: "Dimensions" });

    if (param.w !== undefined) {
        self.w = new mobiwork.PropertyDouble({
            text: "Width, w",
            value: param.w,
            unit: units.length
        });
    }

    if (param.h !== undefined) {
        self.h = new mobiwork.PropertyDouble({
            text: "Height, h",
            value: param.h,
            unit: units.length
        });
    }

    self.position = new mobiwork.PropertyHeader({ text: "Position" });

    self.x = new mobiwork.PropertyDouble({
        text: "X",
        value: param.x,
        unit: units.length
    });

    self.y = new mobiwork.PropertyDouble({
        text: "Y",
        value: param.y,
        unit: units.length
    });

    self.angle = new mobiwork.PropertyDouble({
        text: "Angle",
        value: 0,
        unit: units.angle
    });

    if (param.a !== undefined)
        self.angle.value = param.a;

    self.Render = function (renderer) {
        //Render shape
        self.shape.Render(renderer);

        //Render dimensions
        if (renderer.settings.SHOWDIMENSIONS)
            for (let i = 0; i < self.dimensions.length; i++)
                self.dimensions[i].Render(renderer);

        //Render additional objects
        if (self.objects !== undefined) {
            for (let i = 0; i < self.objects.length; i++)
                self.objects[i].Render(renderer);
        }

        //Sizing Handles
        if (self.selected) {
            let size = renderer.ToPointWidth(10);
            let rotation = self.sizinghandles[self.sizinghandles.length - 1];

            //Draw a line
            if (rotation && rotation.rotation) {
                let line = new canvasgraphics.Line({
                    x1: self.x.GetValue(),
                    y1: self.y.GetValue(),
                    x2: rotation.x,
                    y2: rotation.y
                });

                line.Render(renderer);
            }

            for (let i = 0; i < self.sizinghandles.length; i++) {
                if (self.sizinghandles[i].w) {
                    self.sizinghandles[i].w = size;
                    self.sizinghandles[i].h = size;
                } else if (self.sizinghandles[i].r)
                    self.sizinghandles[i].r = size / 2;

                self.sizinghandles[i].property = self.handleproperty;
                self.sizinghandles[i].selectedproperty = self.selectedhandleproperty;

                self.sizinghandles[i].Refresh();
                self.sizinghandles[i].Render(renderer);
            }
        }
    };

    self.Select = function () {
        self.selected = true;
        self.shape.selected = true;

        self.GenerateSizingHandles();
    };

    self.Deselect = function () {
        //Deselect
        if (self.selected) {
            self.shape.selected = false;
            self.selected = false;
            self.sizinghandles = [];
        }
    };

    self.SelectByPoint = function (x, y) {
        if (self.selected) {
            //Check if a sizing handle is selected    
            for (let i = 0; i < self.sizinghandles.length; i++)
                if (self.sizinghandles[i].selected) {
                    return self.selected;
                }
        }

        self.activehandle = undefined;
        self.selected = self.shape.SelectByPoint(x, y);

        if (self.selected)
            self.GenerateSizingHandles();

        return self.selected;
    };

    self.SelectByRectangle = function (x1, y1, x2, y2) {
        if (!self.onmousemove) {
            let points = self.shape.GetPoints();
            let bounds = new graphicsentity.Bounds2F(x1, y1, x2, y2);
            let selected = true;

            for (let i = 0; i < points.length; i++) {
                if (!bounds.Inside(points[i].x, points[i].y)) {
                    selected = false;
                    break;
                }
            }

            self.selected = selected;
            self.shape.selected = selected;

            if (selected) {
                self.GenerateSizingHandles();
            }

            return selected;
        }
        return false;
    };

    self.GenerateSizingHandles = function () {
        self.sizinghandles = [];

        //Generate sizing handles
        if (self.selected) {
            let points = self.shape.GetPoints();
            let handle;

            for (let i = 0; i < points.length; i++) {
                handle = new canvasgraphics.Rectangle_2({ x: 0, y: 0, w: 1, h: 1 });
                self.sizinghandles.push(handle);
            }

            handle = new canvasgraphics.Circle({ x: 0, y: 0, r: 1 });
            self.sizinghandles.push(handle);

            self.UpdateSizingHandles();
        }
    };

    self.UpdateSizingHandles = function () {
        let points = self.shape.GetPoints();
        let handle;
        let line;
        let midpoint;
        let i;

        for (i = 0; i < points.length - 1; i++) {
            line = new graphicsentity.Line2F(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
            midpoint = line.GetMidPoint();

            if (self.sizinghandles[i]) {
                self.sizinghandles[i].x = midpoint.x;
                self.sizinghandles[i].y = midpoint.y;

                if (self.angle.value != 0) {
                    self.sizinghandles[i].a = self.angle.value;
                    self.sizinghandles[i].Refresh();
                }
            }
        }

        //Last point
        i = points.length - 1;
        line = new graphicsentity.Line2F(points[i].x, points[i].y, points[0].x, points[0].y);
        midpoint = line.GetMidPoint();

        if (self.sizinghandles[i]) {
            self.sizinghandles[i].x = midpoint.x;
            self.sizinghandles[i].y = midpoint.y;

            if (self.angle.value != 0) {
                self.sizinghandles[i].a = self.angle.value;
                self.sizinghandles[i].Refresh();
            }
        }

        //Rotation handle
        let bounds = new graphicsentity.Bounds2F();
        self.UpdateBounds(bounds);

        if (self.sizinghandles.length > i + 1) {
            let radius;
            let cx = self.x.GetValue();
            let cy = self.y.GetValue();

            if (self.r)
                radius = self.r.GetValue();
            else if (self.w)
                radius = self.w.GetValue() / 2;
            else {
                radius = bounds.Width() / 2;
                cx = bounds.MidX();
                cy = bounds.MidY();
            }

            let point = Rotate(cx + radius * 1.25, cy, cx, cy, self.angle.value);

            self.sizinghandles[i + 1].rotation = true;
            self.sizinghandles[i + 1].x = point.x;
            self.sizinghandles[i + 1].y = point.y;
        }
    };

    self.TestSelectByPoint = function (canvas, mouse) {
        if (self.selected) {
            let x = canvas.ToPointX(mouse.down.x);
            let y = canvas.ToPointY(mouse.down.y);
            let handle;

            for (let i = 0; i < self.sizinghandles.length; i++)
                if (self.sizinghandles[i].SelectByPoint(x, y)) {
                    handle = true;
                    break;
                }

            if (!handle) {
                if (self.shape.SelectByPoint(x, y))
                    return true;
                else
                    return false;
            }
        }

        return false;
    };

    self.OnMouseMove = function (canvas, mouse) {
        if (self.selected) {
            let x;
            let y;
            let px;
            let py;

            if (!self.activehandle) {
                if (!self.onmousemove) {
                    x = canvas.ToPointX(mouse.down.x);
                    y = canvas.ToPointY(mouse.down.y);

                    for (let i = 0; i < self.sizinghandles.length; i++)
                        if (self.sizinghandles[i].SelectByPoint(x, y)) {
                            self.onmousemove = true;
                            self.activehandle = self.sizinghandles[i];
                            self.activehandleindex = i;
                            index = i;
                            break;
                        }

                    if (!self.onmousemove) {
                        if (self.shape.SelectByPoint(x, y))
                            self.onmousemove = true;
                        else
                            return;
                    }
                } else {
                    for (let i = 0; i < self.sizinghandles.length; i++)
                        if (self.sizinghandles[i].SelectByPoint(x, y)) {
                            self.onmousemove = true;
                            self.activehandle = true;
                            self.activehandleindex = i;
                            break;
                        }
                }
            }

            //Select if there is no selected handle
            x = mouse.currentsnap.x;
            y = mouse.currentsnap.y;

            px = mouse.previoussnap.x;
            py = mouse.previoussnap.y;

            let dx = x - px;
            let dy = y - py;

            if (self.activehandle) {
                if (dx || dy) {
                    let res = 0;

                    if (self.activehandle.rotation) {
                        x = canvas.ToPointX(mouse.current.x);
                        y = canvas.ToPointY(mouse.current.y);

                        px = canvas.ToPointX(mouse.previous.x);
                        py = canvas.ToPointY(mouse.previous.y);

                        self.Resize(self.activehandleindex, dx, dy, res);

                    } else {
                        dx = x - px;
                        dy = y - py;

                        res = Math.sqrt(dx * dx + dy * dy);
                        let dir = 1;
                        let angle = 0;

                        if (self.angle)
                            angle = self.angle.value

                        if (Math.abs(dx) > Math.abs(dy)) {
                            if (dx < 0)
                                dir = -1;
                        } else {
                            if (dy > 0)
                                dir = -1;
                        }

                        res *= dir;
                        dx = Math.cos(angle) * res;
                        dy = Math.sin(angle) * res;

                        self.Resize(self.activehandleindex, dx, dy, res);
                    }

                    self.Refresh();
                    self.shape.selected = true;
                }

                self.UpdateSizingHandles();
            } else {

                let points = self.GetPoints();

                //Find the closest point to snap
                let point, p1;
                let index;
                let p0 = new graphicsentity.Point2F(canvas.ToPointX(mouse.current.x), canvas.ToPointY(mouse.current.y));
                let factor = units.length.value.value;

                if (!self.pivotpoint) {
                    for (let i = 0; i < points.length; i++) {
                        if (!point) {
                            index = i;
                            point = new graphicsentity.Point2F(points[i].x * factor, points[i].y * factor);
                        }
                        else {
                            p1 = new graphicsentity.Point2F(points[i].x * factor, points[i].y * factor);

                            if (p0.Distance(p1) < p0.Distance(point)) {
                                index = i;
                                point = p1;
                            }
                        }
                    }

                    p1 = new graphicsentity.Point2F(canvas.ToPointX(mouse.previous.x), canvas.ToPointY(mouse.previous.y));
                    self.pivotpoint = { index: index, point: point, x: p1.x - point.x, y: p1.y - point.y };

                } else {

                    point = new graphicsentity.Point2F(points[self.pivotpoint.index].x * factor, points[self.pivotpoint.index].y * factor);
                    self.pivotpoint.point = point;
                }

                dx = p0.x - (point.x + self.pivotpoint.x);
                dy = p0.y - (point.y + self.pivotpoint.y);

                let spoint = mouse.Snap(point.x + dx, point.y + dy);
                dx = spoint.x - point.x;
                dy = spoint.y - point.y;

                //Move
                self.Move(dx / factor, dy / factor);

                self.Refresh();
                self.UpdateSizingHandles();

                self.shape.selected = true;
                self.moved = true;
            }

            return true;
        }

        return false;
    };

    self.OnMouseUp = function (canvas, mouse) {
        if (self.selected) {
            self.onmousemove = false;
            self.activehandle = undefined;

            for (let i = 0; i < self.sizinghandles.length; i++)
                self.sizinghandles[i].selected = false;

            return true;
        }
    };

    self.UpdateBounds = function (bounds) {
        self.shape.UpdateBounds(bounds);

        for (let i = 0; i < self.dimensions.length; i++)
            self.dimensions[i].UpdateBounds(bounds);
    };

    self.Move = function (dx, dy) {
        self.x.value += dx;
        self.y.value += dy;
    };

    self.Scale = function (x, y) {
        self.shape.Scale(x, y);
    };

    self.GetPoints = function () {
        let points = self.shape.GetPoints();
        let output = [];

        for (let i = 0; i < points.length; i++) {
            output.push({
                x: points[i].x / units.length.value.value,
                y: points[i].y / units.length.value.value
            });
        }

        return output;
    };

    self.GetMesh = function () {
        let mesh = {};
        mesh.Area = [];

        let points = self.GetPoints();

        let holes = self.GetHoles();
        let triangles = self.Triangulate(points, holes);

        let area = {};

        for (let i = 0; i < triangles.length; i++) {
            area = { Points: [] };

            for (let j = 0; j < triangles[i].points_.length; j++) {
                area.Points.push({
                    Stress: 0,
                    X: triangles[i].points_[j].x,
                    Y: triangles[i].points_[j].y,
                    Z: 0
                });
            }

            mesh.Area.push(area);
        }

        return mesh;
    };

    self.Triangulate = function (points, holepoints) {
        let contour = [];

        for (let i = 0; i < points.length; i++) {
            contour.push(new poly2tri.Point(points[i].x, points[i].y));
        }

        let holes = [];
        let hole;

        if (holepoints) {
            for (let i = 0; i < holepoints.length; i++) {
                hole = [];
                for (let j = 0; j < holepoints[i].points.length; j++)
                    hole.push(new poly2tri.Point(holepoints[i].points[j].x, holepoints[i].points[j].y));

                holes.push(hole);
            }
        }

        let swctx = new poly2tri.SweepContext(contour);
        swctx.addHoles(holes);

        swctx.triangulate();

        let triangles = swctx.getTriangles();

        return triangles;
    };

    self.GetHoles = function () {
        return [];
    };

    self.Delete = function () {
        return false;
    };
};

canvasgraphics.SectionPolygon = function (param) {
    canvasgraphics.Section.call(this, param);

    let self = this;
    let points = param.points;
    let holes = param.holes;
    let w;

    if (!points)
        points = [];

    //Required for drawing purpose
    self.drawpoints = 10000;

    //Hide dimension header
    self.dimension.visible = false;

    self.Refresh = function () {
        //Shape
        let pts = [];

        for (let i = 0; i < points.length; i++) {
            pts.push({
                x: points[i].x * units.length.value.value,
                y: points[i].y * units.length.value.value,
            });
        }

        self.UpdateCenter();

        let holepts = [];
        let hpts = [];

        if (holes) {
            for (let i = 0; i < holes.length; i++) {
                hpts = [];

                for (let j = 0; j < holes[i].points.length; j++) {
                    hpts.push({
                        x: holes[i].points[j].x * units.length.value.value,
                        y: holes[i].points[j].y * units.length.value.value,
                    });
                }

                switch (holes[i].type) {
                    case "polygon":
                        holepts.push({ type: holes[i].type, points: hpts });
                        break;

                    case "circle":
                        holepts.push({
                            type: holes[i].type,
                            points: hpts,
                            x: holes[i].x * units.length.value.value,
                            y: holes[i].y * units.length.value.value,
                            r: holes[i].r * units.length.value.value
                        });
                        break;
                }

            }

        }

        self.shape = new canvasgraphics.Polygon({
            points: pts,
            holes: holepts,
            a: self.angle.value
        });

        let bounds = new graphicsentity.Bounds2F();
        self.shape.UpdateBounds(bounds);

        //Dimensions - Width
        self.dimensions = [];

        self.dimensions.push(new canvasgraphics.DimensionLine({
            name: "w",
            x1: bounds.x1 / units.length.value.value,
            y1: bounds.y1 / units.length.value.value,
            x2: bounds.x2 / units.length.value.value,
            y2: bounds.y1 / units.length.value.value,
            offset: -150
        }));

        //Dimensions - Height
        self.dimensions.push(new canvasgraphics.DimensionLine({
            name: "h",
            x1: bounds.x1 / units.length.value.value,
            y1: bounds.y1 / units.length.value.value,
            x2: bounds.x1 / units.length.value.value,
            y2: bounds.y2 / units.length.value.value,
        }));

        if (self.selected)
            self.UpdateSizingHandles();
    };

    self.UpdateCenter = function () {
        let polygon = new graphicsentity.Polygon(points);
        let bounds = new graphicsentity.Bounds2F();
        polygon.UpdateBounds(bounds);

        self.x.value = bounds.MidX();
        self.y.value = bounds.MidY();

        w = bounds.Width() * units.length.value.value;
    };

    self.Move = function (dx, dy) {
        let bounds = new graphicsentity.Bounds2F();

        for (let i = 0; i < points.length; i++) {
            points[i].x += dx;
            points[i].y += dy;
        }

        if (holes) {
            for (let i = 0; i < holes.length; i++) {
                //For polygonal holes
                for (let j = 0; j < holes[i].points.length; j++) {
                    holes[i].points[j].x += dx;
                    holes[i].points[j].y += dy;

                }

                //For circular holes
                if (holes[i].x !== undefined) {
                    holes[i].x += dx;
                    holes[i].y += dy;
                }
            }
        }

        self.UpdateBounds(bounds);

        self.x.value = bounds.MidX() / units.length.value.value;
        self.y.value = bounds.MidY() / units.length.value.value;
    };

    self.GetPoints = function () {
        return points;
    };

    self.GetHoles = function () {
        return holes;
    };

    self.AddPoint = function (x, y) {
        if (!points.push)
            points.push = [];

        points.push({ x: x, y: y });

        self.UpdateCenter();
    };

    self.UpdateLastPoint = function (x, y) {
        if (points.length > 0)
            points[points.length - 1] = { x: x, y: y };
    };

    self.RemoveLastPoint = function () {
        points.pop();
    }

    self.Scale = function (x1, y1, x2, y2) {
    };

    self.Resize = function (index, dx, dy, res) {
        if (dx !== 0 || dy !== 0) {
            //Angle
            let x_ = self.sizinghandles[self.sizinghandles.length - 1].x + dx - self.x.GetValue();
            let y_ = self.sizinghandles[self.sizinghandles.length - 1].y + dy - self.y.GetValue();

            let angle = Math.atan(y_ / x_);

            if (x_ < 0 && y_ > 0)
                angle += Math.PI;
            else if (x_ < 0 && y_ < 0)
                angle -= Math.PI;

            if (angle)
                self.angle.value = angle;
        }
    };

    self.GenerateSizingHandles = function () {
        self.sizinghandles = [];

        //Generate sizing handles
        if (self.selected) {
            let points = self.shape.GetPoints();
            let handle;

            for (let i = 0; i < points.length; i++) {
                handle = new canvasgraphics.Rectangle_2({ x: 0, y: 0, w: 1, h: 1 });
                handle.pointid = i;
                self.sizinghandles.push(handle);
            }

            handle = new canvasgraphics.Circle({ x: 0, y: 0, r: 1 });
            self.sizinghandles.push(handle);

            self.UpdateSizingHandles();
        }
    };

    self.UpdateSizingHandles = function () {
        let points = self.shape.GetPoints();
        let handle;
        let line;
        let midpoint;
        let i;

        for (i = 0; i < points.length; i++) {
            if (self.sizinghandles[i]) {
                self.sizinghandles[i].x = points[i].x;
                self.sizinghandles[i].y = points[i].y;

                if (self.angle.value != 0) {
                    self.sizinghandles[i].a = self.angle.value;
                    self.sizinghandles[i].Refresh();
                }
            }
        }

        //Rotation handle
        let bounds = new graphicsentity.Bounds2F();
        self.UpdateBounds(bounds);

        let radius;
        let cx = self.x.GetValue();
        let cy = self.y.GetValue();
        radius = w / 2;

        let point = Rotate(cx + radius * 1.25, cy, cx, cy, self.angle.value);

        self.sizinghandles[i].rotation = true;
        self.sizinghandles[i].x = point.x;
        self.sizinghandles[i].y = point.y;
    };

    self.OnMouseMove = function (canvas, mouse) {
        if (self.selected) {
            if (!self.activehandle) {
                let x = canvas.ToPointX(mouse.down.x);
                let y = canvas.ToPointY(mouse.down.y);

                if (!self.onmousemove) {
                    for (let i = 0; i < self.sizinghandles.length; i++)
                        if (self.sizinghandles[i].SelectByPoint(x, y)) {
                            self.onmousemove = true;
                            self.activehandle = self.sizinghandles[i];
                            self.activehandleindex = i;
                            index = i;
                            break;
                        }

                    if (!self.onmousemove) {
                        if (self.shape.SelectByPoint(x, y))
                            self.onmousemove = true;
                        else
                            return;
                    }
                } else {
                    for (let i = 0; i < self.sizinghandles.length; i++)
                        if (self.sizinghandles[i].SelectByPoint(x, y)) {
                            self.onmousemove = true;
                            self.activehandle = true;
                            self.activehandleindex = i;
                            break;
                        }
                }
            }

            //Select if there is no selected handle
            x = canvas.ToPointX(mouse.current.x);
            y = canvas.ToPointY(mouse.current.y);

            let px = canvas.ToPointX(mouse.previous.x);
            let py = canvas.ToPointY(mouse.previous.y);

            let dx = x - px;
            let dy = y - py;

            if (self.activehandle) {
                if (dx || dy) {
                    let res = 0;

                    if (self.activehandle.rotation) {
                        self.Resize(self.activehandleindex, dx, dy, res);
                    } else {
                        x = mouse.currentsnap.x;
                        y = mouse.currentsnap.y;

                        px = mouse.previoussnap.x;
                        py = mouse.previoussnap.y;

                        let point = Rotate(px, py, x, y, Math.PI * 2 - self.angle.value);

                        if (points[self.activehandle.pointid]) {
                            points[self.activehandle.pointid].x = point.x / units.length.value.value;
                            points[self.activehandle.pointid].y = point.y / units.length.value.value;
                        }
                    }

                    self.Refresh();
                    self.shape.selected = true;
                }

                self.UpdateSizingHandles();
            } else {

                //Find the closest point to snap
                let point, p1;
                let index;
                let p0 = new graphicsentity.Point2F(canvas.ToPointX(mouse.current.x), canvas.ToPointY(mouse.current.y));
                let factor = units.length.value.value;

                if (!self.pivotpoint) {
                    for (let i = 0; i < points.length; i++) {
                        if (!point) {
                            index = i;
                            point = new graphicsentity.Point2F(points[i].x * factor, points[i].y * factor);
                        }
                        else {
                            p1 = new graphicsentity.Point2F(points[i].x * factor, points[i].y * factor);

                            if (p0.Distance(p1) < p0.Distance(point)) {
                                index = i;
                                point = p1;
                            }
                        }
                    }

                    p1 = new graphicsentity.Point2F(canvas.ToPointX(mouse.previous.x), canvas.ToPointY(mouse.previous.y));
                    self.pivotpoint = { index: index, point: point, x: p1.x - point.x, y: p1.y - point.y };

                } else {

                    point = new graphicsentity.Point2F(points[self.pivotpoint.index].x * factor, points[self.pivotpoint.index].y * factor);
                    self.pivotpoint.point = point;
                }

                dx = p0.x - (point.x + self.pivotpoint.x);
                dy = p0.y - (point.y + self.pivotpoint.y);

                let spoint = mouse.Snap(point.x + dx, point.y + dy);
                dx = spoint.x - point.x;
                dy = spoint.y - point.y;

                //Move
                self.Move(dx / factor, dy / factor);
                self.Refresh();
                self.UpdateSizingHandles();

                self.shape.selected = true;
                self.moved = true;
            }

            return true;
        }

        return false;
    };

    self.Delete = function () {
        let handle = false;

        for (let i = 0; i < self.sizinghandles.length; i++)
            if (self.sizinghandles[i].selected) {
                self.sizinghandles.splice(i, 1);
                points.splice(i, 1);
                handle = true;
                self.activehandle = undefined;

                self.Refresh();
                self.UpdateSizingHandles();

                break;
            }

        return handle;
    };

    self.Refresh();
};

canvasgraphics.SectionRectangle = function (param) {
    canvasgraphics.Section.call(this, param);

    let self = this;

    self.Clone = function () {
        return new canvasgraphics.SectionRectangle({
            param
        });
    };

    self.Refresh = function () {
        let x = self.x.GetValue();
        let y = self.y.GetValue();
        let w = self.w.GetValue();
        let h = self.h.GetValue();

        let a = self.angle.value;

        //Shape
        self.shape = new canvasgraphics.Rectangle_2({
            x: x,
            y: y,
            w: w,
            h: h,
            a: a
        });

        x = self.x.value;
        y = self.y.value;
        w = self.w.value;
        h = self.h.value;

        self.dimensions = [];

        let points = self.shape.GetPoints();

        //Dimensions - Width
        self.dimensions.push(new canvasgraphics.DimensionLine({
            name: "w",
            x1: points[0].x / units.length.value.value,
            y1: points[0].y / units.length.value.value,
            x2: points[3].x / units.length.value.value,
            y2: points[3].y / units.length.value.value,
            offset: -150
        }));

        //Dimensions - Height
        self.dimensions.push(new canvasgraphics.DimensionLine({
            name: "h",
            x1: points[0].x / units.length.value.value,
            y1: points[0].y / units.length.value.value,
            x2: points[1].x / units.length.value.value,
            y2: points[1].y / units.length.value.value,
        }));
    };

    self.Resize = function (index, dx, dy, res) {
        if (dx !== 0 || dy !== 0) {
            switch (index) {
                case 0:
                    //Left
                    self.x.value += dx / 2 / units.length.value.value;
                    self.y.value += dy / 2 / units.length.value.value;
                    self.w.value -= res / units.length.value.value;

                    break;

                case 1:
                    //Top
                    self.x.value += dy / 2 / units.length.value.value;
                    self.y.value -= dx / 2 / units.length.value.value;
                    self.h.value -= res / units.length.value.value;

                    break;

                case 2:
                    //Right
                    self.x.value += dx / 2 / units.length.value.value;
                    self.y.value += dy / 2 / units.length.value.value;
                    self.w.value += res / units.length.value.value;

                    break;

                case 3:
                    //Bottom
                    self.x.value += dy / 2 / units.length.value.value;
                    self.y.value -= dx / 2 / units.length.value.value;
                    self.h.value += res / units.length.value.value;

                    break;

                case 4:
                    //Angle
                    let x_ = self.sizinghandles[4].x + dx - self.x.GetValue();
                    let y_ = self.sizinghandles[4].y + dy - self.y.GetValue();

                    let angle = Math.atan(y_ / x_);

                    if (x_ < 0 && y_ > 0)
                        angle += Math.PI;
                    else if (x_ < 0 && y_ < 0)
                        angle -= Math.PI;

                    if (angle)
                        self.angle.value = angle;

                    //console.log(angle);
                    break;
            }
        }
    };

    self.Scale = function (x1, y1, x2, y2) {
        self.x.value = (x1 + x2) / 2;
        self.y.value = (y1 + y2) / 2;
        self.w.value = Math.abs(x1 - x2);
        self.h.value = Math.abs(y1 - y2);

        self.Refresh();
    };

    self.GetPoints = function () {
        let points = self.shape.GetPoints();
        let output = [];

        for (let i = 0; i < points.length; i++) {
            output.push({
                x: points[i].x / units.length.value.value,
                y: points[i].y / units.length.value.value
            });
        }

        return output;
    };

    this.Refresh();
};

canvasgraphics.SectionCircle = function (param) {
    canvasgraphics.Section.call(this, param);

    let self = this;

    if (param.r !== undefined) {
        self.r = new mobiwork.PropertyDouble({
            text: "Radius, r",
            value: param.r,
            unit: units.length
        });
    }

    self.points = [];

    self.Clone = function () {
        return new canvasgraphics.SectionCircle({
            param
        });
    };

    self.Refresh = function () {
        let x = self.x.GetValue();
        let y = self.y.GetValue();
        let r = self.r.GetValue();
        let a = self.angle.value;

        //Shape
        self.shape = new canvasgraphics.Circle({
            x: x,
            y: y,
            r: r,
            a: a
        });

        x = self.x.value;
        y = self.y.value;
        r = self.r.value;

        self.dimensions = [];

        self.dimensions.push(new canvasgraphics.DimensionLine({
            name: "r",
            x1: x,
            y1: y,
            x2: x + r,
            y2: y,
            offset: -150
        }));
    };

    self.Resize = function (index, dx, dy, res) {
        switch (index) {
            case 0:
                //Radial
                self.x.value += dy / 2 / units.length.value.value;
                self.y.value += dy / 2 / units.length.value.value;
                self.r.value += res / units.length.value.value;
                break;
            case 1:
                //Angle
                let x_ = self.sizinghandles[index].x + dx - self.x.GetValue();
                let y_ = self.sizinghandles[index].y + dy - self.y.GetValue();

                let angle = Math.atan(y_ / x_);

                if (x_ < 0 && y_ > 0)
                    angle += Math.PI;
                else if (x_ < 0 && y_ < 0)
                    angle -= Math.PI;

                if (angle)
                    self.angle.value = angle;
                break;
        }


        console.log("index: " + index + ", dx: " + dx + ", dy: " + dy);
    };

    self.Scale = function (x1, y1, x2, y2) {
        self.x.value = (x1 + x2) / 2;
        self.y.value = (y1 + y2) / 2;
        self.r.value = Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2)) / 2;

        self.Refresh();
    };

    self.GenerateSizingHandles = function () {
        self.sizinghandles = [];

        //Generate sizing handles
        if (self.selected) {
            let points = self.shape.GetPoints();
            let handle;

            for (let i = 0; i < points.length; i++) {
                handle = new canvasgraphics.Rectangle_2({ x: 0, y: 0 });
                self.sizinghandles.push(handle);
            }

            self.UpdateSizingHandles();
        }
    };

    self.GetHoles = function () {
    };

    this.Refresh();
};

canvasgraphics.SectionRegularPolygon = function (param) {
    canvasgraphics.Section.call(this, param);

    let self = this;

    if (param.r !== undefined) {
        self.r = new mobiwork.PropertyDouble({
            text: "Radius, r",
            value: param.r,
            unit: units.length
        });
    }

    if (param.n !== undefined) {
        self.n = new mobiwork.PropertyDouble({
            text: "No. of Sides",
            value: param.n
        });
    }

    self.points = [];

    self.Clone = function () {
        return new canvasgraphics.SectionRegularPolygon({
            param
        });
    };

    self.Refresh = function () {
        let x = self.x.GetValue();
        let y = self.y.GetValue();
        let r = self.r.GetValue();
        let n = self.n.GetValue();
        let a = self.angle.value;

        //Shape
        self.shape = new canvasgraphics.RegularPolygon({
            x: x,
            y: y,
            r: r,
            n: n,
            a: a
        });

        x = self.x.value;
        y = self.y.value;
        r = self.r.value;
        n = self.n.value;

        self.dimensions = [];

        self.dimensions.push(new canvasgraphics.DimensionLine({
            name: "r",
            x1: x,
            y1: y,
            x2: x + r,
            y2: y,
            offset: -150
        }));
    };

    self.Resize = function (index, dx, dy, res) {
        switch (index) {
            case 0:
                //Radial
                self.x.value += dy / 2 / units.length.value.value;
                self.y.value += dy / 2 / units.length.value.value;
                self.r.value += res / units.length.value.value;
                break;

            case 1:
                //Angle
                let x_ = self.sizinghandles[index].x + dx - self.x.GetValue();
                let y_ = self.sizinghandles[index].y + dy - self.y.GetValue();

                let angle = Math.atan(y_ / x_);

                if (x_ < 0 && y_ > 0)
                    angle += Math.PI;
                else if (x_ < 0 && y_ < 0)
                    angle -= Math.PI;

                if (angle)
                    self.angle.value = angle;
                break;
        }
    };

    self.Scale = function (x1, y1, x2, y2) {
        self.x.value = (x1 + x2) / 2;
        self.y.value = (y1 + y2) / 2;
        self.r.value = Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2)) / 2;

        self.Refresh();
    };

    this.Refresh();
};

canvasgraphics.SectionTee = function (param) {
    canvasgraphics.Section.call(this, param);

    let self = this;

    if (param.tw !== undefined) {
        self.tw = new mobiwork.PropertyDouble({
            text: "Web Thickness, tw",
            value: param.tw,
            unit: units.length
        });
    }

    if (param.tf !== undefined) {
        self.tf = new mobiwork.PropertyDouble({
            text: "Flange Thickness, tf",
            value: param.tf,
            unit: units.length
        });
    }

    self.points = [];

    self.Clone = function () {
        return new canvasgraphics.SectionTee({
            param
        });
    };

    self.Refresh = function () {
        let x = self.x.GetValue();
        let y = self.y.GetValue();
        let w = self.w.GetValue();
        let h = self.h.GetValue();
        let tw = self.tw.GetValue();
        let tf = self.tf.GetValue();

        let a = self.angle.value;

        //Shape
        self.shape = new canvasgraphics.Tee({
            x: x,
            y: y,
            w: w,
            h: h,
            tw: tw,
            tf: tf,
            a: a
        });

        x = self.x.value;
        y = self.y.value;
        w = self.w.value;
        h = self.h.value;
        tw = self.tw.value;
        tf = self.tf.value;

        self.dimensions = [];

        let points = self.shape.GetPoints();

        self.dimensions.push(new canvasgraphics.DimensionLine({
            name: "w",
            x1: points[3].x / units.length.value.value,
            y1: points[3].y / units.length.value.value,
            x2: points[4].x / units.length.value.value,
            y2: points[4].y / units.length.value.value,
            offset: 150
        }));

        self.dimensions.push(new canvasgraphics.VerticalDimensionLine({
            name: "h",
            x1: points[0].x / units.length.value.value,
            y1: points[0].y / units.length.value.value,
            x2: points[3].x / units.length.value.value,
            y2: points[3].y / units.length.value.value,
            offset: 150
        }));

        self.dimensions.push(new canvasgraphics.DimensionLine({
            name: "tw",
            x1: points[0].x / units.length.value.value,
            y1: points[0].y / units.length.value.value,
            x2: points[7].x / units.length.value.value,
            y2: points[7].y / units.length.value.value,
            offset: -150
        }));

        self.dimensions.push(new canvasgraphics.DimensionLine({
            name: "tf",
            x1: points[5].x / units.length.value.value,
            y1: points[5].y / units.length.value.value,
            x2: points[4].x / units.length.value.value,
            y2: points[4].y / units.length.value.value,
            offset: -150
        }));
    };

    //TODO: Change to Tee section resizing
    self.Resize = function (index, dx, dy, res) {
        if (dx !== 0 || dy !== 0) {
            switch (index) {
                case 0:
                    //Left
                    self.x.value += dx / 2 / units.length.value.value;
                    self.y.value += dy / 2 / units.length.value.value;
                    self.w.value -= res / units.length.value.value;

                    break;

                case 1:
                    //Top
                    self.x.value += dy / 2 / units.length.value.value;
                    self.y.value -= dx / 2 / units.length.value.value;
                    self.h.value -= res / units.length.value.value;

                    break;

                case 2:
                    //Right
                    self.x.value += dx / 2 / units.length.value.value;
                    self.y.value += dy / 2 / units.length.value.value;
                    self.w.value += res / units.length.value.value;

                    break;

                case 3:
                    //Bottom
                    self.x.value += dy / 2 / units.length.value.value;
                    self.y.value -= dx / 2 / units.length.value.value;
                    self.h.value += res / units.length.value.value;

                    break;

                case 8:
                    //Angle
                    let x_ = self.sizinghandles[4].x + dx - self.x.GetValue();
                    let y_ = self.sizinghandles[4].y + dy - self.y.GetValue();

                    let angle = Math.atan(y_ / x_);

                    if (x_ < 0 && y_ > 0)
                        angle += Math.PI;
                    else if (x_ < 0 && y_ < 0)
                        angle -= Math.PI;

                    if (angle)
                        self.angle.value = angle;

                    //console.log(angle);
                    break;
            }
        }
    };

    self.Scale = function (x1, y1, x2, y2) {
        self.x.value = (x1 + x2) / 2;
        self.y.value = (y1 + y2) / 2;
        self.w.value = Math.abs(x1 - x2);
        self.h.value = Math.abs(y1 - y2);
        self.tw.value = Math.abs(x1 - x2) * 0.3;
        self.tf.value = Math.abs(y1 - y2) * 0.3;

        self.Refresh();
    };

    this.Refresh();
};

canvasgraphics.SectionSlopedTee = function (param) {
    canvasgraphics.Section.call(this, param);

    let self = this;

    if (param.tw !== undefined) {
        self.tw = new mobiwork.PropertyDouble({
            text: "Web Thickness, tw",
            value: param.tw,
            unit: units.length
        });
    }

    if (param.tf !== undefined) {
        self.tf = new mobiwork.PropertyDouble({
            text: "Flange Thickness, tf",
            value: param.tf,
            unit: units.length
        });
    }

    if (param.ow !== undefined) {
        self.ow = new mobiwork.PropertyDouble({
            text: "Web Offset, ow",
            value: param.ow,
            unit: units.length
        });
    }

    if (param.of !== undefined) {
        self.of = new mobiwork.PropertyDouble({
            text: "Flange Offset, of",
            value: param.of,
            unit: units.length
        });
    }

    self.points = [];

    self.Clone = function () {
        return new canvasgraphics.SectionSlopedTee({
            param
        });
    };

    self.Refresh = function () {
        let x = self.x.GetValue();
        let y = self.y.GetValue();
        let w = self.w.GetValue();
        let h = self.h.GetValue();
        let tw = self.tw.GetValue();
        let tf = self.tf.GetValue();
        let ow = self.ow.GetValue();
        let of = self.of.GetValue();

        let a = self.angle.value;

        //Shape
        self.shape = new canvasgraphics.SlopedTee({
            x: x,
            y: y,
            w: w,
            h: h,
            tw: tw,
            tf: tf,
            ow: ow,
            of: of,
            a: a
        });

        x = self.x.value;
        y = self.y.value;
        w = self.w.value;
        h = self.h.value;
        tw = self.tw.value;
        tf = self.tf.value;
        ow = self.ow.value;
        of = self.of.value;

        self.dimensions = [];

        let points = self.shape.GetPoints();

        //Dimensions - Width
        self.dimensions.push(new canvasgraphics.DimensionLine({
            name: "w",
            x1: points[3].x / units.length.value.value,
            y1: points[3].y / units.length.value.value,
            x2: points[4].x / units.length.value.value,
            y2: points[4].y / units.length.value.value,
            offset: 150
        }));

        self.dimensions.push(new canvasgraphics.VerticalDimensionLine({
            name: "h",
            x1: points[0].x / units.length.value.value,
            y1: points[0].y / units.length.value.value,
            x2: points[3].x / units.length.value.value,
            y2: points[3].y / units.length.value.value,
            offset: 150
        }));

        self.dimensions.push(new canvasgraphics.DimensionLine({
            name: "tw",
            x1: points[0].x / units.length.value.value,
            y1: points[0].y / units.length.value.value,
            x2: points[7].x / units.length.value.value,
            y2: points[7].y / units.length.value.value,
            offset: -150
        }));

        self.dimensions.push(new canvasgraphics.DimensionLine({
            name: "tf",
            x1: points[5].x / units.length.value.value,
            y1: points[5].y / units.length.value.value,
            x2: points[4].x / units.length.value.value,
            y2: points[4].y / units.length.value.value,
            offset: -150
        }));

        self.dimensions.push(new canvasgraphics.DimensionLine({
            name: "ow",
            x1: points[1].x / units.length.value.value,
            y1: points[1].y / units.length.value.value - (h - tf - of),
            x2: points[0].x / units.length.value.value,
            y2: points[0].y / units.length.value.value,
            offset: -75
        }));

        self.dimensions.push(new canvasgraphics.DimensionLine({
            name: "ow",
            x1: points[7].x / units.length.value.value,
            y1: points[7].y / units.length.value.value,
            x2: points[6].x / units.length.value.value,
            y2: points[6].y / units.length.value.value - (h - tf - of),
            offset: -75
        }));

        self.dimensions.push(new canvasgraphics.DimensionLine({
            name: "of",
            x1: points[6].x / units.length.value.value + (w - tw - 2 * ow) / 2,
            y1: points[6].y / units.length.value.value,
            x2: points[5].x / units.length.value.value,
            y2: points[5].y / units.length.value.value,
            offset: -75
        }));
    };

    //TODO: Change to Tee section resizing
    self.Resize = function (index, dx, dy, res) {
        if (dx !== 0 || dy !== 0) {
            switch (index) {
                case 0:
                    //Left
                    self.x.value += dx / 2 / units.length.value.value;
                    self.y.value += dy / 2 / units.length.value.value;
                    self.w.value -= res / units.length.value.value;

                    break;

                case 1:
                    //Top
                    self.x.value += dy / 2 / units.length.value.value;
                    self.y.value -= dx / 2 / units.length.value.value;
                    self.h.value -= res / units.length.value.value;

                    break;

                case 2:
                    //Right
                    self.x.value += dx / 2 / units.length.value.value;
                    self.y.value += dy / 2 / units.length.value.value;
                    self.w.value += res / units.length.value.value;

                    break;

                case 3:
                    //Bottom
                    self.x.value += dy / 2 / units.length.value.value;
                    self.y.value -= dx / 2 / units.length.value.value;
                    self.h.value += res / units.length.value.value;

                    break;

                case 8:
                    //Angle
                    let x_ = self.sizinghandles[8].x + dx - self.x.GetValue();
                    let y_ = self.sizinghandles[8].y + dy - self.y.GetValue();

                    let angle = Math.atan(y_ / x_);

                    if (x_ < 0 && y_ > 0)
                        angle += Math.PI;
                    else if (x_ < 0 && y_ < 0)
                        angle -= Math.PI;

                    if (angle)
                        self.angle.value = angle;

                    break;
            }
        }
    };

    self.Scale = function (x1, y1, x2, y2) {
        self.x.value = (x1 + x2) / 2;
        self.y.value = (y1 + y2) / 2;
        self.w.value = Math.abs(x1 - x2);
        self.h.value = Math.abs(y1 - y2);
        self.tw.value = Math.abs(x1 - x2) * 0.2;
        self.tf.value = Math.abs(y1 - y2) * 0.2;
        self.ow.value = Math.abs(x1 - x2) * 0.05;
        self.of.value = Math.abs(y1 - y2) * 0.1;

        self.Refresh();
    };

    this.Refresh();
};

canvasgraphics.SectionI = function (param) {
    canvasgraphics.Section.call(this, param);

    let self = this;

    if (param.wt !== undefined) {
        self.wt = new mobiwork.PropertyDouble({
            text: "Top Flange Width, wt",
            value: param.wt,
            unit: units.length
        });
    }

    if (param.wb !== undefined) {
        self.wb = new mobiwork.PropertyDouble({
            text: "Bottom Flange Width, wb",
            value: param.wb,
            unit: units.length
        });
    }

    if (param.tw !== undefined) {
        self.tw = new mobiwork.PropertyDouble({
            text: "Web Thickness, tw",
            value: param.tw,
            unit: units.length
        });
    }

    if (param.tft !== undefined) {
        self.tft = new mobiwork.PropertyDouble({
            text: "Top Flange Thickness, tft",
            value: param.tft,
            unit: units.length
        });
    }

    if (param.tfb !== undefined) {
        self.tfb = new mobiwork.PropertyDouble({
            text: "Bottom Flange Thickness, tfb",
            value: param.tfb,
            unit: units.length
        });
    }

    self.points = [];

    self.Clone = function () {
        return new canvasgraphics.SectionI({
            param
        });
    };

    self.Refresh = function () {
        let x = self.x.GetValue();
        let y = self.y.GetValue();
        let wt = self.wt.GetValue();
        let wb = self.wb.GetValue();
        let h = self.h.GetValue();
        let tft = self.tft.GetValue();
        let tfb = self.tfb.GetValue();
        let tw = self.tw.GetValue();

        let a = self.angle.value;

        //Shape
        self.shape = new canvasgraphics.I({
            x: x,
            y: y,
            wt: wt,
            wb: wb,
            h: h,
            tw: tw,
            tft: tft,
            tfb: tfb,
            a: a
        });

        x = self.x.value;
        y = self.y.value;
        wt = self.wt.value;
        wb = self.wb.value;
        h = self.h.value;
        tw = self.tw.value;
        tft = self.tft.value;
        tfb = self.tfb.value;

        self.dimensions = [];

        let points = self.shape.GetPoints();

        //Dimensions
        self.dimensions.push(new canvasgraphics.DimensionLine({
            name: "wt",
            x1: points[5].x / units.length.value.value,
            y1: points[5].y / units.length.value.value,
            x2: points[6].x / units.length.value.value,
            y2: points[6].y / units.length.value.value,
            offset: 150
        }));

        self.dimensions.push(new canvasgraphics.DimensionLine({
            name: "wb",
            x1: points[0].x / units.length.value.value,
            y1: points[0].y / units.length.value.value,
            x2: points[11].x / units.length.value.value,
            y2: points[11].y / units.length.value.value,
            offset: -150
        }));

        self.dimensions.push(new canvasgraphics.VerticalDimensionLine({
            name: "h",
            x1: points[0].x / units.length.value.value,
            y1: points[0].y / units.length.value.value,
            x2: points[5].x / units.length.value.value,
            y2: points[5].y / units.length.value.value,
            offset: 150
        }));

        self.dimensions.push(new canvasgraphics.DimensionLine({
            name: "tw",
            x1: points[2].x / units.length.value.value,
            y1: y,
            x2: points[9].x / units.length.value.value,
            y2: y,
            offset: 150
        }));

        self.dimensions.push(new canvasgraphics.DimensionLine({
            name: "tft",
            x1: points[7].x / units.length.value.value,
            y1: points[7].y / units.length.value.value,
            x2: points[6].x / units.length.value.value,
            y2: points[6].y / units.length.value.value,
            offset: -150
        }));

        self.dimensions.push(new canvasgraphics.DimensionLine({
            name: "tfb",
            x1: points[11].x / units.length.value.value,
            y1: points[11].y / units.length.value.value,
            x2: points[10].x / units.length.value.value,
            y2: points[10].y / units.length.value.value,
            offset: -150
        }));
    };

    //TODO: Change to Angle section resizing
    self.Resize = function (index, dx, dy, res) {
        if (dx !== 0 || dy !== 0) {
            switch (index) {
                case 0:
                    //Left
                    self.x.value += dx / 2 / units.length.value.value;
                    self.y.value += dy / 2 / units.length.value.value;
                    self.w.value -= res / units.length.value.value;

                    break;

                case 1:
                    //Top
                    self.x.value += dy / 2 / units.length.value.value;
                    self.y.value -= dx / 2 / units.length.value.value;
                    self.h.value -= res / units.length.value.value;

                    break;

                case 2:
                    //Right
                    self.x.value += dx / 2 / units.length.value.value;
                    self.y.value += dy / 2 / units.length.value.value;
                    self.w.value += res / units.length.value.value;

                    break;

                case 3:
                    //Bottom
                    self.x.value += dy / 2 / units.length.value.value;
                    self.y.value -= dx / 2 / units.length.value.value;
                    self.h.value += res / units.length.value.value;

                    break;

                case 4:
                    //Angle
                    let x_ = self.sizinghandles[4].x + dx - self.x.GetValue();
                    let y_ = self.sizinghandles[4].y + dy - self.y.GetValue();

                    let angle = Math.atan(y_ / x_);

                    if (x_ < 0 && y_ > 0)
                        angle += Math.PI;
                    else if (x_ < 0 && y_ < 0)
                        angle -= Math.PI;

                    if (angle)
                        self.angle.value = angle;

                    //console.log(angle);
                    break;
            }
        }
    };

    self.Scale = function (x1, y1, x2, y2) {
        self.x.value = (x1 + x2) / 2;
        self.y.value = (y1 + y2) / 2;
        self.wb.value = Math.abs(x1 - x2);
        self.wt.value = Math.abs(x1 - x2);
        self.tw.value = Math.abs(x1 - x2) * 0.3;
        self.h.value = Math.abs(y1 - y2);
        self.tft.value = Math.abs(y1 - y2) * 0.15;
        self.tfb.value = Math.abs(y1 - y2) * 0.15;

        self.Refresh();
    };

    this.Refresh();
};

canvasgraphics.SectionSlopedI = function (param) {
    canvasgraphics.Section.call(this, param);

    let self = this;

    if (param.wt !== undefined) {
        self.wt = new mobiwork.PropertyDouble({
            text: "Top Flange Width, wt",
            value: param.wt,
            unit: units.length
        });
    }

    if (param.wb !== undefined) {
        self.wb = new mobiwork.PropertyDouble({
            text: "Bottom Flange Width, wb",
            value: param.wb,
            unit: units.length
        });
    }

    if (param.tft !== undefined) {
        self.tft = new mobiwork.PropertyDouble({
            text: "Top Flange Thickness, tft",
            value: param.tft,
            unit: units.length
        });
    }

    if (param.tfb !== undefined) {
        self.tfb = new mobiwork.PropertyDouble({
            text: "Bottom Flange Thickness, tfb",
            value: param.tfb,
            unit: units.length
        });
    }

    if (param.oft !== undefined) {
        self.oft = new mobiwork.PropertyDouble({
            text: "Top Flange Offset, oft",
            value: param.oft,
            unit: units.length
        });
    }

    if (param.ofb !== undefined) {
        self.ofb = new mobiwork.PropertyDouble({
            text: "Bottom Flange Offset, ofb",
            value: param.ofb,
            unit: units.length
        });
    }

    if (param.tw !== undefined) {
        self.tw = new mobiwork.PropertyDouble({
            text: "Web Thickness, tw",
            value: param.tw,
            unit: units.length
        });
    }

    self.points = [];

    self.Clone = function () {
        return new canvasgraphics.SectionSlopedI({
            param
        });
    };

    self.Refresh = function () {
        let x = self.x.GetValue();
        let y = self.y.GetValue();
        let wt = self.wt.GetValue();
        let wb = self.wb.GetValue();
        let h = self.h.GetValue();
        let tft = self.tft.GetValue();
        let tfb = self.tfb.GetValue();
        let oft = self.oft.GetValue();
        let ofb = self.ofb.GetValue();
        let tw = self.tw.GetValue();

        let a = self.angle.value;

        //Shape
        self.shape = new canvasgraphics.SlopedI({
            x: x,
            y: y,
            wt: wt,
            wb: wb,
            h: h,
            tw: tw,
            tft: tft,
            tfb: tfb,
            oft: oft,
            ofb: ofb,
            a: a
        });

        x = self.x.value;
        y = self.y.value;
        wt = self.wt.value;
        wb = self.wb.value;
        h = self.h.value;
        tw = self.tw.value;
        tft = self.tft.value;
        tfb = self.tfb.value;
        oft = self.oft.value;
        ofb = self.ofb.value;

        self.dimensions = [];

        let points = self.shape.GetPoints();

        //Dimensions
        self.dimensions.push(new canvasgraphics.DimensionLine({
            name: "wt",
            x1: points[5].x / units.length.value.value,
            y1: points[5].y / units.length.value.value,
            x2: points[6].x / units.length.value.value,
            y2: points[6].y / units.length.value.value,
            offset: 150
        }));

        self.dimensions.push(new canvasgraphics.DimensionLine({
            name: "wb",
            x1: points[0].x / units.length.value.value,
            y1: points[0].y / units.length.value.value,
            x2: points[11].x / units.length.value.value,
            y2: points[11].y / units.length.value.value,
            offset: -150
        }));

        self.dimensions.push(new canvasgraphics.VerticalDimensionLine({
            name: "h",
            x1: points[0].x / units.length.value.value,
            y1: points[0].y / units.length.value.value,
            x2: points[5].x / units.length.value.value,
            y2: points[5].y / units.length.value.value,
            offset: 150
        }));

        self.dimensions.push(new canvasgraphics.DimensionLine({
            name: "tw",
            x1: points[2].x / units.length.value.value,
            y1: y,
            x2: points[9].x / units.length.value.value,
            y2: y,
            offset: 150
        }));

        self.dimensions.push(new canvasgraphics.DimensionLine({
            name: "tft",
            x1: points[7].x / units.length.value.value,
            y1: points[7].y / units.length.value.value,
            x2: points[6].x / units.length.value.value,
            y2: points[6].y / units.length.value.value,
            offset: -150
        }));

        self.dimensions.push(new canvasgraphics.DimensionLine({
            name: "tfb",
            x1: points[11].x / units.length.value.value,
            y1: points[11].y / units.length.value.value,
            x2: points[10].x / units.length.value.value,
            y2: points[10].y / units.length.value.value,
            offset: -150
        }));

        self.dimensions.push(new canvasgraphics.DimensionLine({
            name: "oft",
            x1: points[7].x / units.length.value.value,
            y1: points[8].y / units.length.value.value,
            x2: points[7].x / units.length.value.value,
            y2: points[7].y / units.length.value.value,
            offset: -75
        }));

        self.dimensions.push(new canvasgraphics.DimensionLine({
            name: "ofb",
            x1: points[10].x / units.length.value.value,
            y1: points[10].y / units.length.value.value,
            x2: points[10].x / units.length.value.value,
            y2: points[9].y / units.length.value.value,
            offset: -75
        }));
    };

    //TODO: Change to Angle section resizing
    self.Resize = function (index, dx, dy, res) {
        if (dx !== 0 || dy !== 0) {
            switch (index) {
                case 0:
                    //Left
                    self.x.value += dx / 2 / units.length.value.value;
                    self.y.value += dy / 2 / units.length.value.value;
                    self.w.value -= res / units.length.value.value;

                    break;

                case 1:
                    //Top
                    self.x.value += dy / 2 / units.length.value.value;
                    self.y.value -= dx / 2 / units.length.value.value;
                    self.h.value -= res / units.length.value.value;

                    break;

                case 2:
                    //Right
                    self.x.value += dx / 2 / units.length.value.value;
                    self.y.value += dy / 2 / units.length.value.value;
                    self.w.value += res / units.length.value.value;

                    break;

                case 3:
                    //Bottom
                    self.x.value += dy / 2 / units.length.value.value;
                    self.y.value -= dx / 2 / units.length.value.value;
                    self.h.value += res / units.length.value.value;

                    break;

                case 4:
                    //Angle
                    let x_ = self.sizinghandles[4].x + dx - self.x.GetValue();
                    let y_ = self.sizinghandles[4].y + dy - self.y.GetValue();

                    let angle = Math.atan(y_ / x_);

                    if (x_ < 0 && y_ > 0)
                        angle += Math.PI;
                    else if (x_ < 0 && y_ < 0)
                        angle -= Math.PI;

                    if (angle)
                        self.angle.value = angle;

                    //console.log(angle);
                    break;
            }
        }
    };

    //TODO: Change to Angle section scaling
    self.Scale = function (x1, y1, x2, y2) {
        self.x.value = (x1 + x2) / 2;
        self.y.value = (y1 + y2) / 2;
        self.wb.value = Math.abs(x1 - x2);
        self.wt.value = Math.abs(x1 - x2);
        self.tw.value = Math.abs(x1 - x2) * 0.3;
        self.h.value = Math.abs(y1 - y2);
        self.tft.value = Math.abs(y1 - y2) * 0.2;
        self.tfb.value = Math.abs(y1 - y2) * 0.2;
        self.oft.value = Math.abs(y1 - y2) * 0.1;
        self.ofb.value = Math.abs(y1 - y2) * 0.1;

        self.Refresh();
    };

    this.Refresh();
};

canvasgraphics.SectionAngle = function (param) {
    canvasgraphics.Section.call(this, param);

    let self = this;

    if (param.tw !== undefined) {
        self.tw = new mobiwork.PropertyDouble({
            text: "Web Thickness, tw",
            value: param.tw,
            unit: units.length
        });
    }

    if (param.tf !== undefined) {
        self.tf = new mobiwork.PropertyDouble({
            text: "Flange Thickness, tf",
            value: param.tf,
            unit: units.length
        });
    }

    self.points = [];

    self.Clone = function () {
        return new canvasgraphics.SectionAngle({
            param
        });
    };

    self.Refresh = function () {
        let x = self.x.GetValue();
        let y = self.y.GetValue();
        let w = self.w.GetValue();
        let h = self.h.GetValue();
        let tw = self.tw.GetValue();
        let tf = self.tf.GetValue();

        let a = self.angle.value;

        //Shape
        self.shape = new canvasgraphics.Angle({
            x: x,
            y: y,
            w: w,
            h: h,
            tw: tw,
            tf: tf,
            a: a
        });

        x = self.x.value;
        y = self.y.value;
        w = self.w.value;
        h = self.h.value;
        tw = self.tw.value;
        tf = self.tf.value;

        self.dimensions = [];

        let points = self.shape.GetPoints();

        //Dimensions
        self.dimensions.push(new canvasgraphics.DimensionLine({
            name: "w",
            x1: points[0].x / units.length.value.value,
            y1: points[0].y / units.length.value.value,
            x2: points[5].x / units.length.value.value,
            y2: points[5].y / units.length.value.value,
            offset: -150
        }));

        self.dimensions.push(new canvasgraphics.DimensionLine({
            name: "h",
            x1: points[0].x / units.length.value.value,
            y1: points[0].y / units.length.value.value,
            x2: points[1].x / units.length.value.value,
            y2: points[1].y / units.length.value.value,
        }));

        self.dimensions.push(new canvasgraphics.DimensionLine({
            name: "tw",
            x1: points[1].x / units.length.value.value,
            y1: points[1].y / units.length.value.value,
            x2: points[2].x / units.length.value.value,
            y2: points[2].y / units.length.value.value,
            offset: 150
        }));

        self.dimensions.push(new canvasgraphics.DimensionLine({
            name: "tf",
            x1: points[5].x / units.length.value.value,
            y1: points[5].y / units.length.value.value,
            x2: points[4].x / units.length.value.value,
            y2: points[4].y / units.length.value.value,
            offset: -150
        }));
    };

    //TODO: Change to Angle section resizing
    self.Resize = function (index, dx, dy, res) {
        if (dx !== 0 || dy !== 0) {
            switch (index) {
                case 0:
                    //Left
                    self.x.value += dx / 2 / units.length.value.value;
                    self.y.value += dy / 2 / units.length.value.value;
                    self.w.value -= res / units.length.value.value;

                    break;

                case 1:
                    //Top
                    self.x.value += dy / 2 / units.length.value.value;
                    self.y.value -= dx / 2 / units.length.value.value;
                    self.h.value -= res / units.length.value.value;

                    break;

                case 2:
                    //Right
                    self.x.value += dx / 2 / units.length.value.value;
                    self.y.value += dy / 2 / units.length.value.value;
                    self.w.value += res / units.length.value.value;

                    break;

                case 3:
                    //Bottom
                    self.x.value += dy / 2 / units.length.value.value;
                    self.y.value -= dx / 2 / units.length.value.value;
                    self.h.value += res / units.length.value.value;

                    break;

                case 4:
                    //Angle
                    let x_ = self.sizinghandles[4].x + dx - self.x.GetValue();
                    let y_ = self.sizinghandles[4].y + dy - self.y.GetValue();

                    let angle = Math.atan(y_ / x_);

                    if (x_ < 0 && y_ > 0)
                        angle += Math.PI;
                    else if (x_ < 0 && y_ < 0)
                        angle -= Math.PI;

                    if (angle)
                        self.angle.value = angle;

                    //console.log(angle);
                    break;
            }
        }
    };

    self.Scale = function (x1, y1, x2, y2) {
        self.x.value = (x1 + x2) / 2;
        self.y.value = (y1 + y2) / 2;
        self.w.value = Math.abs(x1 - x2);
        self.h.value = Math.abs(y1 - y2);
        self.tw.value = Math.abs(x1 - x2) * 0.3;
        self.tf.value = Math.abs(y1 - y2) * 0.3;

        self.Refresh();
    };

    this.Refresh();
};

canvasgraphics.SectionChannel = function (param) {
    canvasgraphics.Section.call(this, param);

    let self = this;

    if (param.wt !== undefined) {
        self.wt = new mobiwork.PropertyDouble({
            text: "Top Flange Width, wt",
            value: param.wt,
            unit: units.length
        });
    }

    if (param.wb !== undefined) {
        self.wb = new mobiwork.PropertyDouble({
            text: "Bottom Flange Width, wb",
            value: param.wb,
            unit: units.length
        });
    }

    if (param.tft !== undefined) {
        self.tft = new mobiwork.PropertyDouble({
            text: "Top Flange Thickness, tft",
            value: param.tft,
            unit: units.length
        });
    }

    if (param.tfb !== undefined) {
        self.tfb = new mobiwork.PropertyDouble({
            text: "Bottom Flange Thickness, tfb",
            value: param.tfb,
            unit: units.length
        });
    }

    if (param.tw !== undefined) {
        self.tw = new mobiwork.PropertyDouble({
            text: "Web Thickness, tw",
            value: param.tw,
            unit: units.length
        });
    }

    self.points = [];

    self.Clone = function () {
        return new canvasgraphics.SectionChannel({
            param
        });
    };

    self.Refresh = function () {
        let x = self.x.GetValue();
        let y = self.y.GetValue();
        let wt = self.wt.GetValue();
        let wb = self.wb.GetValue();
        let h = self.h.GetValue();
        let tft = self.tft.GetValue();
        let tfb = self.tfb.GetValue();
        let tw = self.tw.GetValue();

        let a = self.angle.value;

        //Shape
        self.shape = new canvasgraphics.Channel({
            x: x,
            y: y,
            wt: wt,
            wb: wb,
            h: h,
            tw: tw,
            tft: tft,
            tfb: tfb,
            a: a
        });

        x = self.x.value;
        y = self.y.value;
        wt = self.wt.value;
        wb = self.wb.value;
        h = self.h.value;
        tw = self.tw.value;
        tft = self.tft.value;
        tfb = self.tfb.value;

        self.dimensions = [];

        let points = self.shape.GetPoints();

        //Dimensions
        self.dimensions.push(new canvasgraphics.DimensionLine({
            name: "wt",
            x1: points[1].x / units.length.value.value,
            y1: points[1].y / units.length.value.value,
            x2: points[2].x / units.length.value.value,
            y2: points[2].y / units.length.value.value,
            offset: 150
        }));

        self.dimensions.push(new canvasgraphics.DimensionLine({
            name: "wb",
            x1: points[0].x / units.length.value.value,
            y1: points[0].y / units.length.value.value,
            x2: points[7].x / units.length.value.value,
            y2: points[7].y / units.length.value.value,
            offset: -150
        }));

        self.dimensions.push(new canvasgraphics.VerticalDimensionLine({
            name: "h",
            x1: points[0].x / units.length.value.value,
            y1: points[0].y / units.length.value.value,
            x2: points[1].x / units.length.value.value,
            y2: points[1].y / units.length.value.value,
            offset: 150
        }));

        self.dimensions.push(new canvasgraphics.DimensionLine({
            name: "tw",
            x1: points[0].x / units.length.value.value,
            y1: y,
            x2: points[4].x / units.length.value.value,
            y2: y,
            offset: 150
        }));

        self.dimensions.push(new canvasgraphics.DimensionLine({
            name: "tft",
            x1: points[3].x / units.length.value.value,
            y1: points[3].y / units.length.value.value,
            x2: points[2].x / units.length.value.value,
            y2: points[2].y / units.length.value.value,
            offset: -150
        }));

        self.dimensions.push(new canvasgraphics.DimensionLine({
            name: "tfb",
            x1: points[7].x / units.length.value.value,
            y1: points[7].y / units.length.value.value,
            x2: points[6].x / units.length.value.value,
            y2: points[6].y / units.length.value.value,
            offset: -150
        }));
    };

    //TODO: Change to Angle section resizing
    self.Resize = function (index, dx, dy, res) {
        if (dx !== 0 || dy !== 0) {
            switch (index) {
                case 0:
                    //Left
                    self.x.value += dx / 2 / units.length.value.value;
                    self.y.value += dy / 2 / units.length.value.value;
                    self.w.value -= res / units.length.value.value;

                    break;

                case 1:
                    //Top
                    self.x.value += dy / 2 / units.length.value.value;
                    self.y.value -= dx / 2 / units.length.value.value;
                    self.h.value -= res / units.length.value.value;

                    break;

                case 2:
                    //Right
                    self.x.value += dx / 2 / units.length.value.value;
                    self.y.value += dy / 2 / units.length.value.value;
                    self.w.value += res / units.length.value.value;

                    break;

                case 3:
                    //Bottom
                    self.x.value += dy / 2 / units.length.value.value;
                    self.y.value -= dx / 2 / units.length.value.value;
                    self.h.value += res / units.length.value.value;

                    break;

                case 4:
                    //Angle
                    let x_ = self.sizinghandles[4].x + dx - self.x.GetValue();
                    let y_ = self.sizinghandles[4].y + dy - self.y.GetValue();

                    let angle = Math.atan(y_ / x_);

                    if (x_ < 0 && y_ > 0)
                        angle += Math.PI;
                    else if (x_ < 0 && y_ < 0)
                        angle -= Math.PI;

                    if (angle)
                        self.angle.value = angle;

                    //console.log(angle);
                    break;
            }
        }
    };

    self.Scale = function (x1, y1, x2, y2) {
        self.x.value = (x1 + x2) / 2;
        self.y.value = (y1 + y2) / 2;
        self.wb.value = Math.abs(x1 - x2);
        self.wt.value = Math.abs(x1 - x2);
        self.tw.value = Math.abs(x1 - x2) * 0.3;
        self.h.value = Math.abs(y1 - y2);
        self.tft.value = Math.abs(y1 - y2) * 0.3;
        self.tfb.value = Math.abs(y1 - y2) * 0.3;

        self.Refresh();
    };

    this.Refresh();
};

canvasgraphics.SectionSlopedChannel = function (param) {
    canvasgraphics.Section.call(this, param);

    let self = this;

    if (param.wt !== undefined) {
        self.wt = new mobiwork.PropertyDouble({
            text: "Top Flange Width, wt",
            value: param.wt,
            unit: units.length
        });
    }

    if (param.wb !== undefined) {
        self.wb = new mobiwork.PropertyDouble({
            text: "Bottom Flange Width, wb",
            value: param.wb,
            unit: units.length
        });
    }

    if (param.tft !== undefined) {
        self.tft = new mobiwork.PropertyDouble({
            text: "Top Flange Thickness, tft",
            value: param.tft,
            unit: units.length
        });
    }

    if (param.tfb !== undefined) {
        self.tfb = new mobiwork.PropertyDouble({
            text: "Bottom Flange Thickness, tfb",
            value: param.tfb,
            unit: units.length
        });
    }

    if (param.oft !== undefined) {
        self.oft = new mobiwork.PropertyDouble({
            text: "Top Flange Offset, oft",
            value: param.oft,
            unit: units.length
        });
    }

    if (param.ofb !== undefined) {
        self.ofb = new mobiwork.PropertyDouble({
            text: "Bottom Flange Offset, ofb",
            value: param.ofb,
            unit: units.length
        });
    }

    if (param.tw !== undefined) {
        self.tw = new mobiwork.PropertyDouble({
            text: "Web Thickness, tw",
            value: param.tw,
            unit: units.length
        });
    }

    self.points = [];

    self.Clone = function () {
        return new canvasgraphics.SectionSlopedChannel({
            param
        });
    };

    self.Refresh = function () {
        let x = self.x.GetValue();
        let y = self.y.GetValue();
        let wt = self.wt.GetValue();
        let wb = self.wb.GetValue();
        let h = self.h.GetValue();
        let tft = self.tft.GetValue();
        let tfb = self.tfb.GetValue();
        let oft = self.oft.GetValue();
        let ofb = self.ofb.GetValue();
        let tw = self.tw.GetValue();

        let a = self.angle.value;

        //Shape
        self.shape = new canvasgraphics.SlopedChannel({
            x: x,
            y: y,
            wt: wt,
            wb: wb,
            h: h,
            tw: tw,
            tft: tft,
            tfb: tfb,
            oft: oft,
            ofb: ofb,
            a: a
        });

        x = self.x.value;
        y = self.y.value;
        wt = self.wt.value;
        wb = self.wb.value;
        h = self.h.value;
        tw = self.tw.value;
        tft = self.tft.value;
        tfb = self.tfb.value;
        oft = self.oft.value;
        ofb = self.ofb.value;

        self.dimensions = [];

        let points = self.shape.GetPoints();

        //Dimensions
        self.dimensions.push(new canvasgraphics.DimensionLine({
            name: "wt",
            x1: points[1].x / units.length.value.value,
            y1: points[1].y / units.length.value.value,
            x2: points[2].x / units.length.value.value,
            y2: points[2].y / units.length.value.value,
            offset: 150
        }));

        self.dimensions.push(new canvasgraphics.DimensionLine({
            name: "wb",
            x1: points[0].x / units.length.value.value,
            y1: points[0].y / units.length.value.value,
            x2: points[7].x / units.length.value.value,
            y2: points[7].y / units.length.value.value,
            offset: -150
        }));

        self.dimensions.push(new canvasgraphics.VerticalDimensionLine({
            name: "h",
            x1: points[0].x / units.length.value.value,
            y1: points[0].y / units.length.value.value,
            x2: points[1].x / units.length.value.value,
            y2: points[1].y / units.length.value.value,
            offset: 150
        }));

        self.dimensions.push(new canvasgraphics.DimensionLine({
            name: "tw",
            x1: points[0].x / units.length.value.value,
            y1: y,
            x2: points[4].x / units.length.value.value,
            y2: y,
            offset: 150
        }));

        self.dimensions.push(new canvasgraphics.DimensionLine({
            name: "tft",
            x1: points[3].x / units.length.value.value,
            y1: points[3].y / units.length.value.value,
            x2: points[2].x / units.length.value.value,
            y2: points[2].y / units.length.value.value,
            offset: -150
        }));

        self.dimensions.push(new canvasgraphics.DimensionLine({
            name: "tfb",
            x1: points[7].x / units.length.value.value,
            y1: points[7].y / units.length.value.value,
            x2: points[6].x / units.length.value.value,
            y2: points[6].y / units.length.value.value,
            offset: -150
        }));

        self.dimensions.push(new canvasgraphics.DimensionLine({
            name: "oft",
            x1: points[3].x / units.length.value.value,
            y1: points[4].y / units.length.value.value,
            x2: points[3].x / units.length.value.value,
            y2: points[3].y / units.length.value.value,
            offset: -75
        }));

        self.dimensions.push(new canvasgraphics.DimensionLine({
            name: "ofb",
            x1: points[6].x / units.length.value.value,
            y1: points[6].y / units.length.value.value,
            x2: points[6].x / units.length.value.value,
            y2: points[5].y / units.length.value.value,
            offset: -75
        }));
    };

    //TODO: Change to Angle section resizing
    self.Resize = function (index, dx, dy, res) {
        if (dx !== 0 || dy !== 0) {
            switch (index) {
                case 0:
                    //Left
                    self.x.value += dx / 2 / units.length.value.value;
                    self.y.value += dy / 2 / units.length.value.value;
                    self.w.value -= res / units.length.value.value;

                    break;

                case 1:
                    //Top
                    self.x.value += dy / 2 / units.length.value.value;
                    self.y.value -= dx / 2 / units.length.value.value;
                    self.h.value -= res / units.length.value.value;

                    break;

                case 2:
                    //Right
                    self.x.value += dx / 2 / units.length.value.value;
                    self.y.value += dy / 2 / units.length.value.value;
                    self.w.value += res / units.length.value.value;

                    break;

                case 3:
                    //Bottom
                    self.x.value += dy / 2 / units.length.value.value;
                    self.y.value -= dx / 2 / units.length.value.value;
                    self.h.value += res / units.length.value.value;

                    break;

                case 4:
                    //Angle
                    let x_ = self.sizinghandles[4].x + dx - self.x.GetValue();
                    let y_ = self.sizinghandles[4].y + dy - self.y.GetValue();

                    let angle = Math.atan(y_ / x_);

                    if (x_ < 0 && y_ > 0)
                        angle += Math.PI;
                    else if (x_ < 0 && y_ < 0)
                        angle -= Math.PI;

                    if (angle)
                        self.angle.value = angle;

                    //console.log(angle);
                    break;
            }
        }
    };

    self.Scale = function (x1, y1, x2, y2) {
        self.x.value = (x1 + x2) / 2;
        self.y.value = (y1 + y2) / 2;
        self.wb.value = Math.abs(x1 - x2);
        self.wt.value = Math.abs(x1 - x2);
        self.tw.value = Math.abs(x1 - x2) * 0.3;
        self.h.value = Math.abs(y1 - y2);
        self.tft.value = Math.abs(y1 - y2) * 0.2;
        self.tfb.value = Math.abs(y1 - y2) * 0.2;
        self.oft.value = Math.abs(y1 - y2) * 0.1;
        self.ofb.value = Math.abs(y1 - y2) * 0.1;

        self.Refresh();
    };

    this.Refresh();
};

canvasgraphics.SectionTube = function (param) {
    canvasgraphics.Section.call(this, param);

    let self = this;

    if (param.t !== undefined) {
        self.t = new mobiwork.PropertyDouble({
            text: "Thickness, t",
            value: param.t,
            unit: units.length
        });
    }

    self.points = [];

    self.Clone = function () {
        return new canvasgraphics.SectionTube({
            param
        });
    };

    self.Refresh = function () {
        let x = self.x.GetValue();
        let y = self.y.GetValue();
        let w = self.w.GetValue();
        let h = self.h.GetValue();
        let t = self.t.GetValue();

        let a = self.angle.value;

        //Shape
        self.shape = new canvasgraphics.Tube({
            x: x,
            y: y,
            w: w,
            h: h,
            t: t,
            a: a
        });

        x = self.x.value;
        y = self.y.value;
        w = self.w.value;
        h = self.h.value;
        t = self.t.value;

        self.dimensions = [];

        let points = self.shape.GetPoints();

        //Dimensions
        self.dimensions.push(new canvasgraphics.DimensionLine({
            name: "w",
            x1: points[1].x / units.length.value.value,
            y1: points[1].y / units.length.value.value,
            x2: points[2].x / units.length.value.value,
            y2: points[2].y / units.length.value.value,
            offset: 150
        }));

        self.dimensions.push(new canvasgraphics.DimensionLine({
            name: "h",
            x1: points[0].x / units.length.value.value,
            y1: points[0].y / units.length.value.value,
            x2: points[1].x / units.length.value.value,
            y2: points[1].y / units.length.value.value,
        }));

        let holes = self.shape.holes[0].points;

        self.dimensions.push(new canvasgraphics.VerticalDimensionLine({
            name: "t",
            x1: points[1].x / units.length.value.value,
            y1: points[1].y / units.length.value.value,
            x2: holes[2].x / units.length.value.value,
            y2: holes[2].y / units.length.value.value,
            offset: -150
        }));
    };

    //TODO: Change to Box section resizing
    self.Resize = function (index, dx, dy, res) {
        if (dx !== 0 || dy !== 0) {
            switch (index) {
                case 0:
                    //Left
                    self.x.value += dx / 2 / units.length.value.value;
                    self.y.value += dy / 2 / units.length.value.value;
                    self.w.value -= res / units.length.value.value;

                    break;

                case 1:
                    //Top
                    self.x.value += dy / 2 / units.length.value.value;
                    self.y.value -= dx / 2 / units.length.value.value;
                    self.h.value -= res / units.length.value.value;

                    break;

                case 2:
                    //Right
                    self.x.value += dx / 2 / units.length.value.value;
                    self.y.value += dy / 2 / units.length.value.value;
                    self.w.value += res / units.length.value.value;

                    break;

                case 3:
                    //Bottom
                    self.x.value += dy / 2 / units.length.value.value;
                    self.y.value -= dx / 2 / units.length.value.value;
                    self.h.value += res / units.length.value.value;

                    break;

                case 4:
                    //Angle
                    let x_ = self.sizinghandles[4].x + dx - self.x.GetValue();
                    let y_ = self.sizinghandles[4].y + dy - self.y.GetValue();

                    let angle = Math.atan(y_ / x_);

                    if (x_ < 0 && y_ > 0)
                        angle += Math.PI;
                    else if (x_ < 0 && y_ < 0)
                        angle -= Math.PI;

                    if (angle)
                        self.angle.value = angle;

                    //console.log(angle);
                    break;
            }
        }
    };

    self.Scale = function (x1, y1, x2, y2) {
        self.x.value = (x1 + x2) / 2;
        self.y.value = (y1 + y2) / 2;
        self.w.value = Math.abs(x1 - x2);
        self.h.value = Math.abs(y1 - y2);
        self.t.value = Math.min(Math.abs(x1 - x2), Math.abs(y1 - y2)) * 0.3;

        self.Refresh();
    };

    this.Refresh();
};

canvasgraphics.SectionPipe = function (param) {
    canvasgraphics.Section.call(this, param);

    let self = this;

    if (param.r !== undefined) {
        self.r = new mobiwork.PropertyDouble({
            text: "Outer Radius, R",
            value: param.r,
            unit: units.length
        });
    }

    if (param.t !== undefined) {
        self.t = new mobiwork.PropertyDouble({
            text: "Thickness, t",
            value: param.t,
            unit: units.length
        });
    }

    self.points = [];

    self.Clone = function () {
        return new canvasgraphics.SectionPipe({
            param
        });
    };

    self.Refresh = function () {
        let x = self.x.GetValue();
        let y = self.y.GetValue();
        let r = self.r.GetValue();
        let t = self.t.GetValue();
        let a = self.angle.value;

        //Shape
        self.shape = new canvasgraphics.Pipe({
            x: x,
            y: y,
            r: r,
            t: t,
            a: a
        });

        x = self.x.value;
        y = self.y.value;
        r = self.r.value;
        t = self.t.value;

        self.dimensions = [];

        self.dimensions.push(new canvasgraphics.DimensionLine({
            name: "r",
            x1: x,
            y1: y,
            x2: x + r,
            y2: y,
            offset: -150
        }));
    };

    self.Resize = function (index, dx, dy, res) {
        switch (index) {
            case 0:
                //Radial
                self.x.value += dy / 2 / units.length.value.value;
                self.y.value += dy / 2 / units.length.value.value;
                self.r.value += res / units.length.value.value;
                break;
            case 1:
                //Angle
                let x_ = self.sizinghandles[index].x + dx - self.x.GetValue();
                let y_ = self.sizinghandles[index].y + dy - self.y.GetValue();

                let angle = Math.atan(y_ / x_);

                if (x_ < 0 && y_ > 0)
                    angle += Math.PI;
                else if (x_ < 0 && y_ < 0)
                    angle -= Math.PI;

                if (angle)
                    self.angle.value = angle;
                break;
        }


        console.log("index: " + index + ", dx: " + dx + ", dy: " + dy);
    };

    self.Scale = function (x1, y1, x2, y2) {
        self.x.value = (x1 + x2) / 2;
        self.y.value = (y1 + y2) / 2;
        self.r.value = Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2)) / 2;
        self.t.value = Math.min(Math.abs(x1 - x2), Math.abs(y1 - y2)) * 0.3;

        self.Refresh();
    };

    self.GenerateSizingHandles = function () {
        self.sizinghandles = [];

        //Generate sizing handles
        if (self.selected) {
            let points = self.shape.GetPoints();
            let handle;

            for (let i = 0; i < points.length; i++) {
                handle = new canvasgraphics.Rectangle_2({ x: 0, y: 0 });
                self.sizinghandles.push(handle);
            }

            self.UpdateSizingHandles();
        }
    };

    this.Refresh();
};

//Steel Sections
canvasgraphics.SectionSteelI = function (param) {
    canvasgraphics.Section.call(this, param);

    let self = this;

    if (param.wt !== undefined) {
        self.wt = new mobiwork.PropertyDouble({
            text: "Top Flange Width, wt",
            value: param.wt,
            unit: units.length
        });
    }

    if (param.wb !== undefined) {
        self.wb = new mobiwork.PropertyDouble({
            text: "Bottom Flange Width, wb",
            value: param.wb,
            unit: units.length
        });
    }

    if (param.tw !== undefined) {
        self.tw = new mobiwork.PropertyDouble({
            text: "Web Thickness, tw",
            value: param.tw,
            unit: units.length
        });
    }

    if (param.tft !== undefined) {
        self.tft = new mobiwork.PropertyDouble({
            text: "Top Flange Thickness, tft",
            value: param.tft,
            unit: units.length
        });
    }

    if (param.tfb !== undefined) {
        self.tfb = new mobiwork.PropertyDouble({
            text: "Bottom Flange Thickness, tfb",
            value: param.tfb,
            unit: units.length
        });
    }

    if (param.r1 !== undefined) {
        self.r1 = new mobiwork.PropertyDouble({
            text: "Fillet Radius, r1",
            value: param.r1,
            unit: units.length
        });
    }

    if (param.r2 !== undefined) {
        self.r2 = new mobiwork.PropertyDouble({
            text: "Inner Flange Radius, r2",
            value: param.r2,
            unit: units.length
        });
    }

    if (param.r3 !== undefined) {
        self.r3 = new mobiwork.PropertyDouble({
            text: "Outer Flange Radius, r3",
            value: param.r3,
            unit: units.length
        });
    }

    if (param.slope !== undefined) {
        self.slope = new mobiwork.PropertyDouble({
            text: "Flange Slope, θ",
            value: param.slope,
            unit: units.angle
        });
    }

    self.points = [];

    self.Clone = function () {
        return new canvasgraphics.SectionSteelI({
            param
        });
    };

    self.Refresh = function () {
        let x = self.x.GetValue();
        let y = self.y.GetValue();
        let wt = self.wt.GetValue();
        let wb = self.wb.GetValue();
        let h = self.h.GetValue();
        let tft = self.tft.GetValue();
        let tfb = self.tfb.GetValue();
        let tw = self.tw.GetValue();
        let r1 = self.r1.GetValue();
        let r2 = self.r2.GetValue();
        let r3 = self.r3.GetValue();
        let slope = self.slope.value;

        let a = self.angle.value;

        //Shape
        self.shape = new canvasgraphics.SteelI({
            x: x,
            y: y,
            wt: wt,
            wb: wb,
            h: h,
            tw: tw,
            tft: tft,
            tfb: tfb,
            r1: r1,
            r2: r2,
            r3: r3,
            slope: slope,
            a: a
        });

        x = self.x.value;
        y = self.y.value;
        wt = self.wt.value;
        wb = self.wb.value;
        h = self.h.value;
        tw = self.tw.value;
        tft = self.tft.value;
        tfb = self.tfb.value;
        r1 = self.r1.value;
        r2 = self.r2.value;
        r3 = self.r3.value;
        slope = self.slope.value;

        self.dimensions = [];

        let points = self.shape.GetPoints();

        //Dimensions
        // self.dimensions.push(new canvasgraphics.DimensionLine({
        //     name: "wt",
        //     x1: points[5].x / units.length.value.value,
        //     y1: points[5].y / units.length.value.value,
        //     x2: points[6].x / units.length.value.value,
        //     y2: points[6].y / units.length.value.value,
        //     offset: 150
        // }));
        //
        // self.dimensions.push(new canvasgraphics.DimensionLine({
        //     name: "wb",
        //     x1: points[0].x / units.length.value.value,
        //     y1: points[0].y / units.length.value.value,
        //     x2: points[11].x / units.length.value.value,
        //     y2: points[11].y / units.length.value.value,
        //     offset: -150
        // }));
        //
        // self.dimensions.push(new canvasgraphics.VerticalDimensionLine({
        //     name: "h",
        //     x1: points[0].x / units.length.value.value,
        //     y1: points[0].y / units.length.value.value,
        //     x2: points[5].x / units.length.value.value,
        //     y2: points[5].y / units.length.value.value,
        //     offset: 150
        // }));
        //
        // self.dimensions.push(new canvasgraphics.DimensionLine({
        //     name: "tw",
        //     x1: points[2].x / units.length.value.value,
        //     y1: y,
        //     x2: points[9].x / units.length.value.value,
        //     y2: y,
        //     offset: 150
        // }));
        //
        // self.dimensions.push(new canvasgraphics.DimensionLine({
        //     name: "tft",
        //     x1: points[7].x / units.length.value.value,
        //     y1: points[7].y / units.length.value.value,
        //     x2: points[6].x / units.length.value.value,
        //     y2: points[6].y / units.length.value.value,
        //     offset: -150
        // }));
        //
        // self.dimensions.push(new canvasgraphics.DimensionLine({
        //     name: "tfb",
        //     x1: points[11].x / units.length.value.value,
        //     y1: points[11].y / units.length.value.value,
        //     x2: points[10].x / units.length.value.value,
        //     y2: points[10].y / units.length.value.value,
        //     offset: -150
        // }));
    };

    //TODO: Change to Angle section resizing
    self.Resize = function (index, dx, dy, res) {
        if (dx !== 0 || dy !== 0) {
            switch (index) {
                case 0:
                    //Left
                    self.x.value += dx / 2 / units.length.value.value;
                    self.y.value += dy / 2 / units.length.value.value;
                    self.w.value -= res / units.length.value.value;

                    break;

                case 1:
                    //Top
                    self.x.value += dy / 2 / units.length.value.value;
                    self.y.value -= dx / 2 / units.length.value.value;
                    self.h.value -= res / units.length.value.value;

                    break;

                case 2:
                    //Right
                    self.x.value += dx / 2 / units.length.value.value;
                    self.y.value += dy / 2 / units.length.value.value;
                    self.w.value += res / units.length.value.value;

                    break;

                case 3:
                    //Bottom
                    self.x.value += dy / 2 / units.length.value.value;
                    self.y.value -= dx / 2 / units.length.value.value;
                    self.h.value += res / units.length.value.value;

                    break;

                case 4:
                    //Angle
                    let x_ = self.sizinghandles[4].x + dx - self.x.GetValue();
                    let y_ = self.sizinghandles[4].y + dy - self.y.GetValue();

                    let angle = Math.atan(y_ / x_);

                    if (x_ < 0 && y_ > 0)
                        angle += Math.PI;
                    else if (x_ < 0 && y_ < 0)
                        angle -= Math.PI;

                    if (angle)
                        self.angle.value = angle;

                    //console.log(angle);
                    break;
            }
        }
    };

    self.Scale = function (x1, y1, x2, y2) {
        self.x.value = (x1 + x2) / 2;
        self.y.value = (y1 + y2) / 2;
        self.wb.value = Math.abs(x1 - x2);
        self.wt.value = Math.abs(x1 - x2);
        self.tw.value = Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2)) * 0.15;
        self.h.value = Math.abs(y1 - y2);
        self.tft.value = Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2)) * 0.15;
        self.tfb.value = Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2)) * 0.15;
        self.r1.value = Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2)) * 0.03;
        self.r2.value = Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2)) * 0.03;
        self.r3.value = Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2)) * 0.01;

        self.Refresh();
    };

    this.Refresh();
};

canvasgraphics.SectionSteelChannel = function (param) {
    canvasgraphics.Section.call(this, param);

    let self = this;

    if (param.wt !== undefined) {
        self.wt = new mobiwork.PropertyDouble({
            text: "Top Flange Width, wt",
            value: param.wt,
            unit: units.length
        });
    }

    if (param.wb !== undefined) {
        self.wb = new mobiwork.PropertyDouble({
            text: "Bottom Flange Width, wb",
            value: param.wb,
            unit: units.length
        });
    }

    if (param.tw !== undefined) {
        self.tw = new mobiwork.PropertyDouble({
            text: "Web Thickness, tw",
            value: param.tw,
            unit: units.length
        });
    }

    if (param.tft !== undefined) {
        self.tft = new mobiwork.PropertyDouble({
            text: "Top Flange Thickness, tft",
            value: param.tft,
            unit: units.length
        });
    }

    if (param.tfb !== undefined) {
        self.tfb = new mobiwork.PropertyDouble({
            text: "Bottom Flange Thickness, tfb",
            value: param.tfb,
            unit: units.length
        });
    }

    if (param.r1 !== undefined) {
        self.r1 = new mobiwork.PropertyDouble({
            text: "Fillet Radius, r1",
            value: param.r1,
            unit: units.length
        });
    }

    if (param.r2 !== undefined) {
        self.r2 = new mobiwork.PropertyDouble({
            text: "Inner Flange Radius, r2",
            value: param.r2,
            unit: units.length
        });
    }

    if (param.r3 !== undefined) {
        self.r3 = new mobiwork.PropertyDouble({
            text: "Outer Flange Radius, r3",
            value: param.r3,
            unit: units.length
        });
    }

    if (param.r4 !== undefined) {
        self.r4 = new mobiwork.PropertyDouble({
            text: "Outer Flange Radius, r4",
            value: param.r4,
            unit: units.length
        });
    }

    if (param.slope !== undefined) {
        self.slope = new mobiwork.PropertyDouble({
            text: "Flange Slope, θ",
            value: param.slope,
            unit: units.angle
        });
    }

    self.points = [];

    self.Clone = function () {
        return new canvasgraphics.SectionSteelChannel({
            param
        });
    };

    self.Refresh = function () {
        let x = self.x.GetValue();
        let y = self.y.GetValue();
        let wt = self.wt.GetValue();
        let wb = self.wb.GetValue();
        let h = self.h.GetValue();
        let tft = self.tft.GetValue();
        let tfb = self.tfb.GetValue();
        let tw = self.tw.GetValue();
        let r1 = self.r1.GetValue();
        let r2 = self.r2.GetValue();
        let r3 = self.r3.GetValue();
        let r4 = self.r4.GetValue();
        let slope = self.slope.value;

        let a = self.angle.value;

        //Shape
        self.shape = new canvasgraphics.SteelChannel({
            x: x,
            y: y,
            wt: wt,
            wb: wb,
            h: h,
            tw: tw,
            tft: tft,
            tfb: tfb,
            r1: r1,
            r2: r2,
            r3: r3,
            r4: r4,
            slope: slope,
            a: a
        });

        x = self.x.value;
        y = self.y.value;
        wt = self.wt.value;
        wb = self.wb.value;
        h = self.h.value;
        tw = self.tw.value;
        tft = self.tft.value;
        tfb = self.tfb.value;

        self.dimensions = [];

        let points = self.shape.GetPoints();

        //Dimensions
        // self.dimensions.push(new canvasgraphics.DimensionLine({
        //     name: "wt",
        //     x1: points[1].x / units.length.value.value,
        //     y1: points[1].y / units.length.value.value,
        //     x2: points[2].x / units.length.value.value,
        //     y2: points[2].y / units.length.value.value,
        //     offset: 150
        // }));
        //
        // self.dimensions.push(new canvasgraphics.DimensionLine({
        //     name: "wb",
        //     x1: points[0].x / units.length.value.value,
        //     y1: points[0].y / units.length.value.value,
        //     x2: points[7].x / units.length.value.value,
        //     y2: points[7].y / units.length.value.value,
        //     offset: -150
        // }));
        //
        // self.dimensions.push(new canvasgraphics.VerticalDimensionLine({
        //     name: "h",
        //     x1: points[0].x / units.length.value.value,
        //     y1: points[0].y / units.length.value.value,
        //     x2: points[1].x / units.length.value.value,
        //     y2: points[1].y / units.length.value.value,
        //     offset: 150
        // }));
        //
        // self.dimensions.push(new canvasgraphics.DimensionLine({
        //     name: "tw",
        //     x1: points[0].x / units.length.value.value,
        //     y1: y,
        //     x2: points[4].x / units.length.value.value,
        //     y2: y,
        //     offset: 150
        // }));
        //
        // self.dimensions.push(new canvasgraphics.DimensionLine({
        //     name: "tft",
        //     x1: points[3].x / units.length.value.value,
        //     y1: points[3].y / units.length.value.value,
        //     x2: points[2].x / units.length.value.value,
        //     y2: points[2].y / units.length.value.value,
        //     offset: -150
        // }));
        //
        // self.dimensions.push(new canvasgraphics.DimensionLine({
        //     name: "tfb",
        //     x1: points[7].x / units.length.value.value,
        //     y1: points[7].y / units.length.value.value,
        //     x2: points[6].x / units.length.value.value,
        //     y2: points[6].y / units.length.value.value,
        //     offset: -150
        // }));
    };

    //TODO: Change to Angle section resizing
    self.Resize = function (index, dx, dy, res) {
        if (dx !== 0 || dy !== 0) {
            switch (index) {
                case 0:
                    //Left
                    self.x.value += dx / 2 / units.length.value.value;
                    self.y.value += dy / 2 / units.length.value.value;
                    self.w.value -= res / units.length.value.value;

                    break;

                case 1:
                    //Top
                    self.x.value += dy / 2 / units.length.value.value;
                    self.y.value -= dx / 2 / units.length.value.value;
                    self.h.value -= res / units.length.value.value;

                    break;

                case 2:
                    //Right
                    self.x.value += dx / 2 / units.length.value.value;
                    self.y.value += dy / 2 / units.length.value.value;
                    self.w.value += res / units.length.value.value;

                    break;

                case 3:
                    //Bottom
                    self.x.value += dy / 2 / units.length.value.value;
                    self.y.value -= dx / 2 / units.length.value.value;
                    self.h.value += res / units.length.value.value;

                    break;

                case 4:
                    //Angle
                    let x_ = self.sizinghandles[4].x + dx - self.x.GetValue();
                    let y_ = self.sizinghandles[4].y + dy - self.y.GetValue();

                    let angle = Math.atan(y_ / x_);

                    if (x_ < 0 && y_ > 0)
                        angle += Math.PI;
                    else if (x_ < 0 && y_ < 0)
                        angle -= Math.PI;

                    if (angle)
                        self.angle.value = angle;

                    //console.log(angle);
                    break;
            }
        }
    };

    self.Scale = function (x1, y1, x2, y2) {
        self.x.value = (x1 + x2) / 2;
        self.y.value = (y1 + y2) / 2;
        self.wb.value = Math.abs(x1 - x2);
        self.wt.value = Math.abs(x1 - x2);
        self.tw.value = Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2)) * 0.15;
        self.h.value = Math.abs(y1 - y2);
        self.tft.value = Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2)) * 0.15;
        self.tfb.value = Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2)) * 0.15;
        self.r1.value = Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2)) * 0.03;
        self.r2.value = Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2)) * 0.03;
        self.r3.value = Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2)) * 0.01;
        self.r4.value = Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2)) * 0.01;

        self.Refresh();
    };

    this.Refresh();
};

canvasgraphics.SectionSteelAngle = function (param) {
    canvasgraphics.Section.call(this, param);

    let self = this;

    if (param.tw !== undefined) {
        self.tw = new mobiwork.PropertyDouble({
            text: "Web Thickness, tw",
            value: param.tw,
            unit: units.length
        });
    }

    if (param.tf !== undefined) {
        self.tf = new mobiwork.PropertyDouble({
            text: "Flange Thickness, tf",
            value: param.tf,
            unit: units.length
        });
    }

    if (param.r1 !== undefined) {
        self.r1 = new mobiwork.PropertyDouble({
            text: "Fillet Radius, r1",
            value: param.r1,
            unit: units.length
        });
    }

    if (param.r2 !== undefined) {
        self.r2 = new mobiwork.PropertyDouble({
            text: "Inner Flange Radius, r2",
            value: param.r2,
            unit: units.length
        });
    }

    if (param.r3 !== undefined) {
        self.r3 = new mobiwork.PropertyDouble({
            text: "Outer Flange Radius, r3",
            value: param.r3,
            unit: units.length
        });
    }

    if (param.r4 !== undefined) {
        self.r4 = new mobiwork.PropertyDouble({
            text: "Outer Flange Radius, r4",
            value: param.r4,
            unit: units.length
        });
    }

    self.points = [];

    self.Clone = function () {
        return new canvasgraphics.SectionSteelAngle({
            param
        });
    };

    self.Refresh = function () {
        let x = self.x.GetValue();
        let y = self.y.GetValue();
        let w = self.w.GetValue();
        let h = self.h.GetValue();
        let tf = self.tf.GetValue();
        let tw = self.tw.GetValue();
        let r1 = self.r1.GetValue();
        let r2 = self.r2.GetValue();
        let r3 = self.r3.GetValue();
        let r4 = self.r4.GetValue();

        let a = self.angle.value;

        //Shape
        self.shape = new canvasgraphics.SteelAngle({
            x: x,
            y: y,
            w: w,
            h: h,
            tw: tw,
            tf: tf,
            r1: r1,
            r2: r2,
            r3: r3,
            r4: r4,
            a: a
        });

        x = self.x.value;
        y = self.y.value;
        w = self.w.value;
        h = self.h.value;
        tw = self.tw.value;
        tf = self.tf.value;

        self.dimensions = [];

        let points = self.shape.GetPoints();
    };

    //TODO: Change to Angle section resizing
    self.Resize = function (index, dx, dy, res) {
        if (dx !== 0 || dy !== 0) {
            switch (index) {
                case 0:
                    //Left
                    self.x.value += dx / 2 / units.length.value.value;
                    self.y.value += dy / 2 / units.length.value.value;
                    self.w.value -= res / units.length.value.value;

                    break;

                case 1:
                    //Top
                    self.x.value += dy / 2 / units.length.value.value;
                    self.y.value -= dx / 2 / units.length.value.value;
                    self.h.value -= res / units.length.value.value;

                    break;

                case 2:
                    //Right
                    self.x.value += dx / 2 / units.length.value.value;
                    self.y.value += dy / 2 / units.length.value.value;
                    self.w.value += res / units.length.value.value;

                    break;

                case 3:
                    //Bottom
                    self.x.value += dy / 2 / units.length.value.value;
                    self.y.value -= dx / 2 / units.length.value.value;
                    self.h.value += res / units.length.value.value;

                    break;

                case 4:
                    //Angle
                    let x_ = self.sizinghandles[4].x + dx - self.x.GetValue();
                    let y_ = self.sizinghandles[4].y + dy - self.y.GetValue();

                    let angle = Math.atan(y_ / x_);

                    if (x_ < 0 && y_ > 0)
                        angle += Math.PI;
                    else if (x_ < 0 && y_ < 0)
                        angle -= Math.PI;

                    if (angle)
                        self.angle.value = angle;

                    //console.log(angle);
                    break;
            }
        }
    };

    self.Scale = function (x1, y1, x2, y2) {
        self.x.value = (x1 + x2) / 2;
        self.y.value = (y1 + y2) / 2;
        self.w.value = Math.abs(x1 - x2);
        self.tw.value = Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2)) * 0.15;
        self.h.value = Math.abs(y1 - y2);
        self.tf.value = Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2)) * 0.15;
        self.r1.value = Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2)) * 0.03;
        self.r2.value = Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2)) * 0.03;
        self.r3.value = Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2)) * 0.03;
        self.r4.value = Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2)) * 0.03;

        self.Refresh();
    };

    this.Refresh();
};


//Concrete Columns
canvasgraphics.Column = function (param) {
    canvasgraphics.call(this, param);

    let self = this;

    self.type = OBJECTTYPE.COLUMN;
    self.section;
    self.rebars = [];
    self.objects;

    self.general = new mobiwork.PropertyHeader({ text: "General" });

    if (param.text) {
        self.text = new mobiwork.PropertyInlineInput({ text: "Name", value: param.text });
    } else {
        self.text = new mobiwork.PropertyInlineInput({ text: "Name", value: "Section" });
    }

    self.matheader = new mobiwork.PropertyHeader({ text: "Material" });
    self.material = new mobiwork.PropertyCombobox({ text: "Material" });

    self.dimension = new mobiwork.PropertyHeader({ text: "Dimensions" });

    if (param.w !== undefined) {
        self.w = new mobiwork.PropertyDouble({
            text: "Width, w",
            value: param.w,
            unit: units.length
        });
    }

    if (param.wt !== undefined) {
        self.wt = new mobiwork.PropertyDouble({
            text: "Top Flange Width, wt",
            value: param.wt,
            unit: units.length
        });
    }

    if (param.wb !== undefined) {
        self.wb = new mobiwork.PropertyDouble({
            text: "Bottom Flange Width, wb",
            value: param.wb,
            unit: units.length
        });
    }

    if (param.h !== undefined) {
        self.h = new mobiwork.PropertyDouble({
            text: "Height, h",
            value: param.h,
            unit: units.length
        });
    }

    if (param.r !== undefined) {
        self.r = new mobiwork.PropertyDouble({
            text: "Outer Radius, r",
            value: param.r,
            unit: units.length
        });
    }

    if (param.t !== undefined) {
        self.t = new mobiwork.PropertyDouble({
            text: "Thickness, t",
            value: param.t,
            unit: units.length
        });
    }

    if (param.tw !== undefined) {
        self.tw = new mobiwork.PropertyDouble({
            text: "Web Thickness, tw",
            value: param.tw,
            unit: units.length
        });
    }

    if (param.twl !== undefined) {
        self.twl = new mobiwork.PropertyDouble({
            text: "Left Web Thickness, twl",
            value: param.twl,
            unit: units.length
        });
    }

    if (param.twr !== undefined) {
        self.twr = new mobiwork.PropertyDouble({
            text: "Right Web Thickness, twr",
            value: param.twr,
            unit: units.length
        });
    }

    if (param.tf !== undefined) {
        self.tf = new mobiwork.PropertyDouble({
            text: "Flange Thickness, tf",
            value: param.tf,
            unit: units.length
        });
    }

    if (param.tft !== undefined) {
        self.tft = new mobiwork.PropertyDouble({
            text: "Top Flange Thickness, tft",
            value: param.tft,
            unit: units.length
        });
    }

    if (param.tfb !== undefined) {
        self.tfb = new mobiwork.PropertyDouble({
            text: "Bottom Flange Thickness, tfb",
            value: param.tfb,
            unit: units.length
        });
    }

    if (param.of !== undefined) {
        self.of = new mobiwork.PropertyDouble({
            text: "Flange Offset, of",
            value: param.of,
            unit: units.length
        });
    }

    if (param.oft !== undefined) {
        self.oft = new mobiwork.PropertyDouble({
            text: "Top Flange Offset, oft",
            value: param.oft,
            unit: units.length
        });
    }

    if (param.ofb !== undefined) {
        self.ofb = new mobiwork.PropertyDouble({
            text: "Bottom Flange Offset, ofb",
            value: param.ofb,
            unit: units.length
        });
    }

    if (param.ow !== undefined) {
        self.ow = new mobiwork.PropertyDouble({
            text: "Web Offset, ow",
            value: param.ow,
            unit: units.length
        });
    }

    if (param.n !== undefined) {
        self.n = new mobiwork.PropertyDouble({
            text: "No. of Sides, n",
            value: param.n
        });
    }

    self.offset = new mobiwork.PropertyHeader({ text: "Coordinate" });

    self.x = new mobiwork.PropertyDouble({
        text: "Offset, X",
        value: param.x,
        unit: units.length
    });

    self.y = new mobiwork.PropertyDouble({
        text: "Offset, Y",
        value: param.y,
        unit: units.length
    });

    self.angle = new mobiwork.PropertyDouble({
        text: "Angle",
        value: 0,
        unit: units.angle
    });

    self.Select = function () {
        self.selected = true;
        self.section.Select();
    };

    self.Deselect = function () {
        self.section.Deselect();
    };

    self.Render = function (renderer) {
        if (self.section) {
            //Render section
            self.section.Render(renderer);

            //Render dimensions
            for (let i = 0; i < self.rebars.length; i++)
                self.rebars[i].Render(renderer);

            //Render additional objects
            if (self.objects !== undefined) {
                for (let i = 0; i < self.objects.length; i++)
                    self.objects[i].Render(renderer);
            }
        }
    };

    self.SelectByPoint = function (x, y) {
        return self.section.SelectByPoint(x, y);
    };

    self.OnMouseMove = function (canvas, mouse) {
        return self.section.OnMouseMove(canvas, mouse);
    };

    self.OnMouseUp = function (canvas, mouse) {
        return self.section.OnMouseUp(canvas, mouse);
    };

    self.UpdateBounds = function (bounds) {
        self.section.UpdateBounds(bounds);
    };
};

canvasgraphics.ColumnPolygon = function (param) {
    canvasgraphics.SectionPolygon.call(this, param);

    let self = this;
    self.type = OBJECTTYPE.COLUMN;

    self.matheader = new mobiwork.PropertyHeader({ text: "Material" });
    self.material = new mobiwork.PropertyCombobox({ text: "Material" });

    if (!param.text)
        self.text.value = "Polygon";

    this.GetModel = function () {
        return {
            param: param,
            material: self.material.value
        }
    };
};

canvasgraphics.ColumnRectangle = function (param) {
    canvasgraphics.SectionRectangle.call(this, param);

    let self = this;
    self.type = OBJECTTYPE.COLUMN;

    self.matheader = new mobiwork.PropertyHeader({ text: "Material" });
    self.material = new mobiwork.PropertyCombobox({ text: "Material" });

    if (!param.text)
        self.text.value = "Rectangle";

    this.GetModel = function () {
        return {
            param: param,
            material: self.material.value
        }
    };
};

canvasgraphics.ColumnCircle = function (param) {
    canvasgraphics.SectionCircle.call(this, param);

    let self = this;
    self.type = OBJECTTYPE.COLUMN;

    self.matheader = new mobiwork.PropertyHeader({ text: "Material" });
    self.material = new mobiwork.PropertyCombobox({ text: "Material" });

    if (!param.text)
        self.text.value = "Circle";

    this.GetModel = function () {
        return {
            param: param,
            material: self.material.value
        }
    };
};

canvasgraphics.ColumnRegularPolygon = function (param) {
    canvasgraphics.SectionRegularPolygon.call(this, param);

    let self = this;
    self.type = OBJECTTYPE.COLUMN;

    self.matheader = new mobiwork.PropertyHeader({ text: "Material" });
    self.material = new mobiwork.PropertyCombobox({ text: "Material" });

    if (!param.text)
        self.text.value = "Regular Polygon";

    this.GetModel = function () {
        return {
            param: param,
            material: self.material.value
        }
    };
};

canvasgraphics.ColumnTee = function (param) {
    canvasgraphics.SectionTee.call(this, param);

    let self = this;
    self.type = OBJECTTYPE.COLUMN;

    self.matheader = new mobiwork.PropertyHeader({ text: "Material" });
    self.material = new mobiwork.PropertyCombobox({ text: "Material" });

    if (!param.text)
        self.text.value = "Tee Section";

    this.GetModel = function () {
        return {
            param: param,
            material: self.material.value
        }
    };
};

canvasgraphics.ColumnSlopedTee = function (param) {
    canvasgraphics.SectionSlopedTee.call(this, param);

    let self = this;
    self.type = OBJECTTYPE.COLUMN;

    self.matheader = new mobiwork.PropertyHeader({ text: "Material" });
    self.material = new mobiwork.PropertyCombobox({ text: "Material" });

    if (!param.text)
        self.text.value = "Sloped Tee Section";

    this.GetModel = function () {
        return {
            param: param,
            material: self.material.value
        }
    };
};

canvasgraphics.ColumnI = function (param) {
    canvasgraphics.SectionI.call(this, param);

    let self = this;
    self.type = OBJECTTYPE.COLUMN;

    self.matheader = new mobiwork.PropertyHeader({ text: "Material" });
    self.material = new mobiwork.PropertyCombobox({ text: "Material" });

    if (!param.text)
        self.text.value = "I Section";

    this.GetModel = function () {
        return {
            param: param,
            material: self.material.value
        }
    };
};

canvasgraphics.ColumnSlopedI = function (param) {
    canvasgraphics.SectionSlopedI.call(this, param);

    let self = this;
    self.type = OBJECTTYPE.COLUMN;

    self.matheader = new mobiwork.PropertyHeader({ text: "Material" });
    self.material = new mobiwork.PropertyCombobox({ text: "Material" });

    if (!param.text)
        self.text.value = "Sloped I Section";

    this.GetModel = function () {
        return {
            param: param,
            material: self.material.value
        }
    };
};

canvasgraphics.ColumnAngle = function (param) {
    canvasgraphics.SectionAngle.call(this, param);

    let self = this;
    self.type = OBJECTTYPE.COLUMN;

    self.matheader = new mobiwork.PropertyHeader({ text: "Material" });
    self.material = new mobiwork.PropertyCombobox({ text: "Material" });

    if (!param.text)
        self.text.value = "L Section";

    this.GetModel = function () {
        return {
            param: param,
            material: self.material.value
        }
    };
};

canvasgraphics.ColumnChannel = function (param) {
    canvasgraphics.SectionChannel.call(this, param);

    let self = this;
    self.type = OBJECTTYPE.COLUMN;

    self.matheader = new mobiwork.PropertyHeader({ text: "Material" });
    self.material = new mobiwork.PropertyCombobox({ text: "Material" });

    if (!param.text)
        self.text.value = "Channel Section";

    this.GetModel = function () {
        return {
            param: param,
            material: self.material.value
        }
    };
};

canvasgraphics.ColumnSlopedChannel = function (param) {
    canvasgraphics.SectionSlopedChannel.call(this, param);

    let self = this;
    self.type = OBJECTTYPE.COLUMN;

    self.matheader = new mobiwork.PropertyHeader({ text: "Material" });
    self.material = new mobiwork.PropertyCombobox({ text: "Material" });

    if (!param.text)
        self.text.value = "Sloped Channel Section";

    this.GetModel = function () {
        return {
            param: param,
            material: self.material.value
        }
    };
};

canvasgraphics.ColumnTube = function (param) {
    canvasgraphics.SectionTube.call(this, param);

    let self = this;
    self.type = OBJECTTYPE.COLUMN;

    self.matheader = new mobiwork.PropertyHeader({ text: "Material" });
    self.material = new mobiwork.PropertyCombobox({ text: "Material" });

    if (!param.text)
        self.text.value = "Box";

    this.GetModel = function () {
        return {
            param: param,
            material: self.material.value
        }
    };
};

canvasgraphics.ColumnPipe = function (param) {
    canvasgraphics.SectionPipe.call(this, param);

    let self = this;
    self.type = OBJECTTYPE.COLUMN;

    self.matheader = new mobiwork.PropertyHeader({ text: "Material" });
    self.material = new mobiwork.PropertyCombobox({ text: "Material" });

    if (!param.text)
        self.text.value = "Pipe";

    this.GetModel = function () {
        return {
            param: param,
            material: self.material.value
        }
    };
};

//Steel Columns //TODO: Steel I, Steel Pipe, Steel Tube
canvasgraphics.ColumnSteelI = function (param) {
    canvasgraphics.SectionSteelI.call(this, param);

    let self = this;
    self.type = OBJECTTYPE.COLUMN;

    self.matheader = new mobiwork.PropertyHeader({ text: "Material" });
    self.material = new mobiwork.PropertyCombobox({ text: "Material" });

    if (!param.text)
        self.text.value = "I Section";

    this.GetModel = function () {
        return {
            param: param,
            material: self.material.value
        }
    };
};

canvasgraphics.ColumnSteelChannel = function (param) {
    canvasgraphics.SectionSteelChannel.call(this, param);

    let self = this;
    self.type = OBJECTTYPE.COLUMN;

    self.matheader = new mobiwork.PropertyHeader({ text: "Material" });
    self.material = new mobiwork.PropertyCombobox({ text: "Material" });

    if (!param.text)
        self.text.value = "Channel Section";

    this.GetModel = function () {
        return {
            param: param,
            material: self.material.value
        }
    };
};

canvasgraphics.ColumnSteelAngle = function (param) {
    canvasgraphics.SectionSteelAngle.call(this, param);

    let self = this;
    self.type = OBJECTTYPE.COLUMN;

    self.matheader = new mobiwork.PropertyHeader({ text: "Material" });
    self.material = new mobiwork.PropertyCombobox({ text: "Material" });

    if (!param.text)
        self.text.value = "Angle Section";

    this.GetModel = function () {
        return {
            param: param,
            material: self.material.value
        }
    };
};


//Rebars
canvasgraphics.Rebar = function (param) {
    canvasgraphics.call(this, param);

    let self = this;

    self.property.fillcolor = "rgba(191, 5, 0, 0.6)";
    self.property.linecolor = "rgba(191, 5, 0, 0.6)";
    self.selectedproperty.fillcolor = "rgba(153, 153, 0, 0.6)";

    self.boundproperty = new canvasgraphics.DrawProperties();
    self.boundproperty.showfill = false;
    self.boundproperty.linecolor = "rgba(191, 5, 0, 0.6)";

    self.type = OBJECTTYPE.REBAR;
    self.points = [];
    self.drawpoints = 1;

    self.property.transparency = 1;
    self.general = new mobiwork.PropertyHeader({ text: "General" });

    if (param.text !== undefined) {
        self.text = new mobiwork.PropertyInlineInput({ text: "Name", value: param.text });
    } else {
        self.text = new mobiwork.PropertyInlineInput({ text: "Name", value: "Rebar" });
    }

    self.matheader = new mobiwork.PropertyHeader({ text: "Material" });
    self.material = new mobiwork.PropertyCombobox({ text: "Material" });

    self.dimension = new mobiwork.PropertyHeader({ text: "Dimensions" });

    if (param.w !== undefined) {
        self.w = new mobiwork.PropertyDouble({
            text: "Width, w",
            value: param.w,
            unit: units.thickness
        });
    }

    if (param.h !== undefined) {
        self.h = new mobiwork.PropertyDouble({
            text: "Height, h",
            value: param.h,
            unit: units.thickness
        });
    }

    if (param.r !== undefined) {
        self.r = new mobiwork.PropertyDouble({
            text: "Radius, r",
            value: param.r,
            unit: units.thickness
        });
    }

    if (param.l !== undefined) {
        self.l = new mobiwork.PropertyDouble({
            text: "Length, l",
            value: param.l,
            unit: units.thickness
        });
    }

    if (param.orientation !== undefined) {
        self.orientation = new mobiwork.PropertyCombobox({
            text: "Orientation",
            list: REBARORIENTATION,
            value: param.orientation
        });
    }

    if (param.cover !== undefined) {
        self.cover = new mobiwork.PropertyDouble({
            text: "Clear Cover",
            value: param.cover,
            unit: units.thickness
        });
    } else {
        self.cover = new mobiwork.PropertyDouble({
            text: "Clear Cover",
            value: 38.1,
            unit: units.thickness
        });
    }

    self.offset = new mobiwork.PropertyHeader({ text: "Offset" });

    self.x = new mobiwork.PropertyDouble({
        text: "Offset, X",
        value: param.x,
        unit: units.thickness
    });

    self.y = new mobiwork.PropertyDouble({
        text: "Offset, Y",
        value: param.y,
        unit: units.thickness
    });

    self.Refresh = function () {
    };

    self.Render = function (renderer) {
        let x;
        let y;
        let r;

        //Render dimensions
        for (let i = 0; i < self.points.length; i++) {
            x = self.points[i].x;
            y = self.points[i].y;
            r = self.points[i].r;
            renderer.DrawCircle(x, y, r, self.GetProperty());
        }

        if (self.selected && self.RenderBounds)
            self.RenderBounds(renderer);
    };

    self.GetBars = function (rebars) {
        let bars = [];

        if (Array.isArray(rebars))
            bars = rebars;

        let factor = units.length.value.value;

        for (let i = 0; i < self.points.length; i++) {
            bars.push({
                Name: "",
                Point: { X: self.points[i].x / factor, Y: self.points[i].y / factor },
                Area: self.points[i].r * self.points[i].r * Math.PI / (factor * factor),
                Weight: 0
            });
        }

        return bars;
    };

    self.SelectByPoint = function (x, y) {
        let point;
        let r;

        for (let i = 0; i < self.points.length; i++) {
            point = self.points[i];
            r = Math.sqrt((x - point.x) * (x - point.x) + (y - point.y) * (y - point.y));

            if (r <= point.r) {
                self.selected = true;
                break;
            }
        }

        return self.selected;
    };

    self.SelectByRectangle = function (x1, y1, x2, y2) {
        if (!self.onmousemove) {
            let points = self.points;
            let bounds = new graphicsentity.Bounds2F(x1, y1, x2, y2);
            let selected = true;

            for (let i = 0; i < points.length; i++) {
                if (!bounds.Inside(points[i].x, points[i].y)) {
                    selected = false;
                    break;
                }
            }

            self.selected = selected;
            return selected;
        }
        return false;
    };

    self.OnMouseMove = function (canvas, mouse) {
        if (self.selected) {
            //Select if there is no selected handle
            let x = mouse.currentsnap.x;
            let y = mouse.currentsnap.y;

            let px = mouse.previoussnap.x;
            let py = mouse.previoussnap.y;

            let dx = x - px;
            let dy = y - py;

            if (dx !== 0 || dy !== 0)
                self.Move(dx / units.length.value.value, dy / units.length.value.value);

            return true;
        }

        return false;
    };

    self.Move = function (dx, dy) {
        self.x.value += dx;
        self.y.value += dy;

        self.Refresh();
    };

    self.Select = function () {
        self.selected = true;
    };

    self.Deselect = function () {
        self.selected = false;
    };

    self.Refresh();
};

canvasgraphics.RebarPoint = function (param) {
    canvasgraphics.Rebar.call(this, param);

    let self = this;

    self.rebar = new mobiwork.PropertyHeader({ text: "Rebars" });
    self.point = new mobiwork.PropertyRebar({
        text: "Point",
        size: {
            list: REBARASTM,
            value: param.point.size
        }
    });

    self.Refresh = function () {
        let x = self.x.GetValue();
        let y = self.y.GetValue();

        self.points = [];

        let cb = self.point.size.value.value * units.thickness.value.value / 2;

        self.points.push(new graphicsentity.Point2F(x, y, cb));
    };

    self.Scale = function (x1, y1, x2, y2) {
        self.x.value = (x1 + x2) / 2;
        self.y.value = (y1 + y2) / 2;

        self.Refresh();
    };

    self.Refresh();
};

canvasgraphics.RebarLine = function (param) {
    canvasgraphics.Rebar.call(this, param);

    let self = this;

    self.rebar = new mobiwork.PropertyHeader({ text: "Rebars" });
    self.edge = new mobiwork.PropertyRebar({
        text: "Edge",
        size: {
            list: REBARASTM,
            value: param.edge.size
        }
    });

    self.middle = new mobiwork.PropertyRebar({
        text: "Middle",
        count: param.middle.count,
        size: {
            list: REBARASTM,
            value: param.middle.size
        }
    });

    self.Refresh = function () {
        let x = self.x.GetValue();
        let y = self.y.GetValue();
        let cover = self.cover.GetValue();
        let l = self.l.GetValue() / 2 - cover;
        let orientation = self.orientation.value;

        self.points = [];

        let cb = self.edge.size.value.value * units.thickness.value.value / 2;

        if (orientation === REBARORIENTATION.Horizontal) {
            //Corner Bars
            self.points.push(new graphicsentity.Point2F(x - l + cb, y, cb));
            self.points.push(new graphicsentity.Point2F(x + l - cb, y, cb));

            //Along 3
            let ax;

            let along3no = self.middle.count;

            cb = self.middle.size.value.value * units.thickness.value.value / 2;

            for (let i = 1; i <= along3no; i++) {
                ax = (x - (l - cb) + 2 * i * (l - cb) / (along3no + 1));
                self.points.push(new graphicsentity.Point2F(ax, y, cb));
                self.points.push(new graphicsentity.Point2F(ax, y, cb));
            }

        } else {
            //Corner Bars
            self.points.push(new graphicsentity.Point2F(x, y - l + cb, cb));
            self.points.push(new graphicsentity.Point2F(x, y + l - cb, cb));

            //Along 2
            let ay;

            let along2no = self.middle.count;

            cb = self.middle.size.value.value * units.thickness.value.value / 2;

            for (let i = 1; i <= along2no; i++) {
                ay = (y - (l - cb) + 2 * i * (l - cb) / (along2no + 1));
                self.points.push(new graphicsentity.Point2F(x, ay, cb));
                self.points.push(new graphicsentity.Point2F(x, ay, cb));
            }
        }
    };

    self.Scale = function (x1, y1, x2, y2) {
        if (self.orientation.value === REBARORIENTATION.Horizontal) {
            self.x.value = (x1 + x2) / 2;
            self.y.value = (y1 + y2) / 2;
            self.l.value = Math.abs(x1 - x2);
            self.cover.value = Math.abs(y1 - y2) * 0.05;
        } else if (self.orientation.value === REBARORIENTATION.Vertical) {
            self.x.value = (x1 + x2) / 2;
            self.y.value = (y1 + y2) / 2;
            self.l.value = Math.abs(y1 - y2);
            self.cover.value = Math.abs(x1 - x2) * 0.05;
        }

        self.Refresh();
        self.selected = true;
    };

    self.Refresh();
};

canvasgraphics.RebarPolyline = function (param) {
    canvasgraphics.Rebar.call(this, param);

    let self = this;
    let points = param.points;
    let holes = param.holes;
    let w;

    if (!points)
        points = [];

    //Required for drawing purpose
    self.drawpoints = 10000;

    //Hide dimension header
    self.dimension.visible = false;

    self.Refresh = function () {
        //Shape
        let pts = [];

        for (let i = 0; i < points.length; i++) {
            pts.push({
                x: points[i].x * units.length.value.value,
                y: points[i].y * units.length.value.value,
            });
        }

        self.UpdateCenter();

        let holepts = [];
        let hpts = [];

        if (holes) {
            for (let i = 0; i < holes.length; i++) {
                hpts = [];

                for (let j = 0; j < holes[i].points.length; j++) {
                    hpts.push({
                        x: holes[i].points[j].x * units.length.value.value,
                        y: holes[i].points[j].y * units.length.value.value,
                    });
                }

                switch (holes[i].type) {
                    case "polygon":
                        holepts.push({ type: holes[i].type, points: hpts });
                        break;

                    case "circle":
                        holepts.push({
                            type: holes[i].type,
                            points: hpts,
                            x: holes[i].x * units.length.value.value,
                            y: holes[i].y * units.length.value.value,
                            r: holes[i].r * units.length.value.value
                        });
                        break;
                }

            }

        }

        self.shape = new canvasgraphics.Polygon({
            points: pts,
            holes: holepts,
            a: self.angle.value
        });

        if (self.selected)
            self.UpdateSizingHandles();
    };

    self.UpdateCenter = function () {
        let polygon = new graphicsentity.Polygon(points);
        let bounds = new graphicsentity.Bounds2F();
        polygon.UpdateBounds(bounds);

        self.x.value = bounds.MidX();
        self.y.value = bounds.MidY();

        w = bounds.Width() * units.length.value.value;
    };

    self.AddPoint = function (x, y) {
        if (!points.push)
            points.push = [];

        points.push({ x: x, y: y });

        self.UpdateCenter();
    };

    self.UpdateLastPoint = function (x, y) {
        if (points.length > 0)
            points[points.length - 1] = { x: x, y: y };
    };

    self.RemoveLastPoint = function () {
        points.pop();
    }

    self.Scale = function (x1, y1, x2, y2) {
    };

    self.Refresh();
};

canvasgraphics.RebarRectangle = function (param) {
    canvasgraphics.Rebar.call(this, param);

    let self = this;

    self.rebar = new mobiwork.PropertyHeader({ text: "Rebars" });
    self.corner = new mobiwork.PropertyRebar({
        text: "Corner",
        size: {
            list: REBARASTM,
            value: param.corner.size
        }
    });

    self.along2 = new mobiwork.PropertyRebar({
        text: "Along 2",
        count: param.along2.count,
        size: {
            list: REBARASTM,
            value: param.along2.size
        }
    });

    self.along3 = new mobiwork.PropertyRebar({
        text: "Along 3",
        count: param.along3.count,
        size: {
            list: REBARASTM,
            value: param.along3.size
        }
    });

    self.RenderBounds = function (renderer) {
        let x = self.x.GetValue();
        let y = self.y.GetValue();
        let w = self.w.GetValue();
        let h = self.h.GetValue();

        renderer.DrawRectangle(x, y, w, h, self.boundproperty);
    };

    self.Refresh = function () {
        let x = self.x.GetValue();
        let y = self.y.GetValue();
        let cover = self.cover.GetValue();
        let w = self.w.GetValue() / 2 - cover;
        let h = self.h.GetValue() / 2 - cover;

        self.points = [];

        let cb = self.corner.size.value.value * units.thickness.value.value / 2;

        //Corner Bars
        self.points.push(new graphicsentity.Point2F(x - w + cb, y + h - cb, cb));
        self.points.push(new graphicsentity.Point2F(x - w + cb, y - h + cb, cb));
        self.points.push(new graphicsentity.Point2F(x + w - cb, y + h - cb, cb));
        self.points.push(new graphicsentity.Point2F(x + w - cb, y - h + cb, cb));

        //Along 2
        let ax;
        let ay;

        let along2no = self.along2.count;
        let along3no = self.along3.count;

        cb = self.along2.size.value.value * units.thickness.value.value / 2;

        for (let i = 1; i <= along2no; i++) {
            ay = (y - (h - cb) + 2 * i * (h - cb) / (along2no + 1));
            self.points.push(new graphicsentity.Point2F(x - w + cb, ay, cb));
            self.points.push(new graphicsentity.Point2F(x + w - cb, ay, cb));
        }

        //Along 3
        cb = self.along3.size.value.value * units.thickness.value.value / 2;

        for (let i = 1; i <= along3no; i++) {
            ax = (x - (w - cb) + 2 * i * (w - cb) / (along3no + 1));
            self.points.push(new graphicsentity.Point2F(ax, y - h + cb, cb));
            self.points.push(new graphicsentity.Point2F(ax, y + h - cb, cb));
        }
    };

    self.Scale = function (x1, y1, x2, y2) {
        self.x.value = (x1 + x2) / 2;
        self.y.value = (y1 + y2) / 2;
        self.w.value = Math.abs(x1 - x2);
        self.h.value = Math.abs(y1 - y2);
        self.cover.value = 38.1; //Math.abs(y1 - y2) * 0.05;

        self.Refresh();
        self.selected = true;
    };

    self.Refresh();
};

canvasgraphics.RebarCircle = function (param) {
    canvasgraphics.Rebar.call(this, param);

    let self = this;

    self.rebar = new mobiwork.PropertyHeader({ text: "Rebars" });
    self.bar = new mobiwork.PropertyRebar({
        text: "Circular",
        count: param.rebar.count,
        size: {
            list: REBARASTM,
            value: param.rebar.size
        }
    });

    self.Refresh = function () {
        let x = self.x.GetValue();
        let y = self.y.GetValue();
        let cover = self.cover.GetValue();
        let r = self.r.GetValue() - cover;

        self.points = [];

        let barsize = self.bar.size.value.value * units.thickness.value.value / 2;
        let barcount = self.bar.count;

        let theta = 2 * Math.PI / barcount;
        let tfactor = Math.tan(theta);//calculate the tangential factor
        let rfactor = Math.cos(theta);//calculate the radial factor

        let x1 = 0;
        let y1 = r - cover - barsize;

        let tx;
        let ty;

        for (let i = 0; i < barcount; i++) {
            self.points.push(new graphicsentity.Point2F(x1 + x, y1 + y, barsize));

            tx = -y1;
            ty = x1;

            //add the tangential vector
            x1 += tx * tfactor;
            y1 += ty * tfactor;

            //correct using the radial factor
            x1 *= rfactor;
            y1 *= rfactor;
        }
    };

    self.Scale = function (x1, y1, x2, y2) {
        self.x.value = (x1 + x2) / 2;
        self.y.value = (y1 + y2) / 2;
        self.r.value = Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2)) / 2;

        self.Refresh();
        self.selected = true;
    };

    self.Refresh();
};