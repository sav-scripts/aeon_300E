(function ()
{

    var _p = window.WireGraphic = {};

    var _scene,
        _camera,
        _renderer,
        _container;

    var _width, _height;

    var _image;

    var _data;

    var $doms = {};

    var CAMERA_SETTING =
    {
        //initPosition: new THREE.Vector3(0, -600, 300),
        fov:45,
        near:1,
        far:5500
    };

    _p.init = function (data, image)
    {
        _data = data;


        _image = image;

        _width = image.width;
        _height = image.height;

        _scene = new THREE.Scene();

        _container = new THREE.Object3D();
        _container.position.x = -_width*.5;
        _container.position.y = _height*.5;
        _container.rotation.x = -Math.PI;

        _scene.add(_container);

        //_camera = new THREE.PerspectiveCamera( CAMERA_SETTING.fov, _width / _height, CAMERA_SETTING.near, CAMERA_SETTING.far);
        _camera = new THREE.OrthographicCamera( _width / - 2, _width / 2, _height / 2, _height / - 2, 1, 1000);

        window.camera = _camera;

        _camera.position.z = 1000;
        _camera.lookAt(new THREE.Vector3(0,0,0));

        //_cameraControl = new DefaultCameraControl(_camera, CAMERA_SETTING.initPosition);
        //_camera.position.z = 500;

        //var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
        //directionalLight.position.set( 1, 1, 1 );
        //_scene.add( directionalLight );
        //
        //
        //var pointLight = new THREE.PointLight(0xFFFFFF);
        //pointLight.position.z = 50;
        //_scene.add(pointLight);


        _renderer = new THREE.WebGLRenderer({ antialiasing: true, alpha:true });
        _renderer.setPixelRatio(window.devicePixelRatio);
        _renderer.setClearColor( 0x000000, 0);

        _renderer.setSize(_width, _height);

        $doms.canvas = $(_renderer.domElement);
        _renderer.domElement.className = "three_canvas";


        $("#main_container").append(_renderer.domElement);
        $doms.canvas.css("position", "absolute").css("z-index", 1);


        //_p.setBasemap();

        _p.setPointLayer();
        _p.setLineLayer();


        render();

        function render()
        {
            requestAnimationFrame(render);

            LineLayer.update();
            _renderer.render(_scene, _camera);
        }
    };

    _p.setBasemap = function()
    {
        BaseMap.init(_image);
        _scene.add(BaseMap.object3D);
    };

    _p.setPointLayer = function()
    {
        PointLayer.init(_data);
        _container.add(PointLayer.object3D);
    };

    _p.setLineLayer = function()
    {
        LineLayer.init(_data);
        _container.add(LineLayer.object3D);
    };

    _p.onResize = function (width, height)
    {
    };

}());


(function(){

    var _p = window.BaseMap = {};

    _p.init = function(image)
    {
        //var texture = new THREE.Texture(_mapData.image);

        //var texture = THREE.ImageUtils.loadTexture( "images/test.jpg" );
        var texture = new THREE.Texture(image);
        texture.needsUpdate = true; // because it is base64
        texture.minFilter = THREE.LinearFilter;

        _p.geometry = new THREE.PlaneBufferGeometry( image.width, image.height, 1, 1 );


        _p.material = new THREE.MeshBasicMaterial
        ({
            map:texture
        });

        _p.object3D = new THREE.Mesh( _p.geometry, _p.material );

        _p.object3D.rotation.x = 0;

    };


}());

(function(){

    var _p = window.PointLayer = {};

    _p.pointDic = {};
    _p.positions = null;

    _p.init = function(graphicData)
    {
        var texture = THREE.ImageUtils.loadTexture( "images/dot_128x128.png" );

        var i, obj, index = 0, vertex;

        var pointList = graphicData.pointList;
        var pointCount = pointList.length;

        var geometry = new THREE.BufferGeometry;
        _p.positions = new Float32Array(pointCount*3);

        for(i=0;i<pointCount;i++)
        {
            obj = pointList[i];

            _p.pointDic[obj.id] =
            {
                index:i*3,
                vertex:new THREE.Vector3(obj.x, obj.y, 0)
            };

            _p.positions[i*3] = obj.x;
            _p.positions[i*3+1] = obj.y;
            _p.positions[i*3+2] = 0;
        }

        geometry.addAttribute("position", new THREE.DynamicBufferAttribute(_p.positions, 3));
        geometry.drawcalls.push({start:0, count:pointCount, index:0});

        var material = new THREE.PointCloudMaterial( {
            map: texture,
            size: 10,
            blending: THREE.AdditiveBlending,
            transparent: true,
            sizeAttenuation: false
        } );

        _p.object3D = new THREE.PointCloud(geometry, material);

    };



}());



