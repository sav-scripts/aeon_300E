(function ()
{

    var _p = window.Feature = {};
    var $doms = {};

    var _fetcheredDic =
    {
        small:false,
        large:false
    };

    var _currentIndex = -1;
    var _numContents = 4;

    var _firstIndex = 1;

    var _offsetDic =
    {
        "small":
        {
            1:null,
            2:null,
            3:null,
            4:null
        },
        "large":
        {
            1:null,
            2:null,
            3:null,
            4:null
        }
    };

    _p.init = function ()
    {
        $doms.container = $("#feature_block");
        $doms.iconGroup = $(".feature_icon_group");

        Helper.getInitValue($doms.iconGroup[0]);

        setupContent(1);
        setupContent(2);
        setupContent(3);
        setupContent(4);

        fetchGeom(Main.styleMode);



        SvgMaskLayer.init(_offsetDic[Main.styleMode][1]);
        //SvgMaskLayer.onResize();
        //SvgMaskLayer.updatePosition(_offsetDic[1], true);

        function setupContent(index)
        {
            var $dom = $doms["feature_" + index] = $doms.container.find(".feature_" + index);

            Helper.getInitValue($dom[0]);
            var v = $dom[0].init;


            $dom.$btnIcon =  $doms.iconGroup.find(".feature_icon:nth-of-type("+index+")");

            $dom.$btnIcon.bind("mousedown", function()
            {
                if(Main.getPlaying()) return;
                if(_currentIndex == index) return;

                _p.toContent(index);
            });

            var $bike = $dom.$bike = $dom.find(".feature_bike");
            //Helper.pxToPercent($bike[0], v.w, v.h);

            var $desc = $dom.$desc = $dom.find(".description");
            //Helper.pxToPercent($desc[0], v.w, v.h);

            var $bigDot = $dom.$bigDot = $dom.find(".dot_big");
            //Helper.pxToPercent($bigDot[0], v.w, v.h);

            var $bigDotCore = $bigDot.find(".dot_core");
            var $bigDotGlow = $bigDot.find(".dot_glow");

            var $smallDot = $dom.$smallDot = $dom.find(".dot_small");
            //Helper.pxToPercent($smallDot[0], v.w, v.h, {"left":true, "top":false});

            $dom.childList = [$bike[0], $desc[0], $bigDot[0], $smallDot[0]];

            var $line = $dom.$line = $dom.find(".dot_line");
            Helper.pxToPercent($line[0], v.w, v.h);
            $dom.vv = new Vivus('dot_line_' + index, {type: 'delayed', duration: 30, start:"manual", animTimingFunction: Vivus.EASE_IN}, onVVComplete);


            var $line2 = $dom.$line2 = $dom.find(".dot_line_v2");
            Helper.pxToPercent($line2[0], v.w, v.h);

            $dom.vv2 = new Vivus('dot_line_' + index + "_v2", {type: 'delayed', duration: 10, start:"manual", animTimingFunction: Vivus.EASE_IN}, onVVComplete);


            $dom.css("visibility", "visible");

            if(index == _currentIndex)
            {
                $dom.css("display", "block");
            }
            else
            {
                $dom.css("display", "none");
            }

            var twinkle = $dom.twinkle = new TimelineMax({repeat:-1, paused:true});

            //twinkle.set($bigDotGlow, {scale:0, alpha:1});
            twinkle.set($bigDotGlow, {alpha:1});
            //twinkle.to($bigDotGlow,.5, {scale:1});
            twinkle.to($bigDotGlow,1, {ease:Linear.easeNone, alpha:0});
            twinkle.to($bigDotGlow,1, {ease:Linear.easeNone, alpha:1});
            //twinkle.to($bigDotGlow,.4, {alpha:0});

            $dom.hideChilds = function(instantly, cb)
            {
                twinkle.pause();

                if(Main.styleMode == "small") instantly = true;

                if(instantly)
                {
                    TweenMax.set($dom.childList, {autoAlpha:0});
                    if(cb) cb.apply();
                }
                else
                {
                    var tl = new TimelineMax;
                    tl.to($desc,.5, {autoAlpha:0},.0);
                    tl.to($bigDot,.5, {autoAlpha:0},.1);
                    tl.to($line,.5, {autoAlpha:0},.1);
                    tl.to($line2,.5, {autoAlpha:0},.1);
                    tl.to($smallDot,.5, {autoAlpha:0},.1);
                    tl.to($bike,.5, {autoAlpha:0},.2);
                    tl.add(function()
                    {
                        if(cb) cb.apply();
                    });
                }
            };

            var cbAfterPlayed;
            var vvCompletePlayed = false;

            $dom.playChilds = function(cb)
            {
                cbAfterPlayed = cb;

                vvCompletePlayed = false;

                twinkle.restart();

                $dom.vv.reset();
                $dom.vv2.reset();
                TweenMax.set($line, {autoAlpha:1});
                TweenMax.set($line2, {autoAlpha:1});

                var duration = Main.styleMode == "large"? .5: 0;


                var tl = new TimelineMax;

                tl.set($bigDotCore,{scale:0});
                tl.set($bigDotGlow,{scale:0});

                tl.to($bike,duration, {autoAlpha:1});
                tl.to($smallDot,duration, {autoAlpha:1},.0);
                tl.add(function ()
                {

                    $dom.vv.play();
                    $dom.vv2.play();

                    //Main.styleMode == "small"? $dom.vv2.play(): $dom.vv.play();
                },.0);

            };

            function onVVComplete()
            {
                if(vvCompletePlayed) return;
                vvCompletePlayed = true;

                var tl = new TimelineMax;
                tl.to($bigDot,.5, {autoAlpha:1});
                tl.to($desc,.5, {autoAlpha:1},.2);

                tl.to($bigDotCore,.5,{scale:1, ease:Back.easeOut}, 0);
                tl.to($bigDotGlow,.5,{scale:1, ease:Back.easeOut},.2);
                tl.add(function()
                {
                    twinkle.restart();
                },.2);

                tl.add(function()
                {
                   if(cbAfterPlayed)
                   {
                       cbAfterPlayed.apply();
                       cbAfterPlayed = null;
                   }
                });
            }
        }
    };



    function fetchGeom(mode)
    {
        if(_fetcheredDic[mode]) return;
        _fetcheredDic[mode] = true;



        var oldContainerDisplay = $doms.container.css("display");
        $doms.container.css("display", "block");

        fetcherOne(1);
        fetcherOne(2);
        fetcherOne(3);
        fetcherOne(4);

        $doms.container.css("display", oldContainerDisplay);

        function fetcherOne(index)
        {
            var $dom = $doms["feature_" + index];

            var oldDisplay = $dom.css("display");
            $dom.css("display", "block");

            var positionPercent = $dom.position().left / $dom.parent().width() * 100;
            _offsetDic[mode][index] = positionPercent / 100;


            var v = {w:100, h:100};


            Helper.getInitValue($dom.$bike[0], true, [], {width: v.w, height: v.h}, true, mode);
            Helper.getInitValue($dom.$desc[0], true, [], {width: v.w, height: v.h}, true, mode);
            Helper.getInitValue($dom.$bigDot[0], true, [], {width: v.w, height: v.h}, true, mode);
            Helper.getInitValue($dom.$smallDot[0], true, [], {width: v.w, height: v.h, styleDic:{l:true, t:false}}, true, mode);
            //Helper.getInitValue($dom.$line[0], true, [], {width: v.w, height: v.h}, true, mode);
            //Helper.getInitValue($dom.$line2[0], true, [], {width: v.w, height: v.h}, true, mode);

            $dom.css("display", oldDisplay);
        }

        /*

        Helper.getInitValue($doms.rightGroup[0], null, null, null, true, mode);

        Helper.getInitValue($doms.triangle[0], null, null, null, true, mode);

        var v = $doms.rightGroup[0].init[mode];

        Helper.getInitValue($doms.centerBlack[0], true, [], {width: v.w, height: v.h}, true, mode);

        Helper.getInitValue($doms.contentText[0], true, ["font-size", "line-height", "letter-spacing"], {width: v.w, height: v.h}, true, mode);
        Helper.getInitValue($doms.title[0], true, ["font-size"], null, true, mode);

        Helper.getInitValue($doms.bike[0], null, null, null, true, mode);
        */
    }

    _p.changeIndex = function(index)
    {
        $(".feature_icon").toggleClass("selected", false);
        _currentIndex = index;

        var $dom = $doms["feature_" + _currentIndex];
        $dom.$btnIcon.toggleClass("selected", true);

    };

    _p.toContent = function(index, updateNow, cb)
    {

        //if(index == _currentIndex) return;


        var $old, $new;

        if(updateNow)
        {
            if(_currentIndex != -1 && _currentIndex != index)
            {
                $old = $doms["feature_" + _currentIndex];
                $old.css("display", "none");
                $old.vv.stop();
                $old.vv2.stop();
            }

            $new = $doms["feature_" + index];
            $new.css("display", "block");
            $new.vv.reset();
            $new.vv2.reset();

            $new.hideChilds(true);


            //Main.setPlaying(true);


            _p.changeIndex(index);

            SvgMaskLayer.toPercent(_offsetDic[Main.styleMode][index], null, true);

            //Main.setPlaying(false);
        }
        else
        {
            Main.setPlaying(true);

            $old = $doms["feature_" + _currentIndex];
            $new = $doms["feature_" + index];

            _p.changeIndex(index);

            //TweenMax.set($new.childList, {autoAlpha:0});

            $new.hideChilds(true);
            $new.css("display", "block");

            $old.hideChilds(false, function()
            {
               $old.css("display", "none");
            });

            $new.playChilds(function()
            {
                Main.setPlaying(false);
                if(cb) cb.apply();
            });


            SvgMaskLayer.toPercent(_offsetDic[Main.styleMode][index],function()
            {

                /*
                Main.setPlaying(false);
                if(cb) cb.apply();
                */

            }, false);
        }



    };

    _p.requestScroll = function(direction)
    {
        var targetIndex = _currentIndex + direction;

        if(targetIndex <= 0 || targetIndex > _numContents)
        {
            return false;
        }
        else
        {
            _p.toContent(targetIndex, false, function()
            {
                Main.triggerCbAfterChange();
            });

            return true;
        }
    };

    _p.beforeStageIn = function(options)
    {
        if(options && options.isScrollUp)
        {
            _p.toContent(_numContents, true);
        }
        else
        {
            _p.toContent(_firstIndex, true);
        }

        if(!__WG) TweenMax.set(SvgMaskLayer.dom, {autoAlpha:0, x:200});

        TweenMax.set($doms.iconGroup, {autoAlpha:0, x:100});
    };

    _p.afterStageIn = function(options)
    {
        TweenMax.to($doms.iconGroup,.5, {autoAlpha:1, x:0});

        TweenMax.to(SvgMaskLayer.dom,.5, {autoAlpha:1, x:0});

        SvgMaskLayer.play();

        $doms["feature_" + _currentIndex].playChilds(function()
        {
           if(options && options.onComplete)
            {
                options.onComplete.apply();
                //TweenMax.delayedCall(.6, options.onComplete);
            }
        });


    };

    _p.beforeStageOut = function()
    {
        if(__WG)
        {
            var $dom = $doms["feature_" + _currentIndex];
            $dom.hideChilds(false, function()
            {
                $dom.css("display", "none");
            });
        }

        SvgMaskLayer.pause();
    };

    _p.afterStageOut = function()
    {
        SvgMaskLayer.pause();
    };


    _p.getWgData = function()
    {
        var $bike = $doms["feature_" + _currentIndex].$bike;

        var offset = $bike.offset();
        var containerOffset = $doms.container.offset();

        var id;

        if(_currentIndex == 1)
        {
            id = "/Feature"
        }
        else
        {
            id = "/Index"
        }

        var gData = WireGraphic.getData(id);

        var rawWidth = gData.rawWidth;
        var rawHeight = gData.rawHeight;

        var obj = {};
        obj.left = offset.left;
        obj.top = offset.top - containerOffset.top;
        obj.scaleX = $bike.width() / rawWidth;
        obj.scaleY = $bike.height() / rawHeight;

        obj.id = id;

        return obj;
    };

    _p.onResize = function (width, height, bgBound, modeChanged, styleMode)
    {
        SvgMaskLayer.onResize(width, height);

        if(modeChanged) fetchGeom(styleMode);


        var bound2 = bgBound;
        if(Main.styleMode == "small") bound2 = Helper.getSize_contain(width, height, 720, 1280);

        Helper.applyTransform($doms.feature_1[0], bound2.ratio, ["w", "h"]);
        Helper.applyTransform($doms.feature_2[0], bound2.ratio, ["w", "h"]);
        Helper.applyTransform($doms.feature_3[0], bound2.ratio, ["w", "h"]);
        Helper.applyTransform($doms.feature_4[0], bound2.ratio, ["w", "h"]);

        updateOne(1);
        updateOne(2);
        updateOne(3);
        updateOne(4);


        function updateOne(index)
        {
            var $dom = $doms["feature_" + index];
            //Helper.applyTransform($dom[0], bgBound.ratio, ["w", "h"]);

            Helper.applyTransform($dom.$bike[0], bgBound.ratio, null, null, ["w", "h", "t", "l"], styleMode);
            Helper.applyTransform($dom.$desc[0], bgBound.ratio, null, null, ["w", "h", "t", "l"], styleMode);
            Helper.applyTransform($dom.$bigDot[0], bgBound.ratio, null, null, ["w", "h", "t", "l"], styleMode);
            Helper.applyTransform($dom.$smallDot[0], bgBound.ratio, null, null, ["t", "l"], styleMode);
            //Helper.applyTransform($dom.$line[0], bgBound.ratio, null, null, ["w", "h", "t", "l"], styleMode);
            //Helper.applyTransform($dom.$line2[0], bgBound.ratio, null, null, ["w", "h", "t", "l"], styleMode);
        }


        Helper.applyTransform($doms.iconGroup[0], bgBound.ratio, ["r", "b"]);
        //TweenMax.set($doms.iconGroup, {scale:bgBound.ratio, transformOrigin:"right bottom"});
    };

}());



