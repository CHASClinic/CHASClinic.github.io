$(document).ready(function() {
    alertify.log("<strong><kbd>Click</kbd>&nbsp on a building to display nearby CHAS Clinics or simply use <kbd>search</kbd>!</strong>", "", 0);
    $(".themeButton").click(function() {
        var option = $(this).html();
        OverlayTheme2(option);


    });
    $('#introDiv').hide();
    $("#hideTheme").hide();
});




function hideThemes() {
    var layers = map.graphicsLayerIds.length;
    for (var i = 0; i < layers; i++) {
        map.removeLayer(map.getLayer(map.graphicsLayerIds[0]));
    };
    $("#hideTheme").hide();
    //$('#introDiv').hide();
}

var centerPoint = "28968.103,33560.969";
var levelNumber = 1;
var OneMap = new GetOneMap('divMain', 'SM', {
    level: levelNumber,
    center: centerPoint
});

function getCoordinates(evt) {
    var x = evt.mapPoint.x.toFixed(3);
    var y = evt.mapPoint.y.toFixed(3);
    getResult(x, y);
}

function init() {
    map = OneMap.map;
    map.hideZoomSlider();
    dojo.connect(OneMap.map, "onClick", getCoordinates);
}

dojo.addOnLoad(init);

function slideUp() {
    $('.navbar,#hideChevron,#zoomBar').animate({
        top: -70
    }, 500);
}

function slideDown() {
    $('.navbar,#hideChevron,#zoomBar').animate({
        top: 0
    }, 500);
}
