(function ()
{

    var _p = window.Detail = {};

    var $doms = {};

    var _fetcheredDic =
    {
        small:false,
        large:false
    };

    _p.init = function ()
    {
        $doms.container = $("#detail_block");


        $doms.blackBike = $doms.container.find(".left_bike_2", $doms.container[0]);
        $doms.whiteBike = $doms.container.find(".left_bike_1", $doms.container[0]);
        $doms.bikeLabel = $doms.container.find(".bike_label", $doms.container[0]);
        $doms.detailBackground = $doms.container.find(".detail_background", $doms.container[0]);
        $doms.detailForm = $doms.container.find(".detail_form", $doms.container[0]);


        //var styleDic = {"width":true, "height":false, "margin-left":true, "margin-top":false};
        //Helper.pxToPercent($doms.blackBike, Main.rawWidth, Main.rawHeight, styleDic);
        //Helper.pxToPercent($doms.whiteBike, Main.rawWidth, Main.rawHeight, styleDic);

        //Helper.getInitValue($doms.blackBike[0]);
        //Helper.getInitValue($doms.whiteBike[0]);
        //Helper.getInitValue($doms.bikeLabel[0]);
        fetchGeom(Main.styleMode);
    };

    function fetchGeom(mode)
    {
        if(_fetcheredDic[mode]) return;
        _fetcheredDic[mode] = true;

        Helper.getInitValue($doms.blackBike[0], null, null, null, true, mode);
        Helper.getInitValue($doms.whiteBike[0], null, null, null, true, mode);
        Helper.getInitValue($doms.bikeLabel[0], null, null, null, true, mode);
        Helper.getInitValue($doms.detailBackground[0], null, null, null, true, mode);
        Helper.getInitValue($doms.detailForm[0], null, null, null, true, mode);
    }

    _p.beforeStageIn = function()
    {
        TweenMax.set($doms.blackBike, {autoAlpha:0, x:-100, y:50});
        TweenMax.set($doms.bikeLabel, {autoAlpha:0, x:-100});
        TweenMax.set($doms.detailBackground, {autoAlpha:0, x:100});
        TweenMax.set($doms.detailForm, {autoAlpha:0, x:-100});

        TweenMax.set($doms.whiteBike, {autoAlpha:0});
    };

    _p.afterStageIn = function(options)
    {
        var tl = new TimelineMax();

        var start = __WG? .1: 0;

        tl.to($doms.whiteBike,.5, {autoAlpha:1});
        tl.to($doms.blackBike,.5, {autoAlpha:1, x:0, y:0},start);
        tl.to($doms.bikeLabel,.5, {autoAlpha:1, x:0},start +.1);
        tl.to($doms.detailBackground,.5, {autoAlpha:1, x:0},start +.2);
        tl.to($doms.detailForm,.5, {autoAlpha:1, x:0},start +.3);
        tl.add(function()
        {
            if(options && options.onComplete) options.onComplete.apply();
        });
    };


    _p.beforeStageOut = function()
    {
        if(__WG) TweenMax.to($doms.whiteBike,.5, {autoAlpha:0});
    };

    _p.getWgData = function()
    {
        var $dom = $doms.whiteBike;
        var offset = $dom.offset();
        var containerOffset = $doms.container.offset();

        var id = "/Detail";
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

    _p.onResize = function (width, height, bgBound, modeChanged, styleMode)
    {
        if(modeChanged) fetchGeom(styleMode);

        var bound2 = bgBound;
        if(Main.styleMode == "small") bound2 = Helper.getSize_contain(width, height, 720, 1280);

        Helper.applyTransform($doms.blackBike[0], bound2.ratio, ["w", "h", "ml", "mt"], null, null, styleMode);
        Helper.applyTransform($doms.whiteBike[0], bound2.ratio, ["w", "h", "ml", "mt"], null, null, styleMode);
        Helper.applyTransform($doms.bikeLabel[0], bound2.ratio, ["w", "h", "ml", "b"], null, null, styleMode);
        Helper.applyTransform($doms.detailBackground[0], bound2.ratio, ["w", "h", "ml", "mt"], null, null, styleMode);
        Helper.applyTransform($doms.detailForm[0], bound2.ratio, ["w", "h", "ml", "mt"], null, null, styleMode);
    };

}());