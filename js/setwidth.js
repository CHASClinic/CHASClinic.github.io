$(document).ready(function() {

    var width = $(window).width();
    var height = $(window).height();
    $("#divMain").width(width);
    $("#divMain").height(height);
    $("#map-canvas").width(width);
    $("#map-canvas").height(height);
    $("#navbar").width(width);
    $("#chevron").css('margin-left', width / 2);
   

     $("#txtSearchText").width(width / 3);
});
