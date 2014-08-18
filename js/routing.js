$(document).ready(function() {
    $("#routeSubmit").click(function() {
        GetSearchForRouting();
    });

    $("#routePublicSubmit").click(function() {
        GetSearchForRouting();
    });
});


function switchToDriving() {
    $('#publicList').attr('class', '');
    $('#driveList').attr('class', 'active');
    $('#driving').attr('class', 'show');
    $('#public').attr('class', 'hide');
    $('#routeSubmit').attr('class', 'btn btn-primary pull-right show');
    $('#routePublicSubmit').attr('class', 'btn btn-danger pull-right hide');

}

function showRoutingIcon() {
    $('#searchResultList').html("<div class='alert alert-danger' style='height:30px;margin:5px 0px 0px 0px;padding: 5px 10px 0px 15px;'><strong><i class='fa fa-spinner fa-spin'></i>&nbspRouting</strong></div>");
}

function switchToPublic() {
    $('#publicList').attr('class', 'active');
    $('#driveList').attr('class', '');
    $('#driving').attr('class', 'hide');
    $('#public').attr('class', 'show');
    $('#routeSubmit').attr('class', 'btn btn-primary pull-right hide');
    $('#routePublicSubmit').attr('class', 'btn btn-danger pull-right show');
}


function GetSearchForRouting() {
    var basicSearch = new BasicSearch;
    var searchText = document.getElementById("origin").value;
    basicSearch.searchVal = searchText;
    basicSearch.returnGeom = '1';
    basicSearch.GetSearchResults(displayOriginList);
}

function displayOriginList(resultData) {
    var results = resultData.results;
    if (results == 'No results') {
        alertify.error("<Strong>No address infomation found</Strong>");
        return false
    } else {
        var htmlStr = "<ul class='list-group  scrollable-menu'>";
        if ($('#publicList').attr('class') == 'active') {
            for (var i = 0; i < results.length; i++) {
                var row = results[i];
                var originX = row.X;
                var originY = row.Y;
                htmlStr = htmlStr + "<li class='list-group-item'>";
                htmlStr = htmlStr + "<a href='JavaScript:getPublicDirections(" + originX + "," + originY + ")'>" + row.SEARCHVAL + "</a>";
                htmlStr = htmlStr + "</li>";
            }
        } else {
            for (var i = 0; i < results.length; i++) {
                var row = results[i];
                var originX = row.X;
                var originY = row.Y;
                htmlStr = htmlStr + "<li class='list-group-item'>";
                htmlStr = htmlStr + "<a href='JavaScript:getDirections(" + originX + "," + originY + ")'>" + row.SEARCHVAL + "</a>";
                htmlStr = htmlStr + "</li>";
            }
        }
        htmlStr = htmlStr + "</ul>";
        $('#resultCount').text(results.length);
        $('#originListButton').click();
        $('#originListBody').html(htmlStr);
    }
}



function getDirections(originX, originY) {
    $('#originListClose').click();
    showRoutingIcon();


    var routeData = new Route;
    var origin = originX + "," + originY;
console.log(origin);

    if ($('#fastest').is(':checked'))
        routeData.routeOption = $('#fastest').val();
    else
        routeData.routeOption = $('#shortest').val();

    if ($('#erp').is(':checked'))
        routeData.avoidERP = '0';
    else
        routeData.avoidERP = '1';
    routeData.routeMode = 'Drive';
    routeData.routeStops = origin + ";" + $('#destination').val();
    console.log("routeStops: " + origin + ";" + $('#destination').val());

    var originName = getAddressData(origin);
    console.log("originName: " + originName);

    $('#originName').val(originName);

    setTimeout(function() {
        var destinationName = getAddressData($('#destination').val());
        console.log("destinationName: " + destinationName);
        $('#destinationName').val(destinationName);
    }, 3000);



    routeData.GetRoute(showRouteData);
}


