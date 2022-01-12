/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author erich666 / http://erichaines.com
 */
/*global THREE, console, csicontrols */

// This set of controls performs orbiting, dollying (zooming), and panning. It maintains
// the "up" direction as +Y, unlike the TrackballControls. Touch on tablet and phones is
// supported.
//
//    Orbit - left mouse / touch: one finger move
//    Zoom - middle mouse, or mousewheel / touch: two finger spread or squish
//    Pan - right mouse, or arrow keys / touch: three finter swipe

var _animate_;

THREE.OrbitControls = function (object, domElement) {

    this.object = object;
    this.domElement = (domElement !== undefined) ? domElement : document;

    // API

    // Set to false to disable this control
    this.enabled = true;

    // "target" sets the location of focus, where the control orbits around
    // and where it pans with respect to.
    this.target = new THREE.Vector3();

    // center is old, deprecated; use "target" instead
    this.center = this.target;

    // This option actually enables dollying in and out; left as "zoom" for
    // backwards compatibility
    this.noZoom = false;
    this.zoomSpeed = 1.0;

    // Limits to how far you can dolly in and out ( PerspectiveCamera only )
    this.minDistance = 1;
    this.maxDistance = Infinity;

    // Limits to how far you can zoom in and out ( OrthographicCamera only )
    this.minZoom = 0;
    this.maxZoom = Infinity;

    // Set to true to disable this control
    this.noRotate = false;
    this.rotateSpeed = 1.0;

    // Set to true to disable this control
    this.noPan = false;
    this.keyPanSpeed = 7.0;	// pixels moved per arrow key push

    // Set to true to automatically rotate around the target
    this.autoRotate = false;
    this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

    // How far you can orbit vertically, upper and lower limits.
    // Range is 0 to Math.PI radians.
    this.minPolarAngle = 0; // radians
    this.maxPolarAngle = Math.PI; // radians

    // How far you can orbit horizontally, upper and lower limits.
    // If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
    this.minAzimuthAngle = -Infinity; // radians
    this.maxAzimuthAngle = Infinity; // radians

    // Set to true to disable use of the keys
    this.noKeys = false;
    this.parent = null;

    this.touchdistance = 0;
    this.prevx0;
    this.prevx1;
    this.prevy0;
    this.prevy1;

    // The four arrow keys
    this.keys = {LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40};

    // Mouse buttons
    this.mouseButtons = {ORBIT: THREE.MOUSE.LEFT, ZOOM: THREE.MOUSE.MIDDLE, PAN: THREE.MOUSE.RIGHT};

    ////////////
    // internals

    var scope = this;

    var EPS = 0.000001;

    var rotateStart = new THREE.Vector2();
    var rotateEnd = new THREE.Vector2();
    var rotateDelta = new THREE.Vector2();

    var panStart = new THREE.Vector2();
    var panEnd = new THREE.Vector2();
    var panDelta = new THREE.Vector2();
    var panOffset = new THREE.Vector3();

    var offset = new THREE.Vector3();

    var dollyStart = new THREE.Vector2();
    var dollyEnd = new THREE.Vector2();
    var dollyDelta = new THREE.Vector2();

    var theta;
    var phi;
    var phiDelta = 0;
    var thetaDelta = 0;
    var scale = 1;
    var pan = new THREE.Vector3();
    var currentmousex;
    var currentmousey;

    var lastPosition = new THREE.Vector3();
    var lastQuaternion = new THREE.Quaternion();

    var mouseZoomDelta = 0;

    var STATE = {NONE: -1, ROTATE: 0, DOLLY: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_DOLLY: 4, TOUCH_PAN: 5};

    var state = STATE.NONE;

    var COMMAND = {NONE: 0, ROTATE: 1, PAN: 2};
    var command = COMMAND.NONE;

    // for reset

    this.target0 = this.target.clone();
    this.position0 = this.object.position.clone();
    this.zoom0 = this.object.zoom;

    // so camera.up is the orbit axis

    var quat = new THREE.Quaternion().setFromUnitVectors(object.up, new THREE.Vector3(0, 1, 0));
    var quatInverse = quat.clone().inverse();

    // events

    var changeEvent = {type: 'change'};
    var startEvent = {type: 'start'};
    var endEvent = {type: 'end'};

    this.EnableControls = function (value) {
        this.noZoom = !value;
        this.noPan = !value;
        this.noRotate = !value;
    }

    this.rotateLeft = function (angle) {

        if (angle === undefined) {

            angle = getAutoRotationAngle();

        }

        thetaDelta -= angle;

    };

    this.rotateUp = function (angle) {

        if (angle === undefined) {

            angle = getAutoRotationAngle();

        }

        phiDelta -= angle;

    };

    // pass in distance in world space to move left
    this.panLeft = function (distance) {

        var te = this.object.matrix.elements;

        // get X column of matrix
        panOffset.set(te[ 0 ], te[ 1 ], te[ 2 ]);
        panOffset.multiplyScalar(-distance);

        pan.add(panOffset);
    };

    // pass in distance in world space to move up
    this.panUp = function (distance) {

        var te = this.object.matrix.elements;

        // get Y column of matrix
        panOffset.set(te[ 4 ], te[ 5 ], te[ 6 ]);
        panOffset.multiplyScalar(distance);

        pan.add(panOffset);
    };

    // pass in x,y of change desired in pixel space,
    // right and down are positive
    this.pan = function (deltaX, deltaY) {

        var element = scope.parent;  //scope.domElement === document ? scope.domElement.body : scope.domElement;

        if (scope.object instanceof THREE.PerspectiveCamera) {

            // perspective
            var position = scope.object.position;
            var offset = position.clone().sub(scope.target);
            var targetDistance = offset.length();

            // half of the fov is center to top of screen
            targetDistance *= Math.tan((scope.object.fov / 2) * Math.PI / 180.0);

            // we actually don't use screenWidth, since perspective camera is fixed to screen height
            scope.panLeft(2 * deltaX * targetDistance / element.clientHeight);
            scope.panUp(2 * deltaY * targetDistance / element.clientHeight);

        } else if (scope.object instanceof THREE.OrthographicCamera) {

            // orthographic
            scope.panLeft(deltaX * (scope.object.right - scope.object.left) / element.clientWidth);
            scope.panUp(deltaY * (scope.object.top - scope.object.bottom) / element.clientHeight);

        } else {

            // camera neither orthographic or perspective
            console.warn('WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.');

        }

    };

    this.dollyIn = function (dollyScale) {

        if (dollyScale === undefined) {
            dollyScale = getZoomScale();
        }

        if (scope.object instanceof THREE.PerspectiveCamera) {
            scale /= dollyScale;

        } else if (scope.object instanceof THREE.OrthographicCamera) {

            scope.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom * dollyScale));
            scope.object.updateProjectionMatrix();
            scope.dispatchEvent(changeEvent);

        } else {

            console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');

        }

    };

    this.dollyOut = function (dollyScale) {

        if (dollyScale === undefined) {
            dollyScale = getZoomScale();

        }

        if (scope.object instanceof THREE.PerspectiveCamera) {
            scale *= dollyScale;

        } else if (scope.object instanceof THREE.OrthographicCamera) {

            scope.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / dollyScale));
            scope.object.updateProjectionMatrix();
            scope.dispatchEvent(changeEvent);

        } else {

            console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');

        }

    };

    this.update = function () {

        var position = this.object.position;

        offset.copy(position).sub(this.target);

        // rotate offset to "y-axis-is-up" space
        offset.applyQuaternion(quat);

        // angle from z-axis around y-axis

        theta = Math.atan2(offset.x, offset.z);

        // angle from y-axis

        phi = Math.atan2(Math.sqrt(offset.x * offset.x + offset.z * offset.z), offset.y);

        if (this.autoRotate && state === STATE.NONE) {

            this.rotateLeft(getAutoRotationAngle());

        }

        theta += thetaDelta;
        phi += phiDelta;

        // restrict theta to be between desired limits
        theta = Math.max(this.minAzimuthAngle, Math.min(this.maxAzimuthAngle, theta));

        // restrict phi to be between desired limits
        phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, phi));

        // restrict phi to be betwee EPS and PI-EPS
        phi = Math.max(EPS, Math.min(Math.PI - EPS, phi));

        var radius = offset.length() * scale;

        // restrict radius to be between desired limits
        radius = Math.max(this.minDistance, Math.min(this.maxDistance, radius));

        // move target to panned location
        this.target.add(pan);

        offset.x = radius * Math.sin(phi) * Math.sin(theta);
        offset.y = radius * Math.cos(phi);
        offset.z = radius * Math.sin(phi) * Math.cos(theta);

        // rotate offset back to "camera-up-vector-is-up" space
        offset.applyQuaternion(quatInverse);

        position.copy(this.target).add(offset);

        this.object.lookAt(this.target);

        thetaDelta = 0;
        phiDelta = 0;
        scale = 1;
        pan.set(0, 0, 0);

        // update condition is:
        // min(camera displacement, camera rotation in radians)^2 > EPS
        // using small-angle approximation cos(x/2) = 1 - x^2 / 8

        if (lastPosition.distanceToSquared(this.object.position) > EPS
                || 8 * (1 - lastQuaternion.dot(this.object.quaternion)) > EPS) {

            this.dispatchEvent(changeEvent);

            lastPosition.copy(this.object.position);
            lastQuaternion.copy(this.object.quaternion);

        }

    };


    this.reset = function () {

        state = STATE.NONE;

        this.target.copy(this.target0);
        this.object.position.copy(this.position0);
        this.object.zoom = this.zoom0;

        this.object.updateProjectionMatrix();
        this.dispatchEvent(changeEvent);

        this.update();

    };

    this.getPolarAngle = function () {

        return phi;

    };

    this.getAzimuthalAngle = function () {

        return theta;

    };

    function getAutoRotationAngle() {

        return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;

    }

    function getZoomScale() {

        return Math.pow(0.95, scope.zoomSpeed);

    }

    function onMouseDown(event) {

        if (scope.enabled === false)
            return;
        event.preventDefault();

        if (event.button === scope.mouseButtons.ORBIT) {
            if (scope.noRotate === true)
                return;

            if (command === COMMAND.NONE || command === COMMAND.ROTATE) {
                state = STATE.ROTATE;
                rotateStart.set(event.clientX, event.clientY);
            } else {
                state = STATE.PAN;
                panStart.set(event.clientX, event.clientY);
            }

        } else if (event.button === scope.mouseButtons.ZOOM) {
            if (scope.noZoom === true)
                return;

            state = STATE.DOLLY;

            dollyStart.set(event.clientX, event.clientY);

        } else if (event.button === scope.mouseButtons.PAN) {
            if (scope.noPan === true)
                return;

            state = STATE.PAN;
            panStart.set(event.clientX, event.clientY);

        }

        if (state !== STATE.NONE) {
            scope.parent.addEventListener('mousemove', onMouseMove, false);
            scope.parent.addEventListener('mouseup', onMouseUp, false);
            scope.dispatchEvent(startEvent);
        }

    }

    function onMouseMove(event) {

        if (scope.enabled === false)
            return;

        currentmousex = event.pageX;
        currentmousey = event.pageY;

        event.preventDefault();

        var element = scope.parent;  //scope.domElement === document ? scope.domElement.body : scope.domElement;

        if (state === STATE.ROTATE) {

            if (scope.noRotate === true)
                return;

            if (command === COMMAND.NONE || command === COMMAND.ROTATE) {
                rotateEnd.set(event.clientX, event.clientY);
                rotateDelta.subVectors(rotateEnd, rotateStart);

                // rotating across whole screen goes 360 degrees around
                scope.rotateLeft(2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed);

                // rotating up and down along whole screen attempts to go 360, but limited to 180
                scope.rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed);

                rotateStart.copy(rotateEnd);
            } else {
                if (scope.noPan === true)
                    return;

                panEnd.set(event.clientX, event.clientY);
                panDelta.subVectors(panEnd, panStart);

                scope.pan(panDelta.x, panDelta.y);

                panStart.copy(panEnd);
            }

        } else if (state === STATE.DOLLY) {

            if (scope.noZoom === true)
                return;

            dollyEnd.set(event.clientX, event.clientY);
            dollyDelta.subVectors(dollyEnd, dollyStart);

            if (dollyDelta.y > 0) {

                scope.dollyIn();

            } else if (dollyDelta.y < 0) {

                scope.dollyOut();

            }

            dollyStart.copy(dollyEnd);

        } else if (state === STATE.PAN) {

            if (scope.noPan === true)
                return;

            panEnd.set(event.clientX, event.clientY);
            panDelta.subVectors(panEnd, panStart);

            scope.pan(panDelta.x, panDelta.y);

            panStart.copy(panEnd);
        }

        if (state !== STATE.NONE)
            scope.update();

    }

    function onMouseUp( /* event */ ) {

        if (scope.enabled === false)
            return;

        scope.parent.removeEventListener('mousemove', onMouseMove, false);
        scope.parent.removeEventListener('mouseup', onMouseUp, false);
        scope.dispatchEvent(endEvent);
        state = STATE.NONE;

    }

    function onMouseWheel(event) {

        if (scope.enabled === false || scope.noZoom === true || state !== STATE.NONE)
            return;

        event.preventDefault();
        event.stopPropagation();

        var delta = 0;

        if (event.wheelDelta !== undefined) { // WebKit / Opera / Explorer 9
            delta = event.wheelDelta;
        } else if (event.detail !== undefined) { // Firefox
            delta = -event.detail;
        }

        //Required to fix issue in zooming using touchpad.
        if (delta > 0)
            delta = 120;
        else
            delta = -120;

        var w = scope.width;
        var h = scope.height;
        var l = scope.left;
        var t = scope.top;
        var cx = currentmousex;
        var cy = currentmousey;

        var movex = 6 * (w / 2 - (cx - l)) / delta;
        var movey = 6 * (h / 2 - (cy - t)) / delta;

        scope.pan(movex, movey);

        if (delta > 0) {
            scope.dollyOut();
        } else if (delta < 0) {
            scope.dollyIn();
        }

        scope.update();
        scope.dispatchEvent(startEvent);
        scope.dispatchEvent(endEvent);
    }

    function onKeyDown(event) {

        if (scope.enabled === false || scope.noKeys === true || scope.noPan === true)
            return;

        switch (event.keyCode) {

            case scope.keys.UP:
                scope.pan(0, scope.keyPanSpeed);
                scope.update();
                break;

            case scope.keys.BOTTOM:
                scope.pan(0, -scope.keyPanSpeed);
                scope.update();
                break;

            case scope.keys.LEFT:
                scope.pan(scope.keyPanSpeed, 0);
                scope.update();
                break;

            case scope.keys.RIGHT:
                scope.pan(-scope.keyPanSpeed, 0);
                scope.update();
                break;

        }

    }

    function touchstart(event) {
        if (scope.enabled === false)
            return;

        if (_animate_) {
            clearInterval(_animate_);
            _animate_ = undefined;
        }


        switch (event.touches.length) {

            case 1:	// one-fingered touch: rotate
                if (command === COMMAND.NONE || command === COMMAND.ROTATE) {
                    if (scope.noRotate === true)
                        return;

                    state = STATE.TOUCH_ROTATE;
                    rotateStart.set(event.touches[ 0 ].pageX, event.touches[ 0 ].pageY);

                } else {
                    state = STATE.TOUCH_PAN;
                    panStart.set(event.touches[ 0 ].pageX, event.touches[ 0 ].pageY);
                }

                break;

            case 2:	// two-fingered touch: dolly

                if (scope.noZoom === true)
                    return;

                state = STATE.TOUCH_DOLLY;

                this.prevx0 = event.touches[ 0 ].pageX;
                this.prevx1 = event.touches[ 1 ].pageX;
                this.prevy0 = event.touches[ 0 ].pageY;
                this.prevy1 = event.touches[ 1 ].pageY;

                var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
                var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
                var distance = Math.sqrt(dx * dx + dy * dy);

                this.touchdistance = distance;

                dollyStart.set(0, distance);
                panStart.set(event.touches[ 0 ].pageX, event.touches[ 0 ].pageY);

                break;

            case 3: // three-fingered touch: pan

                if (scope.noPan === true)
                    return;

                state = STATE.TOUCH_PAN;
                panStart.set(event.touches[ 0 ].pageX, event.touches[ 0 ].pageY);
                break;

            default:

                state = STATE.NONE;

        }

        if (state !== STATE.NONE)
            scope.dispatchEvent(startEvent);

        if (mobiwork.os === undefined || mobiwork.os && mobiwork.os !== "AndroidOS") {
            if (scope.tapped === undefined || !scope.tapped) { //if tap is not set, set up single tap
                scope.tapped = setTimeout(function () {
                    scope.tapped = undefined;
                }, 300);
            } else {
                clearTimeout(scope.tapped); //stop single tap callback
                scope.tapped = undefined;

                if (event.touches.length === 1) {
                    var counter = 1;
                    var speed = 0.99;
                    var px = event.touches[ 0 ].pageX;
                    var py = event.touches[ 0 ].pageY;

                    var x = ((scope.left + scope.width / 2) - px) / 60;
                    var y = ((scope.top + scope.height / 2) - py) / 60;

                    panStart.set(px, py);

                    _animate_ = setInterval(function () {
                        panEnd.set(px + x, py + y);
                        panDelta.subVectors(panEnd, panStart);
                        scope.pan(panDelta.x, panDelta.y);
                        panStart.copy(panEnd);

                        scope.dollyOut(speed);
                        scope.update();

                        px += x;
                        py += y;

                        counter++;

                        if (counter > 75)
                            clearInterval(_animate_);
                    }, 10);

                    scope.dispatchEvent(startEvent);
                    scope.dispatchEvent(endEvent);
                }
            }
        }
    }

    function touchmove(event) {

        if (scope.enabled === false)
            return;

        if (_animate_) {
            clearInterval(_animate_);
            _animate_ = undefined;
        }

        event.preventDefault();
        event.stopPropagation();

        var element = scope.parent;  //scope.domElement === document ? scope.domElement.body : scope.domElement;
        scope.tapped = undefined;

        switch (event.touches.length) {

            case 1: // one-fingered touch: rotate

                if (command === COMMAND.NONE || command === COMMAND.ROTATE) {
                    if (scope.noRotate === true)
                        return;
                    if (state !== STATE.TOUCH_ROTATE)
                        return;

                    rotateEnd.set(event.touches[ 0 ].pageX, event.touches[ 0 ].pageY);
                    rotateDelta.subVectors(rotateEnd, rotateStart);

                    // rotating across whole screen goes 360 degrees around
                    scope.rotateLeft(2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed);
                    // rotating up and down along whole screen attempts to go 360, but limited to 180
                    scope.rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed);

                    rotateStart.copy(rotateEnd);

                    scope.update();
                } else {
                    if (scope.noPan === true)
                        return;

                    if (state !== STATE.TOUCH_PAN)
                        return;

                    panEnd.set(event.touches[ 0 ].pageX, event.touches[ 0 ].pageY);
                    panDelta.subVectors(panEnd, panStart);

                    scope.pan(panDelta.x, panDelta.y);

                    panStart.copy(panEnd);

                    scope.update();
                }

                break;

            case 2: // two-fingered touch: dolly

                if (scope.noZoom === true)
                    return;

                if (state !== STATE.TOUCH_DOLLY)
                    return;

                var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
                var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;

                var distance = Math.sqrt(dx * dx + dy * dy);

                var x0 = event.touches[ 0 ].pageX - this.prevx0;
                var x1 = event.touches[ 1 ].pageX - this.prevx1;
                var y0 = event.touches[ 0 ].pageY - this.prevy0;
                var y1 = event.touches[ 1 ].pageY - this.prevy1;

                var zoom = true;

                if (Math.abs(x0) < 3 && Math.abs(x1) < 3 && Math.abs(y0) < 3 && Math.abs(y1) < 3) {
                    return;
                }

                if (Math.abs(y0) > Math.abs(x0)) {
                    if ((y0 > 0 && y1 > 0) || (y0 < 0 && y1 < 0))
                        zoom = false;
                } else {
                    if ((x0 > 0 && x1 > 0) || (x0 < 0 && x1 < 0))
                        zoom = false;
                }

                if (zoom) {

                    currentmousex = (event.touches[ 0 ].pageX + event.touches[ 1 ].pageX) / 2;
                    currentmousey = (event.touches[ 0 ].pageY + event.touches[ 1 ].pageY) / 2;

                    dollyEnd.set(0, distance);
                    dollyDelta.subVectors(dollyEnd, dollyStart);

                    var w = scope.width;
                    var h = scope.height;
                    var l = scope.left;
                    var t = scope.top;
                    var cx = currentmousex;
                    var cy = currentmousey;

                    if (dollyDelta.y > 0) {
                        var movex = 6 * (w / 2 - (cx - l)) / 120;
                        var movey = 6 * (h / 2 - (cy - t)) / 120;
                        scope.pan(movex, movey);

                        scope.dollyOut();
                    } else if (dollyDelta.y < 0) {
                        var movex = -6 * (w / 2 - (cx - l)) / 120;
                        var movey = -6 * (h / 2 - (cy - t)) / 120;
                        scope.pan(movex, movey);

                        scope.dollyIn();
                    }

                    dollyStart.copy(dollyEnd);
                    panStart.set(event.touches[ 0 ].pageX, event.touches[ 0 ].pageY);

                    scope.update();
                } else {
                    if (scope.noPan === true)
                        return;

                    panEnd.set(event.touches[ 0 ].pageX, event.touches[ 0 ].pageY);
                    panDelta.subVectors(panEnd, panStart);

                    scope.pan(panDelta.x, panDelta.y);
                    panStart.copy(panEnd);
                    scope.update();
                }

                this.prevx0 = event.touches[ 0 ].pageX;
                this.prevx1 = event.touches[ 1 ].pageX;
                this.prevy0 = event.touches[ 0 ].pageY;
                this.prevy1 = event.touches[ 1 ].pageY;
                this.touchdistance = distance;

                break;

            case 3: // three-fingered touch: pan

                if (scope.noPan === true)
                    return;

                if (state !== STATE.TOUCH_PAN)
                    return;

                panEnd.set(event.touches[ 0 ].pageX, event.touches[ 0 ].pageY);
                panDelta.subVectors(panEnd, panStart);

                scope.pan(panDelta.x, panDelta.y);

                panStart.copy(panEnd);

                scope.update();
                break;

            default:

                state = STATE.NONE;

        }

    }

    this.Refresh = function () {
        scope.update();
    };

    this.Pan = function () {
        command = COMMAND.PAN;
    };

    this.Rotate = function () {
        command = COMMAND.ROTATE;
    };

    function touchend( /* event */ ) {
        if (scope.enabled === false)
            return;

        scope.dispatchEvent(endEvent);
        state = STATE.NONE;

    }

    this.Initialize = function () {
        this.parent.addEventListener('contextmenu', function (event) {
            event.preventDefault();
        }, false);

        this.parent.addEventListener('mousedown', onMouseDown, false);

        $(this.parent).mousemove(onMouseMove);

        this.parent.addEventListener('mousewheel', onMouseWheel, false);
        this.parent.addEventListener('DOMMouseScroll', onMouseWheel, false); // firefox

        this.parent.addEventListener('touchstart', touchstart, false);
        this.parent.addEventListener('touchend', touchend, false);
        this.parent.addEventListener('touchmove', touchmove, false);
    };

    // force an update at start
    this.update();

};

THREE.OrbitControls.prototype = Object.create(THREE.EventDispatcher.prototype);
THREE.OrbitControls.prototype.constructor = THREE.OrbitControls;