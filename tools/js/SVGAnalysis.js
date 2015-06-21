(function ()
{

    var _p = window.SVGAnalysis = {};



    _p.analyze = function ($svg)
    {
        var _pointDic = {};
        var _lineDic = {};

        var _pointList = [];
        var _lineList = [];


        var i, k, svgPoint, pathLength, $poly, $path, pointObj, lineObj,
            pointCount = 0, lineCount = 0, oldKey = null, firstKey,
            $polylines = $svg.find("polyline"), numPolygons;

        $polylines = $polylines.add($svg.find("polygon"));
        numPolygons = $polylines.length;

        console.log($polylines.length);

        for(i=0;i<numPolygons;i++)
        {
            $poly = $($polylines[i]);
            $path = $poly.prop("points");
            pathLength = $path.length;

            firstKey = null;

            for(k=0;k<=pathLength;k++)
            {
                if(k != pathLength)
                {
                    svgPoint = $path[k];
                    //console.log(svgPoint.x);

                    var key = testPoint(svgPoint.x, svgPoint.y);
                    if(!key)
                    {
                        key = "p_" + pointCount;
                        pointObj = {x:svgPoint.x, y:svgPoint.y, id:key};
                        _pointDic[key] = pointObj;

                        //console.log(JSON.stringify(pointObj));

                        _pointList.push(pointObj);
                        pointCount++;
                    }
                }

                if(k != 0)
                {
                    if(k == pathLength) key = firstKey;

                    if(!(_lineDic[key + "-" + oldKey] || _lineDic[oldKey + "-" + key]))
                    {
                        _lineDic[key + "-" + oldKey] = true;
                        _lineDic[oldKey + "-" + key] = true;

                        lineObj =
                        {
                            start: oldKey,
                            end: key
                        };

                        //console.log("line: " + oldKey + " to " + key);

                        _lineList.push(lineObj);

                        lineCount ++;
                    }
                }
                else
                {
                    firstKey = key;
                }

                oldKey = key;
            }
        }

        //console.log("lineCount = " + lineCount);

        return {
            pointDic: _pointDic,
            pointList: _pointList,
            lineDic: _lineDic,
            lineList: _lineList
        };

        function testPoint(x, y)
        {
            var key, obj;
            for(key in _pointDic)
            {
                obj = _pointDic[key];
                if(obj.x == x && obj.y == y) return key;
            }
            return null;
        }
    };

    _p.onResize = function (width, height)
    {

    };

}());