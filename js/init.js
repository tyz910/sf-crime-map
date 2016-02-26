function weeksToDate(y,w,d) {
    var days = 2 + d + (w - 1) * 7 - (new Date(y,0,1)).getDay();
    return new Date(y, 0, days);
}

ymaps.ready(function () {
    $(function () {
        var types = new CrimeTypes();
        var map = window.map = new CrimeMap();
        var loader = new CrimeLoader(map, types);
        var filter = new CrimeFilter(map, loader, types);
    });
});