function showRouteData(routeResults) {
    if (routeResults.results == "No results") {
        document.getElementById('searchResultList').innerHTML = "<div class='alert alert-danger' style='height:30px;margin:5px 0px 0px 0px;padding: 5px 10px 0px 15px;'>No Routes Found</div>";
    }
    if (typeof routeResults.results.directions == "undefined") {
        document.getElementById('searchResultList').innerHTML = "<div class='alert alert-danger' style='height:30px;margin:5px 0px 0px 0px;padding: 5px 10px 0px 15px;'>No Routes Found</div>";
    } else {
        directions = routeResults.results.directions[0];
        directionFeatures = directions.features;
        var routeSymbol = new esri.symbol.SimpleLineSymbol().setColor(new dojo.Color([27, 194, 255, 1])).setWidth(6);
        var mergedGeometry = new esri.geometry.Polyline();
        mergedGeometry.addPath(routeResults.results.routes.features[0].geometry.paths[0]);
        OneMap.map.graphics.clear();
        OneMap.map.graphics.add(new esri.Graphic(mergedGeometry, routeSymbol));
        var htmlStr = "<a id='dropdownB' href='#' class='dropdown-toggle' data-toggle='dropdown'>Instructions <span id='resultCount' class='badge'></span><b class='caret'></b></a><ul class='list-group dropdown-menu scrollable-menu'><li class='list-group-item'>Total distance:<br>" + parseFloat(Math.round(directions.summary.totalLength * 100) / 100).toFixed(2) + " km</li><li class='list-group-item'>Time estimated:<br>" + parseFloat(Math.round(directions.summary.totalTime * 100) / 100).toFixed(2) + " min</li>";
        for (var i = 0; i < directions.features.length; i++) {
            var feature = directions.features[i]
            if (i == directions.features.length - 1) {
                htmlStr = htmlStr + "<li class='list-group-item'>";
                console.log("o:  " + $('#originName').val());
                htmlStr = htmlStr + parseInt(parseInt(i) + 1) + ". Finish at <br>" + $('#originName').val();
                htmlStr = htmlStr + "</li>";
            } else if (i == 0) {
                htmlStr = htmlStr + "<li class='list-group-item'>";
                console.log("d:  " + $('#destinationName').val());
                htmlStr = htmlStr + parseInt(parseInt(i) + 1) + ". Start at <br>" + $('#destinationName').val();
                htmlStr = htmlStr + "</li>";
            } else {
                htmlStr = htmlStr + "<li class='list-group-item'>";
                htmlStr = htmlStr + parseInt(parseInt(i) + 1) + ". " + feature.attributes.text + " <br>(" + parseFloat(Math.round(feature.attributes.length * 100) / 100).toFixed(2) + " km, " + parseFloat(Math.round(feature.attributes.time * 100) / 100).toFixed(2) + " min)";
                htmlStr = htmlStr + "</li>";
            }
        }
        htmlStr = htmlStr + "</ul>";

        document.getElementById('searchResultList').innerHTML = htmlStr;
        $('#resultCount').text(directions.features.length);
    }
}


