/**
 * Created by sav on 2015/6/22.
 */
(function (){

    var _p = window.SmallMenu = {};
    var $doms = {};
    var _numButtons = 0;

    var _currentIndex = -1;

    _p.init = function()
    {
        $doms.container = $("#small_menu_block");

        $doms.redLine = Helper.$extract("#small_menu_block .red_line");

        //$doms.

        setupButton(1, "/Index");
        setupButton(2, "/Brand");
        setupButton(3, "/Feature");
        setupButton(4, "/Spec");
        //setupButton(5, "/Watch");

        function setupButton(index, hashName)
        {
            var $button = $doms.container.find(".button:nth-of-type("+index+")");

            _numButtons = Math.max(index, _numButtons);

            $doms["button_" + index] = $button;
            if(hashName) $doms["button_" + hashName] = $button;

            $button.index = index;
            $button.hashName = hashName;

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
                if($button.isLocked) return;

                TweenMax.killTweensOf($core2);
                TweenMax.killTweensOf($core3);

                TweenMax.to($core3,.5, {ease:Back.easeOut, scale:0});
                TweenMax.to($core2,.5, {ease:Back.easeOut, delay:.2, scale:0});

            };

            TweenMax.set($core3, {ease:Back.easeOut, scale:0});
            TweenMax.set($core2, {ease:Back.easeOut, scale:0});

            $button.bind("mouseover", function(event)
            {
                if($button.has(event.relatedTarget).length > 0) return;

                $button.show();
            });


            $button.bind("mouseout", function(event)
            {
                if($button.has(event.relatedTarget).length > 0) return;

                $button.hide();

            });

            if(hashName)
            {
                $button.bind("mousedown", function(event)
                {
                    Main.toBlock(hashName);
                });
            }
        }
    };

    _p.lockTo = function(hashName)
    {
        var $button = $doms["button_" + hashName];


        if($button)
        {
            var index = $button.index;


            if(_currentIndex == index) return;

            var oldIndex = _currentIndex;
            _currentIndex = index;

            _p.updateRedLine(oldIndex, _currentIndex);

            for(var i=1;i<=_numButtons;i++)
            {
                $button = $doms["button_" + i];

                if(i == index)
                {
                    $button.isLocked = true;
                    $button.show();
                }
                else
                {
                    $button.isLocked = false;
                    $button.hide();
                }
            }
        }
    };

    _p.updateRedLine = function(oldIndex, newIndex)
    {
        var gap = 50;

        if(oldIndex == -1)
        {
            $doms.redLine.height(0);
        }
        else
        {
            var height = Math.abs(newIndex - oldIndex) * gap;
            //$doms.redLine.height(height);

            TweenMax.killTweensOf($doms.redLine[0]);

            var v = $doms.redLine[0].init;

            var top;

            if(newIndex > oldIndex)
            {
                top = (oldIndex-1) * gap + v.t;
            }
            else
            {
                top = (newIndex-1) * gap + v.t;
            }



            if(newIndex > oldIndex)
            {
                $doms.redLine.css("top", top).height(0);
                TweenMax.to($doms.redLine[0],.5, {height:height});
                TweenMax.to($doms.redLine[0],.5, {delay:.5, height:0, top:top+height});
            }
            else
            {
                $doms.redLine.css("top", top+height).height(0);
                TweenMax.to($doms.redLine[0],.5, {height:height, top:top});
                TweenMax.to($doms.redLine[0],.5, {delay:.5, height:0});
            }

        }

    };

    _p.onResize = function(width, height)
    {

    };

}());

