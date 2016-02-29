var CrimeTypes = (function () {
    function CrimeTypes() {
        var self = this;

        var types = ['LARCENY/THEFT', 'OTHER OFFENSES', 'NON-CRIMINAL', 'ASSAULT', 'DRUG/NARCOTIC', 'VEHICLE THEFT',
            'VANDALISM', 'WARRANTS', 'BURGLARY', 'SUSPICIOUS OCC', 'MISSING PERSON', 'ROBBERY', 'FRAUD',
            'FORGERY/COUNTERFEITING', 'SECONDARY CODES', 'WEAPON LAWS', 'PROSTITUTION', 'TRESPASS', 'STOLEN PROPERTY',
            'SEX OFFENSES FORCIBLE', 'DISORDERLY CONDUCT', 'DRUNKENNESS', 'RECOVERED VEHICLE', 'KIDNAPPING',
            'DRIVING UNDER THE INFLUENCE', 'RUNAWAY', 'LIQUOR LAWS', 'ARSON', 'LOITERING', 'EMBEZZLEMENT', 'SUICIDE',
            'FAMILY OFFENSES', 'BAD CHECKS', 'BRIBERY', 'EXTORTION', 'SEX OFFENSES NON FORCIBLE', 'GAMBLING',
            'PORNOGRAPHY/OBSCENE MAT', 'TREA'
        ];

        var colors = {
            "blue"       : "0A6CC8",
            "darkblue"   : "3D4AE9",
            "darkgreen"  : "158B02",
            "darkorange" : "CD6D2D",
            "green"      : "1AB500",
            "grey"       : "94948E",
            "lightblue"  : "4391E7",
            "night"      : "143A6B",
            "orange"     : "CCA42B",
            "pink"       : "E666DD",
            "red"        : "E03632",
            "violet"     : "A41DE2",
            "white"      : "FFFFFF",
            "yellow"     : "D4C62C",
            "brown"      : "946134",
            "black"      : "000000"
        };

        this.colors = {};
        $.each(colors, function (name, web) {
            self.colors[name] = {
                name: name,
                preset: 'islands#' + name + 'Icon',
                web: web,
                active: false
            };
        });

        this.typeColors = {};
        $.each(types, function (i, type) {
            self.typeColors[type] = {
                'c': self.colors.black
            };
        });

        this.render(types);
        this.toggle('DRUG/NARCOTIC', true);
        this.toggle('VEHICLE THEFT', true);
    }

    CrimeTypes.prototype.getColor = function (type) {
        return this.typeColors[type];
    };

    CrimeTypes.prototype.render = function (types) {
        var self = this;
        var div = $('#types');
        this.typeChecks = {};

        $.each(types, function (i, type) {
            var chk = $('<div><input type="checkbox" name="' + type + '"> <span style="display: none;" class="glyphicon glyphicon-flag"></span> ' + type + ' </div>');
            self.typeChecks[type] = chk;
            div.append(chk);
        });

        div.find('input').click(function () {
            self.toggle($(this).attr('name'));
        });
    };

    CrimeTypes.prototype.toggle = function (type, notUser) {
        var self = this;
        var chk = this.typeChecks[type].find('input');
        if (notUser) {
            chk.prop('checked', !chk.prop('checked'));
        }

        var color = self.typeColors[type];
        var checked = chk.prop('checked');

        if (!checked && !this.getActiveTypes().length) {
            color.c.active = true;
            chk.prop('checked', true);
            alert('Min types - 1');

            return;
        }

        if (checked) {
            if (!color.c.active) {
                color.c.active = true;
            } else {
                var free = self.getFreeColor();
                if (free) {
                    color.c = free;
                    free.active = true;
                } else {
                    chk.prop('checked', false);
                    alert('Max types - 16');
                }
            }
        } else {
            color.c.active = false;
        }

        if (!notUser) {
            var callback = this.changeCallback;
            if (callback) {
                callback();
            }
        }

        var ico = chk.siblings('.glyphicon');
        if (chk.prop('checked')) {
            ico.css('color', '#' + color.c.web).show();
        } else {
            ico.hide();
        }
    };

    CrimeTypes.prototype.getActiveTypes = function () {
        var active = [];

        $.each(this.typeChecks, function (type, chk) {
            if (chk.find('input').prop('checked')) {
                active.push(type);
            }
        });

        return active;
    };

    CrimeTypes.prototype.getFreeColor = function () {
        var free = null;
        $.each(this.colors, function (i, color) {
            if (!color.active && !free) {
                free = color;
            }
        });

        return free;
    };

    CrimeTypes.prototype.onChange = function (callback) {
        this.changeCallback = callback;
    };

    return CrimeTypes;
})();
