(function ()
{

    var _p = window.Feature = {};
    var $doms = {};

    var _currentIndex = -1;
    var _numContents = 4;

    var _firstIndex = 1;

    var _offsetDic =
    {
        1:null,
        2:null,
        3:null,
        4:null
    };

    _p.init = function ()
    {
        $doms.container = $("#feature_block");

        setupContent(1, true);
        setupContent(2);
        setupContent(3);
        setupContent(4);




        function setupContent(index, isFeature1)
        {
            var $dom = $doms["feature_" + index] = $doms.container.find(".feature_" + index);

            var positionPercent = $dom.position().left / $dom.parent().width() * 100;

            _offsetDic[index] = positionPercent / 100;

            Helper.getInitValue($dom[0]);
            var v = $dom[0].init;

            var image;

            if(isFeature1)
            {
                image = WireGraphic.getData("/Feature").image;
            }
            else
            {
                image = new Image();
                image.src = WireGraphic.getData("/Index").image.src;
            }

            $dom.find(".feature_bike").parent().append(image);
            $dom.find(".feature_bike").detach();

            image.className = "feature_bike";


            var $bike = $dom.$bike = $dom.find(".feature_bike");
            Helper.pxToPercent($bike[0], v.w, v.h);

            var $desc = $dom.find(".description");
            Helper.pxToPercent($desc[0], v.w, v.h);

            var $bigDot = $dom.find(".dot_big");
            Helper.pxToPercent($bigDot[0], v.w, v.h);

            var $smallDot = $dom.find(".dot_small");
            Helper.pxToPercent($smallDot[0], v.w, v.h, {"left":true, "top":false});

            var $line = $dom.find(".dot_line");
            Helper.pxToPercent($line[0], v.w, v.h);

            $dom.vv = new Vivus('dot_line_' + index, {type: 'delayed', duration: 50, start:"manual", animTimingFunction: Vivus.EASE_IN});

            $dom.css("visibility", "visible");

            if(index == _currentIndex)
            {
                $dom.css("display", "block");
            }
            else
            {
                $dom.css("display", "none");
            }
        }

        SvgMaskLayer.init(_offsetDic[1]);
        //SvgMaskLayer.onResize();
        //SvgMaskLayer.updatePosition(_offsetDic[1], true);
    };

    _p.toContent = function(index, updateNow, cb)
    {

        if(index == _currentIndex) return;

        //Main.setPlaying(true);
        //
        //var $current = $doms["feature_" + _currentIndex];
        //var $target = $doms["feature_" + index];
        //
        //
        //var startTop = index > _currentIndex? Main.stageHeight: -Main.stageHeight;
        //var targetTop = index > _currentIndex? -Main.stageHeight: Main.stageHeight;
        //
        //$target.css("display", "block").css("top", startTop);
        //
        //
        //TweenMax.to($target,1, {top:0});
        //TweenMax.to($current,1, {top:targetTop, onComplete:function()
        //{
        //    $current.css("display", "none");
        //    Main.setPlaying(false);
        //}});



        if(_currentIndex != -1)
        {
            var $old = $doms["feature_" + _currentIndex];
            $old.css("display", "none");
            $old.vv.stop();
        }

        var $new = $doms["feature_" + index];

        $new.css("display", "block");

        $new.vv.reset();


        Main.setPlaying(true);


        _currentIndex = index;

        SvgMaskLayer.toPercent(_offsetDic[index],function()
        {
            $new.vv.play();
            Main.setPlaying(false);
            if(cb) cb.apply();

        }, updateNow);

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

    _p.beforeStageIn = function()
    {
        _p.toContent(_firstIndex, true);
    };

    _p.afterStageIn = function(options)
    {
        SvgMaskLayer.play();

        if(options && options.onComplete)
        {
            TweenMax.delayedCall(.6, options.onComplete);
        }
    };

    _p.beforeStageOut = function()
    {
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

    _p.onResize = function (width, height, bgBound)
    {
        SvgMaskLayer.onResize(width, height);


        Helper.applyTransform($doms.feature_1[0], bgBound.ratio, ["w", "h"]);
        Helper.applyTransform($doms.feature_2[0], bgBound.ratio, ["w", "h"]);
        Helper.applyTransform($doms.feature_3[0], bgBound.ratio, ["w", "h"]);
        Helper.applyTransform($doms.feature_4[0], bgBound.ratio, ["w", "h"]);
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

        _currentCenter = centerPercent;

        $doms.shapes = $doms.container.children("g");

        //console.log($doms.shapes.length);




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
        _tl.pause();
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
        $doms.container.attr("height", _height);
        $doms.container.attr("width", Main.rawWidth * ratio);

        _textureWidth = _rawTextureWidth * ratio;
        _textureCenter = _rawTextureCenter * ratio;

        _p.update();
    };

}());


/*
(function(){

    var _p = window.SvgMaskLayer = {};

    var $doms = {};

    var _width = 0, _height = 0;

    var _textureWidth = 400;

    _p.right = 0;
    _p.left = 0;
    _p.offset = 600;

    _p.centerPercent = 0;

    var _targetRight;
    var _targetLeft;

    _p.init = function()
    {
        $doms.container = $("#feature_block").find(".svg_layer");

        $doms.svg = $doms.container.find("svg");
        $doms.leftPolygon = $doms.svg.find(".left_polygon");
        $doms.rightPolygon = $doms.svg.find(".right_polygon");
    };

    _p.toPercent = function(centerPercent, cb, updateNow)
    {
        var duration = .6;

        var oldTargetRight = _targetRight;
        _p.updatePosition(centerPercent, updateNow);


        if(!updateNow)
        {
            var tl = new TimelineMax();


            if(_targetRight < oldTargetRight)
            {
                tl.to(_p,duration,{ease:Back.easeOut, left:_targetLeft, onUpdate:_p.update});
                tl.to(_p,duration,{ease:Back.easeOut, right:_targetRight, onUpdate:_p.update, onComplete:cb},.1);
            }
            else
            {
                tl.to(_p,duration,{ease:Back.easeOut, right:_targetRight, onUpdate:_p.update});
                tl.to(_p,duration,{ease:Back.easeOut, left:_targetLeft, onUpdate:_p.update, onComplete:cb},.1);
            }
        }
        else
        {
            if(cb) cb.apply();
        }

    };

    _p.updatePosition = function(centerPercent, updateNow)
    {
        _targetRight = _width * (1-centerPercent) - _height * .25 - _textureWidth * .5;
        _targetLeft = _width - _targetRight - _textureWidth;

        if(updateNow)
        {
            _p.right = _targetRight;
            _p.left = _targetLeft;
            _p.update();
        }
    };

    _p.update = function()
    {
        $doms.svg.attr("width", _width).attr("height", _height);


        //var x0 = _width * (_p.right - _p.width);
        //var x1 = _width * (_p.right);
        //var x2 = _width * (_p.right - _p.offset);
        //var x3 = _width * (_p.right - _p.offset - _p.width);

        //var x0 = _width - _p.right - _p.width;
        //var x1 = _width - _p.right;
        //var x2 = _width - _p.right - _p.offset;
        //var x3 = _width - _p.right - _p.offset - _p.width;

        //var ho = _height * .5;

        var x0 = _p.left;
        var x1 = _width - _p.right;
        var x2 = _width - _p.right - _p.offset;
        var x3 = _p.left - _p.offset;


        $doms.leftPolygon.attr("points", "0,0 "+x0+",0 "+x3+","+_height+" 0," + _height);
        $doms.rightPolygon.attr("points", x1+",0 "+_width+",0 "+_width+","+_height+" "+x2+","+_height+"");
    };


    _p.onResize = function (width, height)
    {
        if(!width && !height)
        {
            width = $(window).width();
            height = $(window).height();
        }


        _width = width;
        _height = height;

        _textureWidth = _width * .2;

        _p.offset = height * .5;

        _p.update();
    };
    
}());
*/