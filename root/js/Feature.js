(function ()
{

    var _p = window.Feature = {};
    var $doms = {};

    var _currentIndex = 1;
    var _numContents = 4;

    var _offsetDic =
    {
        1:.6,
        2:.2,
        3:.8,
        4:.4
    }

    _p.init = function ()
    {
        $doms.container = $("#feature_block");

        setupContent(1);
        setupContent(2);
        setupContent(3);
        setupContent(4);

        function setupContent(index)
        {
            var $dom = $doms["feature_" + index] = $doms.container.find(".feature_" + index);

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

        SvgMaskLayer.init();
        SvgMaskLayer.onResize();
        SvgMaskLayer.updatePosition(_offsetDic[1], true);
    };

    _p.toContent = function(index, updateNow)
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

        Main.setPlaying(true);


        _currentIndex = index;

        SvgMaskLayer.toPercent(_offsetDic[index],function()
        {

            Main.setPlaying(false);
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
            _p.toContent(targetIndex);

            return true;
        }
    };

    _p.beforeStageIn = function()
    {
        _p.toContent(1, true);
    };

    _p.onResize = function (width, height)
    {
        SvgMaskLayer.onResize(width, height);
    };

}());


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