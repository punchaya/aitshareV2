var graphicsentity = {};

graphicsentity.Bounds2F = function (x1, y1, x2, y2) {
    this.x1 = Number.MAX_VALUE;
    this.y1 = Number.MAX_VALUE;
    this.x2 = -Number.MAX_VALUE;
    this.y2 = -Number.MAX_VALUE;

    if (x1 !== undefined)
        this.x1 = x1;

    if (x2 !== undefined)
        this.x2 = x2;

    if (y1 !== undefined)
        this.y1 = y1;

    if (y2 !== undefined)
        this.y2 = y2;

    this.Update = function (x, y) {
        if (this.x1 > x)
            this.x1 = x;

        if (this.y1 > y)
            this.y1 = y;

        if (this.x2 < x)
            this.x2 = x;

        if (this.y2 < y)
            this.y2 = y;
    };

    this.Expand = function (factor) {
        let x = this.x2 - this.x1;
        let y = this.y2 - this.y1;

        this.x1 -= x * factor;
        this.x2 += x * factor;

        this.y1 -= y * factor;
        this.y2 += y * factor;
    };

    this.Inside = function (x, y) {
        if (x >= this.x1 && x <= this.x2)
            if (y >= this.y1 && y <= this.y2)
                return true;

        return false;
    }

    this.Area = function () {
        return Math.sqrt((this.x1 - this.x2) * (this.x1 - this.x2) + (this.y1 - this.y2) * (this.y1 - this.y2));
    };

    this.Width = function () {
        return Math.abs(this.x1 - this.x2);
    };

    this.Height = function () {
        return Math.abs(this.y1 - this.y2);
    };

    this.MidX = function () {
        return (this.x1 + this.x2) / 2;
    };

    this.MidY = function () {
        return (this.y1 + this.y2) / 2;
    };
};

graphicsentity.Bounds3F = function (x1, y1, z1, x2, y2, z2) {
    graphicsentity.Bounds2F.call(this, x1, y1, x2, y2);

    this.z1 = Number.MAX_VALUE;
    this.z2 = -Number.MAX_VALUE;

    if (z1 !== undefined)
        this.z1 = z1;

    if (z2 !== undefined)
        this.z2 = z2;

    this.Update = function (x, y, z) {
        if (this.x1 > x)
            this.x1 = x;

        if (this.y1 > y)
            this.y1 = y;

        if (this.z1 > z)
            this.z1 = z;

        if (this.x2 < x)
            this.x2 = x;

        if (this.y2 < y)
            this.y2 = y;

        if (this.z2 < z)
            this.z2 = z;
    };

    this.Expand = function (factor) {
        let x = this.x2 - this.x1;
        let y = this.y2 - this.y1;
        let z = this.z2 - this.z1;

        this.x1 -= x * factor;
        this.x2 += x * factor;

        this.y1 -= y * factor;
        this.y2 += y * factor;

        this.z1 += z * factor;
        this.z2 += z * factor;
    };

    this.MidX = function () {
        return (this.x1 + this.x2) / 2;
    };

    this.MidY = function () {
        return (this.y1 + this.y2) / 2;
    };

    this.MidZ = function () {
        return (this.z1 + this.z2) / 2;
    };
};

graphicsentity.Point2F = function (x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.color;
    this.thickness = 1;

    let a;

    this.Rotate = function (cx, cy, angle) {
        a = Math.PI * angle / 180;
        x = this.x;
        y = this.y;

        this.x = cx + Math.cos(a) * (x - cx) - Math.sin(a) * (y - cy);
        this.y = cy + Math.sin(a) * (x - cx) + Math.cos(a) * (y - cy);
    };

    this.Move = function (dx, dy) {
        this.x += dx;
        this.y += dy;
    };

    this.Equal = function (point, tolerance) {
        if (tolerance) {
            if (Math.sqrt((this.x - point.x) * (this.x - point.x) + (this.y - point.y) * (this.y - point.y)) <= tolerance)
                return true;

        } else {
            if (this.x === point.x && this.y === point.y)
                return true;
        }

        return false;
    };

    this.Distance = function (point) {
        return Math.sqrt(Math.pow(this.x - point.x, 2) + Math.pow(this.y - point.y, 2));
    };
};

graphicsentity.Point3F = function (x, y, z, r) {
    this.x = x;
    this.y = y;
    this.z = z;

    this.r = r;
    this.color;
    this.thickness = 1;

    this.Move = function (dx, dy, dz) {
        this.x += dx;
        this.y += dy;
        this.z += dz;
    };

    this.RotateAlongXY = function (cx, cy, angle) {
        let x = this.x;
        let y = this.y;

        let cos = Math.cos(angle);
        let sin = Math.sin(angle);

        this.x = cx + cos * (x - cx) - sin * (y - cy);
        this.y = cy + sin * (x - cx) + cos * (y - cy);
    };

    this.RotateAlongXZ = function (cx, cz, angle) {
        let x = this.x;
        let z = this.z;

        let cos = Math.cos(angle);
        let sin = Math.sin(angle);

        this.x = cx + cos * (x - cx) - sin * (z - cz);
        this.z = cz + sin * (x - cx) + cos * (z - cz);
    };

    this.Equal = function (point, tolerance) {
        if (tolerance) {
            if (Math.abs(this.x - point.x) <= tolerance &&
                Math.abs(this.y - point.y) <= tolerance &&
                Math.abs(this.z - point.z) <= tolerance)
                return true;

        } else {
            if (this.x === point.x && this.y === point.y && this.z === point.z)
                return true;
        }

        return false;
    };
};