(function (){

    var _p = window.Menu = {};

    var $doms = {};

    var _isOpen = false;

    var _currentIndex = -1;

    var _isPlaying = false;

    _p.init = function()
    {
        $doms.container = $("#big_menu_block");

        $doms.basement = Helper.$extract("#big_menu_block .basement");

        $doms.buttonContainer = Helper.$extract("#big_menu_block .button_group");


        setupTrigger();

        setupMenuButton(1, "/Index");
        setupMenuButton(3, "/Brand");
        setupMenuButton(5, "/Feature");
        setupMenuButton(7, "/Spec");

        $doms.basement.css("display", "none");

        //_p.show();


        function setupMenuButton(index, hashName)
        {
            var $button = Helper.$extract(".menu_button:nth-of-type("+index+")");


            $doms["button_" + index] = $button;
            if(hashName) $doms["button_" + hashName] = $button;

            $button.index = index;
            $button.hashName = hashName;

            var dom = document.createElement("div");
            dom.className = "menu_red_line";

            var $redLine = $(dom);

            $redLine.css("top", $button.position().top + 32);

            $doms.buttonContainer.append($redLine);

            TweenMax.set($redLine, {width:0, marginLeft:0});

            $button.bind("mouseover", function(event)
            {
                $button.show();
            });

            $button.bind("mouseout", function(event)
            {
                $button.hide();
            });

            $button.show = function()
            {
                TweenMax.to($redLine,.5, {width:128, marginLeft:-64});
            };

            $button.hide = function()
            {
                if($button.isLocked) return;
                TweenMax.to($redLine,.5, {width:0, marginLeft:0});

            };

            $button.bind("mousedown", function()
            {
                Main.toBlock(hashName);
                _p.hide();
            });
        }


        function setupTrigger()
        {
            $doms.trigger = Helper.$extract(".trigger_container");
            $doms.bar1 = Helper.$extract(".trigger_bar:nth-of-type(1)");
            $doms.bar2 = Helper.$extract(".trigger_bar:nth-of-type(2)");
            $doms.bar3 = Helper.$extract(".trigger_bar:nth-of-type(3)");
            $doms.bar4 = Helper.$extract(".trigger_bar:nth-of-type(4)");

            $doms.trigger.bind("mouseover", onMouseOver);

            $doms.trigger.bind("mouseout", onMouseOut);

            TweenMax.set($doms.bar4, {top:$doms.bar2[0].init.t, height:6});

            function onMouseOver(event)
            {
                if(event)
                {
                    if(event.relatedTarget == $doms.trigger[0]) return;
                    if($doms.trigger.has(event.relatedTarget).length > 0) return;
                }
                if(_isOpen) return;

                TweenMax.killTweensOf($doms.bar1);
                TweenMax.killTweensOf($doms.bar2);
                TweenMax.killTweensOf($doms.bar3);
                TweenMax.killTweensOf($doms.bar4);

                TweenMax.to($doms.bar1,.4, {ease:Power1.easeIn, top:$doms.bar2[0].init.t});
                TweenMax.to($doms.bar3,.4, {ease:Power1.easeIn, top:$doms.bar2[0].init.t});

                TweenMax.set($doms.bar4, {top:$doms.bar2[0].init.t, height:6});
                TweenMax.to($doms.bar4,.4, {delay:.3, top:$doms.bar4[0].init.t, height:$doms.bar4[0].init.h});

            }

            function onMouseOut(event)
            {
                if(event)
                {
                    if(event.relatedTarget == $doms.trigger[0]) return;
                    if($doms.trigger.has(event.relatedTarget).length > 0) return;
                }
                if(_isOpen) return;

                TweenMax.killTweensOf($doms.bar1);
                TweenMax.killTweensOf($doms.bar2);
                TweenMax.killTweensOf($doms.bar3);
                TweenMax.killTweensOf($doms.bar4);

                TweenMax.to($doms.bar4,.4, {ease:Power1.easeIn, top:$doms.bar2[0].init.t, height:6});

                //TweenMax.to($doms.bar1,.5, {rotation:0});
                TweenMax.to($doms.bar1,.4, {delay:.3, top:$doms.bar1[0].init.t});
                TweenMax.to($doms.bar3,.4, {delay:.3, top:$doms.bar3[0].init.t});
            }

            _p.triggerMouseOver = onMouseOver;
            _p.triggerMouseOut = onMouseOut;

            $doms.trigger.bind("mousedown", function()
            {
                if(_isOpen)
                {
                    _p.hide();
                }
                else
                {
                    _p.show();
                }
            });
        }

    };

    _p.lockTo = function(hashName)
    {
        var $button = $doms["button_" + hashName];


        if($button)
        {
            var index = $button.index;

            if(_currentIndex == index) return;

            var oldIndex = _currentIndex;
            _currentIndex = index;

            if(oldIndex != -1)
            {
                var $oldButton = $doms["button_" + oldIndex];
                $oldButton.isLocked = false;
                $oldButton.hide();
            }

            $button.isLocked = true;
            $button.show();
        }
    };

    _p.show = function()
    {
        if(_isPlaying) return;

        _isOpen = true;
        _isPlaying = true;

        $doms.basement.css("display", "block").css("right", $doms.basement[0].init.r);

        TweenMax.to($doms.basement[0],.7, {ease:Power1.easeInOut, right:0});

        TweenMax.to($doms.trigger,.5, {ease:Power1.easeOut, delay:.3, right:$doms.basement[0].init.w - 50 });


        TweenMax.killTweensOf($doms.bar1);
        TweenMax.killTweensOf($doms.bar2);
        TweenMax.killTweensOf($doms.bar3);
        TweenMax.killTweensOf($doms.bar4);

        TweenMax.to($doms.bar1,.4, {ease:Power1.easeIn, top:$doms.bar2[0].init.t});
        TweenMax.to($doms.bar3,.4, {ease:Power1.easeIn, top:$doms.bar2[0].init.t, onComplete:function()
        {
            _isPlaying = false;

        }});

        TweenMax.set($doms.bar4, {top:$doms.bar2[0].init.t, height:6});

    };

    _p.hide = function()
    {
        if(_isPlaying) return;

        _isOpen = false;
        _isPlaying = true;

        TweenMax.killTweensOf($doms.basement[0]);

        TweenMax.to($doms.trigger,.5, {ease:Power1.easeOut, right:$doms.trigger[0].init.r});

        TweenMax.to($doms.basement[0],.7, {ease:Power1.easeInOut, right:$doms.basement[0].init.r, onComplete:function()
        {
            $doms.basement.css("display", "none");
            _isPlaying = false;
        }});


        TweenMax.killTweensOf($doms.bar1);
        TweenMax.killTweensOf($doms.bar2);
        TweenMax.killTweensOf($doms.bar3);
        TweenMax.killTweensOf($doms.bar4);


        //TweenMax.to($doms.bar1,.5, {rotation:0});
        TweenMax.to($doms.bar1,.4, {top:$doms.bar1[0].init.t});
        TweenMax.to($doms.bar3,.4, {top:$doms.bar3[0].init.t});

    };

    _p.onResize = function(width, height)
    {

    };

}());