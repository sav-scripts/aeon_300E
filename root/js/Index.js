(function ()
{

    var _p = window.Index = {};

    var $doms = {};

    _p.init = function ()
    {
        $doms.container = $("#index_block");
        $doms.background = $doms.container.find(".background");

        Helper.getInitValue($doms.background[0]);

        //console.log($doms.background[0].init);

    };

    _p.onResize = function (width, height)
    {
        var bgDom = $doms.background[0]
        var bound = Helper.getSize_cover(width, height, bgDom.init.w, bgDom.init.h);

        //console.log(bound);

        $(bgDom).css("width", bound.width).css("height", bound.height).css("left", (width - bound.width) *.5).css("top", (height - bound.height) *.5);

    };

}());