function getPublicDirections(originX, originY) {

    $('#originListClose').click();
    showRoutingIcon();

    var origin = originX + "," + originY;

    var destination = $('#destination').val();
    var startstop = $('#startstop').val();
    var endstop = $('#endstop').val();
    var mode;
    var routeOption;
    if ($('#busPublic').is(':checked'))
        mode = "BUS";
    else
        mode = "BUS/MRT";
    if ($('#fastestPublic').is(':checked'))
        routeOption = "fastest";
    else
        routeOption = "cheapest";

    var url = "http://www.onemap.sg/publictransportation/service1.svc/routesolns?token=qo/s2TnSUmfLz+32CvLC4RMVkzEFYjxqyti1KhByvEacEdMWBpCuSSQ+IFRT84QjGPBCuz/cBom8PfSm3GjEsGc8PkdEEOEr&sl=" + origin + "&el=" + destination + "&walkdist=500&mode=" + mode + "&routeopt=" + routeOption + "&retgeo=true&maxsolns=1&callback=";
    url = encodeURI(url);


    $.getJSON(url, function(data) {
        if (data.BusRoute[0].STEPS.length > 1) {
            var time = data.BusRoute[0].Duration;
            var timeSplit = time.split(",");
            var totalTime = parseInt(timeSplit[0].replace(":", ".")) + parseInt(timeSplit[1].replace(":", "."));
        } else
            var totalTime = parseInt(data.BusRoute[0].Duration.replace(":", "."));
        var totalDistance = data.BusRoute[0].TotalDistance;
        var htmlStr = "<a id='dropdownB' href='#' class='dropdown-toggle' data-toggle='dropdown'>Total Stops<span id='resultCount' class='badge'></span><b class='caret'></b></a><ul class='list-group dropdown-menu scrollable-menu'><li class='list-group-item'>Time distance:<br>" + totalDistance + " km</li><li class = 'list-group-item' > Time estimated:<br>" + totalTime + " min</li><li class = 'list-group-item' > Total cost:<br>$ " + data.BusRoute[0].TotalCard + "</li>";

        for (var i = 0; i < data.BusRoute[0].STEPS.length; i++) {
            htmlStr += "<li class = 'list-group-item' >" + parseInt(parseInt(i) + 1) + ". " + " Take <br><Strong>" + data.BusRoute[0].STEPS[i].ServiceType + " " +
                data.BusRoute[0].STEPS[i].ServiceID + "</Strong> at <Strong><br>" +
                data.BusRoute[0].STEPS[i].BoardDesc + "</Strong><br> alight at <strong><br>" +
                data.BusRoute[0].STEPS[i].AlightDesc + "</strong></li>"
        }

        var path = String(data.BusRoute[0].PATH[0]); // Full path coordinates.Format["x,y;x,y;x,y;|x,y;x,y;x,y;"]
        var steps = path.split('|'); //split transfers. Format ["x,y;x,y;x,y;","x,y;x,y;x,y;"]
        var coordinatesList = [];
        OneMap.map.graphics.clear();

        for (var i = 0; i < steps.length; i++) {
            coordinatesList[i] = steps[i].split(';'); //All coordinates of bus stops for each transfer. Format ["x,y","x,y","x,y","x,y","x,y","x,y"]
        };

        for (var o = 0; o < coordinatesList.length; o++) {
            var array = [];
            var first = coordinatesList[o];
            var coordinates = [];

            for (var i = 0; i < first.length; i++) {
                var second = first[i].split(',');
                var third = [];
                third[0] = second[0];
                third[1] = second.pop();
                coordinates.push(third);
            };

            for (var p = 0; p < coordinates.length; p++) {
                array.push(coordinates[p]);
            };
            if (o == 0) {
                var routeSymbol = new esri.symbol.SimpleLineSymbol().setColor(new dojo.Color([27, 194, 255, 1])).setWidth(6);
            } else if (o == 1) {
                var routeSymbol = new esri.symbol.SimpleLineSymbol().setColor(new dojo.Color([67, 152, 59, 1])).setWidth(6);
            } else if (o == 2) {
                var routeSymbol = new esri.symbol.SimpleLineSymbol().setColor(new dojo.Color([0, 0, 139, 1])).setWidth(6);
            } else if (o == 3) {
                var routeSymbol = new esri.symbol.SimpleLineSymbol().setColor(new dojo.Color([255, 0, 0, 1])).setWidth(6);
            }
            var mergedGeometry = new esri.geometry.Polyline();
            mergedGeometry.addPath(array); // Format required: [[x,y],[x,y],[x,y],[x,y],[x,y],[x,y]]. An array of X & Y for all stops, then put into an array.
            OneMap.map.graphics.add(new esri.Graphic(mergedGeometry, routeSymbol));

        };

        $('#searchResultList').html(htmlStr);
        $('#resultCount').text(data.BusRoute[0].TotalStops);

    });
}
