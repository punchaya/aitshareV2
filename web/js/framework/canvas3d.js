var VIEWTYPE = {
    XY: { value: 1 },
    XZ: { value: 2 },
    YZ: { value: 3 }
};

mobiwork.text3dfont;

var $CANVAS3DRENDERER;

mobiwork.Canvas3D = function (param) {
    mobiwork.call(this, param);

    this.class = "canvas";

    let self = this;
    let camera = null;
    let scene = null;
    let control = null;
    let canvas = null;
    let renderer = null;
    let backcolor = 0xffffff;

    let raycaster;
    let mousedown;
    let mouseup;

    let onselect;
    let model;

    this.allowselect;
    let lightcount;

    let selectedobjects = [];

    let closedSpline = new THREE.CatmullRomCurve3();
    let extrudeSettings = {
        steps: 1,
        bevelEnabled: false,
    };

    let oninitlight;

    if (param) {
        this.allowselect = param.allowselect;
        onselect = param.onselect;
        oninitlight = param.oninitlight;

        if (param.backcolor !== undefined)
            backcolor = param.backcolor;
    }

    this.Refresh = function () {
        camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 1000000);
        camera.up.set(0, 0, 1);
        camera.position.x = -40;
        camera.position.y = -40;
        camera.position.z = 40;

        control = new THREE.OrbitControls(camera);
        control.damping = 0.01;
        control.addEventListener('change', this.Render);
        control.zoomSpeed = 1;

        // world

        scene = new THREE.Scene();

        raycaster = new THREE.Raycaster();
        mousedown = new THREE.Vector2();
        mousemove = new THREE.Vector2();
        mouseup = new THREE.Vector2();

        // LIGHTS
        if (oninitlight) {
            oninitlight(this);
            lightcount = scene.children.length;

        } else {

            let hemiLight = new THREE.HemisphereLight(0x666666, 0x000000, 0.5);
            hemiLight.position.set(1000, 1000, 1000);
            scene.add(hemiLight);

            let d = 20;
            let color = 0x888888;

            let light = new THREE.SpotLight(color);
            light.position.set(1000, 2000, 1000);

            light = new THREE.SpotLight(color);
            light.position.set(-2000, -1000, 1000);
            scene.add(light);

            light = new THREE.SpotLight(color);
            light.position.set(1300, -1700, -1000);
            scene.add(light);

            light = new THREE.SpotLight(color);
            light.position.set(-1000, 1000, 0);
            scene.add(light);

            let ambientLight = new THREE.AmbientLight(0x111111);
            scene.add(ambientLight);

            lightcount = scene.children.length;
        }

        // renderer

        if ($CANVAS3DRENDERER) {
            $CANVAS3DRENDERER.dispose();
            $CANVAS3DRENDERER = undefined;
        }

        if (mobiwork.mobile)
            renderer = new THREE.WebGLRenderer({ antialias: true });
        else
            renderer = new THREE.WebGLRenderer({
                antialias: true,
                preserveDrawingBuffer: true,
                logarithmicDepthBuffer: true
            });

        renderer.setClearColor(backcolor);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.sortObjects = false;

        renderer.gammaInput = false;
        renderer.gammaOutput = false;

        renderer.shadowMap.enabled = false;

        $CANVAS3DRENDERER = renderer;

        this.object.append(renderer.domElement);

        canvas = this.object;
        control.parent = this.object.find("canvas")[0];
        control.Initialize();

        self.Resize();
        self.Events();
        self.Render();

        //Update dimension
        $(window).resize(function () {
            self.Resize();
        });
    };

    this.EnableControls = function (value) {
        control.EnableControls(value);
    };

    this.Events = function () {
        window.addEventListener('resize', this.Resize, false);

        control.parent.addEventListener('mousedown', this.MouseDown, false);
        control.parent.addEventListener('mousemove', this.MouseMove, false);
        control.parent.addEventListener('mouseup', this.MouseUp, false);

        canvas.on("touchstart", function (event) {
            control.enabled = true;
        });

        canvas.mouseenter(function (event) {
            control.enabled = true;
        });

        canvas.mouseleave(function (event) {
            control.enabled = false;
        });
    };

    this.SelectObject = function (e) {
        let selected = e.selected[e.selected.length - 1];

        let select = true;
        let index = 0;

        let mat = new THREE.MeshPhongMaterial({ color: 0x880000, specular: 0xffffff, shininess: 5 });
        mat.side = THREE.DoubleSide;

        for (let i = 0; i < model.objects.length; i++) {
            if (selected === model.objects[i].modelobject) {
                if (selected.selected) {
                    selectedobjects.push([model.objects[i], model.objects[i].material]);
                    model.objects[i].material = mat;

                } else {
                    for (let j = 0; j < selectedobjects.length; j++) {
                        if (selectedobjects[j][0].id === model.objects[i].id) {
                            model.objects[i].material = selectedobjects[j][1];
                            select = false;
                            index = j;
                            break;
                        }
                    }

                    if (select)
                        selectedobjects.splice(index, 1);
                }

                break;
            }
        }
    };

    this.Resize = function () {
        let position = self.parent.position();

        if (position !== undefined) {
            let width = self.parent.width();
            let height = self.parent.height();
            let offset = self.parent.offset();
            let left = offset.left;
            let top = offset.top;

            if (!height) {
                width = canvas[0].clientWidth;
                height = canvas[0].clientHeight;
            }

            if (width !== 0 && height !== 0) {
                canvas.width = width;
                canvas.height = height;

                control.width = canvas.width;
                control.height = canvas.height;
                control.left = left;
                control.top = top;

                camera.aspect = canvas.width / canvas.height;
                camera.updateProjectionMatrix();

                renderer.setSize(canvas.width, canvas.height);
                self.Render();
            }
        }
    };

    this.CaptureThumbnail = function (width, height) {
        let position = self.parent.position();

        if (position !== undefined) {
            let offset = self.parent.offset();
            let left = offset.left;
            let top = offset.top;

            if (width !== 0 && height !== 0) {
                canvas.width = width;
                canvas.height = height;

                control.width = canvas.width;
                control.height = canvas.height;
                control.left = left;
                control.top = top;

                camera.aspect = canvas.width / canvas.height;
                camera.updateProjectionMatrix();

                renderer.setSize(canvas.width, canvas.height);
                self.Render();

                let image = renderer.domElement.toDataURL();

                self.Resize();
                self.Render();

                return image;
            }
        }
    };

    this.Render = function () {
        renderer.render(scene, camera);
    };

    this.StartAnimation = function () {
        self.stopanimation = false;
        animate();
    };

    this.StopAnimation = function () {
        self.stopanimation = true;
    };

    this.SetModel = function (object3d) {
        model = object3d;

        this.Clear();
        scene.add(object3d);
        this.Render();
    };

    this.GetMesh = function () {
        return scene;
    };

    this.AddMesh = function (mesh) {
        scene.add(mesh);
    };

    this.RemoveMesh = function (mesh) {
        if (mesh !== null) {
            scene.remove(mesh);
        }
    };

    this.RemoveLast = function (mesh) {
        scene.children.pop();
    };

    this.GetCameraPosition = function () {
        return camera.position;
    };

    this.GetCameraCenter = function () {
        return control.target;
    };

    this.SetCameraLookat = function (x, y, z) {
        control.target = new THREE.Vector3(x, y, z);
        control.center = this.target;
    };

    this.SetCameraPosition = function (x, y, z) {
        camera.position.x = x;
        camera.position.y = y;
        camera.position.z = z;
    };

    this.GetCamera = function () {
        return camera;
    };

    this.SetOrthographicView = function () {
        control.reset();

        if (!(camera instanceof THREE.OrthographicCamera)) {
            scene.remove(camera);

            let aspect = window.innerWidth / window.innerHeight;
            let frustumSize = 10;

            camera = new THREE.OrthographicCamera(frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 0, 1000);
            camera.up.set(0, 0, 1);

            control.object = camera;
            control.update();

            scene.add(camera);
        }

        camera.position.x = 40;
        camera.position.y = 40;
        camera.position.z = 40;

        this.Resize();
        this.Render();
    };

    this.SetPerspectiveView = function () {
        control.reset();

        if (!(camera instanceof THREE.PerspectiveCamera)) {
            scene.remove(camera);

            camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 1000000);
            camera.up.set(0, 0, 1);

            control.object = camera;
            control.update();

            scene.add(camera);
        }

        camera.position.x = 40;
        camera.position.y = 40;
        camera.position.z = 40;

        this.Resize();
        this.ZoomAll();
    };

    this.Clear = function () {
        if (scene.children.length > lightcount) {
            let item;
            for (let g = scene.children.length; g >= lightcount; g--) {
                item = scene.children[g];
                scene.remove(item);
            }
        }
    };

    this.RemoveAll = function () {
        let item, item2;


        for (let g = scene.children.length - 1; g >= 0; g--) {
            item = scene.children[g];

            for (let h = item.children.length - 1; h >= 0; h--) {
                item2 = item.children[h];
                item.remove(item);

                delete item2;
            }

            scene.remove(item);
            delete item;
        }
    };

    this.ZoomIn = function () {
        control.dollyIn(1.1);
        control.Refresh();
    };

    this.ZoomOut = function () {
        control.dollyOut(1.1);
        control.Refresh();
    };

    this.ZoomAll = function (noresize) {
        if (!noresize)
            self.Resize();

        let obj = scene;
        let bounds = new THREE.Box3().setFromObject(obj);

        let x = bounds.max.x - bounds.min.x;
        let y = bounds.max.y - bounds.min.y;
        let z = bounds.max.z - bounds.min.z;

        let bx = (bounds.max.x + bounds.min.x) / 2;
        let by = (bounds.max.y + bounds.min.y) / 2;
        let bz = (bounds.max.z + bounds.min.z) / 2;

        obj.center = new THREE.Vector3(bx, by, bz);
        
        let boundingSphere = bounds.getBoundingSphere(obj);
        let radius = boundingSphere.radius;

        if (window.innerHeight > window.innerWidth)
            radius *= window.innerHeight / window.innerWidth;

        let scale = 2; // object size / display size
        let objectAngularSize = (camera.fov * Math.PI / 180) * scale;
        let distanceToCamera = radius / Math.tan(objectAngularSize / 2)
        let len = Math.sqrt(Math.pow(distanceToCamera, 2) + Math.pow(distanceToCamera, 2))

        camera.position.set(-len, -len, len); //Math.max(z, Math.max(x, y)));
        let center = new THREE.Vector3(bx, by, bz);

        camera.lookAt(center);
        control.target.set(center.x, center.y, center.z);

        camera.updateProjectionMatrix();
        control.update();
    };

    this.Update = function () {
        control.update();
    };

    this.Pan = function () {
        control.Pan();
    };

    this.Reset = function () {
        control.reset();
    };

    this.Rotate = function () {
        control.Rotate();
    };

    this.SetBackgroundColor = function (color) {
        renderer.setClearColor(color);
    };

    this.MouseDown = function (event) {
        if (onselect) {
            mousedown.x = event.clientX;
            mousedown.y = event.clientY;
        }
    };

    this.MouseMove = function (event) {
        // mouseup.x = ((event.clientX - control.left) / renderer.domElement.clientWidth) * 2 - 1;
        // mouseup.y = -((event.clientY - control.top) / renderer.domElement.clientHeight) * 2 + 1;

        // raycaster.setFromCamera(mouseup, camera);

        // let intersects = raycaster.intersectObjects(scene.children);

        // if (intersects.length > 0) {
        //     if (self.selected)
        //         self.selected.material = self.selectedmaterial;

        //     self.selected = intersects[0].object;
        //     self.selectedmaterial = intersects[0].object.material;

        //     let mat = new THREE.MeshPhongMaterial({ color: 0x3c4f5f, specular: 0xffffff, shininess: 20 });
        //     mat.side = THREE.DoubleSide;
        //     intersects[0].object.material = mat;

        //     renderer.render(scene, camera);
        // }
    };

    this.MouseUp = function (event) {
        if (onselect) {
            if (Math.abs(event.clientX - mousedown.x) < 5 && Math.abs(event.clientY - mousedown.y) < 5) {
                mouseup.x = ((event.clientX - control.left) / renderer.domElement.clientWidth) * 2 - 1;
                mouseup.y = -((event.clientY - control.top) / renderer.domElement.clientHeight) * 2 + 1;

                raycaster.setFromCamera(mouseup, camera);

                let intersects = raycaster.intersectObjects(model.children);

                if (intersects.length > 0) {
                    mouseup.x = event.clientX;
                    mouseup.y = event.clientY;

                    onselect(intersects, mouseup);

                    // if (self.selected)
                    //     self.selected.material = self.selectedmaterial;

                    // self.selected = intersects[0].object;
                    // self.selectedmaterial = intersects[0].object.material;

                    // let mat = new THREE.MeshPhongMaterial({ color: 0x880000, specular: 0xffffff, shininess: 20, shading: THREE.SmoothShading });
                    // mat.side = THREE.DoubleSide;
                    // intersects[0].object.material = mat;

                    // renderer.render(scene, camera);
                }
            }
        }
    };

    this.Create3DObject = function () {
        return new THREE.Object3D();
    };

    this.AddCube = function (x, y, z, wx, wy, wz, material) {
        let geometry = new THREE.BoxBufferGeometry(wx, wy, wz);
        let object = new THREE.Mesh(geometry, material);
        object.position.x = x;
        object.position.y = y;
        object.position.z = z;

        scene.add(object);
    };

    this.AddSphere = function (x, y, z, radius, segments, material) {
        let geometry = new THREE.SphereBufferGeometry(radius, segments, segments);
        let object = new THREE.Mesh(geometry, material);
        object.position.x = x;
        object.position.y = y;
        object.position.z = z;

        scene.add(object);
    };

    this.GenerateMeshFromSection = function (section, material, x1, y1, z1, x2, y2, z2) {
        let points = section.GetPoints();
        let shapepoints = [];

        for (let i = 0; i < points.length; i++) {
            points[i].x /= 1000;
            points[i].y /= 1000;

            shapepoints.push(new THREE.Vector2(points[i].y, points[i].x));
        }

        let line = [new THREE.Vector3(x1, y1, z1), new THREE.Vector3(x2, y2, z2)];
        let geometry = self.Extrude(line, shapepoints);
        let mesh = new THREE.Mesh(geometry, material);

        return mesh;
    };

    this.GetPoints = function (shape, points, x1, y1, z1, x2, y2, z2) {
        let line = new graphicsentity.Line3F(x1, y1, z1, x2, y2, z2);

        let offsetline1, offsetline2;
        let p1, p2, p3, p4;
        let offsetx, offsety;
        let faces = [];

        for (let i = 0; i < shape.length - 1; i++) {
            offsetx = shape[i].x;
            offsety = shape[i].y;

            offsetline1 = line.Offset(offsetx, offsety);

            if (!offsetline1)
                continue;

            //console.log("[" + offsetx + ", " + offsety + "]");
            //console.log(offsetline1.ToString());

            offsetx = shape[i + 1].x;
            offsety = shape[i + 1].y;
            offsetline2 = line.Offset(offsetx, offsety);

            if (!offsetline2)
                continue;

            //console.log("[" + offsetx + ", " + offsety + "]");
            //console.log(offsetline2.ToString());

            p1 = [offsetline1.point1.x, offsetline1.point1.y, offsetline1.point1.z];
            p2 = [offsetline1.point2.x, offsetline1.point2.y, offsetline1.point2.z];

            p3 = [offsetline2.point1.x, offsetline2.point1.y, offsetline2.point1.z];
            p4 = [offsetline2.point2.x, offsetline2.point2.y, offsetline2.point2.z];

            faces.push(p1);
            faces.push(p2);
            faces.push(p3);

            faces.push(p2);
            faces.push(p4);
            faces.push(p3);

            if (i === 0) {
                offsetx = shape[shape.length - 1].x;
                offsety = shape[shape.length - 1].y;
                offsetline2 = line.Offset(offsetx, offsety);

                if (!offsetline2)
                    continue;

                p3 = [offsetline2.point1.x, offsetline2.point1.y, offsetline2.point1.z];
                p4 = [offsetline2.point2.x, offsetline2.point2.y, offsetline2.point2.z];

                faces.push(p1);
                faces.push(p2);
                faces.push(p3);

                faces.push(p2);
                faces.push(p4);
                faces.push(p3);
            }
        }

        for (let i = 0; i < faces.length; i++)
            points.push([faces[i][0], faces[i][1], faces[i][2]]);

        return points;
    };

    this.ExtrudeShape = function (shape, material, x1, y1, z1, x2, y2, z2) {
        let path = { x1: x1, y1: y1, z1: z1, x2: x2, y2: y2, z2: z2 };
        let faces;

        if (z1 === z2)
            faces = this.ExtrudeBeam(shape, path);
        else
            faces = this.ExtrudeColumn(shape, path);

        let points = [];

        for (let i = 0; i < faces.length; i++)
            points.push([faces[i][0], faces[i][1], faces[i][2]]);

        let j;

        let vertices = new Float32Array(points.length * 3);
        let normals = new Float32Array(points.length * 3);
        let colors = new Float32Array(points.length * 3);

        //Calculate normals
        let u, v;

        for (let i = 0; i < faces.length; i += 3) {
            j = i * 9;

            u = [faces[i + 1][0] - faces[i][0], faces[i + 1][1] - faces[i][1], faces[i + 1][2] - faces[i][2]];
            v = [faces[i + 2][0] - faces[i][0], faces[i + 2][1] - faces[i][1], faces[i + 2][2] - faces[i][2]];
        }


        for (let i = 0; i < points.length; i++) {
            j = i * 3;
            vertices[j + 0] = points[i][0];
            vertices[j + 1] = points[i][1];
            vertices[j + 2] = points[i][2];

            colors[j + 0] = 1;
            colors[j + 1] = 0;
            colors[j + 2] = 0;
        }

        let geometry = new THREE.BufferGeometry();
        geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
        //geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));

        geometry.computeVertexNormals();

        // let material = new THREE.MeshPhongMaterial({ vertexColors: THREE.VertexColors, specular: 0xffffff, shininess: 5 });
        // material.side = THREE.DoubleSide;

        let mesh = new THREE.Mesh(geometry, material);

        return mesh;
    };

    this.ExtrudeBeam = function (shape, path, open) {
        let faces = [];
        let dx = Math.abs(path.x2 - path.x1);
        let dy = Math.abs(path.y2 - path.y1);
        let dz = Math.abs(path.z2 - path.z1);
        let xy = Math.sqrt(dx * dx + dy * dy);
        let l = Math.sqrt(dx * dx + dy * dy + dz * dz);

        let i, j;
        let frontcover = [];
        let backcover = [];

        for (i = 0; i < shape.length - 1; i++) {
            j = i + 1;
            this.InsertBeamFace(faces, shape, path, dx, dy, dz, l, xy, i, j, frontcover, backcover);
        }

        i = shape.length - 1;
        j = 0;

        this.InsertBeamFace(faces, shape, path, dx, dy, dz, l, xy, i, j, frontcover, backcover);

        let triangles = this.Triangulate(shape);

        if (open === undefined) {
            //Front Cover
            for (let i = 0; i < triangles.length; i++) {
                faces.push([frontcover[triangles[i]].x, frontcover[triangles[i]].y, frontcover[triangles[i]].z]);
            }

            //Back Cover
            for (let i = 0; i < triangles.length; i++) {
                faces.push([backcover[triangles[i]].x, backcover[triangles[i]].y, backcover[triangles[i]].z]);
            }
        }

        return faces;
    };

    this.InsertBeamFace = function (faces, shape, path, dx, dy, dz, l, xy, i, j, frontcover, backcover) {
        let x1, y1, x2, y2;
        let axi = 0;
        let axj = 0;
        let ayi = shape[i].y;
        let ayj = shape[j].y;
        let p1, p2, p3, p4;

        x1 = shape[i].x * dy / xy;
        y1 = shape[i].x * dx / xy;

        x2 = shape[j].x * dy / xy;
        y2 = shape[j].x * dx / xy;

        let xi = 0;
        let xj = 0;

        let yi = 0;
        let yj = 0;

        axi = shape[i].y * dz / l;
        axj = shape[j].y * dz / l;

        ayi = shape[i].y * xy / l;
        ayj = shape[j].y * xy / l;

        if (dz > this.tolerance) {
            xi = axi * dx / xy;
            xj = axj * dx / xy;

            yi = axi * dy / xy;
            yj = axj * dy / xy;
        }

        if (path.x2 >= path.x1) {
            if (path.y2 >= path.y1) {
                if (path.z2 >= path.z1) {
                    p1 = [path.x1 + x1 - xi, path.y1 - y1 - yi, path.z1 + ayi];
                    p2 = [path.x1 + x2 - xj, path.y1 - y2 - yj, path.z1 + ayj];
                    p3 = [path.x2 + x2 - xj, path.y2 - y2 - yj, path.z2 + ayj];
                    p4 = [path.x2 + x1 - xi, path.y2 - y1 - yi, path.z2 + ayi];
                    //OK
                } else {
                    p1 = [path.x1 + x1 - xi, path.y1 - y1 - yi, path.z1 - ayi];
                    p2 = [path.x1 + x2 - xj, path.y1 - y2 - yj, path.z1 - ayj];
                    p3 = [path.x2 + x2 - xj, path.y2 - y2 - yj, path.z2 - ayj];
                    p4 = [path.x2 + x1 - xi, path.y2 - y1 - yi, path.z2 - ayi];
                    //OK
                }

            } else {
                if (path.z2 >= path.z1) {
                    p1 = [path.x1 - x1 - xi, path.y1 - y1 + yi, path.z1 + ayi];
                    p2 = [path.x1 - x2 - xj, path.y1 - y2 + yj, path.z1 + ayj];
                    p3 = [path.x2 - x2 - xj, path.y2 - y2 + yj, path.z2 + ayj];
                    p4 = [path.x2 - x1 - xi, path.y2 - y1 + yi, path.z2 + ayi];
                    //OK
                } else {
                    p1 = [path.x1 - x1 - xi, path.y1 - y1 + yi, path.z1 - ayi];
                    p2 = [path.x1 - x2 - xj, path.y1 - y2 + yj, path.z1 - ayj];
                    p3 = [path.x2 - x2 - xj, path.y2 - y2 + yj, path.z2 - ayj];
                    p4 = [path.x2 - x1 - xi, path.y2 - y1 + yi, path.z2 - ayi];
                    //OK
                }
            }
        } else {
            if (path.y2 >= path.y1) {
                if (path.z2 >= path.z1) {
                    p1 = [path.x1 - x1 + xi, path.y1 - y1 - yi, path.z1 + ayi];
                    p2 = [path.x1 - x2 + xj, path.y1 - y2 - yj, path.z1 + ayj];
                    p3 = [path.x2 - x2 + xj, path.y2 - y2 - yj, path.z2 + ayj];
                    p4 = [path.x2 - x1 + xi, path.y2 - y1 - yi, path.z2 + ayi];
                    //OK
                } else {
                    p1 = [path.x1 - x1 + xi, path.y1 - y1 - yi, path.z1 - ayi];
                    p2 = [path.x1 - x2 + xj, path.y1 - y2 - yj, path.z1 - ayj];
                    p3 = [path.x2 - x2 + xj, path.y2 - y2 - yj, path.z2 - ayj];
                    p4 = [path.x2 - x1 + xi, path.y2 - y1 - yi, path.z2 - ayi];
                    //OK
                }

            } else {
                if (path.z2 > path.z1) {
                    p1 = [path.x1 + x1 + xi, path.y1 - y1 + yi, path.z1 + ayi];
                    p2 = [path.x1 + x2 + xj, path.y1 - y2 + yj, path.z1 + ayj];
                    p3 = [path.x2 + x2 + xj, path.y2 - y2 + yj, path.z2 + ayj];
                    p4 = [path.x2 + x1 + xi, path.y2 - y1 + yi, path.z2 + ayi];
                    //OK
                } else {
                    p1 = [path.x1 + x1 + xi, path.y1 - y1 + yi, path.z1 - ayi];
                    p2 = [path.x1 + x2 + xj, path.y1 - y2 + yj, path.z1 - ayj];
                    p3 = [path.x2 + x2 + xj, path.y2 - y2 + yj, path.z2 - ayj];
                    p4 = [path.x2 + x1 + xi, path.y2 - y1 + yi, path.z2 - ayi];
                    //OK
                }
            }
        }

        frontcover.push({ x: p1[0], y: p1[1], z: p1[2] });
        backcover.push({ x: p4[0], y: p4[1], z: p4[2] });

        faces.push(p1);
        faces.push(p2);
        faces.push(p3);

        faces.push(p1);
        faces.push(p3);
        faces.push(p4);
    };

    this.ExtrudeColumn = function (shape, path, inclineangle, open) {
        let faces = [];

        if (inclineangle === undefined) {
            for (let i = 0; i < shape.length - 1; i++) {
                faces.push([shape[i].x + path.x1, shape[i].y + path.y1, path.z1]);
                faces.push([shape[i].x + path.x2, shape[i].y + path.y2, path.z2]);
                faces.push([shape[i + 1].x + path.x2, shape[i + 1].y + path.y2, path.z2]);

                faces.push([shape[i].x + path.x1, shape[i].y + path.y1, path.z1]);
                faces.push([shape[i + 1].x + path.x1, shape[i + 1].y + path.y1, path.z1]);
                faces.push([shape[i + 1].x + path.x2, shape[i + 1].y + path.y2, path.z2]);
            }

            i = shape.length - 1;

            faces.push([shape[0].x + path.x1, shape[0].y + path.y1, path.z1]);
            faces.push([shape[0].x + path.x2, shape[0].y + path.y2, path.z2]);
            faces.push([shape[i].x + path.x2, shape[i].y + path.y2, path.z2]);

            faces.push([shape[0].x + path.x1, shape[0].y + path.y1, path.z1]);
            faces.push([shape[i].x + path.x1, shape[i].y + path.y1, path.z1]);
            faces.push([shape[i].x + path.x2, shape[i].y + path.y2, path.z2]);

            if (open === undefined) {
                let triangles = this.Triangulate(shape);

                //Front Cover
                for (let i = 0; i < triangles.length; i++) {
                    faces.push([shape[triangles[i]].x + path.x1, shape[triangles[i]].y + path.y1, path.z1]);
                }

                //Back Cover
                for (let i = 0; i < triangles.length; i++) {
                    faces.push([shape[triangles[i]].x + path.x2, shape[triangles[i]].y + path.y2, path.z2]);
                }
            }

        } else {
            let l = Math.sqrt((path.x1 - path.x2) * (path.x1 - path.x2) + (path.y1 - path.y2) * (path.y1 - path.y2) + (path.z1 - path.z2) * (path.z1 - path.z2));
            let l2 = l / 2;
            let mx = (path.x1 + path.x2) / 2;
            let my = (path.y1 + path.y2) / 2;
            let mz = (path.z1 + path.z2) / 2;

            for (let i = 0; i < shape.length - 1; i++) {
                faces.push([shape[i].x + mx, shape[i].y + my, mz - l2]);
                faces.push([shape[i].x + mx, shape[i].y + my, mz + l2]);
                faces.push([shape[i + 1].x + mx, shape[i + 1].y + my, mz + l2]);

                faces.push([shape[i].x + mx, shape[i].y + my, mz - l2]);
                faces.push([shape[i + 1].x + mx, shape[i + 1].y + my, mz - l2]);
                faces.push([shape[i + 1].x + mx, shape[i + 1].y + my, mz + l2]);
            }

            i = shape.length - 1;

            faces.push([shape[0].x + mx, shape[0].y + my, mz - l2]);
            faces.push([shape[0].x + mx, shape[0].y + my, mz + l2]);
            faces.push([shape[i].x + mx, shape[i].y + my, mz + l2]);

            faces.push([shape[0].x + mx, shape[0].y + my, mz - l2]);
            faces.push([shape[i].x + mx, shape[i].y + my, mz - l2]);
            faces.push([shape[i].x + mx, shape[i].y + my, mz + l2]);

            if (open === undefined) {
                let triangles = this.Triangulate(shape);

                //Front Cover
                for (let i = 0; i < triangles.length; i++) {
                    faces.push([shape[triangles[i]].x + mx, shape[triangles[i]].y + my, mz - l2]);
                }

                //Back Cover
                for (let i = 0; i < triangles.length; i++) {
                    faces.push([shape[triangles[i]].x + mx, shape[triangles[i]].y + my, mz + l2]);
                }
            }
        }

        return faces;
    };

    this.ExtrudePath = function (points, radius, material) {
        closedSpline.points = points;
        let geometry = new THREE.TubeBufferGeometry(closedSpline, 1, radius, 8, false);
        return new THREE.Mesh(geometry, material);
    };

    this.ExtrudeTube = function (points, radius, segments) {
        closedSpline.points = points;
        return new THREE.TubeBufferGeometry(closedSpline, 1, radius, segments, false, undefined, true);
    };

    this.ExtrudeTube2 = function (points, radius, segments, count) {
        closedSpline.points = points;
        return new THREE.TubeBufferGeometry(closedSpline, count, radius, segments, false, undefined, true);
    };

    this.ExtrudeArcTube = function (points, radius, segments) {
        closedSpline.points = points;
        closedSpline.curveType = 'chordal';

        return new THREE.TubeGeometry(closedSpline, 20, radius, segments, false, undefined, true);
    };

    this.Extrude = function (points, shapepoints) {
        closedSpline.points = points;
        extrudeSettings.extrudePath = closedSpline;

        let shape = new THREE.Shape(shapepoints);
        return new THREE.ExtrudeBufferGeometry(shape, extrudeSettings);
    };

    this.ExtrudeAlongZ = function (points, opoints, holes, oholes, height) {
        let swctx = new poly2tri.SweepContext(points);
        swctx.addHoles(holes);

        swctx.triangulate();
        let triangles = swctx.getTriangles();

        let vertices = [];
        let indices = [];
        let normals = [];
        let index = [];
        let point, triangle;
        let count = 0;
        let holecount = 0;

        //Top Vertices
        for (let j = 0; j < opoints.length; j++) {
            point = opoints[j];

            vertices.push(point.x);
            vertices.push(point.y);
            vertices.push(point.z);

            index[point.x + "-" + point.y] = count;
            count++;
        }

        if (oholes) {
            for (let j = 0; j < oholes.length; j++) {
                for (let k = 0; k < oholes[j].length; k++) {
                    point = oholes[j][k];

                    vertices.push(point.x);
                    vertices.push(point.y);
                    vertices.push(point.z);

                    index[point.x + "-" + point.y] = count;
                    count++;
                    holecount++;
                }
            }
        }

        //Bottom Vertices
        for (let j = 0; j < opoints.length; j++) {
            point = opoints[j];

            vertices.push(point.x);
            vertices.push(point.y);
            vertices.push(point.z + height);
        }

        if (oholes) {
            for (let j = 0; j < oholes.length; j++) {
                for (let k = 0; k < oholes[j].length; k++) {
                    point = oholes[j][k];

                    vertices.push(point.x);
                    vertices.push(point.y);
                    vertices.push(point.z + height);
                }
            }
        }

        //Top

        for (let j = 0; j < triangles.length; j++) {
            triangle = triangles[j];

            for (let k = 0; k < triangle.points_.length; k++) {
                point = triangle.points_[k];

                indices.push(index[point.x + "-" + point.y]);
            }
        }

        // let l = opoints.length + holecount;
        let k = indices.length;
        let l = opoints.length + holecount;

        //Bottom
        for (let j = 0; j < k; j++) {
            indices.push(indices[j] + l);
        }

        //Sides
        for (let j = 0; j < opoints.length - 1; j++) {
            indices.push(j);
            indices.push(j + l);
            indices.push(j + l + 1);

            indices.push(j);
            indices.push(j + l + 1);
            indices.push(j + 1);
        }

        //Side - last

        indices.push(j);
        indices.push(j + l);
        indices.push(0);

        indices.push(j + l);
        indices.push(l);
        indices.push(0);

        if (oholes) {
            let s = opoints.length;
            let e = opoints.length;

            for (let i = 0; i < oholes.length; i++) {
                e += oholes[i].length;

                //Holes
                for (let j = s; j < e - 1; j++) {
                    indices.push(j);
                    indices.push(j + l);
                    indices.push(j + l + 1);

                    indices.push(j);
                    indices.push(j + l + 1);
                    indices.push(j + 1);
                }

                //Side - last

                indices.push(j);
                indices.push(j + l);
                indices.push(s);

                indices.push(j + l);
                indices.push(s + l);
                indices.push(s);

                s += oholes[i].length;
            }
        }


        let vA, vB, vC;
        let pA = new THREE.Vector3(), pB = new THREE.Vector3(), pC = new THREE.Vector3();
        let cb = new THREE.Vector3(), ab = new THREE.Vector3();

        // indexed elements

        for (let i = 0, il = indices.length; i < il; i += 3) {

            vA = indices[i + 0] * 3;
            vB = indices[i + 1] * 3;
            vC = indices[i + 2] * 3;

            pA.fromArray(vertices, vA);
            pB.fromArray(vertices, vB);
            pC.fromArray(vertices, vC);

            cb.subVectors(pC, pB);
            ab.subVectors(pA, pB);
            cb.cross(ab);

            if (normals[vA] === undefined)
                normals[vA] = 0;

            normals[vA] += cb.x;

            if (normals[vA + 1] === undefined)
                normals[vA + 1] = 0;

            normals[vA + 1] += cb.y;

            if (normals[vA + 2] === undefined)
                normals[vA + 2] = 0;

            normals[vA + 2] += cb.z;

            if (normals[vB] === undefined)
                normals[vB] = 0;

            normals[vB] += cb.x;

            if (normals[vB + 1] === undefined)
                normals[vB + 1] = 0;

            normals[vB + 1] += cb.y;

            if (normals[vB + 2] === undefined)
                normals[vB + 2] = 0;

            normals[vB + 2] += cb.z;

            if (normals[vC] === undefined)
                normals[vC] = 0;

            normals[vC] += cb.x;

            if (normals[vC + 1] === undefined)
                normals[vC + 1] = 0;

            normals[vC + 1] += cb.y;

            if (normals[vC + 2] === undefined)
                normals[vC + 2] = 0;

            normals[vC + 2] += cb.z;

        }

        return {
            vertices: vertices,
            indices: indices,
            normals: normals
        }
    };

    this.ExtrudeAlongX = function (points, opoints, height) {
        let triangles = this.Triangulate(points);

        let vertices = [];
        let indices = [];

        height /= 2;

        //Top Vertices
        for (let j = 0; j < opoints.length; j++) {
            point = opoints[j];

            vertices.push(point.x + height);
            vertices.push(point.y);
            vertices.push(point.z);
        }

        //Bottom Vertices
        for (let j = 0; j < opoints.length; j++) {
            point = opoints[j];

            vertices.push(point.x - height);
            vertices.push(point.y);
            vertices.push(point.z);
        }

        //Top

        for (let j = 0; j < triangles.length; j++) {
            triangle = triangles[j];
            indices.push(triangles[j]);
        }

        let k = indices.length;
        let l = opoints.length;

        //Bottom
        for (let j = 0; j < k; j++) {
            indices.push(indices[j] + l);
        }

        //Sides
        for (let j = 0; j < opoints.length - 1; j++) {
            indices.push(j);
            indices.push(j + l);
            indices.push(j + l + 1);

            indices.push(j);
            indices.push(j + l + 1);
            indices.push(j + 1);
        }

        //Side - last

        indices.push(j);
        indices.push(j + l);
        indices.push(0);

        indices.push(j + l);
        indices.push(l);
        indices.push(0);

        return {
            vertices: vertices,
            indices: indices
        }
    };

    this.ExtrudeAlongY = function (points, opoints, height) {
        let triangles = this.Triangulate(points);

        let vertices = [];
        let indices = [];

        height /= 2;

        //Top Vertices
        for (let j = 0; j < opoints.length; j++) {
            point = opoints[j];

            vertices.push(point.x);
            vertices.push(point.y + height);
            vertices.push(point.z);
        }

        //Bottom Vertices
        for (let j = 0; j < opoints.length; j++) {
            point = opoints[j];

            vertices.push(point.x);
            vertices.push(point.y - height);
            vertices.push(point.z);
        }

        //Top

        for (let j = 0; j < triangles.length; j++) {
            triangle = triangles[j];
            indices.push(triangles[j]);
        }

        let k = indices.length;
        let l = opoints.length;

        //Bottom
        for (let j = 0; j < k; j++) {
            indices.push(indices[j] + l);
        }

        //Sides
        for (let j = 0; j < opoints.length - 1; j++) {
            indices.push(j);
            indices.push(j + l);
            indices.push(j + l + 1);

            indices.push(j);
            indices.push(j + l + 1);
            indices.push(j + 1);
        }

        //Side - last

        indices.push(j);
        indices.push(j + l);
        indices.push(0);

        indices.push(j + l);
        indices.push(l);
        indices.push(0);

        return {
            vertices: vertices,
            indices: indices
        }
    };

    this.Triangulate = function (points) {
        let array = [];

        for (let i = 0; i < points.length; i++) {
            array.push(points[i].x);
            array.push(points[i].y);
            array.push(points[i].z);
        }

        let triangles = earcut(array, undefined, 3);
        return triangles;
    };

    this.Generate3DLineAxes = function (object3d, xo, yo, x, y, z, maxbounds) {

        let dirX = new THREE.Vector3(1, 0, 0);
        dirX.normalize();
        let dirY = new THREE.Vector3(0, 1, 0);
        dirY.normalize();
        let dirZ = new THREE.Vector3(0, 0, 1);
        dirZ.normalize();

        let origin = new THREE.Vector3(xo, yo, 0);
        let hexX = 0xff0000;
        let hexY = 0x008800;
        let hexZ = 0x0000ff;

        let size = maxbounds * 0.15;

        let arrowX = new THREE.ArrowHelper(dirX, origin, x, hexX, size);
        object3d.add(arrowX);

        let arrowY = new THREE.ArrowHelper(dirY, origin, y, hexY, size);
        object3d.add(arrowY);

        let arrowZ = new THREE.ArrowHelper(dirZ, origin, z, hexZ, size);
        object3d.add(arrowZ);

        let materialx = new THREE.LineBasicMaterial({
            color: 0xff0000
        });

        let materialy = new THREE.LineBasicMaterial({
            color: 0x008800
        });

        let materialz = new THREE.LineBasicMaterial({
            color: 0x0000ff
        });

        let offset = maxbounds * 0.075;
        object3d.add(this.CreateText(x + offset + xo, yo, 0, { x: Math.PI / 2, y: 0, z: 0 }, "X", materialx, maxbounds));
        object3d.add(this.CreateText(xo, y + offset + yo, 0, { x: Math.PI / 2, y: Math.PI / 2, z: 0 }, "Y", materialy, maxbounds));
        object3d.add(this.CreateText(xo, yo, z + offset, { x: Math.PI / 2, y: 0, z: 0 }, "Z", materialz, maxbounds));
    };

    this.Dispose = function () {
        self.object.remove();
        canvas === undefined;

        let item;
        let child;

        for (let g = scene.children.length - 1; g >= 0; g--) {
            item = scene.children[g];

            for (let i = item.children.length - 1; i >= 0; i--) {
                child = item.children[i];

                item.remove(child);

                if (child.geometry && child.geometry.dispose)
                    child.geometry.dispose();

                delete child;
                child = {};
            }

            scene.remove(item);

            if (item.dispose)
                item.dispose();
            else
                delete item;

            item = {};
        }

        renderer.dispose();
    };

    this.LoadFont = function () {
        let loader = new THREE.FontLoader();
        loader.load('fonts/arial.json', function (response) {
            mobiwork.text3dfont = response;
        });
    };

    this.CreateText = function (x, y, z, rot, text, material, maxbounds) {
        try {
            let textGeo = new THREE.TextGeometry(text, {
                font: mobiwork.text3dfont,
                size: 0.1 * maxbounds,
                height: 0.01 * maxbounds,
                bevelEnabled: 0,
                material: 0,
                extrudeMaterial: 1
            });

            let center = textGeo.center();

            textGeo.computeBoundingBox();
            textGeo.computeVertexNormals();

            let mesh = new THREE.Mesh(textGeo, material);

            mesh.position.x = x; // + center.x / 10;
            mesh.position.y = y; // + center.y / 10;
            mesh.position.z = z;

            mesh.rotation.x = rot.x; // 0;
            mesh.rotation.y = rot.y; //Math.PI * 2;
            mesh.rotation.z = rot.z; //Math.PI * 2;

            return mesh;
        } catch (e) {
        }
    };

    this.SaveImage = function () {
        let strMime = "image/jpeg";
        let strDownloadMime = "image/octet-stream";
        imgData = renderer.domElement.toDataURL(strMime);

        let strData = imgData.replace(strMime, strDownloadMime);
        let filename = "screencapture.jpg";
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

    this.ToDataURL = function () {
        return renderer.domElement.toDataURL();
    };


    //Animations
    this.Inspect = function (mesh) {
        self.AnimateFindMesh(mesh, function () {
            self.AnimateScan(mesh, function () {
                self.Stop(1000, function () {
                    self.Render();
                });
            });
        });
    };

    this.ShowMesh = function (selectedmesh, entiremesh) {
        let material;

        self.AnimateFrameToTransparent(entiremesh, 0.4, function () {
            self.AnimateFindMesh(selectedmesh, function () {
                self.AnimateFrameToOpaque(entiremesh);
            });
        });
    };

    this.AnimateFindMesh = function (mesh, res) {
        //self.AnimateRotateFull(function () {
        let bounds = new THREE.Box3().setFromObject(mesh);

        let position = self.GetCameraPosition();
        let px = position.x;
        let py = position.y;
        let pz = position.z;

        let x = (bounds.max.x + bounds.min.x) / 2;
        let y = (bounds.max.y + bounds.min.y) / 2;
        let z = (bounds.max.z + bounds.min.z) / 2;

        let dx = (bounds.max.x - bounds.min.x);
        let dy = (bounds.max.y - bounds.min.y);
        let dz = (bounds.max.z - bounds.min.z);

        let radius = Math.sqrt((bounds.max.x - bounds.min.x) * (bounds.max.x - bounds.min.x) +
            (bounds.max.y - bounds.min.y) * (bounds.max.y - bounds.min.y) +
            (bounds.max.z - bounds.min.x) * (bounds.max.z - bounds.min.z));

        if (dz > dx && dz > dy) {
            let ratio = dz / Math.max(dx, dy);
            radius *= (1 + ratio / 120);
        }

        let line = new graphicsentity.Line2F(px, py, x, y);
        let camera = line.GetEndOffset(radius);

        self.AnimatePosition(x, y, z, camera.x, camera.y, z + radius / 2, function () {
            self.Stop(1000, function () {
                res();
            });
        });
        //});
    };

    this.AnimateScan = function (mesh, res) {
        let bounds = new THREE.Box3().setFromObject(mesh);

        let x = (bounds.max.x + bounds.min.x) / 2;
        let y = (bounds.max.y + bounds.min.y) / 2;
        let z = (bounds.max.z + bounds.min.z) / 2;

        let dx = (bounds.max.x - bounds.min.x);
        let dy = (bounds.max.y - bounds.min.y);
        let dz = (bounds.max.z - bounds.min.z);

        let boundradius = Math.sqrt((bounds.max.x - bounds.min.x) * (bounds.max.x - bounds.min.x) +
            (bounds.max.y - bounds.min.y) * (bounds.max.y - bounds.min.y) +
            (bounds.max.z - bounds.min.x) * (bounds.max.z - bounds.min.z));

        if (dz > dx && dz > dy)
            boundradius *= 2;

        let x1;
        let y1;
        let z1;

        let x2;
        let y2;
        let z2;

        let radius;
        let ratio;
        let speed = 0.005;
        let angle;
        let mid;

        let a, b, c;
        x1 = x;
        y1 = y;
        z1 = z;

        x2 = y;
        y2 = y;
        z2 = z;

        if (dx > dy) {
            if (dx > dz) {
                //X
                x1 = bounds.min.x;
                y1 = y;
                z1 = z;

                x2 = bounds.max.x;
                y2 = y;
                z2 = z;

                radius = Math.max(dy, dz) * 3;
                ratio = dx * 0.3333 / Math.max(dy, dz);
                angle = 180 * speed;

            } else {
                //Z
                x1 = x;
                y1 = y;
                z1 = bounds.max.z;

                x2 = x;
                y2 = y;
                z2 = bounds.min.z;

                ratio = Math.max(dx, dy) / Math.min(dx, dy);

                if (ratio > 5) {
                    radius = Math.max(dx, dy) * 1.5;
                    ratio = 0.125 * ratio * dz / Math.max(dx, dy);
                }
                else {
                    radius = Math.max(dx, dy) * 3;
                    ratio = dz * 0.75 / Math.max(dx, dy);
                }

                angle = 180 * speed;

            }
        } else if (dy > dz) {
            //Y
            x1 = x;
            y1 = bounds.min.y;
            z1 = z;

            x2 = x;
            y2 = bounds.max.y;
            z2 = z;

            radius = Math.max(dx, dz) * 3;
            ratio = dy * 0.3333 / Math.max(dx, dz);
            angle = -180 * speed;

        } else {
            //Z
            x1 = x;
            y1 = y;
            z1 = bounds.max.z;

            x2 = x;
            y2 = y;
            z2 = bounds.min.z;

            ratio = Math.max(dx, dy) / Math.min(dx, dy);

            if (ratio > 5) {
                radius = Math.max(dx, dy) * 1.5;
                ratio = 0.125 * ratio * dz / Math.max(dx, dy);
            }
            else {
                radius = Math.max(dx, dy) * 3;
                ratio = dz * 0.65 / Math.max(dx, dy);
            }

            angle = 180 * speed;
        }

        self.AnimatePosition(x2, y2, z2, radius, function () {
            self.AnimatePosition(x1, y1, z1, radius, function () {

                self.AnimateRotation(angle, function () {
                    self.AnimatePosition(x2, y2, z2, -radius, function () {
                        self.AnimateRotation(angle, function () {

                            self.AnimatePosition(x, y, z, boundradius, function () {
                                res();
                            });

                        }, 1000);
                    }, ratio, 1000);
                }, 1000);
            }, ratio, 1000);
        }, 1, 1000);
    };

    this.AnimateRotateFull = function (res) {
        let camera = self.GetCameraCenter();
        let cx = camera.x;
        let cy = camera.y;
        let cz = camera.z;

        let position = self.GetCameraPosition();
        let px = position.x;
        let py = position.y;
        let pz = position.z;

        if (cx > px) {
            let angle = 180 * 0.005;
            self.AnimateRotation(angle, function () {
                res();
            });
        } else
            res();
    };

    this.AnimatePosition = function (x, y, z, ex, ey, ez, res, speed, pause) {
        let camera = self.GetCameraCenter();
        let cx = camera.x;
        let cy = camera.y;
        let cz = camera.z;

        let position = self.GetCameraPosition();
        let px = position.x;
        let py = position.y;
        let pz = position.z;

        if (speed === undefined)
            speed = 1;

        let factor = 0.003 / speed;
        let increment = factor;

        let cx1 = (x - cx) / 10;
        let cy1 = (y - cy) / 10;
        let cz1 = (z - cz) / 10;

        let px1 = (ex - px) / 10;
        let py1 = (ey - py) / 10;
        let pz1 = (ez - pz) / 10;
        let time = Date.now();

        self.onanimation = function () {
            let now = Date.now();
            let diff = now - time;
            time = now;

            self.SetCameraLookat(cx + cx1 * increment, cy + cy1 * increment, cz + cz1 * increment);
            self.SetCameraPosition(px + px1 * increment, py + py1 * increment, pz + pz1 * increment);

            increment += factor * diff;

            if (increment > 10) {
                self.StopAnimation();

                if (pause)
                    self.Stop(pause, function () {
                        if (res)
                            res();
                    });
                else
                    if (res)
                        res();

            }
        };

        self.StartAnimation();

    };

    this.AnimateFrameToTransparent = function (object3d, value, res) {
        let material;
        let increment = 0.1;
        let factor = 0.01;
        let time = Date.now();

        for (let i = 0; i < object3d.children.length; i++) {
            material = object3d.children[i].material;
            material.transparent = true;
            material.transparency = material.opacity;
        }

        self.onanimation = function () {
            let now = Date.now();
            let diff = now - time;
            time = now;

            for (let i = 0; i < object3d.children.length; i++) {
                if (object3d.children[i]) {
                    material = object3d.children[i].material;
                    material.opacity = material.transparency - (1 - value) * increment / 10;
                }
            }

            increment += factor * diff;

            if (increment > 10) {
                self.StopAnimation();

                for (let i = 0; i < object3d.children.length; i++) {
                    material = object3d.children[i].material;
                    material.opacity = value;
                }

                if (res)
                    res();

            }

            self.Render();
        };

        self.StartAnimation();
    };

    this.AnimateFrameToOpaque = function (object3d, res) {
        let material;
        let increment = 10;
        let factor = 0.01;
        let time = Date.now();

        let value = object3d.children[0].material.opacity;

        self.onanimation = function () {
            let now = Date.now();
            let diff = now - time;
            time = now;

            for (let i = 0; i < object3d.children.length; i++) {
                if (object3d.children[i]) {
                    material = object3d.children[i].material;
                    material.opacity = material.transparency - (1 - value) * increment / 10;
                }
            }

            increment -= factor * diff;

            if (increment < 0) {
                self.StopAnimation();

                for (let i = 0; i < object3d.children.length; i++) {
                    material = object3d.children[i].material;
                    material.transparent = false;
                    material.transparency = undefined;
                    material.opacity = 1;
                }

                if (res)
                    res();

            }

            self.Render();
        };

        self.StartAnimation();
    };

    this.AnimateRotation = function (angle, res, pause) {
        let camera = self.GetCameraCenter();
        let cx = camera.x;
        let cy = camera.y;
        let cz = camera.z;

        let position = self.GetCameraPosition();
        let px = position.x;
        let py = position.y;
        let pz = position.z;

        let line = new graphicsentity.Line2F(cx, cy, px, py);
        let increment = 0.001;
        let time = Date.now();

        self.onanimation = function () {
            let now = Date.now();
            let diff = now - time;
            time = now;

            line.Rotate(cx, cy, angle * diff / 20);
            self.SetCameraPosition(line.point2.x, line.point2.y, pz);

            increment += 0.0025 * diff;

            if (increment > 10) {
                self.StopAnimation();

                if (pause)
                    self.Stop(pause, function () {
                        if (res)
                            res();
                    });
                else
                    if (res)
                        res();
            }
        };

        self.StartAnimation();
    };

    this.CancelAnimation = function () {
        self.StopAnimation();
        self.AnimateFrameToOpaque(selectedmesh.parent);
    };

    this.Stop = function (time, res) {
        let timer = setTimeout(function () {
            clearTimeout(timer);
            res();
        }, time);
    };

    this.LoadFont();

    function animate() {
        if (self.stopanimation)
            cancelAnimationFrame(self.animationid);// Stop the animation
        else {
            self.animationid = requestAnimationFrame(animate);

            if (self.onanimation)
                self.onanimation();

            control.update();
        }
    };
};