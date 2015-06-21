(function ()
{

    var _p = window.Main = {};

    _p.init = function ()
    {
        Index.init();
        SmallMenu.init();


        $(window).bind("resize", _p.onResize);
        _p.onResize();
    };

    _p.onResize = function ()
    {
        var width = $(window).width();
        var height = $(window).height();

        Index.onResize(width, height);
        SmallMenu.onReisze(width, height);

    };

}());