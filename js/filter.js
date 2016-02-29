var CrimeFilter = (function () {
    function CrimeFilter(map, loader, types) {
        var self = this;

        this.year = 2003;
        this.map = map;
        this.loader = loader;
        this.types = types;
        this.monthList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        this.weeks = $("#week_slider").rangeSlider({
            defaultValues: {min: 1, max: 2},
            bounds: {min: 1, max: 27},
            range: {min: 1},
            step: 1,
            formatter: function(val) {
                var w = self.weeks.rangeSlider("values").min;
                var isLeft = val == w;
                w *= 2;

                var date;
                if (isLeft) {
                    date = weeksToDate(self.year, w, 0);
                } else {
                    date = weeksToDate(self.year, val * 2, 0);
                }

                var day = date.getDate();
                var month = self.monthList[date.getMonth()];

                return day + ' ' + month;
            }
        });

        this.years = $("#year_slider").rangeSlider({
            defaultValues: {min: 2003, max: 2004},
            bounds: {min: 2003, max: 2016},
            range: {min: 1},
            step: 1
        });

        var allHours = [];
        for (var day = 0; day < 7; day++){
            for (var hour = 0; hour < 24; hour++){
                allHours[allHours.length]={
                    day: day,
                    hour: hour
                };
            }
        }

        this.times = $("#time_select").dayparts({
            showPresets: false,
            data: allHours
        });

        this.weeks.bind("userValuesChanged", function () {
            self.changed();
        });

        this.years.bind("userValuesChanged", function () {
            var year = 2003;
            $.each(self.getYears(), function (i, y) {
                year = y;
            });

            self.year = year;
            self.changed();
        });

        this.types.onChange(function () {
            self.changed();
        });

        this.times.on("daypartsUpdate", function() {
            self.changed();
        });

        self.changed();
    }

    CrimeFilter.prototype.changed = function () {
        this.loader.load(this.createQuery(), this.map);
    };

    CrimeFilter.prototype.createQuery = function () {
        return new CrimeQuery({
            types: this.types.getActiveTypes(),
            years: this.getYears(),
            times: this.getTimes(),
            weeks: this.getWeeks()
        });
    };

    CrimeFilter.prototype.getWeeks = function () {
        var wList = [];
        var weeks = this.weeks.rangeSlider("values");
        for (var i = weeks.min; i < weeks.max; i = i + 1) {
            wList.push(i * 2);
        }

        return wList;
    };

    CrimeFilter.prototype.getYears = function () {
        var yList = [];
        var years = this.years.rangeSlider("values");
        for (var i = years.min; i < years.max; i = i + 1) {
            yList.push(i);
        }

        return yList;
    };

    CrimeFilter.prototype.getTimes = function () {
        return this.times.dayparts.getValue();
    };

    return CrimeFilter;
})();