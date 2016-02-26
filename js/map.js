var CrimeMap = (function () {
    function CrimeMap() {
        this._recreateMap();
        this.loading = false;
        this.update = {
            add: [],
            del: [],
            len: 0
        };

        var self = this;
        setInterval(function () {
            self._updateMap();
        }, 500);
    }

    CrimeMap.prototype._recreateMap = function () {
        var self = this;
        var opts = {
            center: [37.757518200786244, -122.44563533838704],
            zoom: 12,
            controls: []
        };

        if (this.map) {
            opts.center = this.map.getCenter();
            opts.zoom = this.map.getZoom();
            this.map.destroy();
        }

        this.map = new ymaps.Map("map", opts, {minZoom: 8, maxZoom: 16});
        this.map.controls.add('zoomControl', {
            zoomStep: 2
        });

        this.cluster = new PieChartClusterer({
            gridSize: 60,
            groupByCoordinates: false,
            clusterDisableClickZoom: true,
            clusterHideIconOnBalloonOpen: false,
            geoObjectHideIconOnBalloonOpen: false
        });

        this.map.geoObjects.add(this.cluster);
    };

    CrimeMap.prototype.add = function (place) {
        this.update.add.push(place);
    };

    CrimeMap.prototype.del = function (place) {
        this.update.del.push(place);
    };

    CrimeMap.prototype._updateMap = function () {
        var len = this.update.add.length + this.update.del.length;

        if ((len > 0) && (len == this.update.len)) {
            var add = this.update.add;
            var del = this.update.del;

            this.update.add = [];
            this.update.del = [];
            this.update.len = 0;

            this._doUpdate(add, del);

            if (this.loading) {
                this.loading = false;
                $('body').loadingOverlay('remove');
            }
        } else {
            this.update.len = len;

            if (len > 0 && !this.loading) {
                this.loading = true;
                $('body').loadingOverlay();
            }
        }
    };

    CrimeMap.prototype._doUpdate = function (add, del) {
        if (del.length > 5000) {
            $.each(this.cluster._objects, function (i, obj) {
                if (obj.geoObject.crime.active) {
                    add.push(obj.geoObject);
                }
            });

            this._recreateMap();
            this.cluster.add(add);
        } else {
            this.cluster.add(add);
            this.cluster.remove(del);
        }
    };

    return CrimeMap;
})();
