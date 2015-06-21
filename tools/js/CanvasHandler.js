(function ()
{

    var _p = window.CanvasHandler = {};

    var $doms = {};

    var _canvas;
    var _stage;

    var _currentMode;

    var _rawImage;
    var _image;

    var _upperLayer;
    var _lineLayer;
    var _polygonLayer;

    var _scaleRate = 1;

    var _viewPort = {};


    var _pointDic = {};
    var _lineDic = {};
    var _polygonDic = {};

    var _serial = 0;

    var _graphicColor = "Black";


    var _pressedKey = {};

    var _selectedPoint;

    var _tempPolygonPath;

    var _isSmallMode = false;

    _p.autoLink = false;

    _p.init = function ($container)
    {
        _canvas = document.createElement("canvas");
        _canvas.className = "edit_canvas";

        $container.append(_canvas);

        _stage = new createjs.Stage(_canvas);
        _stage.enableMouseOver(10);

        _polygonLayer = new createjs.Container();
        _stage.addChild(_polygonLayer);

        _lineLayer = new createjs.Container();
        _stage.addChild(_lineLayer);

        _upperLayer = new createjs.Container();
        _stage.addChild(_upperLayer);


        createjs.Ticker.addEventListener("tick", handleTick);
        function handleTick() {
            _stage.update();
        }

        $(window).bind("keydown", function(event)
        {
            _pressedKey[event.keyCode] = true;

            //console.log(event.keyCode);

            if(event.keyCode == 32)
            {
                $(_canvas).toggleClass("cursor_grab", true);
            }

            if(event.keyCode == 88 || event.keyCode == 67)
            {
                _graphicColor = event.keyCode == 88? "Black": "White";

                var wasSmallMode = _isSmallMode;
                _isSmallMode = true;
                if(wasSmallMode != _isSmallMode) redrawAll();

                //if(_currentMode == "delete")
                    updateLineVisibility();
            }
        });

        $(window).bind("keyup", function(event)
        {
            _pressedKey[event.keyCode] = false;

            if(event.keyCode == 32)
            {
                $(_canvas).toggleClass("cursor_grab", false);
            }

            if(event.keyCode == 88 || event.keyCode == 67)
            {
                _isSmallMode = false;
                _graphicColor = "Black";

                redrawAll();
                //if(_currentMode == "delete")
                updateLineVisibility();
            }
        });

        $(_canvas).bind("mousewheel", function(event)
        {
            if(_pressedKey[90])
            {
                if(_image)
                {
                    if(event.deltaY > 0)
                    {
                        _image.alpha +=.1;
                    }
                    else
                    {
                        _image.alpha -=.1;
                    }

                    if(_image.alpha > 1) _image.alpha = 1;
                    if(_image.alpha < 0) _image.alpha = 0;

                }
            }
            else
            {
                var px = event.pageX - $(this).offset().left,
                py = event.pageY - $(this).offset().top;

                var local = _image.globalToLocal(px, py);

                if(event.deltaY > 0)
                {
                    _scaleRate += .1;
                }
                else
                {
                    _scaleRate -= .1;
                }

                if(_scaleRate < 1) _scaleRate = 1;

                _image.scaleX = _image.scaleY = _scaleRate;
                _upperLayer.scaleX = _upperLayer.scaleY = _scaleRate;
                _lineLayer.scaleX = _lineLayer.scaleY = _scaleRate;
                _polygonLayer.scaleX = _polygonLayer.scaleY = _scaleRate;

                var newX = -local.x * _scaleRate + px,
                    newY = -local.y * _scaleRate + py;

                _upperLayer.x = _image.x = _polygonLayer.x = newX;
                _upperLayer.y = _image.y = _polygonLayer.y = newY;



                reboundImage();
            }
        });


        _stage.addEventListener("stagemousedown", editHander);

        function editHander(event)
        {
            var px = event.stageX / _scaleRate,
                py = event.stageY / _scaleRate;

            //console.log(event.relatedTarget);

            if(_pressedKey[32])
            {

                startMoveCanvas(px, py);
            }
            else
            {

                var point, oldPoint, isNewPoint = false, polygon, line;

                if(event.relatedTarget && event.relatedTarget.name == "point")
                {
                    point = event.relatedTarget;
                }
                else if(event.relatedTarget && event.relatedTarget.name == "polygon")
                {
                    polygon = event.relatedTarget;
                }
                else if(event.relatedTarget && event.relatedTarget.name == "line")
                {
                    line = event.relatedTarget;
                }
                else
                {
                    if(_currentMode == "point")
                    {
                        isNewPoint = true;
                        point = createPoint(event.stageX, event.stageY);
                    }
                }

                //console.log(event.relatedTarget);

                if(point)
                {
                    if(_currentMode == "point")
                    {

                        startDrag(point, isNewPoint);

                        oldPoint = _selectedPoint;

                        unSelectPoint();
                        selectPoint(point);

                        if(_p.autoLink && oldPoint)
                        {
                            createLine(oldPoint, point, true);
                        }


                    }
                    else if(_currentMode == "delete")
                    {
                        removePoint(point);
                    }
                    else if(_currentMode == "line")
                    {
                        if(_selectedPoint == point)
                        {
                            unSelectPoint();
                        }
                        else if(_selectedPoint == null)
                        {
                            selectPoint(point);
                        }
                        else
                        {
                            oldPoint = _selectedPoint;
                            unSelectPoint();
                            selectPoint(point);

                            createLine(oldPoint, point);
                        }
                    }
                    else if(_currentMode == "polygon")
                    {
                        if(_selectedPoint == point)
                        {
                            //unSelectPoint();
                        }
                        else if(_selectedPoint == null)
                        {
                            selectPoint(point);

                            _tempPolygonPath = [point];
                        }
                        else
                        {
                            oldPoint = _selectedPoint;

                            if(point == _tempPolygonPath[0] && _tempPolygonPath.length == 2)
                            {
                                console.log("same");
                            }
                            else
                            {
                                unSelectPoint();
                                selectPoint(point);

                                editPolygon(oldPoint, point);
                            }
                        }

                    }
                }
                else if(polygon)
                {
                    if(_currentMode == "fill")
                    {
                        redrawPolygon(polygon);
                    }
                    else if(_currentMode == "delete")
                    {
                        removePolygon(polygon);
                    }

                }
                else if(line)
                {
                    if(_currentMode == "delete")
                    {
                        removeLine(line);
                    }

                }
            }
        }
    };



    /** polygon handlers **/
    function editPolygon(p1, p2)
    {
        if(p1 == p2) return;

        var line = _lineDic[p1.serial + "-" + p2.serial];

        if(line)
        {
            var i, point;


            for(i=1;i<_tempPolygonPath.length;i++)
            {
                point = _tempPolygonPath[i];
                if(point == p2)
                {
                    changeLinesVisibility(false);
                    _tempPolygonPath = [p2];

                    return;
                }
            }


            if(p2 == _tempPolygonPath[0])
            {
                _tempPolygonPath.push(p2);

                createPolygon(_tempPolygonPath);

                unSelectPoint();
                //clearPolygonPath();
                changeLinesVisibility(false);
            }
            else
            {
                _tempPolygonPath.push(p2);
                p2.isSelected = true;
                redrawPoint(p2, "selected_hover");

                //line.alpha = 1;
                redrawEditPath();
            }
        }
        else
        {
            changeLinesVisibility(false);
            _tempPolygonPath = [p2];
        }
    }

    function redrawEditPath()
    {
        var i, p0, p1, line;
        for(i=1;i<_tempPolygonPath.length;i++)
        {
            p0 = _tempPolygonPath[i-1];
            p1 = _tempPolygonPath[i];

            line = _lineDic[p0.serial + "-" + p1.serial];

            //console.log("line = " + line);

            if(line) line.alpha = 1;

        }

        //console.log("check: " + _tempPolygonPath.length);
    }

    function clearPolygonPath()
    {
        if(!_tempPolygonPath) return;

        var i, point;

        for(i=0;i<_tempPolygonPath.length;i++)
        {
            point = _tempPolygonPath[i];
            point.isSelected = false;
            redrawPoint(point, "normal");
        }
    }

    function createPolygon(path, dataObj)
    {
        var polygon = new createjs.Shape();
        polygon.name = "polygon";
        polygon.cursor = "default";
        polygon.path = path;

        _polygonLayer.addChild(polygon);
        _polygonDic[polygon.id] = polygon;
        
        var i, point, line, id = "";

        for(i=0;i<polygon.path.length;i++)
        {
            point = polygon.path[i];

            point.polygonDic[polygon.id] = polygon;

            if(i > 0)
            {
                line = _lineDic[polygon.path[i-1].serial + "-" + polygon.path[i].serial];
                line.polygonDic[polygon.id] = polygon;
            }

            //id += (i==0)? point.serial
        }

        //console.log("id = " + polygon.id);

        redrawPolygon(polygon, false, dataObj);
    }



    function redrawPolygon(polygon, useOldColor, dataObj)
    {
        var i, point;
        var colorObj =$("#input_color").spectrum("get");
        var color = colorObj.toRgbString();

        if(!useOldColor)
        {
            if(dataObj)
            {
                polygon.colorHex = dataObj.hex;
                polygon.colorAlpha = parseFloat(dataObj.alpha);
                polygon.colorRGBA = dataObj.rgba;
                color = dataObj.rgba
            }
            else
            {
                polygon.colorHex = colorObj.toHexString();
                polygon.colorAlpha = colorObj._a;
                polygon.colorRGBA = color;
            }
        }
        else
        {
            color = polygon.colorRGBA;
        }

        polygon.graphics.clear().beginFill(color);

        for(i=0;i<polygon.path.length;i++)
        {
            point = polygon.path[i];

            if(i==0)
            {
                polygon.graphics.moveTo(point.x, point.y);
            }
            else
            {
                polygon.graphics.lineTo(point.x, point.y);
            }
        }
    }

    function removePolygon(polygon)
    {
        var i, lastPoint = null, point, line;

        if(polygon.parent) polygon.parent.removeChild(polygon);

        for(i=0;i<polygon.path.length;i++)
        {
            point = polygon.path[i];

            delete point.polygonDic[polygon.id];


            if(i != 0)
            {
                line = _lineDic[lastPoint.serial + "-" + point.serial];
                delete line.polygonDic[polygon.id];
            }


            lastPoint = point;
        }

        delete  _polygonDic[polygon.id];
    }



    /** line handlers **/
    function createLine(p1, p2, keepLineIfExist)
    {
        if(p1 == p2) return;
        var line = _lineDic[p1.serial + "-" + p2.serial];

        if(line)
        {
            //if(!keepLineIfExist)
            //{
            //    removeLine(line);
            //}
        }
        else
        {
            line = new createjs.Shape();
            line.startPoint = p1;
            line.endPoint = p2;
            line.name = "line";
            //line.cursor = "default";
            _lineLayer.addChild(line);

            line.polygonDic = {};

            redrawLine(line);

            p1.lineDic[p2.serial] = line;
            p2.lineDic[p1.serial] = line;

            _lineDic[p1.serial + "-" + p2.serial] = _lineDic[p2.serial + "-" + p1.serial] = line;
        }
    };

    function removeLine(line)
    {
        var p1, p2;
        if(line.parent) line.parent.removeChild(line);

        var key;
        for(key in line.polygonDic)
        {
            removePolygon(line.polygonDic[key]);
        }


        p1 = line.startPoint;
        p2 = line.endPoint;

        delete _lineDic[p1.serial + "-" + p2.serial];
        delete _lineDic[p2.serial + "-" + p1.serial];

        delete p1.lineDic[p2.serial];
        delete p2.lineDic[p1.serial];

    }

    function redrawLine(line, thickness)
    {
        var p1 = line.startPoint;
        var p2 = line.endPoint;
        if(thickness == null) thickness = 1;
        line.graphics.clear().setStrokeStyle(thickness).beginStroke(_graphicColor).moveTo(p1.x, p1.y).lineTo(p2.x, p2.y);
    }

    /** point handler **/


    function createPoint(stageX, stageY)
    {
        var local = _image.globalToLocal(stageX, stageY);


        var point = new createjs.Shape();
        point.x = local.x;
        point.y = local.y;
        point.cursor = "pointer";

        point.name = 'point';
        point.serial = "p_" + _serial;

        redrawPoint(point, "normal");

        _upperLayer.addChild(point);

        _serial ++;

        _pointDic[point.serial] =
        {
            point: point,
            serial: point.serial
        };

        point.lineDic = {};
        point.polygonDic = {};

        point.addEventListener("mouseover", function()
        {
            if(point.isSelected)
            {
                point.styleType = "selected_hover";
            }
            else
            {
                point.styleType = "hover";
            }
            redrawPoint(point);
        });

        point.addEventListener("mouseout", function()
        {
            if(point.isSelected)
            {
                point.styleType = "selected_out";
            }
            else
            {
                point.styleType = "normal";
            }
            redrawPoint(point);
        });

        return point;
    }




    function unSelectPoint()
    {
        if(!_selectedPoint) return;
        _selectedPoint.isSelected = false;
        redrawPoint(_selectedPoint, "normal");
        _selectedPoint = null;
    }

    function selectPoint(point)
    {
        _selectedPoint = point;
        _selectedPoint.isSelected = true;
        redrawPoint(_selectedPoint, "selected_hover");
    }

    function startDrag(point, isNewPoint)
    {
        var isMoved = (isNewPoint == true);

        _stage.addEventListener("stagemousemove", onStageMouseMove);
        _stage.addEventListener("stagemouseup", onStageMouseUp);

        function onStageMouseMove(event)
        {
            isMoved = true;

            var local = _image.globalToLocal(event.stageX, event.stageY);

            point.x = local.x;
            point.y = local.y;

            var key, line, polygon;
            for(key in point.lineDic)
            {
                line = point.lineDic[key];
                redrawLine(line);
            }

            for(key in point.polygonDic)
            {
                polygon = point.polygonDic[key];
                redrawPolygon(polygon, true);
            }
        }

        function onStageMouseUp()
        {
            _stage.removeEventListener("stagemousemove", onStageMouseMove);
            _stage.removeEventListener("stagemouseup", onStageMouseUp);
        }
    }


    function redrawPoint(point, type)
    {
        var size1 = 3, size2 = 5;

        if(_isSmallMode)
        {
            size1 = 2;
            size2 = 2;
        }

        if(type) point.styleType = type;
        if(!type) type = point.styleType;

        switch(type)
        {
            case "selected_hover":
                point.graphics.clear().beginFill("LightBlue").beginStroke("Black").drawCircle(0, 0, size2);
                break;

            case "selected_out":
                point.graphics.clear().beginFill("Blue").drawCircle(0, 0, size2);
                break;

            case "hover":
                point.graphics.clear().beginFill("White").beginStroke("Black").drawCircle(0, 0, size1);
                break;

            case "normal":
                point.graphics.clear().beginFill(_graphicColor).drawCircle(0, 0, size1);
                break;

            //default:
            //    shape.graphics.clear().beginFill("Red").drawCircle(0, 0, size1);
            //    break;
        }

    }

    function removePoint(point, keepData)
    {
        if(point.parent) point.parent.removeChild(point);
        point.removeAllEventListeners();

        if(point == _selectedPoint) _selectedPoint = null;

        var key, line, p1, p2;

        for(key in point.lineDic)
        {
            line = point.lineDic[key];

            removeLine(line);
        }


        if(!keepData)
        {
            delete  _pointDic[point.serial];
        }

    }



    /** misc **/

    _p.clear = function()
    {
        var key, obj, point;

        for(key in _pointDic)
        {
            obj = _pointDic[key];
            point = obj.point;
            removePoint(point, true);
        }

        _pointDic = {};
        _lineDic = {};
    };

    _p.changeDraftOpacity = function(alpha)
    {
        if(_image)
        {
            _image.alpha = alpha;
        }
    };


    function redrawAll()
    {
        var key, obj, point;
        for(key in _pointDic)
        {
            obj = _pointDic[key];
            point = obj.point;
            redrawPoint(point);
        }

        //if(_currentMode)
    }

    function changeLinesVisibility(fullVisible, thickness, activeInteractive)
    {
        var key, line;
        var alpha = fullVisible? 1: .2;
        for(key in _lineDic)
        {
            line = _lineDic[key];
            line.alpha = alpha;

            line.cursor = activeInteractive? "pointer": null;

            if(thickness != null)
            {
                redrawLine(line, thickness);
            }
        }
    }



    function reboundImage()
    {
        var tx = _image.x,
            ty = _image.y;

        var bound = _image.getBounds();
        bound.width *= _scaleRate;
        bound.height *= _scaleRate;

        if(tx > _viewPort.left) tx = _viewPort.left;
        if(ty > _viewPort.top) ty = _viewPort.top;

        if((tx+bound.width) < _viewPort.right)
        {
            tx = _viewPort.right - bound.width;
        }
        if((ty+bound.height) < _viewPort.bottom) ty = _viewPort.bottom - bound.height;

        _lineLayer.x = _upperLayer.x = _polygonLayer.x = _image.x = tx;
        _lineLayer.y = _upperLayer.y = _polygonLayer.y = _image.y = ty;

    }

    _p.changeImage = function(image)
    {
        if(_image)
        {
            if(_image.parent) _image.parent.removeChild(_image);
        }

        _rawImage = image;

        _scaleRate = 1;

        _p.onResize(_rawImage.width, _rawImage.height);

        _image = new createjs.Bitmap(_rawImage);
        _stage.addChildAt(_image, 0);

    };


    _p.toMode = function(mode)
    {
        _currentMode = mode;
        _tempPolygonPath = [];
        unSelectPoint();
        clearPolygonPath();

        updateLineVisibility();
    };

    function updateLineVisibility()
    {
        if (_currentMode == "polygon")
        {
            changeLinesVisibility(false, 1);
        }
        else if (_currentMode == "delete")
        {
            if(_pressedKey[88] || _pressedKey[67])
            {
                changeLinesVisibility(true, 1, false);
            }
            else
            {
                changeLinesVisibility(true, 3, true);
            }
        }
        else
        {
            changeLinesVisibility(true, 1);
        }

        redrawEditPath();
    }

    _p.drawData = function(data)
    {
        var pointList = data.point_list;

        //console.log("point list length = " + pointList.length);
        var i, obj, p1Obj, p2Obj, mySerial = 0, pointSerial;

        for(i=0;i<pointList.length;i++)
        {
            obj = pointList[i];
            pointSerial = parseInt(obj.id.replace("p_", ""));
            _serial = pointSerial;

            //console.log(_serial);
            createPoint(obj.x, obj.y);

            mySerial = Math.max(pointSerial, mySerial);
        }

        _serial = mySerial + 1;

        //console.log("_serial = " + _serial);

        if(data.line_list)
        {

            for(i=0;i<data.line_list.length;i++)
            {
                obj = data.line_list[i];

                p1Obj = _pointDic[obj.a];
                p2Obj = _pointDic[obj.b];

                if(p1Obj && p2Obj)
                {
                    createLine(p1Obj.point, p2Obj.point);
                }
            }
        }


        if(data.polygon_list)
        {
            var k, point, array;

            for(i=0;i<data.polygon_list.length;i++)
            {
                obj = data.polygon_list[i];
                array = [];

                for(k=0;k<obj.points.length;k++)
                {
                    point = _pointDic[obj.points[k]].point;
                    array.push(point);
                }

                createPolygon(array, obj);
            }
        }
    };

    _p.getExportData = function()
    {
        var data = {};

        var i, key, p1, p2, line, obj, point, polygon, handledDic = {}, array = [], lineArray = [], polygonArray = [];

        for(key in _pointDic)
        {
            obj = _pointDic[key];
            point = obj.point;
            array.push
            ({
                id: obj.serial,
                x: point.x,
                y: point.y
            });
        }

        data.point_list = array;

        for(key in _lineDic)
        {
            if(handledDic[key]) continue;

            line = _lineDic[key];
            p1 = line.startPoint;
            p2 = line.endPoint;

            handledDic[p1.serial + "-" + p2.serial] = true;
            handledDic[p2.serial + "-" + p1.serial] = true;

            obj = {a:p1.serial, b:p2.serial};
            lineArray.push(obj);
        }

        for(key in _polygonDic)
        {
            polygon = _polygonDic[key];
            array = [];
            for(i=0;i<polygon.path.length;i++)
            {
                array.push(polygon.path[i].serial);
            }

            polygonArray.push
            ({
                points:array,
                hex: polygon.colorHex,
                alpha: polygon.colorAlpha,
                rgba: polygon.colorRGBA
            });
        }

        data.line_list = lineArray;

        data.polygon_list = polygonArray;

        //console.log(JSON.stringify(polygonArray));

        //console.log(data.line_list);

        return data;
    };

    function startMoveCanvas(px, py)
    {
        var oldX = _image.x,
            oldY = _image.y;

        _stage.addEventListener("stagemousemove", onStageMouseMove);
        _stage.addEventListener("stagemouseup", onStageMouseUp);

        function onStageMouseMove(event)
        {
            var tx = event.stageX / _scaleRate,
                ty = event.stageY / _scaleRate;

            _image.x = oldX + (tx - px)*_scaleRate;
            _image.y = oldY + (ty - py)*_scaleRate;

            reboundImage();
        }

        function onStageMouseUp()
        {
            _stage.removeEventListener("stagemousemove", onStageMouseMove);
            _stage.removeEventListener("stagemouseup", onStageMouseUp);
        }
    }

    _p.onResize = function (width, height)
    {
        _canvas.width = width;
        _canvas.height = height;

        _viewPort = {left:0, top:0, right:width, bottom:height};

    };

}());