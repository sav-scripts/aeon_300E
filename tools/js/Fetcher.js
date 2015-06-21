(function ()
{

    var _p = window.Fetcher = {};

    var $doms = {};
    var _image = null;

    var _datGUI;
    var _toolSetting;

    var _defaultSetting =
    {
        draftOpacity:.5
    };

    var _currentMode = null;

    _p.init = function ()
    {
        //localStorage.removeItem("data");
        if(Utility.urlParams.clear_cache == "1") localStorage.removeItem("data");

        $doms.imageInput = $("#image_input");
        $doms.fileInput = $("#file_input");

        $doms.imageContainer = $(".image_container");
        $doms.imageBlock = $("#image_block");

        $doms.redButtons = $(".red_button");

        $doms.greenButtons = $(".green_button");
        //$doms.greenButtons.css("display", "none");
        $doms.greenButtons.hide();

        $doms.btnImageLoad = $($doms.greenButtons[0]);
        $doms.btnloadImageFile = $($doms.greenButtons[1]);

        //$doms.btnEditPoint = $($doms.greenButtons[0]);
        //$doms.btnEditLine = $($doms.greenButtons[1]);
        $doms.btnSave1 = $($doms.greenButtons[2]);
        $doms.btnSave2 = $($doms.greenButtons[3]);
        $doms.btnExport = $($doms.greenButtons[4]);

        $doms.btnImageLoad.show();
        $doms.btnloadImageFile.show();

        $doms.btnChangeMode = $(".black_button");

        $doms.btnChangeMode.hide();

        $doms.helpText = $(".help_text");

        $doms.button_group = $(".button_group");
        $doms.btnPoint = $doms.button_group.find(".button:nth-of-type(1)");
        $doms.btnPointAuto = $doms.button_group.find(".button:nth-of-type(2)");
        $doms.btnLine = $doms.button_group.find(".button:nth-of-type(3)");
        $doms.btnPolygon = $doms.button_group.find(".button:nth-of-type(4)");
        $doms.btnFill = $doms.button_group.find(".button:nth-of-type(5)");
        $doms.btnDelete = $doms.button_group.find(".button:nth-of-type(6)");

        $doms.colorInputContainer = $(".input_color_label");
        $doms.colorInputContainer.hide();

        $("#input_color").spectrum({
            color: "#f00",
            showAlpha:true,
            showInput:true,
            preferredFormat:"rgb",
            showPalette: true
        });

        $doms.btnPoint.bind("click", function()
        {
           _p.toMode("point");
        });

        $doms.btnPointAuto.bind("click", function()
        {
            _p.toMode("point_auto");
        });

        $doms.btnLine.bind("click", function()
        {
            _p.toMode("line");
        });

        $doms.btnPolygon.bind("click", function()
        {
            _p.toMode("polygon");
        });

        $doms.btnFill.bind("click", function()
        {
            _p.toMode("fill");
        });

        $doms.btnDelete.bind("click", function()
        {
            _p.toMode("delete");
        });

        $doms.button_group.hide();

        //setupDatGUI();

        $doms.btnImageLoad.bind("click", function()
        {
            $doms.imageInput.click();
        });

        $doms.btnloadImageFile.bind("click", function()
        {
            $doms.fileInput.click();
        });

        $doms.imageInput.bind("change", function(event)
        {
            loadImageFile(event.target);
        });

        $doms.fileInput.bind("change", function(event)
        {
            loadFile(event.target);
        });

        $doms.btnSave1.bind("click", function()
        {
            localStorage.setItem("data", getSaveString());
            alert("存入完畢.");
        });

        $doms.btnSave2.bind("click", function()
        {
            localStorage.setItem("data2", getSaveString());
            alert("存入完畢.");
        });

        $doms.btnExport.bind("click", function()
        {
            //CanvasHandler.exportData();
            //var data = JSON.parse(localStorage.getItem("data"));

            var blob = new Blob([getSaveString()], {type: "text/plain;charset=utf-8"});
            saveAs(blob, "data.txt");
        });

        CanvasHandler.init($doms.imageContainer);



        var tempData = JSON.parse(localStorage.getItem("data"));

        if(tempData && tempData.image_src)
        {
            loadImg(tempData.image_src, function()
            {
                CanvasHandler.drawData(tempData.graphic_data);
            });
        }
    };

    _p.toMode = function(mode)
    {
        if(_currentMode == mode) return;

        _currentMode = mode;



        CanvasHandler.toMode(_currentMode == "point_auto"? "point": _currentMode);

        $doms.helpText.text("滑鼠滾輪: 縮放 | \"Z\"鍵+滑鼠滾輪: 改變底圖透明度 | 空白鍵: 移動畫布 | \"X\"鍵切換顯示");
        $doms.colorInputContainer.hide();

        $(".button_group .button").toggleClass("faded", true);

        switch (_currentMode)
        {
            case "point":
                $(".button_group .button:nth-of-type(1)").toggleClass("faded", false);

                CanvasHandler.autoLink = false;

            break;
            case "point_auto":
                $(".button_group .button:nth-of-type(2)").toggleClass("faded", false);

                CanvasHandler.autoLink = true;

                break;

            case "line":
                $(".button_group .button:nth-of-type(3)").toggleClass("faded", false);
            break;

            case "polygon":
                $(".button_group .button:nth-of-type(4)").toggleClass("faded", false);
                $doms.colorInputContainer.show();
                break;

            case "fill":
                $(".button_group .button:nth-of-type(5)").toggleClass("faded", false);
                $doms.colorInputContainer.show();
                break;

            case "delete":
                $(".button_group .button:nth-of-type(6)").toggleClass("faded", false);

            break;
        }
    };

    function getSaveString()
    {
        var data =
        {
            graphic_data: CanvasHandler.getExportData(),
            image_src: _image.src
        };


        return JSON.stringify(data);
    }

    function activeEdit()
    {
        //$doms.greenButtons.css("display", "inline-block").toggleClass("faded", true);
        $doms.greenButtons.show();
        //$doms.btnChangeMode.show();
        $doms.button_group.show();
        _p.toMode("point");
    }

    function loadFile(input)
    {

        if (input.files && input.files[0]) {
            var reader = new FileReader();

            reader.onload = function (event)
            {
                //console.log("result = " + event.target.result);


                var data;
                try
                {
                    data = JSON.parse(event.target.result);
                }catch (e)
                {
                    alert("illegal data format");
                }

                if(data)
                {
                    loadImg(data.image_src, function()
                    {
                        CanvasHandler.clear();
                        CanvasHandler.drawData(data.graphic_data);
                    });
                }
            };

            reader.readAsText(input.files[0]);
        }
    }


    function loadImageFile(input)
    {
        if (input.files && input.files[0]) {
            var reader = new FileReader();

            reader.onload = function (event)
            {
                loadImg(event.target.result, function()
                {
                    //CanvasHandler.clear();
                });
            };

            reader.readAsDataURL(input.files[0]);
        }
    }

    function loadImg(src, cb)
    {
        if(_image) $(_image).detach();

        _image = document.createElement("img");
        _image.onload = loaded;

        function loaded()
        {

            $doms.imageContainer.css("width", _image.width).css("height", _image.height);
            $doms.imageBlock.css("width", _image.width).css("height", _image.height).css("display", "block");

            //$doms.imageContainer.append(_image);

            //CanvasHandler.onResize(_image.width, _image.height);

            CanvasHandler.changeImage(_image);

            activeEdit();

            //_toolSetting.draftOpacity = _defaultSetting.draftOpacity;
            //_datGUI.updateAll();

            _p.toMode("point");

            CanvasHandler.changeDraftOpacity(_defaultSetting.draftOpacity);

            if(cb) cb.apply();
        }

        _image.src = src;
    }

}());