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

    _p.setPlaying = function(b)
    {
        _isPlaying = b;
    };

    _p.init = function ()
    {
        build();
    };

    function build()
    {
        Index.init();
        Feature.init();
        SmallMenu.init();
        Menu.init();

        $("img").attr("draggable", false);


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



            window.scrollTo(0, 1);
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

        window.scrollTo(0, 1);
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


        if(_currentHash == null)
        {
            _currentHash = hashName;
            targetObj = _hashDic[hashName];
            $(targetObj.block).css("display", "block");
            if(targetObj.stageClass && targetObj.stageClass.beforeStageIn) targetObj.stageClass.beforeStageIn();
            if(targetObj.stageClass && targetObj.stageClass.afterStageIn) targetObj.stageClass.afterStageIn();
        }
        else
        {

            currentObj = _hashDic[_currentHash];
            targetObj = _hashDic[hashName];

            $(currentObj.block).css("display", "block");
            $(targetObj.block).css("display", "block");


            if(currentObj.stageClass && currentObj.stageClass.beforeStageOut) currentObj.stageClass.beforeStageOut();
            if(targetObj.stageClass && targetObj.stageClass.beforeStageIn) targetObj.stageClass.beforeStageIn();


            _isPlaying = true;

            var startTop = targetObj.index > currentObj.index? _stageHeight: -_stageHeight;
            var targetTop = targetObj.index > currentObj.index? -_stageHeight: _stageHeight;

            var tl = new TimelineMax;
            tl.set(targetObj.block, {top:startTop});
            tl.to(currentObj.block, 1, {ease:Power1.easeInOut, top:targetTop});
            tl.to(targetObj.block, 1, {ease:Power1.easeInOut, top:0}, 0);
            tl.add(function()
            {
               _isPlaying = false;

                if(currentObj.stageClass && currentObj.stageClass.afterStageOut) currentObj.stageClass.afterStageOut();
                if(targetObj.stageClass && targetObj.stageClass.afterStageIn) targetObj.stageClass.afterStageIn();

                $(currentObj.block).css("display", "none");

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
        var width = _stageWidth = Main.stageWidth = $(window).width();
        var height = _stageHeight = Main.stageHeight = $(window).height();

        Index.onResize(width, height);
        Feature.onResize(width, height);
        SmallMenu.onResize(width, height);
        Menu.onResize(width, height);

    };

}());