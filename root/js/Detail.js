(function ()
{

    var _p = window.Detail = {};

    var $doms = {};

    _p.init = function ()
    {
        $doms.container = $("#detail_block");

        //$doms.blackBike = $doms.container.find(".left_bike_2");
        //$doms.whiteBike = $doms.container.find(".left_bike_1");
        //$doms.bikeLabel = $doms.container.find(".bike_label");

        var wgImage = WireGraphic.getData("/Detail").image;
        var $oldBike = $(".left_bike_1");
        $oldBike.parent().append(wgImage);
        $oldBike.detach();
        wgImage.className = "left_bike_1";


        $doms.blackBike = Helper.$extract(".left_bike_2", $doms.container[0]);
        $doms.whiteBike = Helper.$extract(".left_bike_1", $doms.container[0]);
        $doms.bikeLabel = Helper.$extract(".bike_label", $doms.container[0]);
        $doms.detailBackground = Helper.$extract(".detail_background", $doms.container[0]);
        $doms.detailForm = Helper.$extract(".detail_form", $doms.container[0]);


        //var styleDic = {"width":true, "height":false, "margin-left":true, "margin-top":false};
        //Helper.pxToPercent($doms.blackBike, Main.rawWidth, Main.rawHeight, styleDic);
        //Helper.pxToPercent($doms.whiteBike, Main.rawWidth, Main.rawHeight, styleDic);

        //Helper.getInitValue($doms.blackBike[0]);
        //Helper.getInitValue($doms.whiteBike[0]);
        //Helper.getInitValue($doms.bikeLabel[0]);

    };

    _p.beforeStageIn = function()
    {
        TweenMax.set($doms.blackBike, {autoAlpha:0, x:-100, y:50});
        TweenMax.set($doms.whiteBike, {autoAlpha:0});
        TweenMax.set($doms.bikeLabel, {autoAlpha:0, x:-100});
        TweenMax.set($doms.detailBackground, {autoAlpha:0, x:100});
        TweenMax.set($doms.detailForm, {autoAlpha:0, x:-100});
    };

    _p.afterStageIn = function(options)
    {
        var tl = new TimelineMax();

        tl.to($doms.whiteBike,.5, {autoAlpha:1});
        tl.to($doms.blackBike,.5, {autoAlpha:1, x:0, y:0},.1);
        tl.to($doms.bikeLabel,.5, {autoAlpha:1, x:0},.2);
        tl.to($doms.detailBackground,.5, {autoAlpha:1, x:0},.3);
        tl.to($doms.detailForm,.5, {autoAlpha:1, x:0},.4);
        tl.add(function()
        {
            if(options && options.onComplete) options.onComplete.apply();
        });
    };


    _p.beforeStageOut = function()
    {
        TweenMax.to($doms.whiteBike,.5, {autoAlpha:0});
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

    _p.onResize = function (width, height, bgBound)
    {

        Helper.applyTransform($doms.blackBike[0], bgBound.ratio, ["w", "h", "ml", "mt"]);
        Helper.applyTransform($doms.whiteBike[0], bgBound.ratio, ["w", "h", "ml", "mt"]);
        Helper.applyTransform($doms.bikeLabel[0], bgBound.ratio, ["w", "h", "l", "b"]);
        Helper.applyTransform($doms.detailBackground[0], bgBound.ratio, ["w", "h", "ml", "mt"]);
        Helper.applyTransform($doms.detailForm[0], bgBound.ratio, ["w", "h", "ml", "mt"]);
    };

}());