graphicsentity.Line2F = function (x1, y1, x2, y2) {
    this.point1 = new graphicsentity.Point2F(x1, y1);
    this.point2 = new graphicsentity.Point2F(x2, y2);
    this.alive = true;

    let ratio;
    let diffx;
    let diffy;

    this.GetPointIntersection = function (point, tolerance) {
        if (this.IsHorizontal()) {
            if (this.IsOnX(point.x)) {
                if (this.InBetweenYWithTolerance(point.y, tolerance))
                    return new graphicsentity.Point2F(point.x, this.point1.y);
            }
        } else if (this.IsVertical()) {
            if (this.IsOnY(point.y)) {
                if (this.InBetweenXWithTolerance(point.x, tolerance))
                    return new graphicsentity.Point2F(this.point1.x, point.y);
            }
        } else if (this.IsOnX(point.x) && this.IsOnY(point.y)) {
            let x = this.point1.x - this.point2.x;
            let y = this.point1.y - this.point2.y;
            let ratio = y / x;

            let value = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
            let tolerancex = Math.abs(value * tolerance / x);
            let tolerancey = Math.abs(value * tolerance / y);

            if (this.InBetweenXWithTolerance(point.x, tolerancex) && this.InBetweenYWithTolerance(point.y, tolerancey)) {

                if (Math.abs(x) > Math.abs(y)) {
                    let compy = this.point1.y - (this.point1.x - point.x) * ratio;
                    if (this.WithinTolerance(compy, point.y, tolerancex))
                        return new graphicsentity.Point2F(point.x, compy);
                } else {
                    let compx = this.point1.x - (this.point1.y - point.y) / ratio;
                    if (this.WithinTolerance(compx, point.x, tolerancey))
                        return new graphicsentity.Point2F(compx, point.y);
                }
            }
        }

        return;
    };

    this.GetPointIntersection_2 = function (point, tolerance) {
        if (this.InBetweenXWithTolerance(point1.x, tolerance) && this.InBetweenYWithTolerance(point1.y, tolerance)) {
            if (this.IsHorizontal()) {
                if (this.IsOnX(point.x))
                        return new graphicsentity.Point2F(point.x, this.point1.y);
            } else if (this.IsVertical()) {
                if (this.IsOnY(point.y)) {
                        return new graphicsentity.Point2F(this.point1.x, point.y);
                }
            } else if (this.IsOnX(point.x) && this.IsOnY(point.y)) {
                let x = this.point1.x - this.point2.x;
                let y = this.point1.y - this.point2.y;
                let ratio = y / x;

                let value = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
                let tolerancex = Math.abs(value * tolerance / x);
                let tolerancey = Math.abs(value * tolerance / y);

                if (this.InBetweenXWithTolerance(point.x, tolerancex) && this.InBetweenYWithTolerance(point.y, tolerancey)) {
                    if (Math.abs(x) > Math.abs(y)) {
                        let compy = this.point1.y - (this.point1.x - point.x) * ratio;
                        if (this.WithinTolerance(compy, point.y, tolerancex))
                            return new graphicsentity.Point2F(point.x, compy);
                    } else {
                        let compx = this.point1.x - (this.point1.y - point.y) / ratio;
                        if (this.WithinTolerance(compx, point.x, tolerancey))
                            return new graphicsentity.Point2F(compx, point.y);
                    }
                }
            }
        }

        return;
    };

    this.GetLineIntersection = function (line) {
        let slope1 = this.GetSlope();
        let b1 = 0;

        if (slope1 !== null)
            b1 = this.GetIntercept(slope1);

        let slope2 = line.GetSlope();
        let b2 = 0;

        if (slope2 !== null)
            b2 = line.GetIntercept(slope2);

        let intersection;

        let x;
        let y;

        if (slope1 === null) {
            if (slope2 === null) {
                return;
            }

            y = slope2 * this.point1.x + b2;
            intersection = new graphicsentity.Point2F(this.point1.x, y);
        } else if (slope2 === null) {
            y = slope1 * line.point2.x + b1;
            intersection = new graphicsentity.Point2F(line.point2.x, y);
        } else {
            x = parseFloat(((b2 - b1) / (slope1 - slope2)).toFixed(4));
            y = parseFloat((slope1 * x + b1).toFixed(4));
            intersection = new graphicsentity.Point2F(x, y);
        }

        if (this.GetPointIntersection(intersection, 0.01) !== null)
            return intersection;

        return;
    };

    this.GetLineIntersection_2 = function (line) {
        let intersection = this.GetLineIntersection(line);

        if (intersection) {
            if (!this.GetPointIntersection(intersection, 0.001))
                return;

            if (!line.GetPointIntersection(intersection, 0.001))
                return;
        }

        return intersection;
    };

    this.GetX = function (y) {
        let slope1 = this.GetSlope();
        let b1 = 0;

        if (slope1 !== null)
            b1 = this.GetIntercept(slope1);

        let x = (y - b1) / slope1;
        return x;
    };

    this.GetY = function (x) {
        let slope1 = this.GetSlope();
        let b1 = 0;

        if (slope1 !== null)
            b1 = this.GetIntercept(slope1);

        let y = slope1 * x + b1;
        return y;
    };

    this.GetIntercept = function (slope) {
        return this.point1.y - slope * this.point1.x;
    };

    this.GetSlope = function () {
        let x = this.point1.x - this.point2.x;
        let y = this.point1.y - this.point2.y;

        if (x === 0)
            return null;

        if (y === 0)
            return 0;

        return y / x;
    };

    this.GetLength = function () {
        return Math.sqrt(Math.pow(this.point1.x - this.point2.x, 2) + Math.pow(this.point1.y - this.point2.y, 2));
    };

    this.GetAngle = function () {
        if (this.point1.x === this.point2.x) {
            if (this.point1.y > this.point2.y)
                return 90;
            else
                return 270;
        } else {
            let x = (this.point2.x - this.point1.x);
            let y = (this.point1.y - this.point2.y);

            let angle = (Math.atan(y / x) * (180 / Math.PI));

            if (x > 0) {
                if (y > 0)
                    return angle;
                else if (angle !== 0)
                    return 360 + angle;
                else
                    return 0;
            } else {
                return 180 + angle;
            }

            return angle;
        }
    };

    this.GetAngle2 = function () {
        if (this.point1.x === this.point2.x) {
            if (this.point1.y > this.point2.y)
                return 90;
            else
                return 270;
        } else {
            let x = (this.point2.x - this.point1.x);
            let y = (this.point2.y - this.point1.y);

            let angle = Math.atan(Math.abs(y) / Math.abs(x)) * (180 / Math.PI);

            if (x > 0) {
                if (y > 0)
                    return angle;
                else
                    return 360 - angle;
            } else {
                if (y > 0)
                    return 180 - angle;
                else
                    return 180 + angle;
            }
        }
    };

    this.GetPointsByCount = function (number) {
        if (number < 2)
            number = 2;

        let points = [];
        let intervalx = (this.point2.x - this.point1.x) / (number - 1);
        let intervaly = (this.point2.y - this.point1.y) / (number - 1);

        for (let count = 0; count < number; count++) {
            points[count] = new graphicsentity.Point2F(intervalx * count + this.point1.x, intervaly * count + this.point1.y);
        }

        return points;
    };

    this.GetPointsBySpacing = function (spacing) {
        if (spacing <= 0)
            return this.GetPointsByCount(2);

        let length = this.GetLength();

        if (length !== 0) {
            let number = Math.ceil(length / spacing) + 1;
            let points = [];
            let intervalx = (this.point2.x - this.point1.x) / (number - 1);
            let intervaly = (this.point2.y - this.point1.y) / (number - 1);

            for (let count = 0; count < number; count++) {
                points[count] = new graphicsentity.Point2F(intervalx * count + this.point1.x, intervaly * count + this.point1.y);
            }

            return points;
        }

        return null;
    };

    this.GetStartOffset = function (offset) {
        ratio = offset / this.GetLength();
        diffx = (this.point2.x - this.point1.x);
        diffy = (this.point2.y - this.point1.y);

        return new graphicsentity.Point2F(ratio * diffx + this.point1.x, ratio * diffy + this.point1.y);
    };

    this.GetStartOffset2 = function (offset) {
        ratio = offset / this.GetLength();
        diffx = (this.point2.x - this.point1.x);
        diffy = (this.point2.y - this.point1.y);

        return { x: ratio * diffx + this.point1.x, y: ratio * diffy + this.point1.y };
    };

    this.GetStartOffsetByRatio = function (ratio) {
        let diffx = (this.point2.x - this.point1.x);
        let diffy = (this.point2.y - this.point1.y);

        return new graphicsentity.Point2F(ratio * diffx + this.point1.x, ratio * diffy + this.point1.y);
    };

    this.GetEndOffset = function (offset) {
        let ratio = offset / this.GetLength();
        let diffx = (this.point2.x - this.point1.x);
        let diffy = (this.point2.y - this.point1.y);

        return new graphicsentity.Point2F(this.point2.x - ratio * diffx, this.point2.y - ratio * diffy);
    };

    this.GetEndOffset2 = function (offset) {
        ratio = offset / this.GetLength();
        diffx = (this.point2.x - this.point1.x);
        diffy = (this.point2.y - this.point1.y);

        return { x: this.point2.x - ratio * diffx, y: this.point2.y - ratio * diffy };
    };

    this.GetMidPoint = function () {
        return new graphicsentity.Point2F((this.point1.x + this.point2.x) / 2, (this.point1.y + this.point2.y) / 2);
    };

    this.GetMidPoint2 = function () {
        return { x: (this.point1.x + this.point2.x) / 2, y: (this.point1.y + this.point2.y) / 2 };
    };

    this.InBetweenXWithTolerance = function (x, tolerance) {
        if (this.point1.x < this.point2.x) {
            if (((this.point1.x - tolerance) < x) && ((this.point2.x + tolerance) > x))
                return true;
            else if (((this.point1.x + tolerance) > x) && ((this.point2.x - tolerance) < x))
                return true;
        } else {
            if (((this.point2.x - tolerance) < x) && ((this.point1.x + tolerance) > x))
                return true;
            else if (((this.point2.x + tolerance) > x) && ((this.point1.x - tolerance) < x))
                return true;
        }

        return false;
    };

    this.InBetweenX = function (x) {
        if (this.point1.x < this.point2.x) {
            if ((this.point1.x < x) && (this.point2.x > x))
                return true;
        } else {
            if ((this.point1.x > x) && (this.point2.x < x))
                return true;
        }

        return false;
    };

    this.IsOnX = function (x) {
        if (this.point1.x < this.point2.x) {
            if ((parseFloat(this.point1.x.toFixed(3)) <= parseFloat(x.toFixed(3))) && (parseFloat(this.point2.x.toFixed(3)) >= parseFloat(x.toFixed(3))))
                return true;
        } else {
            if ((parseFloat(this.point1.x.toFixed(3)) >= parseFloat(x.toFixed(3))) && (parseFloat(this.point2.x.toFixed(3)) <= parseFloat(x.toFixed(3))))
                return true;
        }

        return false;
    };

    this.InBetweenYWithTolerance = function (y, tolerance) {
        if (this.point1.y < this.point2.y) {
            if (((this.point1.y - tolerance) < y) && ((this.point2.y + tolerance) > y))
                return true;
        } else {
            if (((this.point1.y + tolerance) > y) && ((this.point2.y - tolerance) < y))
                return true;
        }

        return false;
    };

    this.InBetweenY = function (y) {
        if (this.point1.y < this.point2.y) {
            if ((this.point1.y < y) && (this.point2.y > y))
                return true;
        } else {
            if ((this.point1.y > y) && (this.point2.y < y))
                return true;
        }

        return false;
    };

    this.IsOnY = function (y) {
        if (this.point1.y < this.point2.y) {
            if ((parseFloat(this.point1.y.toFixed(3)) <= parseFloat(y.toFixed(3))) && (parseFloat(this.point2.y.toFixed(3)) >= parseFloat(y.toFixed(3))))
                return true;
        } else {
            if ((parseFloat(this.point1.y.toFixed(3)) >= parseFloat(y.toFixed(3))) && (parseFloat(this.point2.y.toFixed(3)) <= parseFloat(y.toFixed(3))))
                return true;
        }

        return false;
    };

    this.IsHorizontal = function () {
        if (this.point1.y === this.point2.y)
            return true;

        return false;
    };

    this.IsVertical = function () {
        if (this.point1.x === this.point2.x)
            return true;

        return false;
    };

    this.UpdateLength = function (l) {
        if (this.IsHorizontal()) {
            if (this.point2.x > this.point1.x)
                this.point2.x = this.point1.x + l;
            else
                this.point2.x = this.point1.x - l;
        } else if (this.IsVertical()) {
            if (this.point2.y > this.point1.y)
                this.point2.y = this.point1.y + l;
            else
                this.point2.y = this.point1.y - l;
        } else {
            let length = this.GetLength();
            let dx = this.point2.x - this.point1.x;
            let dy = this.point2.y - this.point1.y;

            this.point2.x = this.point1.x + (l * dx) / length;
            this.point2.y = this.point1.y + (l * dy) / length;
        }
    };

    this.Rotate = function (cx, cy, angle) {
        if (angle !== 0) {
            this.point1.Rotate(cx, cy, angle);
            this.point2.Rotate(cx, cy, angle);
        }
    };

    this.Offset = function (offset) {
        let dx = this.point1.x - this.point2.x;
        let dy = this.point1.y - this.point2.y;

        if (dx === 0 && dy === 0) {
            return new graphicsentity.Line2F(
                this.point1.x,
                this.point1.y,
                this.point2.x,
                this.point2.y
            );

        } else if (dx === 0) {
            return new graphicsentity.Line2F(
                this.point1.x + offset,
                this.point1.y,
                this.point2.x + offset,
                this.point2.y
            );

        } else if (dy === 0) {
            return new graphicsentity.Line2F(
                this.point1.x,
                this.point1.y + offset,
                this.point2.x,
                this.point2.y + offset
            );

        } else {
            let r = dx / dy;
            let sign = Math.sign(offset);
            let x = Math.sqrt(offset * offset / (1 + r * r));
            let y = Math.sqrt(offset * offset - x * x);

            if (dx > 0 && dy > 0) {
                return new graphicsentity.Line2F(
                    this.point1.x - sign * x,
                    this.point1.y + sign * y,
                    this.point2.x - sign * x,
                    this.point2.y + sign * y
                );

            } else if (dx > 0 && dy < 0) {
                return new graphicsentity.Line2F(
                    this.point1.x + sign * x,
                    this.point1.y + sign * y,
                    this.point2.x + sign * x,
                    this.point2.y + sign * y
                );

            } else if (dx < 0 && dy < 0) {
                return new graphicsentity.Line2F(
                    this.point1.x + sign * x,
                    this.point1.y - sign * y,
                    this.point2.x + sign * x,
                    this.point2.y - sign * y
                );

            } else {
                return new graphicsentity.Line2F(
                    this.point1.x - sign * x,
                    this.point1.y - sign * y,
                    this.point2.x - sign * x,
                    this.point2.y - sign * y
                );

            }
        }
    };

    this.Normalize = function () {
        let l = this.GetLength();

        return {
            x: (this.point1.x - this.point2.x) / l,
            y: (this.point1.y - this.point2.y) / l,
        };
    };

    this.WithinTolerance = function (value, compare, tolerance) {
        if (((value - tolerance) <= compare) && ((value + tolerance) >= compare))
            return true;

        return false;
    };
};

