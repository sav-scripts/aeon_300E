(function ()
{

    var _p = window.Tester = {};
    var _firstGraphicId = "data";
    var _currentId;
    var _isPlaying = false;

    var _isReady = false;

    var _datguiObj;

    var _useServerData = false;

    _p.init = function ()
    {
        //console.log(localStorage.getItem("data"));
        //var dataList = ["data", "data2"];

        if(Utility.urlParams["use_server_data"] == "1") _useServerData = true;

        var dataList =
        [
            {id:"data", url:"data/moto_1.txt"},
            {id:"data2", url:"data/moto_2.txt"}
        ];


        ShaderLoader.preventCache = true;
        ShaderLoader.load(["misc"], function()
        {
            _p.loadData(dataList);
        });

        window.addEventListener("resize", onWindowResize, false);
        onWindowResize();

        //WireGraphic.init();
    };

    _p.loadData = function(list)
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
                img.className ="graphic_image";
                //$(img).css("margin-left", -img.width *.5).css("margin-top", -img.height *.5).css("opacity",.2);
                $(img).css("opacity",.2).css("display", "block");

                TweenMax.set(img, {autoAlpha:0});

                $("body").append(img);


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

            _p.changeTo(_firstGraphicId);

            _isReady = true;
            setDatGUI();

            onWindowResize();


        }
    };

    _p.changeTo = function(id)
    {
        if(id == _currentId) return;

        _currentId = id;

        var data = WireGraphic.getData(_currentId);
        WireGraphic.changeTo(_currentId);

        TweenMax.set(data.image, {autoAlpha:1});
    };

    function loadFiles()
    {

    }

    function loadFile(input)
    {

        if (input.files && input.files[0]) {
            var reader = new FileReader();

            reader.onload = function (event)
            {
                //console.log("result = " + event.target.result);


                var data;
                try
                {
                    data = JSON.parse(event.target.result);
                }catch (e)
                {
                    alert("illegal data format");
                }

                if(data)
                {
                    loadImg(data.image_src, function()
                    {
                        CanvasHandler.clear();
                        CanvasHandler.drawData(data.graphic_data);
                    });
                }
            };

            reader.readAsText(input.files[0]);
        }
    }



    function setDatGUI()
    {

        _datguiObj =
        {
            "play": playIt,
            "randomPower": 1,
            "out_tween": "Power2",
            "out_ease": "easeIn",
            "in_tween": "Power1",
            "in_ease": "easeInOut"
        };

        var datGUI = new dat.GUI();

        var tweenDic =
        {
            "Power1": "Power1",
            "Power2": "Power2",
            "Power3": "Power3",
            "Circ": "Circ",
            "Cubic": "Cubic",
            "Quad": "Quad",
            "Expo": "Expo",
            "Linear": "Linear"
        };

        var easeDic =
        {
            "easeInOut": "easeInOut",
            "easeIn": "easeIn",
            "easeOut": "easeOut"
        };


        datGUI.add(_datguiObj, "randomPower", 0, 2).name("隨機位移強度");
        datGUI.add(_datguiObj, "out_tween", tweenDic).name("進入轉場 Tween");
        datGUI.add(_datguiObj, "out_ease", easeDic).name("進入轉場 Ease");
        datGUI.add(_datguiObj, "in_tween", tweenDic).name("離開轉場 Tween");
        datGUI.add(_datguiObj, "in_ease", easeDic).name("離開轉場 Ease");
        datGUI.add(_datguiObj, "play").name("撥放");


        $(".dg.ac").css("z-index", 8000);
    }

    function playIt()
    {
        if(_isPlaying) return;

        _isPlaying = true;

        var funcDic =
        {
            "Power1": Power1,
            "Power2": Power2,
            "Power3": Power3,
            "Circ": Circ,
            "Cubic": Cubic,
            "Quad": Quad,
            "Expo": Expo,
            "Linear": Linear
        };


        var targetId = _currentId == "data"? "data2": "data";


        var image1 = WireGraphic.getData(_currentId).image;
        var image2 = WireGraphic.getData(targetId).image;

        //$(image1).css("left", width *.5 - image1.width *.5).css("top", height *.5-image1.height *.5);
        //$(image2).css("left", width *.5 - image2.width *.5).css("top", height *.5-image2.height *.5);

        //TweenMax.to(image1,.5, {autoAlpha:0});

        var func1 = funcDic[_datguiObj.out_tween][_datguiObj.out_ease];
        var func2 = funcDic[_datguiObj.in_tween][_datguiObj.in_ease];

        WireGraphic.tweenTo(targetId,
            {
                outFunc: func1,
                inFunc: func2,
                randomPower: _datguiObj.randomPower
            }, function()
        {
            //_p.changeTo(targetId);

            _currentId = targetId;

            _isPlaying = false;
        });
    }

    function onWindowResize()
    {
        if(!_isReady) return;

        var width = $(window).width();
        var height = $(window).height();

        //console.log($("#main_container").offset());

        /*
        var position = $("#main_container").offset();
        WireGraphic.rePosition(position.left, position.top);
        */


        var image1 = WireGraphic.getData("data").image;
        var image2 = WireGraphic.getData("data2").image;

        $(image1).css("left", width *.5 - image1.width *.5 - 200).css("top", height *.5-image1.height *.5);
        $(image2).css("left", width *.5 - image2.width *.5 + 200).css("top", height *.5-image2.height *.5);

        image1.offset = $(image1).offset();
        image2.offset = $(image2).offset();


        if(_currentId)
        {
            var data = WireGraphic.getData(_currentId);

            var position = data.image.offset;

            WireGraphic.rePosition(position.left, position.top);
        }

        //var data = WireGraphic.getData(_firstGraphicId);
        //if(data)
        //{
        //    var image = data.image;
        //    WireGraphic.rePosition(width *.5 - image.width *.5, height *.5 - image.height *.5);
        //}

        WireGraphic.onResize(width, height);
    }

}());