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

    var _currentId;

    var _wgDic =
    {
        "/Index": {url:"data/index.txt"},
        "/Brand": {url:"data/brand.txt"}
    };

    var _wgSetting =
    {

        duration:3,
        outFunc: Power2.easeIn,
        inFunc: Power1.easeInOut,
        randomPower: 1
    };

    if(window.orientation == undefined) _isAlerted = true;

    _p.setPlaying = function(b)
    {
        _isPlaying = b;
    };

    _p.init = function ()
    {
        buildWireGraphic(buildContent);
    };

    function buildWireGraphic(cb)
    {
        var dataList = [];
        for(var key in _wgDic)
        {
            var obj = _wgDic[key];
            dataList.push({id:key, url:obj.url});
        }


        ShaderLoader.preventCache = true;
        ShaderLoader.load(["misc"], function()
        {
            WGHelper.load(true, dataList, function()
            {
                for(var i=0;i<dataList.length;i++)
                {
                    var id = dataList[i].id;
                    var img = WireGraphic.getData(id).image;


                    $(img).css("display", "block").css("position", "absolute");
                    $("body").append(img);
                    TweenMax.set(img, {autoAlpha:0});


                    if(i == 1)
                    {
                        $(img).css("left", 100).css("top", "50%");

                        img.offset = $(img).offset();

                    }
                }


                _p.changeTo("/Index");

                if(cb) cb.apply();
            });

        });
    }
    _p.changeTo = function(id)
    {
        if(id == _currentId) return;

        _currentId = id;

        var data = WireGraphic.getData(_currentId);
        WireGraphic.changeTo(_currentId);

        TweenMax.set(data.image, {autoAlpha:1});
    };

    function buildContent()
    {
        Index.init();
        Feature.init();
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


        TweenMax.to("#loading_block",.5, {alpha:0, onComplete:function()
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


        if(_currentHash == null)
        {
            options.isFirstIn = true;

            _currentHash = hashName;
            targetObj = _hashDic[hashName];
            $(targetObj.block).css("display", "block");
            if(targetObj.stageClass && targetObj.stageClass.beforeStageIn) targetObj.stageClass.beforeStageIn(options);
            if(targetObj.stageClass && targetObj.stageClass.afterStageIn) targetObj.stageClass.afterStageIn(options);

            $("#logo").toggleClass("lighten", (_currentHash != "/Index"));
        }
        else if(_wgDic[_currentHash] && _wgDic[hashName])
        {
            currentObj = _hashDic[_currentHash];
            targetObj = _hashDic[hashName];

            $(currentObj.block).css("display", "block");
            $(targetObj.block).css("display", "block");


            if(currentObj.stageClass && currentObj.stageClass.beforeStageOut) currentObj.stageClass.beforeStageOut(options);
            if(targetObj.stageClass && targetObj.stageClass.beforeStageIn) targetObj.stageClass.beforeStageIn(options);

            WireGraphic.tweenTo(hashName, _wgSetting);


            _isPlaying = true;

            var scrollStart = 1.3;

            var tl = new TimelineMax;

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

            tl.add(function()
            {
                _isPlaying = false;

                if(currentObj.stageClass && currentObj.stageClass.afterStageOut) currentObj.stageClass.afterStageOut(options);
                if(targetObj.stageClass && targetObj.stageClass.afterStageIn) targetObj.stageClass.afterStageIn(options);

                $(currentObj.block).css("display", "none");

                $("#logo").toggleClass("lighten", (_currentHash != "/Index"));

                if(_cbAfterToBlock != null)
                {
                    var func = _cbAfterToBlock;
                    _cbAfterToBlock = null;
                    func.apply();
                }
            });

            _currentHash = hashName;

        }
        else
        {

            currentObj = _hashDic[_currentHash];
            targetObj = _hashDic[hashName];

            $(currentObj.block).css("display", "block");
            $(targetObj.block).css("display", "block");


            if(currentObj.stageClass && currentObj.stageClass.beforeStageOut) currentObj.stageClass.beforeStageOut(options);
            if(targetObj.stageClass && targetObj.stageClass.beforeStageIn) targetObj.stageClass.beforeStageIn(options);


            _isPlaying = true;

            var tl = new TimelineMax;

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

                if(_cbAfterToBlock != null)
                {
                    var func = _cbAfterToBlock;
                    _cbAfterToBlock = null;
                    func.apply();
                }
            });

            _currentHash = hashName;
        }



    };

    _p.onResize = function ()
    {
        if(!_isAlerted)
        {
            if(window.orientation == 0 || window.orientation == 180)
            {
                alert("請以橫向方式瀏覽以得到較佳的瀏覽體驗.");
                _isAlerted = true;
            }

        }

        var width = _stageWidth = Main.stageWidth = $(window).width();
        var height = _stageHeight = Main.stageHeight = $(window).height();

        Index.onResize(width, height);
        Feature.onResize(width, height);
        SmallMenu.onResize(width, height);
        Menu.onResize(width, height);

    };

}());