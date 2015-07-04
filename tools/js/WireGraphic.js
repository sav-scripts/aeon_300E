(function(){

    var _p = window.WGHelper = {};

    _p.load = function(_useServerData, list, cb)
    {
        var index = 0;

        loadOne();

        var data, id;

        function loadOne()
        {
            if(index >= list.length)
            {
                loadComplete();
                return;
            }

            id = list[index].id;

            if(_useServerData)
            {
                loadFile(list[index].url);
            }
            else
            {
                data = JSON.parse(localStorage.getItem(id));
                loadImage();
            }
        }

        function loadImage()
        {
            var img = document.createElement("img");
            img.onload = function()
            {
                WireGraphic.addData(id, data, img);
                index ++;
                loadOne();
            };


            img.src = data.image_src;

        }

        function loadFile(url)
        {
            //console.log("load url: " + url);
            $.ajax(
                {
                    url:url + "?v=" + new Date().getTime()
                }
            ).done(function(response)
                {
                    data = JSON.parse(response);
                    loadImage();

                }).fail(function(event)
                {
                    console.log("load fail: " + event);
                });
        }

        function loadComplete()
        {
            WireGraphic.init();
            cb.apply();

        }
    };

}());



(function (){

    var __graphicDic = {};
    var __currentGraphicId;

    var __nextGraphicId;
    var __tweenObj =
    {
        progress:0,
        polygonChanged: false,
        randomProgress:0,
        fadeProgress:0,
        antiFadeProgress:1
    };

    var __settings =
    {
        fadeMark:.2,
        maxLineAlpha: .4,
        randomPower: 1,
        connectDistance: 120,
        maxConnectPerPoint: 5
    };


    (function ()
    {

        var _p = window.WireGraphic = {};

        var _scene,
            _camera,
            _renderer,
            _container;

        var _width, _height;

        var $doms = {};

        var _isInit = false;

        var _isRendering = false;

        _p.init = function ()
        {
            _width = $(window).width();
            _height = $(window).height();

            _scene = new THREE.Scene();

            _container = new THREE.Object3D();
            _container.frustumCulled = false;

            _scene.add(_container);

            //_camera = new THREE.PerspectiveCamera( 45, _width / _height, 1, 5500);
            //_camera = new THREE.OrthographicCamera(_width / -2, _width / 2, _height / 2, _height / -2, 1, 1000);
            _camera = new THREE.OrthographicCamera(0, _width, 0, _height, -1000, 1000);

            window.camera = _camera;

            //_camera.position.x = _width*.5;
            _camera.position.z = 1000;
            _camera.lookAt(new THREE.Vector3(0, 0, 0));


            _renderer = new THREE.WebGLRenderer({antialiasing: true, alpha: true});
            _renderer.setPixelRatio(window.devicePixelRatio);
            _renderer.setClearColor(0x000000, 0);

            _renderer.setSize(_width, _height);

            $doms.canvas = $(_renderer.domElement);
            _renderer.domElement.className = "three_canvas";


            $("body").append(_renderer.domElement);
            _renderer.domElement.id = "main_canvas";

            /*
            BaseMap.init();
            _container.add(BaseMap.object3D);
            */



            PointLayer.init();
            _container.add(PointLayer.object3D);

            LineLayer.init();
            _container.add(LineLayer.object3D);

            //PolygonLayer.init();
            //_container.add(PolygonLayer.object3D);

            RandomLine.init();
            _container.add(RandomLine.object3D);


            _isInit = true;

            //

            _p.setRendering(false);


            render();

            function render()
            {
                requestAnimationFrame(render);

                if(_isRendering)
                {
                    _renderer.render(_scene, _camera);
                }

            }
        };

        _p.setRendering = function(b)
        {
            _isRendering = b;
            $(_renderer.domElement).css("display", b?"block":"none");
        };

        _p.getData = function(id)
        {
            if(!id) id = __currentGraphicId;
            return __graphicDic[id];
        };

        _p.addData = function (id, data, image)
        {

            var texture = new THREE.Texture(image);
            texture.needsUpdate = true; // because it is base64
            texture.minFilter = THREE.LinearFilter;

            __graphicDic[id] =
            {
                rawData:data.graphic_data,
                image:image,
                texture:texture,
                segmentCount: data.graphic_data.line_list.length,
                width:image.width,
                height:image.height
            };

            PointLayer.addData(id);
        };

        _p.changeTo = function(id)
        {
            __currentGraphicId = id;


            //PointLayer.update();
            //LineLayer.update();


            //PolygonLayer.update();

            //var obj = __graphicDic[id];
            //BaseMap.changeTexture(obj.texture, obj.image.width, obj.image.height);
        };

        _p.tweenTo = function(targetId, setting, cb)
        {
            if(__currentGraphicId == targetId) return;
            if(__nextGraphicId == targetId) return;


            _p.setRendering(true);



            RandomLine.object3D.visible = true;

            __settings.randomPower = setting.randomPower;

            __nextGraphicId = targetId;

            var currentImage = __graphicDic[__currentGraphicId].image;
            var targetImage = __graphicDic[__nextGraphicId].image;


            TweenMax.killTweensOf(__tweenObj);
            TweenMax.to(currentImage,.5, {autoAlpha:0});

            TweenMax.to(PointLayer.object3D.material.uniforms.opacity,.5, {value:1});
            TweenMax.to(LineLayer.object3D.material.uniforms.opacity,.5, {value:0, onComplete:null},.5);



            __tweenObj.left = _container.position.x;
            __tweenObj.top = _container.position.y;

            __tweenObj.progress = 0;

            var defaultDuration = 4.8;
            var duration = defaultDuration;

            if(setting && setting.duration)
            {
                duration = setting.duration;
            }
            var ds = duration / defaultDuration;

            var tl = new TimelineMax();
            tl.to(__tweenObj, 1.5*ds, {progress:.5, ease:setting.outFunc, onUpdate:onProgressUpdate});
            tl.to(__tweenObj, 2*ds, {progress:.6, ease:Linear.easeNone, onUpdate:onProgressUpdate});
            tl.to(__tweenObj,1.3*ds, {progress:1, ease:setting.inFunc, onUpdate:onProgressUpdate});


            tl.add(function()
            {
                __tweenObj.progress = 0;

                RandomLine.object3D.visible = false;

                _p.changeTo(targetId);

            });

            tl.set(targetImage, {autoAlpha:0}, "+=.2");
            tl.to(PointLayer.object3D.material.uniforms.opacity,.7, {value:0});
            tl.to(LineLayer.object3D.material.uniforms.opacity,.7, {value:0}, "-=.7");
            tl.to(targetImage,.5, {autoAlpha:1}, "-=.7");

            tl.add(function()
            {
                __nextGraphicId = null;
                _p.setRendering(false);
                if(cb) cb.apply();
            });
        };

        _p.updatePosition = function()
        {
            var g1 = __graphicDic[__currentGraphicId],
                g2 = __graphicDic[__nextGraphicId];

            if(g2)
            {
                _container.position.x = g1.image.offset.left + (g2.image.offset.left - g1.image.offset.left) * __tweenObj.progress;
                _container.position.y = g1.image.offset.top + (g2.image.offset.top - g1.image.offset.top) * __tweenObj.progress;


                _container.scale.x = g1.image.width / g1.width + (g2.image.width / g2.width - g1.image.width / g1.width) * __tweenObj.progress;
                _container.scale.y = g1.image.height / g1.height + (g2.image.height / g2.height - g1.image.height / g1.height) * __tweenObj.progress;
            }
            else
            {
                _container.position.x = g1.image.offset.left;
                _container.position.y = g1.image.offset.top;

                _container.scale.x = g1.image.width / g1.width;
                _container.scale.y = g1.image.height / g1.height;

                //console.log(currentImage.width);
            }


            //_container.position.x = __tweenObj.left;
            //_container.position.y = __tweenObj.top;
        };

        function onProgressUpdate()
        {
            _p.updatePosition();

            __tweenObj.randomProgress = (.5 - Math.abs(.5 - __tweenObj.progress))/.5 * __settings.randomPower;

            var fadeMark = __settings.fadeMark;

            if(__tweenObj.progress <= fadeMark)
            {
                __tweenObj.fadeProgress = __tweenObj.progress / fadeMark;
            }
            else if(__tweenObj.progress >= (1-fadeMark))
            {
                __tweenObj.fadeProgress = (1-__tweenObj.progress)/fadeMark;
            }
            else __tweenObj.fadeProgress = 1;

            __tweenObj.antiFadeProgress = 1 - __tweenObj.fadeProgress;

            PointLayer.update();
            LineLayer.update();
        }

        _p.getCurrentId = function(){ return __currentGraphicId; };
        _p.getNextId = function(){ return __nextGraphicId; };

        _p.onResize = function (width, height)
        {
            if(!_isInit) return;

            _width = width;
            _height = height;

            //_camera.aspect = _width / _height;


            _camera.left = 0;
            _camera.right = _width;
            _camera.top = 0;
            _camera.bottom = _height;
            _camera.near = 1000;
            _camera.far = -1000;


            _camera.updateProjectionMatrix();

            _renderer.setSize( _width, _height );
        };

    }());

    (function(){

        var _p = window.BaseMap = {};

        _p.init = function()
        {
            //var texture = new THREE.Texture(_mapData.image);

            //var texture = THREE.ImageUtils.loadTexture( "images/test.jpg" );

            _p.geometry = new THREE.PlaneBufferGeometry( 400, 400, 1, 1 );


            _p.material = new THREE.MeshBasicMaterial
            ({
                map:null,
                color:0x999999,
                side:THREE.DoubleSide
            });

            _p.object3D = new THREE.Mesh( _p.geometry, _p.material );
        };

        _p.changeTexture = function(texture, width, height)
        {
            console.log(_p.geometry.attributes.position);

            var array = _p.geometry.attributes.position;

            console.log(width);

            array[0] = 0;
            array[1] = 0;
            array[2] = 0;

            array[3] = width;
            array[4] = 0;
            array[5] = 0;

            array[6] = 0;
            array[7] = height;
            array[8] = 0;

            array[9] = width;
            array[10] = height;
            array[11] = 0;

            /*
            array =
            [
                0,0,0,
                width,0,0,
                0,height,0,
                width,height,0
            ];
            */

            _p.geometry.attributes.position.needsUpdate = true;

            _p.object3D.material.map = texture;
        };


    }());

    (function(){

        var _p = window.PointLayer = {};

        _p.positions = null;



        var _geometry, _material, _randomPositions;


        _p.init = function()
        {
            generateGeometry();

            var texture = THREE.ImageUtils.loadTexture( "images/dot_128x128.png" );

            /*
            _material = new THREE.PointCloudMaterial( {
                map: texture,
                size: 10,
                blending: THREE.AdditiveBlending,
                transparent: true,
                sizeAttenuation: false
            } );
            */

            _material = new THREE.ShaderMaterial
            ({
                uniforms:
                {
                    opacity:{type:"f", value:1},
                    size:{type:"f", value:15 * window.devicePixelRatio},
                    texture:{type:"t", value:texture}
                },
                transparent: true,
                depthTest: false,
                vertexShader:   ShaderLoader.getShader("misc", "#point_layer_vertex"),
                fragmentShader: ShaderLoader.getShader("misc", "#point_layer_fragment")
            });

            _p.object3D = new THREE.PointCloud(_geometry, _material);
            _p.object3D.frustumCulled = false;

        };

        function generateGeometry()
        {
            _geometry = new THREE.BufferGeometry;

            var obj, key, maxPointCount = 0;

            for(key in __graphicDic)
            {
                obj = __graphicDic[key];
                maxPointCount = Math.max(maxPointCount, obj.pointCount);
            }

            _p.positions = new Float32Array(maxPointCount*3);


            _geometry.addAttribute("position", new THREE.DynamicBufferAttribute(_p.positions, 3));
            _geometry.drawcalls.push({start:0, count:0, index:0});

        }

        _p.addData = function(id)
        {
            var i, obj, vertex;

            var pointDic = {}, pointList = [], graphicData = __graphicDic[id], rawGraphicData = graphicData.rawData;
            var rawPointList = rawGraphicData.point_list;
            var pointCount = rawPointList.length;

            var randomRange = 500;
            var rs = randomRange*.5;


            for(i=0;i<pointCount;i++)
            {
                obj = rawPointList[i];

                //vertex = new THREE.Vector3(obj.x, obj.y, 0);

                vertex =
                {
                    x: obj.x,
                    y: obj.y,
                    z: 0,
                    rx: -rs + Math.random() * randomRange,
                    ry: -rs + Math.random() * randomRange,
                    rz: Math.random() * rs
                };

                //console.log(vertex);

                pointDic[obj.id] =
                {
                    index:i*3,
                    vertex:vertex
                };

                pointList[i] = vertex;

                graphicData.pointCount = pointCount;
                graphicData.pointDic = pointDic;
                graphicData.pointList = pointList;
            }
        };

        _p.update = function()
        {
            if(!__currentGraphicId) return;

            var graphicData = __graphicDic[__currentGraphicId];
            var i, vertex, pointCount = graphicData.pointCount, pointList = graphicData.pointList;

            if(__nextGraphicId && __tweenObj.progress > 0)
            {
                var progress = __tweenObj.progress,
                    ngd = __graphicDic[__nextGraphicId],
                    nVertex,
                    nPointCount = ngd.pointCount,
                    nPointList = ngd.pointList,
                    maxPointCount = Math.max(pointCount, nPointCount);


                for(i=0;i<maxPointCount;i++)
                {
                    vertex = pointList[i%pointCount];
                    nVertex = nPointList[i%nPointCount];

                    _p.positions[i*3] = vertex.x + (nVertex.x-vertex.x) * progress + vertex.rx * __tweenObj.randomProgress;
                    _p.positions[i*3+1] = vertex.y + (nVertex.y-vertex.y) * progress + vertex.ry * __tweenObj.randomProgress;
                    _p.positions[i*3+2] = vertex.z + (nVertex.z-vertex.z) * progress + vertex.rz * __tweenObj.randomProgress;

                    //_p.positions[i*3] = vertex.x + vertex.rx * __tweenObj.randomProgress;
                    //_p.positions[i*3+1] = vertex.y + vertex.ry * __tweenObj.randomProgress;
                    //_p.positions[i*3+2] = vertex.z + vertex.rz * __tweenObj.randomProgress;
                }

                _geometry.drawcalls[0].count = maxPointCount;
                _geometry.attributes.position.needsUpdate = true;

                //var tId = pointCount > nPointCount? __currentGraphicId: __nextGraphicId;
                RandomLine.update(maxPointCount);
            }
            else
            {
                pointCount = graphicData.pointCount;
                pointList = graphicData.pointList;

                for(i=0;i<pointCount;i++)
                {
                    vertex = pointList[i];
                    _p.positions[i*3] = vertex.x;
                    _p.positions[i*3+1] = vertex.y;
                    _p.positions[i*3+2] = vertex.z;
                }

                _geometry.drawcalls[0].count = pointCount;
                _geometry.attributes.position.needsUpdate = true;
            }

        };
    }());



    (function(){

        var _p = window.LineLayer = {};

        var _positions;

        var _geometry, _material;

        _p.init = function()
        {
            _material = new THREE.ShaderMaterial( {

                uniforms:
                {
                    opacity:{type:"f", value:__settings.maxLineAlpha}
                },
                attributes:
                {
                    //alpha: {type:"f", value:null}
                },
                vertexShader:   ShaderLoader.getShader("misc", "#line_layer_vertex"),
                fragmentShader: ShaderLoader.getShader("misc", "#line_layer_fragment"),

                depthTest:      false,
                transparent:    true

            });

            generateGeometry();

            _p.object3D = new THREE.Line( _geometry, _material, THREE.LinePieces );
            _p.object3D.frustumCulled = false;




        };

        function generateGeometry()
        {
            _geometry = new THREE.BufferGeometry();

            var obj, key, segmentCount, maxSegmentCount = 0;

            for(key in __graphicDic)
            {
                obj = __graphicDic[key];
                segmentCount = obj.rawData.line_list.length;

                maxSegmentCount = Math.max(maxSegmentCount, segmentCount);
            }

            _positions = new Float32Array(maxSegmentCount*3*2);
            //_colors = new Float32Array(maxSegmentCount*3*2);
            //_alphas = new Float32Array(maxSegmentCount*2);

            _geometry.addAttribute("position", new THREE.DynamicBufferAttribute(_positions, 3));
            //_geometry.addAttribute("color", new THREE.DynamicBufferAttribute(_colors, 3));
            //_geometry.addAttribute("alpha", new THREE.DynamicBufferAttribute(_alphas, 1));

            _geometry.drawcalls.push( {
                start: 0,
                count: 0,
                index: 0
            } );
        }

        _p.update = function()
        {
            if(!__currentGraphicId) return;

            var i, obj, start, end, index = 0, pointPositions = PointLayer.positions;
            var graphicData, maxAlpha = __settings.maxLineAlpha, fadeMark = __settings.fadeMark;


            var alpha = __tweenObj.antiFadeProgress * maxAlpha;

            if(__tweenObj.progress <= fadeMark)
            {
                graphicData = __graphicDic[__currentGraphicId];
            }
            else if(__tweenObj.progress >= (1-fadeMark))
            {
                graphicData = __graphicDic[__nextGraphicId];
                _material.uniforms.opacity.value = alpha;
            }
            else
            {
                _p.object3D.geometry.drawcalls[0].count = 0;
                return;
            }

            if(!graphicData)
            {
                console.log(__currentGraphicId);
                console.log(__nextGraphicId);
                return;
            }

            var lineList = graphicData.rawData.line_list;
            var pointDic = graphicData.pointDic;
            var segmentCount = graphicData.segmentCount;

            //console.log(pointDic);

            for(i=0;i<segmentCount;i++)
            {
                obj = lineList[i];
                start = pointDic[obj.a].index;
                end = pointDic[obj.b].index;

                _positions[i*6] = pointPositions[start];
                _positions[i*6+1] = pointPositions[start+1];
                _positions[i*6+2] = pointPositions[start+2];

                _positions[i*6+3] = pointPositions[end];
                _positions[i*6+4] = pointPositions[end+1];
                _positions[i*6+5] = pointPositions[end+2];

                //_alphas[i*2] = alpha;
                //_alphas[i*2+1] = alpha;
            }

            _p.object3D.geometry.drawcalls[0].count = segmentCount*2;

            _p.object3D.geometry.attributes.position.needsUpdate = true;
            //_p.object3D.geometry.attributes.color.needsUpdate = true;
            //_p.object3D.geometry.attributes.alpha.needsUpdate = true;

            //_p.attributes.alpha.needsUpdate = true;

        };



    }());

    (function(){

        var _p = window.PolygonLayer = {};

        var _geometry, _material;

        //var _polygon_list;

        //var _vertexPositions;

        var _vertices, _colors, _opacitys, _indices, _randomV;

        _p.showProgress = 0;

        var _isInit = false;

        _p.init = function()
        {

            generateGeometry();

            _material = new THREE.ShaderMaterial( {

                uniforms:
                {
                    breakProgress: {type:"f", value:0},
                    opacity: {type:"f", value:1}
                },
                attributes:
                {
                    randomV: {type:"v3", value:null},
                    color: {type:"v4", value:null},
                    opacity: {type:"f", value:null}
                },
                vertexShader:   ShaderLoader.getShader("misc", "#polygon_layer_vertex"),
                fragmentShader: ShaderLoader.getShader("misc", "#polygon_layer_fragment"),

                //blending:       THREE.AdditiveBlending,
                depthTest:      false,
                transparent:    true,
                side:THREE.DoubleSide
            });



            _p.object3D = new THREE.Mesh(_geometry, _material);

            _p.object3D.visible = false;

            _isInit = true;
        };

        function generateGeometry()
        {
            _geometry = new THREE.BufferGeometry();

            var obj, key, vertexCount, maxVertexCount = 0;

            for(key in __graphicDic)
            {
                obj = __graphicDic[key];
                vertexCount = obj.polygonVertices.length;

                maxVertexCount = Math.max(maxVertexCount, vertexCount);
            }

            _vertices = new Float32Array(maxVertexCount*3);
            _colors = new Float32Array(maxVertexCount*4);
            _opacitys = new Float32Array(maxVertexCount);
            _indices = new Uint16Array( maxVertexCount);

            _randomV = new Float32Array(maxVertexCount*3);

            for(var i=0;i<maxVertexCount;i++)
            {
                var range = 100, hRange = -range*.5;
                _randomV[i*3] = hRange+Math.random()*range;
                _randomV[i*3+1] = hRange+Math.random()*range;
                _randomV[i*3+2] = hRange+Math.random()*range;
                //_randomV.push(new THREE.Vector3(hRange+Math.random()*range, hRange+Math.random()*range, hRange+Math.random()*range));

            }


            _geometry.addAttribute('index', new THREE.DynamicBufferAttribute(_indices, 1));
            _geometry.addAttribute('position', new THREE.DynamicBufferAttribute(_vertices, 3));
            _geometry.addAttribute("color", new THREE.DynamicBufferAttribute(_colors, 4));
            //_geometry.addAttribute("opacity", new THREE.DynamicBufferAttribute(_opacitys, 1));
            _geometry.addAttribute('randomV', new THREE.DynamicBufferAttribute(_randomV, 3));



            //_indices[0] = 0;
            //_indices[1] = 1;
            //_indices[2] = 2;


            _geometry.offsets.push( {
                start: 0,
                count: 0,
                index: 0
            } );

            //console.log(_geometry.offsets[0].count);

        }

        _p.addData = function(graphicId)
        {
            var graphicData = __graphicDic[graphicId];


            var polygon_list = graphicData.rawData.polygon_list;
            var pointDic = graphicData.pointDic;



            var i, k, id, obj, array, pointObj;

            //var geometry = new THREE.BufferGeometry;

            var polygonVertices = [], poindId;

            var indexCount = 0;


            for(i=0;i<polygon_list.length;i++)
            {
                obj = polygon_list[i];

                var color = getVec4Color(obj.rgba);

                array = [];

                for(k=0;k<obj.points.length-1;k++)
                {
                    poindId = obj.points[k];
                    pointObj = pointDic[poindId];


                    array.push(pointObj.vertex.x, pointObj.vertex.y);
                }

                var indices = Earcut.execute(array);

                for(k=0;k<indices.length;k++)
                {
                    id = obj.points[indices[k]];
                    pointObj = pointDic[id];


                    polygonVertices.push
                    ({
                        id: id,
                        index: indexCount + k,
                        vertex: pointObj.vertex,
                        color: color
                    });


                }

                indexCount += indices.length;

            }


            //console.log(graphicId + ": " + polygonVertices.length);


            graphicData.polygonVertices = polygonVertices;
        };

        _p.changeColors = function(id)
        {
            if(!_isInit) return;

            var graphicData = __graphicDic[id];
            var polygonVertices = graphicData.polygonVertices;

            var i, vertexObj, color;

            for ( i = 0; i < polygonVertices.length; i++ )
            {
                vertexObj = polygonVertices[i];
                color = vertexObj.color;

                _colors[i*4] = color.x;
                _colors[i*4+1] = color.y;
                _colors[i*4+2] = color.z;
                _colors[i*4+3] = color.w;
            }

            _geometry.attributes.color.needsUpdate = true;
        };

        /*
        _p.show = function(cb)
        {
            _p.object3D.visible = true;
            //var numTriangles = polygonVertices.length / 3;


            var graphicData =__graphicDic[__currentGraphicId];
            var polygonVertices = graphicData.polygonVertices;
            var duration = polygonVertices.length / 3 * .1;



            _p.showProgress = 0;

            TweenMax.to(_p, duration, {showProgress:1, onUpdate:_p.updateOpacity, onComplete:cb});

        };
        */

        _p.breakOut = function(cb)
        {
            _material.uniforms.breakProgress.value = 0;


            TweenMax.to(_material.uniforms.breakProgress, 2, {ease:Power1.easeOut, value: 1, onComplete:function()
            {
                _material.uniforms.breakProgress.value = 0;
                _p.object3D.visible = false;
                if(cb) cb.apply();
            }});


        };

        /*
        _p.updateOpacity = function(targetOpacity)
        {

            var graphicData =__graphicDic[__currentGraphicId];
            var polygonVertices = graphicData.polygonVertices;

            var i, numVertices = polygonVertices.length, opacity;

            if(targetOpacity != null)
            {
                for ( i = 0; i < numVertices; i++ )
                {
                    _opacitys[i] = 1;
                }
            }
            else
            {
                for ( i = 0; i < numVertices; i+=3 )
                {
                    //_opacitys[i] =i/numVertices;

                    if(i/(numVertices-1) < _p.showProgress)
                    {
                        _opacitys[i] = 1;
                        _opacitys[i+1] = 1;
                        _opacitys[i+2] = 1;
                    }
                    else
                    {
                        _opacitys[i] = 0;
                        _opacitys[i+1] = 0;
                        _opacitys[i+2] = 0;
                    }
                }
            }

            _p.object3D.geometry.attributes.opacity.needsUpdate = true;
        };
        */

        _p.update = function()
        {
            if(!_isInit) return;
            if(!__currentGraphicId) return;

            var graphicData;
            var alpha = 1, fadeMark = __settings.fadeMark;

            if(__tweenObj.progress <= fadeMark)
            {
                graphicData = __graphicDic[__currentGraphicId];
                //alpha = (1-(__tweenObj.progress / fadeMark));
            }
            else if(__tweenObj.progress >= (1-fadeMark))
            {
                graphicData = __graphicDic[__nextGraphicId];
                //alpha = __tweenObj.antiFadeProgress;
            }
            else
            {
                _p.object3D.geometry.drawcalls[0].count = 0;
                return;
            }


            var polygonVertices = graphicData.polygonVertices;
            var pointDic = graphicData.pointDic;

            //console.log(polygonVertices.length);

            var i, vertexObj;

            var index, pointPositions = PointLayer.positions;

            //console.log("alpha = " + alpha);


            for ( i = 0; i < polygonVertices.length; i++ )
            {
                vertexObj = polygonVertices[i];
                //vertex = vertexObj.vertex;
                index = pointDic[vertexObj.id].index;

                _vertices[ i * 3 ] = pointPositions[index];
                _vertices[ i*3 + 1 ] = pointPositions[index+1];
                _vertices[ i*3 + 2 ] = pointPositions[index+2];

                _indices[i] = vertexObj.index;

                //_opacitys[i] = alpha;

            }

            //console.log("-------");

            _p.object3D.geometry.attributes.position.needsUpdate = true;
            _p.object3D.geometry.attributes.index.needsUpdate = true;
            //_p.object3D.geometry.attributes.opacity.needsUpdate = true;

            _geometry.drawcalls[0].count = polygonVertices.length;


        };

        function getVec4Color(rgbString)
        {
            var array = rgbString.split(",");
            array[0] = array[0].split("(")[1];
            array[array.length-1] = array[array.length-1].split(")")[0];
            if(array.length == 3) array.push(1);

            return new THREE.Vector4
            (
                parseInt(array[0]) / 255,
                parseInt(array[1]) / 255,
                parseInt(array[2]) / 255,
                array[3] = parseFloat(array[3])
            );
        }

    }());


    (function(){

        var _p = window.RandomLine = {};

        var _positions, _alphas;
        var _material, _geometry;
        var _isInit = false;

        _p.init = function()
        {

            _material = new THREE.ShaderMaterial( {

                uniforms:
                {
                    opacity:{type:"f", value:0}
                },
                attributes:
                {
                    alpha:{type:"f", value:null}
                },
                vertexShader:   ShaderLoader.getShader("misc", "#random_line_vertex"),
                fragmentShader: ShaderLoader.getShader("misc", "#random_line_fragment"),

                depthTest:      false,
                transparent:    true

            });

            generateGeometry();

            _p.object3D = new THREE.Line( _geometry, _material, THREE.LinePieces);
            _p.object3D.frustumCulled = false;

            _isInit = true;
        };

        function generateGeometry()
        {
            _geometry = new THREE.BufferGeometry;

            var obj, key, pointCount, maxPointCount = 0;

            for(key in __graphicDic)
            {
                obj = __graphicDic[key];
                pointCount = obj.rawData.point_list.length;

                maxPointCount = Math.max(maxPointCount, pointCount);
            }

            _positions = new Float32Array(maxPointCount * maxPointCount * 3);
            _alphas = new Float32Array(maxPointCount * maxPointCount);
            //_colors = new Float32Array(maxSegmentCount * maxSegmentCount * 3);

            _geometry.addAttribute("position", new THREE.DynamicBufferAttribute(_positions, 3));
            _geometry.addAttribute("alpha", new THREE.DynamicBufferAttribute(_alphas, 1));

            _geometry.drawcalls.push( {
                start: 0,
                count: 0,
                index: 0
            } );

        }

        _p.update = function(maxPointCount)
        {
            if(!_isInit) return;

            _material.uniforms.opacity.value = __tweenObj.fadeProgress;

            var i, j, pointPositions = PointLayer.positions;

            var minDistance = __settings.connectDistance;
            var vertexpos = 0, alphapos = 0, numConnected = 0;

            //var maxConnectPerPoint = __settings.maxConnectPerPoint, usedPointDic = {};

            for(i=0;i<maxPointCount;i++)
            {
                //if(!usedPointDic[i]) usedPointDic[i] = 0;

                for(j=i+1;j<maxPointCount;j++)
                {
                    var dx = pointPositions[ i * 3     ] - pointPositions[ j * 3     ];
                    var dy = pointPositions[ i * 3 + 1 ] - pointPositions[ j * 3 + 1 ];
                    var dz = pointPositions[ i * 3 + 2 ] - pointPositions[ j * 3 + 2 ];
                    var dist = Math.sqrt( dx * dx + dy * dy + dz * dz );


                    if ( dist < minDistance && dist > 5 )
                    {

                        var alpha = 1.0 - dist / minDistance;

                        _positions[ vertexpos++ ] = pointPositions[ i * 3     ];
                        _positions[ vertexpos++ ] = pointPositions[ i * 3 + 1 ];
                        _positions[ vertexpos++ ] = pointPositions[ i * 3 + 2 ];

                        _positions[ vertexpos++ ] = pointPositions[ j * 3     ];
                        _positions[ vertexpos++ ] = pointPositions[ j * 3 + 1 ];
                        _positions[ vertexpos++ ] = pointPositions[ j * 3 + 2 ];

                        _alphas[ alphapos++ ] = alpha;
                        _alphas[ alphapos++ ] = alpha;

                        numConnected++;

                        //usedPointDic[i] ++;
                        //if(usedPointDic[i] >= maxConnectPerPoint) break;
                    }

                }
            }

            _geometry.drawcalls[ 0 ].count = numConnected * 2;
            _geometry.attributes.position.needsUpdate = true;
            _geometry.attributes.alpha.needsUpdate = true;

        };

    }());


}());