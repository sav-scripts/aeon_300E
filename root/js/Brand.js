(function ()
{

    var _p = window.Brand = {};

    var $doms = {};

    _p.init = function ()
    {
        $doms.container = $("#brand_block");

        $doms.rightGroup = $doms.container.find(".right_group");
        Helper.getInitValue($doms.rightGroup[0]);

        var v = $doms.rightGroup[0].init;

        $doms.centerBlack = $doms.container.find(".center_black");
        $doms.contentText = $doms.container.find(".content_text");
        $doms.title = $doms.container.find(".title_text");
        $doms.triangle = $doms.container.find(".little_triangle");

        $doms.text_1 = $doms.container.find(".text_row_1");
        $doms.text_2 = $doms.container.find(".text_row_2");
        $doms.text_3 = $doms.container.find(".text_row_3");
        $doms.text_4 = $doms.container.find(".text_row_4");

        Helper.getInitValue($doms.triangle[0]);

        Helper.pxToPercent($doms.centerBlack[0], v.w, v.h);
        Helper.pxToPercent($doms.contentText[0], v.w, v.h);

        Helper.getInitValue($doms.contentText[0], true, ["font-size", "line-height", "letter-spacing"]);
        Helper.getInitValue($doms.title[0], true, ["font-size"]);


        var wgImage = WireGraphic.getData("/Brand").image;
        $doms.bike = $(wgImage);

        $doms.container.append(wgImage);

        $doms.bike.css("position", "absolute");

        Helper.getInitValue($doms.bike[0]);
    };

    _p.beforeStageIn = function(option)
    {
        var dx = 300;

        TweenMax.set($doms.text_1, {x:-dx, autoAlpha:0});
        TweenMax.set($doms.text_2, {x:dx, autoAlpha:0});
        TweenMax.set($doms.text_3, {x:-dx, autoAlpha:0});
        TweenMax.set($doms.text_4, {x:dx, autoAlpha:0});

        TweenMax.set($doms.centerBlack, {scale:0});
        TweenMax.set($doms.contentText, {autoAlpha:0});
        TweenMax.set($doms.triangle, {autoAlpha:0});

        TweenMax.set($doms.bike, {autoAlpha:0});
    };

    _p.afterStageIn = function(options)
    {
        TweenMax.to($doms.bike,.5, {autoAlpha:1});

        var d1 = .6;
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
        TweenMax.to($doms.bike,.5, {autoAlpha:0});
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

    _p.onResize = function (width, height, bgBound)
    {
        //$doms.bike.width(bgBound.ratio * )
        var v = $doms.bike.init;
        $doms.bike.width(v * bgBound).height(height).css("left", 0).css("top", 0);


        //var offset = $doms.bike.offset();
        //var containerOffset = $doms.container.offset();
        //WireGraphic.updateDataGeom("/Brand", offset.left, offset.top - containerOffset.top, $doms.bike.width(), $doms.bike.height());


        Helper.applyTransform($doms.rightGroup[0], bgBound.ratio, ["w", "h", "ml", "mt"]);
        Helper.applyTransform($doms.triangle[0], bgBound.ratio, ["w", "h", "l", "t"]);

        Helper.applyTransform($doms.contentText[0], bgBound.ratio, ["font-size", "line-height", "letter-spacing"]);
        Helper.applyTransform($doms.title[0], bgBound.ratio, ["font-size"]);
    };

}());