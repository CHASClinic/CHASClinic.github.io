function GetSearchData() {
    var basicSearch = new BasicSearch;
    var searchText = document.getElementById("txtSearchText").value;
    basicSearch.searchVal = searchText;
    basicSearch.returnGeom = '1';
    basicSearch.GetSearchResults(displayData);
}

function displayData(resultData) {
    var results = resultData.results;
    if (results == 'No results') {
        alertify.error("<p align='center'><Strong>No results found</Strong></p>");
        return false
    } else {
        var htmlStr = "<a id='dropdownB' href='#' class='dropdown-toggle' data-toggle='dropdown'>Result  <span id='resultCount' class='badge'></span><b class='caret'></b></a><ul class='list-group dropdown-menu scrollable-menu'>";
        for (var i = 0; i < results.length; i++) {
            var row = results[i];
            htmlStr = htmlStr + "<li class='list-group-item'>";
            htmlStr = htmlStr + "<a id='searchResult" + i + "' href='JavaScript:ZoomTo(" + row.X + "," + row.Y + ")'>" + row.SEARCHVAL + "</a>";
            htmlStr = htmlStr + "</li>";
        }
        htmlStr = htmlStr + "</ul>";
        document.getElementById('searchResultList').innerHTML = htmlStr;

        $('#resultCount').text(results.length);
        $('#searchResult0')[0].click();
    }
}

function ZoomTo(xVal, yVal) {
    getResult(xVal, yVal);
    OneMap.showLocation(xVal, yVal);
}


function getCoordinates(evt) {
    var x = evt.mapPoint.x.toFixed(3);
    var y = evt.mapPoint.y.toFixed(3);
    DisplayGeocodeData(x + "," + y);

    xx = parseFloat(x);
    yy = parseFloat(y);

    ZoomTo(xx, yy);
}

function getResult(xx, yy) {

    themeGraphicsLayer = new esri.layers.GraphicsLayer();
    var theme = "CHASCLINIC";
    var token = "qo/s2TnSUmfLz+32CvLC4RMVkzEFYjxqyti1KhByvEacEdMWBpCuSSQ+IFRT84QjGPBCuz/cBom8PfSm3GjEsGc8PkdEEOEr";
    var queryTask = new esri.tasks.QueryTask("http://uat.onemap.sg/DataService/Services.svc/" + theme + "?token=" + token);
    var query = new esri.tasks.Query();


    var polygon = new esri.geometry.Polygon(new esri.SpatialReference({
        wkid: 3414
    }));

    xx = parseFloat(xx);
    yy = parseFloat(yy);

    polygon.addRing([
        [xx + 900, yy + 900],
        [xx + 900, yy - 900],
        [xx - 900, yy - 900],
        [xx - 900, yy + 900],
        [xx + 900, yy + 900]
    ]);
    var symbol = new esri.symbol.SimpleFillSymbol("none", new esri.symbol.SimpleLineSymbol("dashdot", new dojo.Color([255, 0, 0]), 0.01), new dojo.Color([255, 255, 0, 0.01]));
    var PointGraphic = new esri.Graphic(polygon, symbol)
    OneMap.map.graphics.add(PointGraphic);

    query.geometry = PointGraphic.geometry;
    query.outFields = ["OBJECTID"];
    query.geometryType = "";
    query.outSR = "";
    query.returnGeometry = true;
    query.spatialRel = "esriSpatialRelIntersects";
    query.text = "";
    query.where = "";

    hideThemes();
    queryTask.execute(query);
    dojo.connect(queryTask, "onComplete", function(fset) {
        CHASCLINIC = new MashupData();
        CHASCLINIC.themeName = "CHASCLINIC";

        var xMin = xx - 900;
        var yMin = yy - 900;
        var xMax = xx + 900;
        var yMax = yy + 900;
        CHASCLINIC.extent = xMin + "," + yMin + "," + xMax + "," + yMax;

        themeGraphicsLayer.id = "CHASCLINIC";
        OneMap.map.addLayer(themeGraphicsLayer);
        CHASCLINIC.GetMashupData(overlayData);
        $("#hideTheme").show();
    });


    dojo.connect(themeGraphicsLayer, "onClick", function(evt) {
        CHASCLINIC.GetDataForCallout(evt.graphic, "", function(results) {
            $('#destination').val(results[0].XY); //This assigns clicked coordinates to hidden input for routing 
            var formattedResults = "<h4>" + results[0].NAME + "</h4><br><p>" + results[0].DESCRIPTION + "<br>" + results[0].ADDRESS + "</p>";
            $('#introDiv').show();
            $('#intro').html(formattedResults);
        });
    })
}


function overlayData(mashupResults) {
    function hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    var results = mashupResults.results;
    if (results == "No results") {
        alertify.error("<strong>No results found nearby!</strong>");
        return;
    }
    var featcount = mashupResults.count;
    var iconPath = mashupResults.iconPath
    var featType = mashupResults.featType;
    themeGraphicsLayer.clear();
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
            themeGraphicsLayer.add(PointGraphic);
        }
    } else if (featType == "Polygon") {
        var polygon;
        for (i = 0; i < results.length; i++) {
            if (mashupResults.results[i].SYMBOLCOLOR != undefined && mashupResults.results[i].SYMBOLCOLOR != "") {
                var polyColor = mashupResults.results[i].SYMBOLCOLOR;
                var r = hexToRgb(polyColor).r;
                var g = hexToRgb(polyColor).g;
                var b = hexToRgb(polyColor).b;
            } else if (mashupResults.results[i].SYMBOLCOLOR == "") {
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
            themeGraphicsLayer.add(gra);
        }
    } else if (featType == "Line") {
        var pLine;
        for (i = 0; i < results.length; i++) {
            if (mashupResults.results[i].SYMBOLCOLOR != undefined && mashupResults.results[i].SYMBOLCOLOR != "") {
                var polyColor = mashupResults.results[i].SYMBOLCOLOR;
                var r = hexToRgb(polyColor).r;
                var g = hexToRgb(polyColor).g;
                var b = hexToRgb(polyColor).b;
            } else if (mashupResults.results[i].SYMBOLCOLOR == "") {
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
            themeGraphicsLayer.add(gra);
        }

    }
}



function DisplayGeocodeData(geocode) {
    var oneMapAddressInfoObj = new GetAddressInfo;
    oneMapAddressInfoObj.XY = geocode;
    oneMapAddressInfoObj.GetAddress(function(addressData) {
        if (addressData.results == "No results") {
            return;
        } else {
            var htmlStr = "<button class='btn btn-sm btn-danger' data-toggle='modal' data-target='#routing'> Get Routes </button>";
            document.getElementById('address').innerHTML = htmlStr;
        }
    });
}

function getAddressData(geocode) {
    var oneMapAddressInfoObj = new GetAddressInfo;
    oneMapAddressInfoObj.XY = geocode;
    oneMapAddressInfoObj.GetAddress(function(addressData) {
        name = addressData.results[0].BUILDINGNAME + "<br>" + addressData.results[0].BLOCK + "  " + addressData.results[0].ROAD;

    });
    return name;
}
