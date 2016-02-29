var CrimeLoader = (function () {
    function CrimeLoader(map, types) {
        this.map = map;
        this.types = types;
        this.data = {};
        this.geo = {};
        this.db = new PouchDB('sf-crime');
    }

    CrimeLoader.prototype.load = function (query) {
        var self = this;
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

        this.query.eachYearWeek(function (year, week) {
            self.getData(year, week, function (data) {
                self.updateGeoObjects(year, week, data);
            });
        });
    };

    CrimeLoader.prototype.getData = function (year, week, func) {
        var self = this;
        var cacheKey = 'y' + year + 'w' + week;

        if (this.data[year] && this.data[year][week]) {
            func(this.data[year][week]);
        } else {
            if ((year < 2003) || (year == 2015 && week < 20) || (year > 2015)) {
                return;
            }

            if (!self.data[year]) {
                self.data[year] = {};
            }

            this.db.get(cacheKey).then(function (doc) {
                self.data[year][week] = doc.data;
                func(doc.data);
            }).catch(function (err) {
                $.getJSON('dates/' + year + '/' + (week < 10 ? '0' + week : week) + '.json', function (data) {
                    self.data[year][week] = data;
                    func(data);

                    self.db.put({
                        '_id': cacheKey,
                        'data': data
                    });
                });
            });
        }
    };

    CrimeLoader.prototype.updateGeoObjects = function(year, week, data) {
        var self = this;

        $.each(self.query.types, function (type) {
            if (data[type]) {
                self.processCrimes(year, week, type, data[type]);
            }
        });
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
            balloonContent: this.getCrimeDescription(crime),
            clusterCaption: type
        }, {
            preset: crime.color.c.preset
        });

        place.crime = crime;
        return place;
    };

    CrimeLoader.prototype.getCrimeDescription = function (crime) {
        return crime.Descript + '<br>'
            + '<small>' + crime.X + ', ' + crime.Y + '</small><br><br>'
            + '<table class="crime-info">'
            + '<tr><td>Resolution:</td><td>' + crime.Resolution + '</td></tr>'
            + '<tr><td>Address:</td><td>' + crime.PdDistrict + ', ' + crime.Address + '</td></tr>'
            + '<tr><td>Date:</td><td>' + crime.Date + ', ' + crime.DayOfWeek + '</td></tr>'
            + '</table>'
        ;
    };

    CrimeLoader.prototype.placeFilterUpdate = function (place) {
        var self = this;
        var crime = place.crime;

        if (self.query.isMatch(crime)) {
            if (!crime.active) {
                crime.active = true;
                self.map.add(place);

                if (crime.color.c.preset != place.options.get('preset')) {
                    place.options.set('preset', crime.color.c.preset);
                }
            }
        } else if (crime.active) {
            crime.active = false;
            self.map.del(place);
        }
    };

    return CrimeLoader;
})();