graphicsentity.Line3F = function (x1, y1, z1, x2, y2, z2) {
    this.point1 = new graphicsentity.Point3F(x1, y1, z1);
    this.point2 = new graphicsentity.Point3F(x2, y2, z2);
    this.alive = true;

    this.GetLength = function () {
        return Math.sqrt(Math.pow(this.point1.x - this.point2.x, 2) + Math.pow(this.point1.y - this.point2.y, 2) + Math.pow(this.point1.z - this.point2.z, 2));
    };

    this.WithinBounds = function (point, tolerance) {
        let dx = Math.abs(this.point1.x - this.point2.x);
        let dy = Math.abs(this.point1.y - this.point2.y);
        let dz = Math.abs(this.point1.z - this.point2.z);
        let pass = true;

        if (dx > tolerance) {
            if (!(this.point1.x < point.x && this.point2.x > point.x) &&
                !(this.point1.x > point.x && this.point2.x < point.x)) {
                pass = false;
            }
        } else {
            if (Math.abs(this.point1.x - point.x) > tolerance)
                pass = false;
        }

        if (!pass)
            return false;

        if (dy > tolerance) {
            if (!(this.point1.y < point.y && this.point2.y > point.y) &&
                !(this.point1.y > point.y && this.point2.y < point.y)) {
                pass = false;
            }
        } else {
            if (Math.abs(this.point1.y - point.y) > tolerance)
                pass = false;
        }

        if (!pass)
            return false;

        if (dz > tolerance) {
            if (!(this.point1.z < point.z && this.point2.z > point.z) &&
                !(this.point1.z > point.z && this.point2.z < point.z)) {
                pass = false;
            }
        } else {
            if (Math.abs(this.point1.z - point.z) > tolerance)
                pass = false;
        }

        return pass;
    };

    this.Normalize = function () {
        let l = this.GetLength();

        return {
            x: (this.point1.x - this.point2.x) / l,
            y: (this.point1.y - this.point2.y) / l,
            z: (this.point1.z - this.point2.z) / l
        };
    };

    this.GetPointsBySpacing = function (spacing) {
        let length = this.GetLength();

        if (length !== 0) {
            let number = Math.ceil(length / spacing) + 1;
            let points = [];

            let intervalx = (this.point2.x - this.point1.x) / (number - 1);
            let intervaly = (this.point2.y - this.point1.y) / (number - 1);
            let intervalz = (this.point2.z - this.point1.z) / (number - 1);

            for (let count = 0; count < number; count++) {
                points[count] = new graphicsentity.Point3F(intervalx * count + this.point1.x, intervaly * count + this.point1.y, intervalz * count + this.point1.z);
            }

            return points;
        }

        return null;
    };

    this.Offset = function (offsetx, offsety) {
        if (this.point1.x - this.point2.x === 0) {
            if (this.point1.y - this.point2.y === 0) {
                //Z only
                return new graphicsentity.Line3F(
                    this.point1.x + offsetx,
                    this.point1.y + offsety,
                    this.point1.z,
                    this.point2.x + offsetx,
                    this.point2.y + offsety,
                    this.point2.z,
                );
            } else if (this.point1.z - this.point2.z === 0) {
                //Y only
                return new graphicsentity.Line3F(
                    this.point1.x + offsetx,
                    this.point1.y,
                    this.point1.z + offsety,
                    this.point2.x + offsetx,
                    this.point2.y,
                    this.point2.z + offsety,
                );
            } else {
                //Y & Z
                let line = new graphicsentity.Line2F(
                    this.point1.y,
                    this.point1.z,
                    this.point2.y,
                    this.point2.z
                );

                if (offsety)
                    line = line.Offset(offsety);

                return new graphicsentity.Line3F(
                    this.point1.x + offsetx,
                    line.point1.x,
                    line.point1.y,
                    this.point2.x + offsetx,
                    line.point2.x,
                    line.point2.y,
                );
            }

        } else if (this.point1.y - this.point2.y === 0) {
            if (this.point1.z - this.point2.z === 0) {
                //X only
                return new graphicsentity.Line3F(
                    this.point1.x,
                    this.point1.y + offsetx,
                    this.point1.z + offsety,
                    this.point2.x,
                    this.point2.y + offsetx,
                    this.point2.z + offsety,
                );
            } else {
                //X & Z
                let line = new graphicsentity.Line2F(
                    this.point1.x,
                    this.point1.z,
                    this.point2.x,
                    this.point2.z
                );

                if (offsety)
                    line = line.Offset(offsety);

                return new graphicsentity.Line3F(
                    line.point1.x,
                    this.point1.y + offsetx,
                    line.point1.y,
                    line.point2.x,
                    this.point2.y + offsetx,
                    line.point2.y,
                );
            }

        } else if (this.point1.z - this.point2.z === 0) {
            //X & Y
            let line = new graphicsentity.Line2F(
                this.point1.x,
                this.point1.y,
                this.point2.x,
                this.point2.y
            );

            if (offsety)
                line = line.Offset(offsety);

            return new graphicsentity.Line3F(
                line.point1.x,
                line.point1.y,
                this.point1.z + offsetx,
                line.point2.x,
                line.point2.y,
                this.point2.z + offsetx,
            );

        } else {
            let dx = this.point2.x - this.point1.x;
            let dy = this.point2.y - this.point1.y;
            let dz = this.point2.z - this.point1.z;

            let lxy = Math.sqrt(dx * dx + dy * dy);
            let lxz = Math.sqrt(dx * dx + dz * dz);
            let length = Math.sqrt(dx * dx + dy * dy + dz * dz);

            let axy = Math.acos(Math.abs(dx) / lxy);
            let axz = Math.acos(Math.abs(dx) / lxz);

            let line = new graphicsentity.Line3F(
                0,
                offsetx,
                offsety,
                length,
                offsetx,
                offsety
            );

            if (dz >= 0)
                line.RotateAlongXZ(0, 0, Math.PI - axz);
            else
                line.RotateAlongXZ(0, 0, Math.PI + axz);

            if (dx >= 0 && dy >= 0) {
                //return;

                //OK
                line.RotateAlongXY(0, 0, Math.PI + axy);
            }

            else if (dx < 0 && dy >= 0) {
                //return;
                line.RotateAlongXY(0, 0, 1.5 * Math.PI + axy);
            }

            else if (dx >= 0 && dy < 0) {
                //return;
                line.RotateAlongXY(0, 0, axy);
            }

            else {
                //return;
                line.RotateAlongXY(0, 0, Math.PI / 2 + axy);
            }

            line.Move(this.point1.x, this.point1.y, this.point1.z);

            return line;
        }
    };

    this.RotateAlongXY = function (cx, cy, angle) {
        if (angle !== 0) {
            this.point1.RotateAlongXY(cx, cy, angle);
            this.point2.RotateAlongXY(cx, cy, angle);
        }
    };

    this.RotateAlongXZ = function (cx, cz, angle) {
        if (angle !== 0) {
            this.point1.RotateAlongXZ(cx, cz, angle);
            this.point2.RotateAlongXZ(cx, cz, angle);
        }
    };

    this.ToString = function () {
        return "P1 = {" + this.point1.x + ", " + this.point1.y + ", " + this.point1.y + "}, " +
            "P2 = {" + this.point2.x + ", " + this.point2.y + ", " + this.point2.y + "}";
    };

    this.Move = function (dx, dy, dz) {
        this.point1.Move(dx, dy, dz);
        this.point2.Move(dx, dy, dz);
    };

    this.GetStartOffset2 = function (offset) {
        let ratio = offset / this.GetLength();
        let diffx = (this.point2.x - this.point1.x);
        let diffy = (this.point2.y - this.point1.y);
        let diffz = (this.point2.z - this.point1.z);

        return { x: ratio * diffx + this.point1.x, y: ratio * diffy + this.point1.y, z: ratio * diffz + this.point1.z };
    };

    this.GetEndOffset2 = function (offset) {
        let ratio = offset / this.GetLength();
        let diffx = (this.point2.x - this.point1.x);
        let diffy = (this.point2.y - this.point1.y);
        let diffz = (this.point2.z - this.point1.z);

        return { x: this.point2.x - ratio * diffx, y: this.point2.y - ratio * diffy, z: this.point2.z - ratio * diffz };
    };
};


