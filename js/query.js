var CrimeQuery = (function () {
    function CrimeQuery (filterValues) {
        var self = this;

        self.years = {};
        $.each(filterValues.years, function (i, year) {
            self.years[year] = true;
        });

        self.weeks = {};
        $.each(filterValues.weeks, function (i, week) {
            self.weeks[week] = true;
        });

        self.types = {};
        $.each(filterValues.types, function (i, type) {
            self.types[type] = true;
        });

        self.times = {};
        $.each(filterValues.times, function (i, time) {
            self.times[time.day] = self.times[time.day] || {};
            self.times[time.day]['' + (time.hour < 10 ? '0' + time.hour : time.hour)] = true;
        });

        $.each(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], function (i, weekday) {
            if (self.times[i] !== undefined) {
                self.times[weekday] = self.times[i];
            } else {
                self.times[weekday] = {};
            }
        });
    }

    CrimeQuery.prototype.eachYearWeek = function (func) {
        var self = this;
        $.each(self.years, function (year) {
            $.each(self.weeks, function (week) {
                func(year, week);
            });
        });
    };

    CrimeQuery.prototype.isMatch = function (crime) {
        if (crime.lastQuery !== this) {
            crime.lastQuery = this;
            crime.lastQueryResult = this.years[crime.year] && this.weeks[crime.week] && this.types[crime.type]
                && this.times[crime.DayOfWeek][crime.Hour]
            ;
        }

        return crime.lastQueryResult;
    };

    return CrimeQuery;
})();
