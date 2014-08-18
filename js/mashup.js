var mashup2;
var themeGraphicsLayer22;
var gra;



function OverlayTheme2(region) {
    var theme = "CHASCLINIC";

    if (region == "East")
        OneMap.showLocation2(38716.3099, 38763.0600);
    else if (region == "North")
        OneMap.showLocation2(28429.6281, 45018.3304);
    else if (region == "North-east")
        OneMap.showLocation2(34196.2660, 39104.8513);
    else if (region == "Central")
        OneMap.showLocation2(29598.5053, 30545.4076);
    else if (region == "West")
        OneMap.showLocation2(13577.7300, 37301.4146);




    mashup2 = new MashupData();
    mashup2.themeName = theme;
    mashup2.extent = OneMap.map.extent.xmin + "," + OneMap.map.extent.ymin + "," + OneMap.map.extent.xmax + "," + OneMap.map.extent.ymax;

    //add graphic layer
    themeGraphicsLayer2 = new esri.layers.GraphicsLayer();
    themeGraphicsLayer2.id = theme;
    OneMap.map.addLayer(themeGraphicsLayer2);

    $("#hideTheme").show();
    mashup2.GetMashupData(overlayData2)




    OneMap.onOneMapExtentChange(OverlayTheme2OnExtentChnage)
    try {
        dojo.connect(themeGraphicsLayer2, "onClick", function(evt) {
            mashup2.GetDataForCallout(evt.graphic, "", function(results) {
                var formattedResults = mashup2.formatResultsEnhanced(results);
                $('#introDiv').show();
                $('#intro').html(formattedResults);
            });
        })
    } catch (err) {}
}

function OverlayTheme2OnExtentChnage(extent) {
    mashup2.extent = extent.xmin + "," + extent.ymin + "," + extent.xmax + "," + extent.ymax;
    mashup2.GetMashupData(overlayData2)
}




function overlayData2(mashup2Results) {
    function hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    var results = mashup2Results.results;
    var featcount = mashup2Results.count;
    var iconPath = mashup2Results.iconPath
    var featType = mashup2Results.featType;
    themeGraphicsLayer2.clear();
    var i;
    var xPnt;
    var yPnt;
    var xCord;
    var yCord;

    var pntArr = new Array();


    if (results.length == 0) {
        return
    }

    if (featType == "Point") {
        //process all the results
        for (i = 0; i < results.length; i++) {

            //create point graphic on map using generatePointGraphic function
            var PointGraphic = generatePointGraphic(results[i].XY, results[i].ICON_NAME, iconPath)
                //set graphic attributes
            PointGraphic.attributes = results[i]
            //add newly created graphic in graphiclayer
            themeGraphicsLayer2.add(PointGraphic);
        }
    } else if (featType == "Polygon") {
        var polygon;
        for (i = 0; i < results.length; i++) {
            if (mashup2Results.results[i].SYMBOLCOLOR != undefined && mashup2Results.results[i].SYMBOLCOLOR != "") {
                var polyColor = mashup2Results.results[i].SYMBOLCOLOR;
                var r = hexToRgb(polyColor).r;
                var g = hexToRgb(polyColor).g;
                var b = hexToRgb(polyColor).b;
            } else if (mashup2Results.results[i].SYMBOLCOLOR == "") {
                var r = 0;
                var g = 0;
                var b = 0;
            }
            pntArr = [];
            polygon = new esri.geometry.Polygon(new esri.SpatialReference({
                wkid: 3414
            }));

            for (var x = 0; x < results[i].XY.split("|").length; x++) {
                xCord = results[i].XY.split("|")[x].split(",")[0];
                yCord = results[i].XY.split("|")[x].split(",")[1];

                var PointLocation = new esri.geometry.Point(xCord, yCord, new esri.SpatialReference({
                    wkid: 3414
                }))
                pntArr.push(PointLocation);
            }
            polygon.addRing(pntArr);

            gra = new esri.Graphic;
            gra.geometry = polygon;
            gra.attributes = results[i];

            var sfs = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
                new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
                    new dojo.Color([0, 0, 0]), 2), new dojo.Color([r, g, b, 0.8]));

            gra.symbol = sfs;
            themeGraphicsLayer2.add(gra);
        }
    } else if (featType == "Line") {
        var pLine;
        for (i = 0; i < results.length; i++) {
            if (mashup2Results.results[i].SYMBOLCOLOR != undefined && mashup2Results.results[i].SYMBOLCOLOR != "") {
                var polyColor = mashup2Results.results[i].SYMBOLCOLOR;
                var r = hexToRgb(polyColor).r;
                var g = hexToRgb(polyColor).g;
                var b = hexToRgb(polyColor).b;
            } else if (mashup2Results.results[i].SYMBOLCOLOR == "") {
                var r = 0;
                var g = 0;
                var b = 0;
            }
            pntArr = [];
            pLine = new esri.geometry.Polyline(new esri.SpatialReference({
                wkid: 3414
            }));

            for (var x = 0; x < results[i].XY.split("|").length; x++) {
                xCord = results[i].XY.split("|")[x].split(",")[0];
                yCord = results[i].XY.split("|")[x].split(",")[1];

                var PointLocation = new esri.geometry.Point(xCord, yCord, new esri.SpatialReference({
                    wkid: 3414
                }))
                pntArr.push(PointLocation);
            }
            pLine.addPath(pntArr);

            gra = new esri.Graphic;
            gra.geometry = pLine;
            gra.attributes = results[i];

            var sfs = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
                new dojo.Color([r, g, b]), 2);
            gra.symbol = sfs;
            themeGraphicsLayer2.add(gra);
        }
    }
}
