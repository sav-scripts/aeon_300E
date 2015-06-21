/**
 * Created by sav on 2015/6/22.
 */
(function (){

    var _p = window.SmallMenu = {};
    var $doms = {};

    _p.init = function()
    {
        $doms.container = $("#small_menu_block");

        //$doms.

        setupButton(1, "index");
        setupButton(2, "index2");
        setupButton(3, "index3");
        setupButton(4, "index4");
        setupButton(5, "index5");

        function setupButton(index, name)
        {
            var $button = $doms.container.find(".button:nth-of-type("+index+")");

            var $core1 = $button.find(".core_1");
            var $core2 = $button.find(".core_2");
            var $core3 = $button.find(".core_3");

            $button.show = function()
            {
                TweenMax.killTweensOf($core2);
                TweenMax.killTweensOf($core3);

                TweenMax.to($core3,.5, {ease:Back.easeOut, scale:1});
                TweenMax.to($core2,.5, {ease:Back.easeOut, delay:.2, scale:1});
            };

            $button.hide = function()
            {
                TweenMax.killTweensOf($core2);
                TweenMax.killTweensOf($core3);

                TweenMax.to($core3,.5, {ease:Back.easeOut, scale:0});
                TweenMax.to($core2,.5, {ease:Back.easeOut, delay:.2, scale:0},.2);

            };

            $button.hide();

            $button.bind("mouseover", function(event)
            {
                //console.log($button.has(event.relatedTarget).length);
                if($button.has(event.relatedTarget).length > 0) return;

                $button.show();
            });


            $button.bind("mouseout", function(event)
            {
                //console.log($button.has(event.relatedTarget).length);
                if($button.has(event.relatedTarget).length > 0) return;

                $button.hide();

            });
        }
    };

    _p.onReisze = function(width, height)
    {

    };

}());

(function (){

    var _p = window.Menu = {};

    _p.init = function()
    {

    };

    _p.onReisze = function(width, height)
    {

    };

}());