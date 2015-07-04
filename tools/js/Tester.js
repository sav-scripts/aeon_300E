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
            {id:"data", url:"data/data.txt"},
            {id:"data2", url:"data/moto_2.txt"}
        ];


        ShaderLoader.preventCache = true;
        ShaderLoader.load(["misc"], function()
        {
            //_p.loadData(dataList);

            WGHelper.load(_useServerData, dataList, function()
            {
                for(var i=0;i<dataList.length;i++)
                {
                    var id = dataList[i].id;
                    var img = WireGraphic.getData(id).image;


                    $(img).css("display", "block").css("position", "absolute");
                    $("body").append(img);
                    TweenMax.set(img, {autoAlpha:0});
                }


                _p.changeTo(_firstGraphicId);

                _isReady = true;
                setDatGUI();

                onWindowResize();
            });

        });

        window.addEventListener("resize", onWindowResize, false);
        onWindowResize();

        //WireGraphic.init();
    };



    _p.changeTo = function(id)
    {
        if(id == _currentId) return;

        _currentId = id;

        var data = WireGraphic.getData(_currentId);
        WireGraphic.changeTo(_currentId);

        TweenMax.set(data.image, {autoAlpha:1});
    };



    function setDatGUI()
    {

        _datguiObj =
        {
            "play": playIt,
            "randomPower": 1,
            "duration": 3,
            "out_tween": "Power2",
            "out_ease": "easeIn",
            "in_tween": "Power1",
            "in_ease": "easeInOut",
            "with_bg":false
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


        datGUI.add(_datguiObj, "duration", 1, 5).name("時間");
        datGUI.add(_datguiObj, "randomPower", 0, 2).name("隨機位移強度");
        datGUI.add(_datguiObj, "out_tween", tweenDic).name("進入轉場 Tween");
        datGUI.add(_datguiObj, "out_ease", easeDic).name("進入轉場 Ease");
        datGUI.add(_datguiObj, "in_tween", tweenDic).name("離開轉場 Tween");
        datGUI.add(_datguiObj, "in_ease", easeDic).name("離開轉場 Ease");
        datGUI.add(_datguiObj, "with_bg").name("背景").onChange(function(b)
        {
            $("body").toggleClass("with_bg", b);
        });
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

        var func1 = funcDic[_datguiObj.out_tween][_datguiObj.out_ease];
        var func2 = funcDic[_datguiObj.in_tween][_datguiObj.in_ease];

        WireGraphic.tweenTo(targetId,
            {
                duration:_datguiObj.duration,
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

        //WireGraphic.getData("data").image.width = 100;
        //WireGraphic.getData("data").image.height = 200;

        updateImage(WireGraphic.getData("data").image, -200);
        updateImage(WireGraphic.getData("data2").image, 200);

        function updateImage(image, xOffset)
        {
            $(image).css("left", width *.5 - image.width *.5 + xOffset).css("top", height *.5-image.height *.5);
            image.offset = $(image).offset();
        }


        if(_currentId)
        {
            WireGraphic.updatePosition();
        }

        WireGraphic.onResize(width, height);
    }

}());