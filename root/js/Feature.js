(function ()
{

    var _p = window.Feature = {};
    var $doms = {};

    var _currentIndex = 1;
    var _numContents = 4;

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
    };

    _p.toContent = function(index)
    {
        if(index == _currentIndex) return;
        Main.setPlaying(true);

        var $current = $doms["feature_" + _currentIndex];
        var $target = $doms["feature_" + index];


        var startTop = index > _currentIndex? Main.stageHeight: -Main.stageHeight;
        var targetTop = index > _currentIndex? -Main.stageHeight: Main.stageHeight;

        $target.css("display", "block").css("top", startTop);


        TweenMax.to($target,1, {top:0});
        TweenMax.to($current,1, {top:targetTop, onComplete:function()
        {
            $current.css("display", "none");
            Main.setPlaying(false);
        }});


        _currentIndex = index;

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

    _p.onResize = function (width, height)
    {

    };

}());