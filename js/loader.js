var CrimeLoader = (function () {
    function CrimeLoader(map, types) {
        this.map = map;
        this.types = types;
        this.data = {};
        this.geo = {};
    }

    CrimeLoader.prototype.load = function (query) {
        var self = this;

        var map = {
            years: {},
            weeks: {},
            types: {}
        };

        $.each(query.years, function (i, year) {
            map.years[year] = true;
        });

        $.each(query.weeks, function (i, week) {
            map.weeks[week] = true;
        });

        $.each(query.types, function (i, type) {
            map.types[type] = true;
        });

        query.map = map;
        this.query = query;

        $.each(this.geo, function (year, weeks) {
            $.each(weeks, function (week, types) {
                $.each(types, function (type, places) {
                    $.each(places, function (i, place) {
                        self.placeFilterUpdate(place);
                    });
                });
            });
        });

        $.each(query.years, function (i, year) {
            $.each(query.weeks, function (j, week) {
                self.getData(year, week, function (data) {
                    self.updateGeoObjects(year, week, data);
                });
            });
        });
    };

    CrimeLoader.prototype.getData = function (year, week, func) {
        var self = this;
        if (this.data[year] && this.data[year][week]) {
            func(this.data[year][week]);
        } else {
            $.getJSON('dates/' + year + '/' + (week < 10 ? '0' + week : week) + '.json', function (data) {
                if (!self.data[year]) {
                    self.data[year] = {};
                }

                self.data[year][week] = data;
                func(data);
            });
        }
    };

    CrimeLoader.prototype.updateGeoObjects = function(year, week, data) {
        var self = this;
        if ($.inArray(year, self.query.years) != -1 && $.inArray(week, self.query.weeks) != -1) {
            if (self.query.types.length) {
                $.each(self.query.types, function (i, type) {
                    if (data[type]) {
                        var crimes = data[type];
                        self.processCrimes(year, week, type, crimes);
                    }
                });
            } else {
                $.each(data, function (type, crimes) {
                    self.processCrimes(year, week, type, crimes);
                });
            }
        }
    };

    CrimeLoader.prototype.processCrimes = function (year, week, type, crimes) {
        var self = this;

        this.geo[year] = this.geo[year] || {};
        this.geo[year][week] = this.geo[year][week] || {};

        var places;
        if (!this.geo[year][week][type]) {
            places = [];
            $.each(crimes, function (i, crime) {
                places.push(self.crimeToPlace(year, week, type, crime));
            });

            this.geo[year][week][type] = places;
        } else {
            places = this.geo[year][week][type];
        }

        $.each(places, function (i, place) {
            self.placeFilterUpdate(place);
        });
    };

    CrimeLoader.prototype.crimeToPlace = function (year, week, type, crime) {
        crime.year = year;
        crime.week = week;
        crime.type = type;
        crime.active = false;
        crime.color = this.types.getColor(type);

        var place = new ymaps.Placemark([crime.Y, crime.X], {
            balloonContent: crime.Descript,
            clusterCaption: type
        }, {
            preset: crime.color.preset
        });

        place.crime = crime;
        return place;
    };

    CrimeLoader.prototype.placeFilterUpdate = function (place) {
        var self = this;
        var q = this.query.map;
        var crime = place.crime;

        if (q.years[crime.year] && q.weeks[crime.week] && q.types[crime.type]) {
            if (crime.active) {
                // nothing
            } else {
                crime.active = true;
                self.map.add(place);
            }
        } else {
            if (crime.active) {
                crime.active = false;
                self.map.del(place);
            } else {
                // nothing
            }
        }
    };

    return CrimeLoader;
})();