(function(){

    var _p = window.SvgMaskLayer = {};

    var _width, _height;
    var _currentCenter = .5;
    var _rawTextureWidth = 576,
        _rawTextureCenter = 555,
        _textureWidth = _rawTextureWidth,
        _textureCenter = _rawTextureCenter;

    var _startIndex = 1, _endIndex = 6, _currentIndex = 1;

    _p.center = _currentCenter;

    var _tl;

    var $doms = {};

    _p.init = function(centerPercent)
    {
        $doms.container = $(".parallelogram");

        _p.dom = $doms.container[0];

        _currentCenter = centerPercent;



        /*
        $doms.shapes = $doms.container.children("g");

        var i, duration = .6, gap = .2;

        for(i=_startIndex;i<=_endIndex;i++)
        {
            var $dom = $($doms.shapes[i]);
            //$dom.css("display", "none");

            TweenMax.set($dom, {autoAlpha:0});

            //_tl.to($dom, duration, {autoAlpha:1, ease:Power1.easeIn}, gap*count);
            //_tl.to($dom, duration, {autoAlpha:0, ease:Power1.easeOut}, duration + gap*count);

            //count ++;
        }

        _tl = new TimelineMax({paused:true, repeat:-1});

        _tl.add(function()
        {
            var $dom = $($doms.shapes[_currentIndex]);
            TweenMax.to($dom, duration, {autoAlpha:1, ease:Power1.easeOut});
            TweenMax.to($dom, duration, {delay:duration, autoAlpha:0, ease:Power1.easeIn});

            _currentIndex ++;
            if(_currentIndex > _endIndex) _currentIndex = _startIndex;
        },gap);
        */

    };

    _p.toPercent = function(centerPercent, cb, updateNow)
    {
        var duration = .6;


        _currentCenter = centerPercent;

        if(updateNow)
        {
            _p.center = _currentCenter;
            _p.update();
            if(cb) cb.apply();
        }
        else
        {
            TweenMax.killTweensOf(_p);
            TweenMax.to(_p, duration, {center:_currentCenter, onUpdate:_p.update, onComplete:cb});
        }

    };

    /*
    _p.updatePosition = function(centerPercent, updateNow)
    {
        _currentCenter = centerPercent;
        _p.up
    };
    */

    _p.play = function()
    {
        //_tl.resume();
    };

    _p.pause = function()
    {
        //_tl.pause();
    };

    _p.update = function()
    {
        $doms.container.css("left", _width * _p.center - _textureCenter);
    };


    _p.onResize = function (width, height, bgBound)
    {
        if(!width && !height)
        {
            width = $(window).width();
            height = $(window).height();
        }

        _width = width;
        _height = height;

        var ratio = _height / Main.rawHeight;

        /*
        $doms.container.attr("height", _height);
        $doms.container.attr("width", Main.rawWidth * ratio);
        */

        $doms.container.css("width", 1110 * ratio).css("height", _height);

        _textureWidth = _rawTextureWidth * ratio;
        _textureCenter = _rawTextureCenter * ratio;

        _p.update();
    };

}());