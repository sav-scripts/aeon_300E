(function ()
{

    var _p = window.Main = {};

    var _defaultHash = "/Index",
        _currentHash = null,
        _hashDic,
        _contentList,
        _isPlaying = false;

    var _stageWidth, _stageHeight;

    var _cbAfterToBlock;

    var _isAlerted = false;

    _p.rawWidth = 1920;
    _p.rawHeight = 1040;

    _p.styleMode = null;

    _p.settings =
    {
        isVerticalMode: false
    };

    var _currentId;

    var _wgDic =
    {
        "/Index": {url:"data/index.txt"},
        "/Brand": {url:"data/brand.txt"},
        "/Feature": {url:"data/feature_1.txt"},
        "/Detail": {url:"data/detail.txt"}
    };

    var _wgSetting =
    {
        d1:.75,
        d2:.4,
        d3:.75,
        d4:.5,
        outFunc: Power2.easeIn,
        inFunc: Power1.easeInOut,
        randomPower: 1
    };

    _wgSetting.duration = _wgSetting.d1 + _wgSetting.d2 + _wgSetting.d3 + _wgSetting.d4;

    if(window.orientation == undefined) _isAlerted = true;

    _p.setPlaying = function(b)
    {
        _isPlaying = b;
    };

    _p.getPlaying = function()
    {
        return _isPlaying;
    };

    _p.init = function ()
    {
        //console.log(BrowserDetect.browser == "Explorer");

        window.__WG_Active = Modernizr.webgl;
        //window.__WG_Active = ( function () { try { var canvas = document.createElement( 'canvas' ); return !! ( window.WebGLRenderingContext && ( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) ) ); } catch ( e ) { return false; } } )();

        if($(window).width() <= 720) window.__WG_Active = false;
        //window.__WG = false;

        var noCache = false;
        var s = noCache? "?v=" + new Date().getTime(): "";

        var wgLibs = ["js/lib/three.min.js", "js/MyThreeHelper.js", "js/WireGraphic.js"+s];

        Modernizr.load
        ({
            test:window.__WG_Active,
            yep:wgLibs,
            complete:function()
            {
                if(__WG_Active)
                {
                    buildWireGraphic(buildContent);
                }
                else
                {
                    _wgDic["/Watch"] = {};
                    buildContent();
                }
            }

        });


        //buildWireGraphic(buildContent);
    };

    function buildWireGraphic(cb)
    {
        var dataList = [];
        for(var key in _wgDic)
        {
            var obj = _wgDic[key];
            dataList.push({id:key, url:obj.url});
        }


        ShaderLoader.preventCache = false;
        ShaderLoader.load(["misc"], function()
        {
            WGHelper.load(true, false, dataList, function()
            {
                _p.changeTo("/Index");

                _wgDic["/Watch"] = {};

                if(cb) cb.apply();
            });

        });
    }
    _p.changeTo = function(id)
    {
        if(id == _currentId) return;

        _currentId = id;

        if(__WG_Active) WireGraphic.changeTo(_currentId);
    };

    function buildContent()
    {
        _p.styleMode = $(window).width() <= 720? "small": "large";
        window.__WG = (__WG_Active && _p.styleMode != "small")? true: false;

        Index.init();
        Brand.init();
        Feature.init();
        Detail.init();
        Watch.init();
        SmallMenu.init();
        Menu.init();

        $("img").attr("draggable", false);

        $("#logo").bind("click", function()
        {
           window.open("http://www.aeonmotor.com.tw/", "_blank");
        });

        _hashDic = {};
        _contentList = [];

        var obj, hash, i, $dom, $scrollBlocks = $(".scroll_block");
        for(i=0;i<$scrollBlocks.length;i++)
        {
            $dom = $($scrollBlocks[i]);

            $dom.css("visibility", "visible").css("display", "none");

            hash = $dom.attr("hash");
            obj = {block:$dom, hash:hash, index:i, stageClass: window[hash.replace("/", "")]};
            _hashDic[hash] = obj;
            _contentList.push(obj);
        }

        Utility.onHashChange(function(hashName)
        {
            if(_hashDic[hashName])
            {
                if(_isPlaying)
                {
                    _cbAfterToBlock = function()
                    {
                        _p.scrollToBlock(hashName);
                    };
                }
                else
                {
                    _p.scrollToBlock(hashName);
                }
            }
        });

        $(window).mousewheel(function(event)
        {
           (event.deltaY > 0)? scrollContent(-1): scrollContent(1);
        });

        var mc = new Hammer(window, {drag_lock_to_axis: true});

        mc.on("swipe", function(event)
        {
            var minRange = 10;
            if(event.gesture.deltaY < -minRange )
            {
                scrollContent(1);
            }
            else if(event.gesture.deltaY > minRange)
            {
                scrollContent(-1);
            }

        });

        function scrollContent(direction)
        {
            if(_isPlaying) return;

            var obj = _hashDic[_currentHash];

            //console.log(obj.index);


            var isScrolled = false;

            if(obj.stageClass && obj.stageClass.requestScroll) isScrolled = obj.stageClass.requestScroll(direction);


            if(isScrolled == false)
            {

                if(direction == 1)
                {
                    if(obj.index < (_contentList.length-1))
                    {
                        _p.toBlock(_contentList[obj.index+1].hash);
                    }
                }
                else
                {
                    if(obj.index > 0)
                    {
                        _p.toBlock(_contentList[obj.index-1].hash);
                    }
                }
            }



            //window.scrollTo(0, 1);
        }


        TweenMax.to("#loading_block",.4, {alpha:0, onComplete:function()
        {
            $("#loading_block").detach();
        }});


        $(window).bind("resize", _p.onResize);
        _p.onResize();

        var firstHash = Utility.getHash();
        if(!_hashDic[firstHash]) firstHash = _defaultHash;
        _p.scrollToBlock(firstHash, 0);

        //alert(window.orientation);
    }

    _p.triggerCbAfterChange = function()
    {
        if(_cbAfterToBlock != null)
        {
            var func = _cbAfterToBlock;
            _cbAfterToBlock = null;
            func.apply();
        }
    };

    _p.toBlock = function(hashName)
    {
        //if(_isPlaying) return;

        //_cbAfterToBlock = cb;

        if(Utility.getHash() != hashName)
        {
            Utility.setHash(hashName);
        }
        else
        {
            _p.scrollToBlock(hashName);
        }
    };

    _p.scrollToBlock = function(hashName)
    {
        if(_isPlaying) return;
        //console.log("to block: " + hashName);

        //SmallMenu.lockTo(hashName);


        if(hashName == "") hashName = _defaultHash;
        if(_currentHash == hashName) return;


        var targetObj, currentObj;

        SmallMenu.lockTo(hashName);
        Menu.lockTo(hashName);

        var options =
        {
            firstIn: false
        };



        function firstTimeCompleted()
        {
            _isPlaying = false;
            _p.triggerCbAfterChange();
        }

        var tl;


        if(_currentHash == null)
        {
            options.isFirstIn = true;
            options.onComplete = firstTimeCompleted;

            _isPlaying = true;

            _currentHash = hashName;
            targetObj = _hashDic[hashName];
            $(targetObj.block).css("display", "block");
            if(targetObj.stageClass && targetObj.stageClass.beforeStageIn) targetObj.stageClass.beforeStageIn(options);
            if(targetObj.stageClass && targetObj.stageClass.afterStageIn) targetObj.stageClass.afterStageIn(options);

            $("#logo").toggleClass("lighten", (_currentHash != "/Index" && _currentHash != "/Feature"));

        }
        else if(_wgDic[_currentHash] && _wgDic[hashName])
        {
            currentObj = _hashDic[_currentHash];
            targetObj = _hashDic[hashName];

            options.isScrollUp = (targetObj.index < currentObj.index);

            $(currentObj.block).css("display", "block");
            $(targetObj.block).css("display", "block");

            _p.onResize();


            if(currentObj.stageClass && currentObj.stageClass.beforeStageOut) currentObj.stageClass.beforeStageOut(options);
            if(targetObj.stageClass && targetObj.stageClass.beforeStageIn) targetObj.stageClass.beforeStageIn(options);

            var scrollStart = .3;

            tl = new TimelineMax;

            tl.add(function()
            {
                $("#logo").toggleClass("lighten", (_currentHash != "/Index" && _currentHash != "/Feature"));
            });

            if(targetObj.index > currentObj.index)
            {
                $(currentObj.block).css("top", "auto").css("bottom", 0);
                $(targetObj.block).css("bottom", "auto").css("top", _stageHeight);

                tl.to(currentObj.block, 1, {ease:Power1.easeInOut, bottom:_stageHeight}, scrollStart);
                tl.to(targetObj.block, 1, {ease:Power1.easeInOut, top:0}, "-=1");
            }
            else
            {
                $(currentObj.block).css("bottom", "auto").css("top", 0);
                $(targetObj.block).css("top", "auto").css("bottom", _stageHeight);

                tl.to(currentObj.block, 1, {ease:Power1.easeInOut, top:_stageHeight}, scrollStart);
                tl.to(targetObj.block, 1, {ease:Power1.easeInOut, bottom:0}, "-=1");
            }


            var endStart = _wgSetting.d1 + _wgSetting.d2 + _wgSetting.d3;
            if(!__WG) endStart = 1.4;


            tl.add(function()
            {
                options.onComplete = complete;
                if(currentObj.stageClass && currentObj.stageClass.afterStageOut) currentObj.stageClass.afterStageOut(options);
                if(targetObj.stageClass && targetObj.stageClass.afterStageIn) targetObj.stageClass.afterStageIn(options);

            }, endStart);

            //if(!(targetObj.stageClass && targetObj.stageClass.afterStageIn))
            //{
            //    tl.add(complete, _wgSetting.duration + .2);
            //}

            function complete()
            {

                _isPlaying = false;

                $(currentObj.block).css("display", "none");

               _p.triggerCbAfterChange();
            }


            if(__WG)
            {
                var startData = currentObj.stageClass.getWgData();
                var targetData = targetObj.stageClass.getWgData();

                _wgSetting.startBound = startData;
                _wgSetting.targetBound = targetData;

                WireGraphic.tweenTo(startData.id, targetData.id, _wgSetting);
            }

            _isPlaying = true;

            _currentHash = hashName;

        }
        else
        {
            /*
            currentObj = _hashDic[_currentHash];
            targetObj = _hashDic[hashName];

            options.isScrollUp =(targetObj.index > currentObj.index);

            $(currentObj.block).css("display", "block");
            $(targetObj.block).css("display", "block");

            _p.onResize();


            if(currentObj.stageClass && currentObj.stageClass.beforeStageOut) currentObj.stageClass.beforeStageOut(options);
            if(targetObj.stageClass && targetObj.stageClass.beforeStageIn) targetObj.stageClass.beforeStageIn(options);


            _isPlaying = true;

            tl = new TimelineMax;

            if(targetObj.index > currentObj.index)
            {
                $(currentObj.block).css("top", "auto").css("bottom", 0);
                $(targetObj.block).css("bottom", "auto").css("top", _stageHeight);

                tl.to(currentObj.block, 1, {ease:Power1.easeInOut, bottom:_stageHeight});
                tl.to(targetObj.block, 1, {ease:Power1.easeInOut, top:0}, 0);
            }
            else
            {
                $(currentObj.block).css("bottom", "auto").css("top", 0);
                $(targetObj.block).css("top", "auto").css("bottom", _stageHeight);

                tl.to(currentObj.block, 1, {ease:Power1.easeInOut, top:_stageHeight});
                tl.to(targetObj.block, 1, {ease:Power1.easeInOut, bottom:0}, 0);
            }

            tl.add(function()
            {
                _isPlaying = false;

                if(currentObj.stageClass && currentObj.stageClass.afterStageOut) currentObj.stageClass.afterStageOut(options);
                if(targetObj.stageClass && targetObj.stageClass.afterStageIn) targetObj.stageClass.afterStageIn(options);

                $(currentObj.block).css("display", "none");

                $("#logo").toggleClass("lighten", (_currentHash != "/Index"));

                _p.triggerCbAfterChange();
            });

            _currentHash = hashName;
            */
        }



    };

    _p.onResize = function ()
    {
        //if(!_isAlerted)
        //{
        //    if(window.orientation == 0 || window.orientation == 180)
        //    {
        //        alert("請以橫向方式瀏覽以得到較佳的瀏覽體驗.");
        //        _isAlerted = true;
        //    }
        //}

        var width = _stageWidth = Main.stageWidth = $(window).width();
        var height = _stageHeight = Main.stageHeight = $(window).height();

        var oldMode = _p.styleMode;
        _p.styleMode = width <= 720? "small": "large";
        window.__WG = (__WG_Active && _p.styleMode != "small")? true: false;



        var modeChanged = _p.styleMode != oldMode;

        _p.settings.isVerticalMode = height > width;

        var rawWidth = _p.styleMode == "small"? 720: _p.rawWidth;
        var rawHeight = _p.styleMode == "small"? 1280: _p.rawHeight;

        var bgBound = Main.bgBound = Helper.getSize_cover(width, height, rawWidth, rawHeight);

        Index.onResize(width, height, bgBound, modeChanged, _p.styleMode);
        Brand.onResize(width, height, bgBound, modeChanged, _p.styleMode);
        Feature.onResize(width, height, bgBound, modeChanged, _p.styleMode);
        Detail.onResize(width, height, bgBound, modeChanged, _p.styleMode);
        Watch.onResize(width, height, bgBound, modeChanged, _p.styleMode);
        SmallMenu.onResize(width, height, bgBound, modeChanged, _p.styleMode);
        Menu.onResize(width, height, bgBound, modeChanged, _p.styleMode);

        if(__WG) WireGraphic.onResize(width, height);

    };

}());