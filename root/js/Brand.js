(function ()
{

    var _p = window.Brand = {};

    var $doms = {};

    var _fetcheredDic =
    {
        small:false,
        large:false
    };

    _p.init = function ()
    {
        $doms.container = $("#brand_block");

        $doms.rightGroup = $doms.container.find(".right_group");
        //Helper.getInitValue($doms.rightGroup[0]);

        $doms.centerBlack = $doms.container.find(".center_black");
        $doms.contentText = $doms.container.find(".content_text");
        $doms.title = $doms.container.find(".title_text");
        $doms.triangle = $doms.container.find(".little_triangle");

        $doms.text_1 = $doms.container.find(".text_row_1");
        $doms.text_2 = $doms.container.find(".text_row_2");
        $doms.text_3 = $doms.container.find(".text_row_3");
        $doms.text_4 = $doms.container.find(".text_row_4");

        //Helper.getInitValue($doms.triangle[0]);

        //Helper.pxToPercent($doms.centerBlack[0], v.w, v.h);
        //Helper.pxToPercent($doms.contentText[0], v.w, v.h);

        //Helper.getInitValue($doms.contentText[0], true, ["font-size", "line-height", "letter-spacing"]);
        //Helper.getInitValue($doms.title[0], true, ["font-size"]);

        $doms.bike = $doms.container.find(".brand_bike");
        Helper.getInitValue($doms.bike[0]);
        //Helper.getInitValue($doms.bike[0]);

        fetchGeom(Main.styleMode);
    };

    function fetchGeom(mode)
    {
        if(_fetcheredDic[mode]) return;
        _fetcheredDic[mode] = true;

        //Helper.clearStyles($doms.rightGroup[0]);

        Helper.getInitValue($doms.rightGroup[0], null, null, null, true, mode);

        Helper.getInitValue($doms.triangle[0], null, null, null, true, mode);

        //Helper.pxToPercent($doms.centerBlack[0], v.w, v.h);
        //Helper.pxToPercent($doms.contentText[0], v.w, v.h);

        var v = $doms.rightGroup[0].init[mode];

        Helper.getInitValue($doms.centerBlack[0], true, [], {width: v.w, height: v.h}, true, mode);

        Helper.getInitValue($doms.contentText[0], true, ["font-size", "line-height", "letter-spacing"], {width: v.w, height: v.h}, true, mode);
        Helper.getInitValue($doms.title[0], true, ["font-size"], null, true, mode);

    }

    _p.beforeStageIn = function()
    {
        var dx = 300;

        TweenMax.set($doms.text_1, {x:-dx, autoAlpha:0});
        TweenMax.set($doms.text_2, {x:dx, autoAlpha:0});
        TweenMax.set($doms.text_3, {x:-dx, autoAlpha:0});
        TweenMax.set($doms.text_4, {x:dx, autoAlpha:0});

        TweenMax.set($doms.centerBlack, {scale:0});
        TweenMax.set($doms.contentText, {autoAlpha:0});
        TweenMax.set($doms.triangle, {autoAlpha:0});

        if(__WG) TweenMax.set($doms.bike, {autoAlpha:0});
    };

    _p.afterStageIn = function(options)
    {
        if(__WG) TweenMax.to($doms.bike,.5, {autoAlpha:1});

        var d1 = 1;
        var e1 = Power3.easeOut;

        var tl = new TimelineMax();

        tl.to($doms.text_1,d1, {ease:e1, x:0, autoAlpha:1});
        tl.to($doms.text_2,d1, {ease:e1, x:0, autoAlpha:1},.2);
        tl.to($doms.text_3,d1, {ease:e1, x:0, autoAlpha:1},.4);
        tl.to($doms.text_4,d1, {ease:e1, x:0, autoAlpha:1},.6);

        tl.to($doms.centerBlack,.8, {scale:1, ease:Power3.easeOut});
        tl.to($doms.contentText,1, {autoAlpha:1}, "-=.0");
        tl.to($doms.triangle,.5, {autoAlpha:1, onComplete:options.onComplete}, "-=.5");

    };

    _p.beforeStageOut = function()
    {
        if(__WG) TweenMax.to($doms.bike,.5, {autoAlpha:0});
    };

    _p.getWgData = function()
    {
        var offset = $doms.bike.offset();
        var containerOffset = $doms.container.offset();

        var id = "/Brand";
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
        var v = $doms.bike[0].init;
        $doms.bike.width(v.w / v.h * height).height(height).css("left", 0).css("top", 0);

        if(modeChanged) fetchGeom(styleMode);


        Helper.applyTransform($doms.rightGroup[0], bgBound.ratio, ["w", "h", "ml", "mt"], null, null, styleMode);
        Helper.applyTransform($doms.triangle[0], bgBound.ratio, ["w", "h", "l", "t"], null, null, styleMode);

        Helper.applyTransform($doms.contentText[0], bgBound.ratio, ["font-size", "line-height", "letter-spacing"], null, ["t", "l", "w", "h"], styleMode);
        Helper.applyTransform($doms.centerBlack[0], bgBound.ratio, null, null, ["t", "l", "w", "h"], styleMode);
        Helper.applyTransform($doms.title[0], bgBound.ratio, ["font-size"], null, null, styleMode);
    };

}());