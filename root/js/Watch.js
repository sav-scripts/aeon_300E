(function ()
{

    var _p = window.Watch = {};

    var _currentIndex = 0;

    var _isActive = false;

    var $doms = {};

    _p.init = function ()
    {
        $doms.container = $("#watch_block");

        $doms.centerGroup = $doms.container.find(".center_group");
        Helper.getInitValue($doms.centerGroup[0]);

        $doms.bikeGroup = $doms.container.find(".watch_bike_group");
        Helper.getInitValue($doms.bikeGroup[0]);


        $doms.text_1 = $doms.container.find(".text_row_1");
        $doms.text_2 = $doms.container.find(".text_row_2");
        $doms.text_3 = $doms.container.find(".text_row_3");
        $doms.text_4 = $doms.container.find(".text_row_4");


        var image;

        image = new Image();
        image.src = WireGraphic.getData("/Feature").image.src;

        $doms.container.find(".watch_bike_1").parent().append(image);
        $doms.container.find(".watch_bike_1").detach();

        image.className = "watch_bike_1";


        //$doms.bike1 = $doms.bikeGroup.find(".watch_bike_1");
        //Helper.pxToPercent($doms.bike1[0], 100,100);

        $doms.contents = [];

        addContent(1);
        addContent(2);
        addContent(3);
        addContent(4);
        addContent(5);
        addContent(6);

        function addContent(domIndex)
        {
            var $dom = $doms["bike_" + domIndex] = $doms.bikeGroup.find(".watch_bike_" + domIndex);
            Helper.pxToPercent($dom, 100,100);

            $doms.contents[domIndex-1] = $dom[0];

            if(_currentIndex != (domIndex-1)) $dom.css("display", "none");
        }

        if(BrowserDetect.isMobile && ('DeviceOrientationEvent' in window))
        {
            window.addEventListener('deviceorientation', handleOrientation);
        }
        else
        {
            bindMouseTrigger();
        }

    };

    function handleOrientation(event)
    {
        //trace(Main.settings.isVerticalMode);

        if(!_isActive) return;

        var v, totalArc, halfArc;

        if(Main.settings.isVerticalMode)
        {
            v = event.gamma;
            totalArc = 60;
        }
        else
        {
            v =  -event.beta;
            totalArc = 60;
        }
        halfArc = totalArc*.5;



        if(v == null)
        {
            bindMouseTrigger();
            window.removeEventListener("deviceorientation", handleOrientation);
        }
        else
        {
            var arc = v;
            if(arc < -halfArc) arc = -halfArc;
            if(arc > halfArc) arc = halfArc;
            updateFrame((totalArc - (arc+halfArc))/totalArc);
        }


    }

    function updateFrame(ratio)
    {
        //trace(ratio);
        if(ratio >= 1) ratio = .99;
        var index = parseInt(ratio * 7) + 3;
        index = index * -1 + 12;
        //console.log("index = " + index);
        index = index % 6;

        if(index != _currentIndex)
        {
            var oldIndex = _currentIndex;
            _currentIndex = index;
            var $old = $($doms.contents[oldIndex]);
            var $current = $($doms.contents[_currentIndex]);

            $old.css("display", "none").css("z-index", 0);
            $current.css("display", "block").css("z-index", 1);

            //TweenMax.set($current, {alpha:0});
            //TweenMax.to($current,.1, {alpha:1});

        }
    }

    function bindMouseTrigger()
    {
        $doms.container.bind("mousemove", function(event)
        {
            if(!_isActive) return;
            var ratio = event.clientX / $(window).width();
            updateFrame(ratio);

        });
    }

    _p.beforeStageIn = function()
    {
        updateFrame(.5);

        var dx = 300;

        TweenMax.set($doms.text_1, {x:-dx, autoAlpha:0});
        TweenMax.set($doms.text_2, {x:dx, autoAlpha:0});
        TweenMax.set($doms.text_3, {x:-dx, autoAlpha:0});
        TweenMax.set($doms.text_4, {x:dx, autoAlpha:0});

        TweenMax.set($doms.bike_1, {autoAlpha:0});

    };

    _p.afterStageIn = function(options)
    {
        var tl = new TimelineMax;
        var d1 = .6;
        var e1 = Power1.easeOut;

        tl.to($doms.text_1,d1, {ease:e1, x:0, autoAlpha:1});
        tl.to($doms.text_2,d1, {ease:e1, x:0, autoAlpha:1},.1);
        tl.to($doms.text_3,d1, {ease:e1, x:0, autoAlpha:1},.2);
        tl.to($doms.text_4,d1, {ease:e1, x:0, autoAlpha:1},.3);

        TweenMax.to($doms.bike_1,.6, {autoAlpha:1, onComplete:function()
        {
            _isActive = true;

            if(options && options.onComplete)
            {
                options.onComplete.apply();
            }
        }});

    };

    _p.beforeStageOut = function()
    {
        _isActive = false;
        updateFrame(.5);

        TweenMax.to($doms.bike_1,.5, {autoAlpha:0});
    };

    _p.getWgData = function()
    {
        var $dom = $doms.bike_1;
        var offset = $dom.offset();
        var containerOffset = $doms.container.offset();

        var id = "/Feature";
        var gData = WireGraphic.getData(id);

        var rawWidth = gData.rawWidth;
        var rawHeight = gData.rawHeight;

        var obj = {};
        obj.left = offset.left;
        obj.top = offset.top - containerOffset.top;
        obj.scaleX = $dom.width() / rawWidth;
        obj.scaleY = $dom.height() / rawHeight;

        obj.id = id;

        return obj;
    };

    _p.onResize = function (width, height, bgBound)
    {

        Helper.applyTransform($doms.centerGroup[0], bgBound.ratio, ["w", "h", "ml", "mt"]);
        Helper.applyTransform($doms.bikeGroup[0], bgBound.ratio, ["w", "h"]);
    };

}());