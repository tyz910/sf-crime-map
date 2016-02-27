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
            crime.lastQueryResult = this.years[crime.year] && this.weeks[crime.week] && this.types[crime.type];
        }

        return crime.lastQueryResult;
    };

    return CrimeQuery;
})();