(function(){

    var _p = window.LineLayer = {};

    var _positions, _colors, _alphas, _lineList, _segmentCount;

    _p.init = function(graphicData)
    {
        //var texture = THREE.ImageUtils.loadTexture( "images/dot_128x128.png" );

        /*
         var uniforms = _p.uniforms =
         {
         //texture:            { type: "t", value: texture }
         };

         var attributes = _p.attributes =
         {
         };

         //uniforms.texture.value.wrapS = uniforms.texture.value.wrapT = THREE.RepeatWrapping;


         var material = new THREE.ShaderMaterial( {

         uniforms:       uniforms,
         attributes:     attributes,
         vertexShader:   ShaderLoader.getShader("misc", "#line_layer_vertex"),
         fragmentShader: ShaderLoader.getShader("misc", "#line_layer_fragment"),

         //blending:       THREE.AdditiveBlending,
         depthTest:      false,
         transparent:    true

         });


         var i, obj, startPoint, endPoint, index = 0, vertex, geometry = new THREE.Geometry();

         var pointList = graphicData.point_list;
         var lineList = graphicData.line_list;
         var pointDic = {};

         for(i=0;i<pointList.length;i++)
         {
         obj = pointList[i];
         pointDic[obj.id] = {x:obj.x, y:obj.y};
         }



         for(i=0;i<lineList.length;i++)
         {
         obj = lineList[i];

         startPoint = pointDic[obj.a];
         endPoint = pointDic[obj.b];

         geometry.vertices.push(new THREE.Vector3(startPoint.x, startPoint.y, 0), new THREE.Vector3(endPoint.x, endPoint.y, 0));
         }


         _p.object3D = new THREE.Line(geometry, material, THREE.LinePieces);
         */

        _lineList = graphicData.lineList;
        _segmentCount = _lineList.length;
        _positions = new Float32Array(_segmentCount*3*2);
        _colors = new Float32Array(_segmentCount*3*2);
        _alphas = new Float32Array(_segmentCount*2);

        var geometry = new THREE.BufferGeometry();
        geometry.addAttribute("position", new THREE.DynamicBufferAttribute(_positions, 3));
        geometry.addAttribute("color", new THREE.DynamicBufferAttribute(_colors, 3));
        geometry.addAttribute("alpha", new THREE.DynamicBufferAttribute(_alphas, 1));

        geometry.drawcalls.push( {
            start: 0,
            count: 0,
            index: 0
        } );

        //var material = new THREE.LineBasicMaterial( {
        //    vertexColors: THREE.VertexColors,
        //    blending: THREE.AdditiveBlending,
        //    transparent: true
        //} );

        var uniforms = _p.uniforms =
        {
        };

        var attributes = _p.attributes =
        {
            alpha: {type:"f", value:null}
        };

        //uniforms.texture.value.wrapS = uniforms.texture.value.wrapT = THREE.RepeatWrapping;


        var material = new THREE.ShaderMaterial( {

            uniforms:       uniforms,
            attributes:     attributes,
            vertexShader:   ShaderLoader.getShader("misc", "#line_layer_vertex"),
            fragmentShader: ShaderLoader.getShader("misc", "#line_layer_fragment"),

            //blending:       THREE.AdditiveBlending,
            depthTest:      false,
            transparent:    true

        });

        _p.object3D = new THREE.Line( geometry, material, THREE.LinePieces );



        _p.update();

    };

    _p.update = function()
    {
        var i, obj, start, end, index = 0, pointPositions = PointLayer.positions;


        for(i=0;i<_segmentCount;i++)
        {
            obj = _lineList[i];
            start = PointLayer.pointDic[obj.start].index;
            end = PointLayer.pointDic[obj.end].index;

            _positions[i*6] = pointPositions[start];
            _positions[i*6+1] = pointPositions[start+1];
            _positions[i*6+2] = pointPositions[start+2];

            _positions[i*6+3] = pointPositions[end];
            _positions[i*6+4] = pointPositions[end+1];
            _positions[i*6+5] = pointPositions[end+2];

            _alphas[i*2] = .1;
            _alphas[i*2+1] = .1;
        }

        _p.object3D.geometry.drawcalls[0].count = _segmentCount*2;
        _p.object3D.geometry.attributes.position.needsUpdate = true;
        _p.object3D.geometry.attributes.color.needsUpdate = true;
        _p.object3D.geometry.attributes.alpha.needsUpdate = true;

        //_p.attributes.alpha.needsUpdate = true;

    };



}());