graphicsentity.Polygon = function (points) {
    let self = this;

    this.points = points;
    this.holes = [];

    this.IsInside = function (x, y) {
        let left = 0;
        let right = 0;
        let bounds = new graphicsentity.Bounds2F();

        this.UpdateBounds(bounds);

        if (bounds.Inside(x, y)) {
            for (let i = 0; i < this.points.length; i++) {
                if (new graphicsentity.Point2F(this.points[i].x, this.points[i].y).Equal({ x: x, y: y }, 0.001)) {
                    return true;
                }
            }

            for (let i = 1; i <= this.points.length; i++) {
                if (i !== this.points.length)
                    line = new graphicsentity.Line2F(this.points[i].x, this.points[i].y, this.points[i - 1].x, this.points[i - 1].y);
                else
                    line = new graphicsentity.Line2F(this.points[0].x, this.points[0].y, this.points[i - 1].x, this.points[i - 1].y);

                compare = new graphicsentity.Line2F(bounds.x1, y, bounds.x2, y);

                if (line.InBetweenY(y)) {
                    intersection = line.GetLineIntersection(compare);

                    if (intersection != null) {
                        if (x > intersection.x) {
                            left++;
                        }
                        else {
                            right++;
                        }
                    }
                }
            }

            if (((left % 2) != 0) && ((right % 2) != 0))
                return true;
        }

        return false;
    };

    this.IsInside1 = function (x, y) {
        let bounds = new graphicsentity.Bounds2F();

        this.UpdateBounds(bounds);

        if (bounds.Inside(x, y)) {
            let angle = 0;
            let line1 = new graphicsentity.Line2F();
            let line2 = new graphicsentity.Line2F();
            let angle1, angle2;
            let diff;

            for (let i = 0; i < this.points.length; i++) {
                if (this.points[i].x === x && this.points[i].y === y)
                    return false;

                line1.point1.x = x;
                line1.point1.y = y;
                line1.point2.x = this.points[i].x;
                line1.point2.y = this.points[i].y;
                angle1 = line1.GetAngle2();

                line2.point1.x = x;
                line2.point1.y = y;

                if (i === 0) {
                    line2.point2.x = this.points[this.points.length - 1].x;
                    line2.point2.y = this.points[this.points.length - 1].y;

                } else {
                    line2.point2.x = this.points[i - 1].x;
                    line2.point2.y = this.points[i - 1].y;
                }

                angle2 = line2.GetAngle2();
                diff = angle2 - angle1;

                if (angle1 >= 180 && angle2 < 90)
                    diff += 360;

                angle += diff;
            }

            return Math.round(angle) >= 270 ? true : false;
        }
    };

    this.IsOn = function (x, y) {
        let left = 0;
        let right = 0;
        let bounds = new graphicsentity.Bounds2F();

        this.UpdateBounds(bounds);

        if (bounds.Inside(x, y)) {
            for (let i = 0; i < this.points.length; i++) {
                if (new graphicsentity.Point2F(this.points[i].x, this.points[i].y).Equal({ x: x, y: y }, 0.001)) {
                    return true;
                }
            }

            for (let i = 1; i <= this.points.length; i++) {
                if (i !== this.points.length)
                    line = new graphicsentity.Line2F(this.points[i].x, this.points[i].y, this.points[i - 1].x, this.points[i - 1].y);
                else
                    line = new graphicsentity.Line2F(this.points[0].x, this.points[0].y, this.points[i - 1].x, this.points[i - 1].y);

                compare = new graphicsentity.Line2F(bounds.x1, y, bounds.x2, y);

                if (line.InBetweenY(y)) {
                    intersection = line.GetLineIntersection(compare);

                    if (intersection != null) {
                        if (x > intersection.x) {
                            left++;
                        }
                        else {
                            right++;
                        }
                    }
                }
            }

            if (((left % 2) != 0) && ((right % 2) != 0))
                return true;
        }

        return false;
    };

    this.IsPolygonInside = function (polygon) {
        let point;

        for (let i = 0; i < polygon.points.length; i++) {
            point = polygon.points[i];

            if (!self.IsInside(point.x, point.y)) {
                return false;
            }
        }

        return true;
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

    this.CheckOrientation = function (polygons) {
        // All polygon show be drawn in clock-wise direction
        // point[0] = (5,0)   edge[0]: (6-5)(4+0) =   4
        // point[1] = (6,4)   edge[1]: (4-6)(5+4) = -18
        // point[2] = (4,5)   edge[2]: (1-4)(5+5) = -30
        // point[3] = (1,5)   edge[3]: (1-1)(0+5) =   0
        // point[4] = (1,0)   edge[4]: (5-1)(0+0) =   0

        let nx, ny, cx, cy;
        let edge = 0;
        let store = [];

        for (let i = 0; i < polygons.length; i++) {
            if (!polygons[i].ishole) {
                edge = 0;
                store = [];

                for (let j = 0; j < polygons[i].points.length; j++) {
                    cx = polygons[i].points[j].x;
                    cy = polygons[i].points[j].y;

                    if (j + 1 === polygons[i].points.length) { //Add first point as next point: closing summation
                        nx = polygons[i].points[0].x;
                        ny = polygons[i].points[0].y;
                    } else {
                        nx = polygons[i].points[j + 1].x;
                        ny = polygons[i].points[j + 1].y;
                    }

                    edge += (nx - cx) * (ny + cy);
                }

                if (edge < 0) { //Summation of edges is (-)tive means counter-clockwise, therefore: Reverse points
                    for (let j = polygons[i].points.length - 1; j >= 0; j--) {
                        store.push(polygons[i].points[j])
                    }

                    polygons[i].points = store;
                }
            }
        }
    };

    this.RemoveInnerPolygons = function (polygons, response) {
        let pt;
        let handle;

        for (let i = 0; i < polygons.length; i++) {
            for (let j = 0; j < polygons.length; j++) {
                //Should not be the same polygon
                if (j !== i && !polygons[i].ishole) {
                    handle = true;

                    for (let k = 0; k < polygons[i].points.length; k++) {
                        pt = polygons[i].points[k];

                        if (!polygons[j].IsInside(pt.x, pt.y)) {
                            handle = false;
                            break;
                        }
                    }

                    if (!handle)
                        break;
                    else {
                        response.success = true;
                        polygons.splice(i, 1);
                        i--;
                        break;
                    }
                }
            }
        }
    };

    this.RemoveOuterPolygons = function (polygons) {
        let pt;
        let handle;

        for (let i = 1; i < polygons.length; i++) {
            handle = true;

            for (let k = 0; k < polygons[i].points.length; k++) {
                pt = polygons[i].points[k];

                if (polygons[0].IsInside(pt.x, pt.y)) {
                    handle = false;
                    break;
                }
            }

            if (handle) {
                polygons.splice(i, 1);
                i--;
            }
        }
    };

    this.FindHoles = function (points, polygons) {
        let holes = [];
        let point;
        let handle;
        let polygon;
        let tolerance = 0.001;

        //Collect all hole points
        for (let i = 0; i < polygons.length; i++) {
            if (polygons[i].merged)
                continue;

            for (let j = 0; j < polygons[i].points.length; j++) {

                point = polygons[i].points[j];

                handle = true;

                //Test if point is not in points
                if (!polygons[i].ishole) {
                    for (let k = 0; k < points.length; k++) {
                        if (Math.abs(point.x - points[k].x) < tolerance && Math.abs(point.y - points[k].y) < tolerance) {
                            handle = false;
                            break;
                        }
                    }
                }

                if (handle) {
                    //Test if point is not inside the other polygons
                    if (polygons[i].ishole) {
                        for (let m = 0; m < polygons.length; m++) {
                            if (i != m && !polygons[m].ishole && polygons[i].parent != m) {
                                polygon = new graphicsentity.Polygon(polygons[m].points);
                                if (polygon.IsInside(point.x, point.y)) {
                                    if (polygons[m].child && polygons[m].child != i) {
                                        polygon = new graphicsentity.Polygon(polygons[polygons[m].child].points);

                                        if (!polygon.IsInside(point.x, point.y)) {
                                            handle = false;
                                            break;
                                        }

                                    } else {
                                        handle = false;
                                        break;
                                    }
                                }
                            }
                        }
                    } else {
                        for (let m = 0; m < polygons.length; m++) {
                            if (i != m) {
                                polygon = new graphicsentity.Polygon(polygons[m].points);
                                if (polygon.IsInside(point.x, point.y)) {
                                    if (polygons[m].child && polygons[m].child != i) {
                                        polygon = new graphicsentity.Polygon(polygons[polygons[m].child].points);

                                        if (!polygon.IsInside(point.x, point.y)) {
                                            handle = false;
                                            break;
                                        }

                                    } else {
                                        handle = false;
                                        break;
                                    }
                                }
                            }
                        }
                    }

                    if (handle) {
                        point.polyindex = i;
                        point.pointindex = j;
                        holes.push(point);
                    }
                }
            }
        }

        let previous;
        let response = { success: false };
        let holelist = [];

        if (holes.length !== 0) {
            for (let i = 0; i < holes.length; i++) {
                if (!holes[i].finished) {
                    points = [];

                    /*  1. MergePolygon is governed by a positive incremental index (i.e.: 0, 1, 2, n, ...)
                        2. Make sure hole coordinates are defined in the anti-clockwise direction (for the positive incremental index)
                        3. Make sure points coordinates are deined in the clockwise direction (for the positive incremental index) */
                    this.MergePolygon(points, polygons, holes[i].polyindex, holes[i].pointindex, previous, true, response);

                    //Tag the finished points
                    for (let k = 0; k < holes.length; k++) {
                        for (let m = 0; m < points.length; m++) {
                            if (holes[k].x === points[m].x && holes[k].y === points[m].y) {
                                holes[k].finished = true;
                                break;
                            }
                        }
                    }

                    //Add hole
                    if (points.length !== 0)
                        holelist.push({
                            type: "polygon",
                            points: points
                        });
                }
            }
        }

        return holelist;
    };

    this.MergePolygon = function (points, polygons, polyindex, pointindex, previous, ishole, response) {
        let pt;
        let pt1;
        let pt2;
        let line;
        let lineo;
        let line1;
        let handle;
        let ipts = [];
        let ipt;
        let iptindex;
        let counter = 0;
        let length;
        let tlength;

        let cpoint1;
        let cpoint2;

        let opoint1;
        let opoint2;
        let tolerance = 0.001;

        let insideindex = -1;
        let remove = true;
        let poly;
        let bounds;

        for (let i = pointindex; i <= polygons[polyindex].points.length; i++) {
            if (i === polygons[polyindex].points.length) {
                counter++;
                i = 0;
            }

            pt = polygons[polyindex].points[i];

            if (points.length === 0) {
                if (counter === 1) {
                    polyindex++;
                    i = -1;
                    counter = 0;

                    if (polygons.length === polyindex)
                        return;

                    continue;

                } else {
                    handle = true;

                    for (let j = 0; j < polygons.length; j++) {
                        //Should not be the same polygon
                        if (j !== polyindex) {
                            if (!polygons[polyindex].ishole || polygons[polyindex].parent !== j) {
                                if (!polygons[j].ishole && polygons[j].IsOn(pt.x, pt.y)) {

                                    if (polygons[j].child && polygons[j].child != polyindex) {
                                        polygon = new graphicsentity.Polygon(polygons[polygons[j].child].points);

                                        if (!polygon.IsOn(pt.x, pt.y)) {
                                            handle = false;
                                            break;
                                        }

                                    } else {
                                        handle = false;
                                        break;
                                    }
                                }
                            }
                        } else {
                            if (!ishole && !polygons[j].ishole) {
                                poly = new graphicsentity.Polygon(polygons[j].points);
                                bounds = new graphicsentity.Bounds2F();
                                poly.UpdateBounds(bounds);

                                if (pt.x > bounds.x1 && pt.x < bounds.x2)
                                    if (pt.y > bounds.y1 && pt.y < bounds.y2) {
                                        handle = false;
                                        break;
                                    }
                            }
                        }
                    }

                    if (!handle)
                        continue;
                }
            }

            //Check if line intersect with the other polygon
            if (previous) {
                line = new graphicsentity.Line2F(previous.x, previous.y, pt.x, pt.y);
                opoint1 = new graphicsentity.Point2F(previous.x, previous.y);
                opoint1.z = previous.z;

                opoint2 = new graphicsentity.Point2F(pt.x, pt.y);
                opoint2.z = pt.z;

                handle = false;
                ipts = [];

                for (let k = 0; k < polygons.length; k++) {
                    if (k !== polyindex) {

                        for (let j = 0; j < polygons[k].points.length; j++) {
                            if (j === polygons[k].points.length - 1) {
                                pt1 = polygons[k].points[j];
                                pt2 = polygons[k].points[0];

                            } else {
                                pt1 = polygons[k].points[j];
                                pt2 = polygons[k].points[j + 1];
                            }

                            cpoint1 = new graphicsentity.Point2F(pt1.x, pt1.y);
                            cpoint1.z = pt1.z;

                            cpoint2 = new graphicsentity.Point2F(pt2.x, pt2.y);
                            cpoint2.z = pt2.z;

                            lineo = new graphicsentity.Line2F(pt1.x, pt1.y, pt2.x, pt2.y);

                            if (opoint2.Equal(cpoint1, tolerance)) {
                                ipt = opoint2;

                            } else if (opoint2.Equal(cpoint2, tolerance)) {
                                ipt = opoint2;

                            } else if (line.GetPointIntersection(cpoint1, tolerance)) {
                                ipt = cpoint1;

                            } else if (line.GetPointIntersection(cpoint2, tolerance)) {
                                ipt = cpoint2;

                            } else if (lineo.GetPointIntersection(pt, tolerance)) {
                                ipt = pt;

                            } else {
                                //Get intersection point
                                ipt = line.GetLineIntersection_2(lineo);
                            }

                            //Intersects
                            if (ipt) {
                                ipt.polyindex = k;
                                ipt.index = j;
                                ipts.push(ipt);
                            }
                        }
                    }
                }

                length = Number.MAX_VALUE;

                for (let j = 0; j < ipts.length; j++) {
                    line1 = new graphicsentity.Line2F(previous.x, previous.y, ipts[j].x, ipts[j].y);

                    tlength = line1.GetLength();
                    if (tlength < length) {
                        length = tlength;
                        ipt = ipts[j];
                        iptindex = ipts[j].index;
                    }
                }

                //Intersects
                if (ipt) {
                    //Add point to the list
                    previous = ipt;

                    //Add point to the list
                    handle = true;

                    for (let m = 0; m < points.length; m++) {
                        if (Math.abs(points[m].x - ipt.x) < tolerance && Math.abs(points[m].y - ipt.y) < tolerance) {
                            handle = false;
                            break;
                        }
                    }

                    if (handle) {
                        polygons[polyindex].merged = true;
                        points.push(ipt);
                    }
                    else {
                        previous = pt;
                        polygons[polyindex].merged = true;
                        points.push(pt);
                        continue;
                    }

                    handle = true;

                    if (polygons[ipt.polyindex].length === iptindex + 1)
                        self.MergePolygon(points, polygons, ipt.polyindex, 0, previous, ishole, response);
                    else
                        self.MergePolygon(points, polygons, ipt.polyindex, iptindex + 1, previous, ishole, response);

                    response.success = true;
                    return;
                }

                if (handle)
                    break;
            }

            //Add point to the list
            handle = true;

            for (let k = 0; k < points.length; k++) {
                if (points[k].x === pt.x && points[k].y === pt.y) {
                    handle = false;
                    break;
                }
            }

            if (handle) {
                polygons[polyindex].merged = true;
                previous = pt;
                points.push(pt);
            } else {
                return;
            }
        }
    };

    this.SubtractPolygon = function (points, polygons, polyindex, pointindex, previous, direction, response) {
        let pt;
        let pt1;
        let pt2;
        let line;
        let lineo;
        let line1;
        let handle;
        let ipts = [];
        let ipt;
        let iptindex;
        let counter = 0;
        let length;
        let tlength;

        let cpoint1;
        let cpoint2;

        let opoint1;
        let opoint2;
        let tolerance = 0.001;

        let i = pointindex;
        let backward;

        do {
            if (direction === 1) {
                if (i === polygons[polyindex].points.length) {
                    counter++;
                    i = 0;
                }
            } else {
                if (i < 0) {
                    counter++;
                    i = polygons[polyindex].points.length - 1;
                }
            }

            pt = polygons[polyindex].points[i];

            //Check if pt is inside polygon
            if (points.length === 0) {
                handle = false;

                //Polygon is inside other polygon
                if (counter !== 0) {
                    //Remove polygon
                    polygons.splice(polyindex, 1);

                    //Try merging the other polygons
                    self.MergePolygon(points, polygons, 0, 0);
                    response.success = true;

                    break;
                }

                for (let j = 0; j < polygons.length; j++) {
                    //Should not be the same polygon
                    if (j !== polyindex) {
                        if (polygons[j].IsInside(pt.x, pt.y)) {
                            handle = true;
                            break;
                        }

                    }
                }

                if (handle) {
                    i += direction;
                    continue;
                }
            }

            //Check if line intersect with the other polygon
            if (previous) {
                line = new graphicsentity.Line2F(previous.x, previous.y, pt.x, pt.y);
                opoint1 = new graphicsentity.Point2F(previous.x, previous.y);
                opoint2 = new graphicsentity.Point2F(pt.x, pt.y);

                handle = false;
                backward = 0;

                for (let k = 0; k < polygons.length; k++) {
                    if (k !== polyindex) {
                        ipts = [];

                        for (let j = 0; j < polygons[k].points.length; j++) {
                            if (j === polygons[k].points.length - 1) {
                                pt1 = polygons[k].points[j];
                                pt2 = polygons[k].points[0];

                            } else {
                                pt1 = polygons[k].points[j];
                                pt2 = polygons[k].points[j + 1];
                            }

                            if (pt1.z == undefined) {
                                cpoint1 = new graphicsentity.Point2F(pt1.x, pt1.y);
                                cpoint2 = new graphicsentity.Point2F(pt2.x, pt2.y);

                            } else {
                                cpoint1 = new graphicsentity.Point3F(pt1.x, pt1.y, pt1.z);
                                cpoint2 = new graphicsentity.Point3F(pt2.x, pt2.y, pt2.z);
                            }

                            lineo = new graphicsentity.Line2F(pt1.x, pt1.y, pt2.x, pt2.y);

                            if (opoint1.Equal(cpoint1, tolerance)) {
                                ipt = opoint1;

                            } else if (opoint1.Equal(cpoint2, tolerance)) {
                                ipt = opoint1;

                            } else if (opoint2.Equal(cpoint1, tolerance)) {
                                ipt = opoint2;

                            } else if (opoint2.Equal(cpoint2, tolerance)) {
                                ipt = opoint2;

                            } else if (line.GetPointIntersection(cpoint1, tolerance)) {
                                ipt = cpoint1;
                                backward = 1;

                            } else if (line.GetPointIntersection(cpoint2, tolerance)) {
                                ipt = cpoint2;
                                backward = 1;

                            } else {
                                //Get intersection point
                                ipt = line.GetLineIntersection_2(lineo);
                            }

                            //Intersects
                            if (ipt) {
                                ipt.index = j;
                                ipts.push(ipt);
                            }
                        }

                        length = Number.MAX_VALUE;

                        for (let j = 0; j < ipts.length; j++) {
                            line1 = new graphicsentity.Line2F(previous.x, previous.y, ipts[j].x, ipts[j].y);

                            tlength = line1.GetLength();
                            if (tlength < length) {
                                length = tlength;
                                ipt = ipts[j];
                                iptindex = ipts[j].index;
                            }
                        }

                        //Intersects
                        if (ipt) {
                            //Add point to the list
                            previous = ipt;

                            //Add point to the list
                            handle = true;

                            for (let m = 0; m < points.length; m++) {
                                if (points[m].x === ipt.x && points[m].y === ipt.y) {
                                    handle = false;
                                    break;
                                }
                            }

                            if (handle)
                                points.push(ipt);
                            else
                                continue;

                            handle = true;

                            // if (k === 0)
                            //     direction = 1;
                            // else
                            //     direction = -1;

                            if (polygons[k].length === iptindex - 1)
                                self.SubtractPolygon(points, polygons, k, 0, previous, direction, response);
                            else {
                                if (direction === 1)
                                    self.SubtractPolygon(points, polygons, k, iptindex + 1, previous, direction, response);
                                //else
                                //    self.SubtractPolygon(points, polygons, k, iptindex - backward, previous, direction, response);
                            }

                            response.success = true;
                            return;
                        }

                        if (handle)
                            break;
                    }
                }
            }

            //Add point to the list
            handle = true;

            for (let k = 0; k < points.length; k++) {
                if (points[k].x === pt.x && points[k].y === pt.y) {
                    handle = false;
                    break;
                }
            }

            if (handle) {
                previous = pt;
                points.push(pt);
            } else {
                return;
            }

            i += direction;

        } while (1);
    };

    this.SubtractHoles = function (polygons, response) {
        let point;

        for (let i = 1; i < polygons.length; i++) {
            switch (polygons[i].type) {
                case "polygon":
                    if (polygons[0].IsPolygonInside(polygons[i])) {
                        polygons[0].holes.push({
                            type: polygons[i].type,
                            points: polygons[i].points
                        });

                        response.success = true;

                        polygons.splice(i, 1);
                        i--;
                    }
                    break;

                case "circle":
                    if (polygons[0].IsPolygonInside(polygons[i])) {
                        polygons[0].holes.push({
                            type: polygons[i].type,
                            points: polygons[i].points,
                            x: polygons[i].x,
                            y: polygons[i].y,
                            r: polygons[i].r
                        });

                        response.success = true;

                        polygons.splice(i, 1);
                        i--;
                    }
                    break;
            }
        }
    };

    this.Merge = function (polygons) {
        let previous;
        let points = [];
        let response = { success: false };

        this.CheckOrientation(polygons);
        this.RemoveInnerPolygons(polygons, response);

        this.MergePolygon(points, polygons, 0, 0, previous, false, response);
        this.points = points;

        this.holes = this.FindHoles(points, polygons);

        return response;
    };

    this.Subtract = function (polygons) {
        let previous;
        let points = [];
        let response = { success: false };

        this.SubtractHoles(polygons, response);

        if (polygons.length > 1) {
            this.SubtractPolygon(points, polygons, 0, 0, previous, 1, response);
            polygons[0].points = points;
        }

        return response;
    };

    this.Flip = function (coordinate, polygon) {
        let store = [];
        let response = { success: false };

        if (polygon.points.length !== 0) {

            if (!polygon[coordinate]) {

                let poly = new graphicsentity.Polygon(polygon.points);
                let bounds = new graphicsentity.Bounds2F();
                poly.UpdateBounds(bounds);

                polygon.x = bounds.MidX();
                polygon.y = bounds.MidY();
            }

            //Do flip (one polygon per time)
            // 1 .Flip points
            // 1.a Shift coordinate values
            for (let i = 0; i < polygon.points.length; i++) {
                polygon.points[i][coordinate] -= (polygon.points[i][coordinate] - polygon[coordinate]) * 2;
            }

            // 1.b Reorder in clockwise direction
            for (let j = polygon.points.length - 1; j >= 0; j--) {
                store.push(polygon.points[j])
            }

            polygon.points = store;
            store = [];

            if (polygon.holes && polygon.holes.length !== 0) {
                // 2. Flip holes
                // 2.a For each hole in holes
                for (let i = 0; i < polygon.holes.length; i++) {
                    // 2.b Shift coordinate values
                    for (let j = 0; j < polygon.holes[i].points.length; j++) {
                        polygon.holes[i].points[j][coordinate] -= (polygon.holes[i].points[j][coordinate] - polygon[coordinate]) * 2;
                    }

                    // 2.c Reorder in clockwise direction
                    for (let k = polygon.holes[i].points.length - 1; k >= 0; k--) {
                        store.push(polygon.holes[i].points[k]);
                    }

                    polygon.holes[i].points = store;
                    store = [];
                }
            }

            // 3. Record polygon
            this.points = polygon.points;
            this.holes = polygon.holes;

            response.success = true;
        }

        return response;
    };
};

graphicsentity.Circle = function (x, y, r) {
    let self = this;

    self.x = x;
    self.y = y;
    self.r = r;

    self.GetPoints = function (nosides) {
        let x = self.x;
        let y = self.y;
        let r = self.r;
        let n = 64;

        if (nosides)
            n = nosides;

        let points = [];

        let theta = -2 * 3.1415926 / n;
        let tfactor = Math.tan(theta);//calculate the tangential factor
        let rfactor = Math.cos(theta);//calculate the radial factor

        let x1 = 0;
        let y1 = r;

        let tx;
        let ty;

        for (let i = 0; i < n; i++) {
            points.push({ x: x1 + x, y: y1 + y });

            tx = -y1;
            ty = x1;

            //add the tangential vector
            x1 += tx * tfactor;
            y1 += ty * tfactor;

            //correct using the radial factor
            x1 *= rfactor;
            y1 *= rfactor;
        }

        return points;
    };
}

graphicsentity.Arc = function (x, y, r, sa, ea, isAnti) {
    let self = this;

    self.x = x;
    self.y = y;
    self.r = r;
    self.sa = sa;
    self.ea = ea;
    self.n = 3;

    self.GetPoints = function (nosides) {
        /* NOTE:
           1. Plotting starts from 0 to n, including n (i.e.: no need "line to" to connect arcs to lines with extra points and code)
           2. Plot starts from start angle ('0' angle is the same as in the canvas)
        */
        let points = [];

        let x = self.x;
        let y = self.y;
        let r = self.r;
        let sa = self.sa;
        let ea = self.ea;
        let n = self.n;
        let angle, dir, theta, x1, y1;

        if (nosides)
            n = nosides;

        if (isAnti) { // anti-clockwise
            dir = -1; // reverse direction
            angle = sa - ea; // positive angle goes from start-angle to end-angle

            if (ea > sa) // if start-angle is smaller than end-angle
                angle = 2 * Math.PI + (sa - ea); // flip to other angle
        } else { // clockwise
            dir = 1
            angle = ea - sa; // positive angle goes from end-angle to start-angle

            if (sa > ea) // if start-angle is smaller than end-angle
                angle = 2 * Math.PI + (ea - sa); // flip to other angle
        }

        theta = angle / n; // positive theta value

        for (let i = 0; i <= n; i++) { // plot starts from start angle +/- theta (depending on direction)
            x1 = r * Math.cos(-(sa + theta * (i) * dir));
            y1 = r * Math.sin(-(sa + theta * (i) * dir));

            points.push({ x: x1 + x, y: y1 + y });
        }

        return points;
    };
};