(function ()
{

    var _p = window.Index = {};

    var $doms = {};

    var _fetcheredDic =
    {
        small:false,
        large:false
    };

    var _replaceTimer;
    var _maskParams =
    {
        needUpdate:false,
        progress:0
    };

    var _currentIndex = 1,
        _numScenes = 2;

    var _isMaskPlayed = true;

    var _iconLoop;

    var _isFirefox;

    _p.init = function ()
    {
        _isFirefox = BrowserDetect.browser == "Firefox";

        $doms.container = $("#index_block");

        $doms.indexMask = $(".index_mask");

        $doms.bike = $doms.container.find(".index_bike");
        $doms.light = $doms.container.find(".index_light");

        var v = _currentIndex == 1? 0: 1;
        TweenMax.set($doms.light, {scale:v, transformOrigin:"41% 45%",autoAlpha:v});


        setupScene(1);
        setupScene(2);

        $doms.scrollDownIcon = $doms.container.find(".scroll_down_icon");
        Helper.getInitValue($doms.scrollDownIcon[0]);

        _iconLoop = new TimelineMax({repeat:-1, paused:true});
        _iconLoop.to($doms.scrollDownIcon,.8,{ease:Power1.easeInOut, marginBottom:-10});
        _iconLoop.to($doms.scrollDownIcon,.8,{ease:Power1.easeInOut, marginBottom:0});

        $doms.scrollDownIcon.bind("mousedown", function()
        {
            Main.toBlock("/Brand");
        });



        //$doms.scene_2.toggleClass("svg-clipped", true);
        //$doms.scene_2.css("display", "block");


        function setupScene(index)
        {
            var $scene = $doms["scene_" + index] = $doms.container.find(".index_scene_" + index);



            $scene.background = $scene.find(".background", $scene[0]);

            $scene.text_1 = $scene.find(".index_text_1", $scene[0]);
            $scene.text_2 = $scene.find(".index_text_2", $scene[0]);
            $scene.text_3 = $scene.find(".index_text_3", $scene[0]);
            $scene.text_4 = $scene.find(".index_text_4", $scene[0]);

            $scene.textDoms = [$scene.text_1[0], $scene.text_2[0], $scene.text_3[0], $scene.text_4[0]];

            if(index != _currentIndex) $scene.css("display", "none");

            //Helper.getInitValue($doms.background[0]);

        }

        _replaceTimer = new TimelineMax({repeat:-1, paused:true});

        _replaceTimer.add(changeScene, 5);

        fetchGeom(Main.styleMode);
    };

    function fetchGeom(mode)
    {
        if(_fetcheredDic[mode]) return;
        _fetcheredDic[mode] = true;

        Helper.getInitValue($doms.bike[0], null, null, null, true, mode);
        Helper.getInitValue($doms.light[0], null, null, null, true, mode);
        
        fetcherScene(1);
        fetcherScene(2);
        
        function fetcherScene(index)
        {
            var $scene = $doms["scene_" + index];

            Helper.getInitValue($scene.background[0], null, null, null, true, mode);

            Helper.getInitValue($scene.text_1[0], null, null, null, true, mode);
            Helper.getInitValue($scene.text_2[0], null, null, null, true, mode);
            Helper.getInitValue($scene.text_3[0], null, null, null, true, mode);
            Helper.getInitValue($scene.text_4[0], null, null, null, true, mode);
        }
    }



    function changeScene(duration, targetIndex)
    {
        if(duration == null) duration = 1;

        if(targetIndex == _currentIndex && duration > 0) return;

        if(targetIndex == null)
        {
            targetIndex = _currentIndex + 1;
            if(targetIndex > _numScenes) targetIndex = 1;
        }

        var $oldScene = $doms["scene_" + _currentIndex];
        var $newScene = $doms["scene_" + targetIndex];
        _currentIndex = targetIndex;

        if(duration == 0)
        {
            $oldScene.css("display", "none");
            $newScene.css("display", "block");

            var v = _currentIndex == 1? 0: 1;
            TweenMax.set($doms.light, {scale:v, transformOrigin:"41% 45%",autoAlpha:v});
        }
        else
        {
            $oldScene.css("z-index", 0);
            $newScene.css("display", "block").css("z-index", 1);


            if(_isMaskPlayed == false)
            {
                if(_isFirefox)
                {
                    $oldScene.toggleClass("svg-clipped", false);
                    $newScene.toggleClass("svg-clipped", true);
                }


                _isMaskPlayed = true;

                _maskParams.needUpdate = true;
                _maskParams.progress = 0;

                updateMask();


                if(_currentIndex == 1)
                {
                    //TweenMax.to($doms.light,.5,{delay:.3, scale:0, transformOrigin:"41% 45%", ease:Power4.easeOut, autoAlpha:0});

                    TweenMax.to($doms.light,.01,{delay:.25, scale:0, transformOrigin:"41% 45%", ease:Power4.easeOut,autoAlpha:0});
                    TweenMax.to($doms.light,.01,{delay:.35, scale:1, transformOrigin:"41% 45%", ease:Power4.easeOut,autoAlpha:1});
                    TweenMax.to($doms.light,.4,{delay:.55, scale:0, transformOrigin:"41% 45%", ease:Power4.easeOut,autoAlpha:0});
                }
                else
                {
                    TweenMax.to($doms.light,.01,{delay:.25, scale:1, transformOrigin:"41% 45%", ease:Power4.easeOut,autoAlpha:1});
                    TweenMax.to($doms.light,.01,{delay:.35, scale:0, transformOrigin:"41% 45%", ease:Power4.easeOut,autoAlpha:0});
                    TweenMax.to($doms.light,.4,{delay:.55, scale:1, transformOrigin:"41% 45%", ease:Power4.easeOut,autoAlpha:1});
                }

                TweenMax.to(_maskParams, duration, {progress:1, ease:Power1.easeInOut, onUpdate:updateMask, onComplete:function()
                {
                    $oldScene.css("display", "none");
                    if(_isFirefox)
                    {
                        $newScene.toggleClass("svg-clipped", false);
                    }
                    else
                    {
                        $newScene.css("-webkit-clip-path", "none");
                        $newScene.css("-moz-clip-path", "none");
                        $newScene.css("clip-path", "none");
                    }
                }});
            }
            else
            {

                if(_currentIndex == 1)
                {

                    TweenMax.to($doms.light,.5,{delay:.05, scale:0, transformOrigin:"41% 45%", ease:Power3.easeIn,autoAlpha:0});
                }
                else
                {
                    TweenMax.to($doms.light,.5,{delay:.35, scale:1, transformOrigin:"41% 45%", ease:Power3.easeOut,autoAlpha:1});
                }




                TweenMax.set($newScene, {autoAlpha:0});
                TweenMax.to($newScene, 1, {autoAlpha:1, ease:Power1.easeInOut, onComplete:function()
                {
                    $oldScene.css("display", "none");
                }});
            }




        }

        //_maskParams.progress = 0;
        //_maskParams
    }

    function updateMask()
    {
        var $scene = $doms["scene_" + _currentIndex];

        if(_maskParams.progress == 0)
        {
            $scene.css("display", "none");
            return;
        }


        $scene.css("display", "block");


        var w = Main.stageWidth + Main.stageHeight;
        var h = Main.stageHeight * _maskParams.progress;


        var left = (Main.stageWidth - w) * .5;
        var top = (Main.stageHeight - h) * .5;
        var right = left+w;
        var bottom = top+h;

        var centerX = Main.stageWidth*.5;
        var centerY = Main.stageHeight*.5;

        var angle = _maskParams.progress * 180;
        var p0 = rotate_point(left, top, centerX, centerY, angle);
        var p1 = rotate_point(right, top, centerX, centerY, angle);
        var p2 = rotate_point(right, bottom, centerX, centerY, angle);
        var p3 = rotate_point(left, bottom, centerX, centerY, angle);



        if(_isFirefox)
        {
            $doms.indexMask.attr("points",
                p0.x+","+p0.y+" "+
                p1.x+","+p1.y+" "+
                p2.x+","+p2.y+" "+
                p3.x+","+p3.y);
        }
        else
        {
            var string = "polygon("+
                p0.x+"px "+p0.y+"px, "+
                p1.x+"px "+p1.y+"px, "+
                p2.x+"px "+p2.y+"px, "+
                p3.x+"px "+p3.y+"px)";

            $scene.css("-webkit-clip-path", string);
            $scene.css("-moz-clip-path", string);
            $scene.css("clip-path", string);
        }




    }

    function rotate_point(pointX, pointY, originX, originY, angle) {
        angle = angle * Math.PI / 180.0;
        return {
            x: Math.cos(angle) * (pointX-originX) - Math.sin(angle) * (pointY-originY) + originX,
            y: Math.sin(angle) * (pointX-originX) + Math.cos(angle) * (pointY-originY) + originY
        };
    }

    _p.beforeStageIn = function(options)
    {
        changeScene(0, 1);

        setupSceneTexts(1, 0);
        //setupSceneTexts(2, 1);


        function setupSceneTexts(index, alpha)
        {
            var $scene = $doms["scene_" + index];

            if(Main.styleMode == "large")
                TweenMax.set($scene.text_1, {alpha:alpha, x:-100});
            else
                TweenMax.set($scene.text_1, {alpha:1, x:0});

            TweenMax.set($scene.text_2, {alpha:alpha, x:100});
            TweenMax.set($scene.text_3, {alpha:alpha, x:-100});
            TweenMax.set($scene.text_4, {alpha:alpha, x:100});
        }

        TweenMax.set($doms.scrollDownIcon, {autoAlpha:0});

        if(__WG) TweenMax.set($doms.bike, {autoAlpha:0});
    };

    _p.afterStageIn = function(options)
    {
        var $scene = $doms["scene_1"];

        var tl = new TimelineMax;

        if(Main.styleMode == "large")
        {
            tl.staggerTo($scene.textDoms,.9,{alpha:1,x:0,ease:Power3.easeOut},.2);
        }


        //var tl2 = new TimelineMax;
        //tl2.staggerTo($doms["scene_2"].textDoms,.9,{autoAlpha:1,x:0,ease:Power3.easeInOut},.2);
        tl.add(function()
        {
            //changeScene();
            _iconLoop.resume();
            TweenMax.to($doms.scrollDownIcon,.5, {autoAlpha:1});

        }, "-=.5");
        tl.add(function()
        {

            //changeScene();


            _replaceTimer.resume(1);
            if(options && options.onComplete) options.onComplete.apply();

        });


        //_replaceTimer.resume(1);
        //TweenMax.to($doms.bike,.6, {autoAlpha:1, onComplete:options.onComplete});
        if(__WG) TweenMax.to($doms.bike,.6, {autoAlpha:1});
    };

    _p.beforeStageOut = function()
    {
        TweenMax.to($doms.scrollDownIcon,.5, {autoAlpha:0});
        _replaceTimer.pause();

        if(__WG) TweenMax.to($doms.bike,.6, {autoAlpha:0});

        if(_currentIndex != 1)
        {
            TweenMax.to($doms.light,.5,{delay:.3, scale:0, transformOrigin:"41% 45%", ease:Power4.easeOut, autoAlpha:0});
        }
    };

    _p.afterStageOut = function()
    {
        _iconLoop.pause();
    };

    _p.getWgData = function()
    {
        var offset = $doms.bike.offset();
        var containerOffset = $doms.container.offset();

        var id = "/Index";
        var gData = WireGraphic.getData(id);

        var rawWidth = gData.rawWidth;
        var rawHeight = gData.rawHeight;

        var obj = {};
        obj.left = offset.left;
        obj.top = offset.top - containerOffset.top;
        obj.scaleX = $doms.bike.width() / rawWidth;
        obj.scaleY = $doms.bike.height() / rawHeight;

        obj.id = id;

        return obj;
    };

    _p.onResize = function (width, height, bgBound, modeChanged, styleMode)
    {
        if(modeChanged) fetchGeom(styleMode);

        var bound = bgBound;
        var bound2 = bgBound;
        if(Main.styleMode == "small") bound2 = Helper.getSize_contain(width, height, 720, 1280);

        Helper.applyTransform($doms.bike[0], bound2.ratio, ["w", "h", "ml", "mt"], null, null, styleMode);
        Helper.applyTransform($doms.light[0], bound2.ratio, ["w", "h", "ml", "mt"], null, null, styleMode);

        Helper.applyTransform($doms.scrollDownIcon[0], bound.ratio, ["w", "h", "ml", "b"]);

        updateScene(1);
        updateScene(2);

        function updateScene(index)
        {
            var $scene = $doms["scene_" + index];
            var bgDom = $scene.background[0];
            $(bgDom).css("width", bound.width).css("height", bound.height).css("left", (width - bound.width) *.5).css("top", (height - bound.height) *.5);

            Helper.applyTransform($scene.text_1[0], bound2.ratio, ["w", "h", "ml", "mt"], null, null, styleMode);
            Helper.applyTransform($scene.text_2[0], bound2.ratio, ["w", "h", "ml", "mt"], null, null, styleMode);
            Helper.applyTransform($scene.text_3[0], bound2.ratio, ["w", "h", "ml", "mt"], null, null, styleMode);
            Helper.applyTransform($scene.text_4[0], bound2.ratio, ["w", "h", "ml", "mt"], null, null, styleMode);
            //Helper.applyTransform($scene.text_2[0], bound.ratio, ["w", "h", "ml", "mt"]);
        }

    };

}());