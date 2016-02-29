/**********************************************
 * jQuery Dayparts
 * ***************
 * a jQuery Plugin for selecting Hours-of-Day
 *
 * Mike Cousins / @mcuznz / github.com/mcuznz
 **********************************************/

(function (factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as anonymous module.
		define(['jquery'], factory);
	} else {
		// Browser globals.
		factory(jQuery);
	}
}(function ($) {
	
	$.fn.dayparts = function( options ) {

		var $el = $(this);

		var dataChange = function(pointA, pointB, dragging) {
			if (!settings.disabled){
                            toggleGrid(pointA, pointB, $table, dragging);
                            // Trigger a catchable event other stuff can listen to
                            if (!dragging) $el.trigger('daypartsUpdate');
                        }
		};

		var settings = $.extend({}, $.fn.dayparts.defaults, options);
		value = settings.data || [];

		var drag_start = null;
		var drag_current = null;

		var $table = $('<table />').addClass('dayparts table');
                
                var minTwoDigits = function (n) {
                    return (n < 10 ? '0' : '') + n;
                };
                
		var hours = {};
		for (var i=0; i<24; i++){
			var thishour = i;
			if (!settings.use24HFormat) {
				if (thishour > 12) thishour -= 12;
				if (settings.change0Hour && thishour === 0) thishour = 12;
			} else {
				if (settings.change0Hour && thishour === 0) thishour = 24;
			}
                        if (settings.show2DigitsHour){
                            hours[i] = minTwoDigits(thishour);
                        }else{
                            hours[i] = thishour;
                        }
		}

		var $thead = $("<thead />");
		
		var presetLoader = function(preset) {
			// Blank out the whole grid
			$table.find('.dayparts-cell').data('state', 0)
			.removeClass('hour-active').addClass('hour-inactive');

			$.each(preset.days, function(index, day) {
				$.each(preset.hours, function(index2, hour) {
					$table.find('td.day-' + day + '.hour-' + hour)
					.data('state', 1).addClass('hour-active').removeClass('hour-inactive');
				});
			});

			updateValue($table.find('.dayparts-cell'));
			$el.trigger('daypartsUpdate');
		};

		// Presets at Top of Header if applicable
		if (settings.showPresets && settings.presets.length) {
			var $td = $("<td />").attr('colspan', 24);

			// Create the Prefix dropdown
			var $select = $("<select />").change(function(){
				if ($(this).find('option:selected').data('preset')) {
					presetLoader($(this).find('option:selected').data('preset'));
				}
			}).addClass("form-control");

			$select.append($("<option />")
				.addClass('default-option')
				.html(settings.i18nfunc(settings.labels.choosePreset)));

			var val = [];
			$.each(value, function(index, v) {
				if (!isNaN(v.day) && isFinite(v.day) && !isNaN(v.hour) && isFinite(v.hour)) {
					val.push(v);
				}
			});
			val = JSON.stringify(val);

			$.each(settings.presets, function(index, preset) {
				$select.append(
					$("<option />")
						.html(settings.i18nfunc(preset.label))
						.data('preset', preset)
						.val(index)
				);
				var data = [];
				$.each(preset.days, function(index, day) {
					var row = [];
					$.each(preset.hours, function(index2, hour){ row.push({day:day, hour:hour}) });
					$.merge(data, row);
				});

				if (val == JSON.stringify(data)) {
					$select.find('option').last().prop('selected', true);
				};

			});
                        if (settings.disabled){
                            $select.prop('disabled', true);
                        }
                        
                        var $presetsSubtitle = $("<span />").addClass('cell-label presetsSubtitle-label').html(
                            settings.i18nfunc(settings.labels.presetsSubtitle)
                        );
                
                        //Presets subtitle before select
			$td.append($presetsSubtitle);
                        
                        //Select
                        $td.append($select);
                        
                        var $label = $("<td />").addClass('cell-label presets-label').html(
				settings.i18nfunc(settings.labels.presets)
			);
			var $tr = $("<tr />");
			
			//Presets title before subtitle and select
			$tr.append($label).append($td);

			$thead.append($tr);

		}

		// Row with AM and PM Labels
		var $tr = $("<tr />");
		var $td = $("<td />").html('&nbsp;').attr('rowspan', 2);
		$tr.append($td);

		var $am = $("<td />").addClass('cell-label am-label').html(
			settings.i18nfunc(settings.labels.am)
		).attr('colspan', 12);
		var $pm = $("<td />").addClass('cell-label pm-label').html(
			settings.i18nfunc(settings.labels.pm)
		).attr('colspan', 12);

		$tr.append($am).append($pm);
		$thead.append($tr);

		// Row with all Hour Labels
		var $hour_tr = $("<tr />");
		for (var i=0; i<24; i++) {
			var $hour_td = $("<td />").addClass('cell-label hour-label')
				.addClass('hour-label-'+ i)
				.html(hours[i])
				.data('hour', i)
				.click(function(e){
					e.preventDefault();

					// See if *any* cells in this hour are state=1
					$hours = $tbody.find("td.dayparts-cell.hour-" + $(this).data('hour'));

					var numActive = 0;
					$.each($hours, function() {
						if ($(this).data('state')) numActive += 1;
					});

					var currState = 0;
					if (numActive == 7) currState = 1;

					dataChange(
						{day: 0, hour: $(this).data('hour'), state: currState},
						{day: 6, hour: $(this).data('hour'), state: currState},
						false);
				});
			if (i < 12) {
				$hour_td.addClass('hour-label-am');
			} else {
				$hour_td.addClass('hour-label-pm');
			}
			$hour_tr.append($hour_td);
		}

		$thead.append($hour_tr);
		$table.append($thead);

		var $tbody = $("<tbody />");

		var day = settings.weekStartsOn;
		for (var i=0; i<7;i++) {

			var $this_tr = $("<tr />");
			var $this_label = $("<td />").addClass('cell-label day-label')
				.addClass(settings.days[day] + '-label')
				.html(settings.i18nfunc(settings.i18nfunc(settings.days[day])))
				.data('day', day)
				.click(function(e) {
					e.preventDefault();

					// See if *any* cells in this hour are state=1
					$days = $tbody.find("td.dayparts-cell.day-" + $(this).data('day'));

					var numActive = 0;
					$.each($days, function() {
						if ($(this).data('state')) numActive += 1;
					});

					var currState = 0;
					if (numActive == 24) currState = 1;

					dataChange(
						{day: $(this).data('day'), hour: 0, state: currState},
						{day: $(this).data('day'), hour: 23, state: currState},
						false);
				});

			$this_tr.append($this_label);

			for (var j=0; j<24; j++) {
				var $hour_td = $("<td />").addClass('dayparts-cell')
					.addClass('day-'+day).addClass('hour-'+j)
					.html('&nbsp;')
					.data('hour', j)
					.data('day', day)
					.data('state', 0)
					.mousedown(function(e){
						e.preventDefault();
						drag_start = drag_current = $(this).data();
					})
					.mouseup(function(e){
						e.preventDefault();
						drag_current = $(this).data();
						dataChange(drag_start, drag_current, false);
						drag_start = drag_current = null;
					})
					.mousemove(function(e){
						e.preventDefault();
						if (drag_start &&
							$(this).data() !== drag_start &&
							$(this).data() !== drag_current) {
							// Dragging is happening
							drag_current = $(this).data();
							dataChange(drag_start, drag_current, true);
						};
					});
				$this_tr.append($hour_td);
			}

			$tbody.append($this_tr);

			day += 1;
			// Wrap around the week, just in case we don't start on Sunday
			if (day == 7) day = 0;

		};

		$table.append($tbody);

		$el.append($table);

		// Loop over contents of Value here, if it was set on load.
		if (value && value.length) {
			$.each(value, function(index, val) {
				// Find the cell with the matching day and hour
				if (val.day !== undefined && val.hour !== undefined) {
					$table.find('td.day-' + val.day + '.hour-' + val.hour)
					.data('state', 1).addClass('hour-active');
				};
			});
		};


		// Chaining!
		return this;
	};

	var value = [];

	$.fn.dayparts.getValue = function() {
		return value;
	};

	$.fn.dayparts.defaults = {
		disabled: false,
                i18nfunc: function(input){ return input; },
		days: {0: 'Sunday', 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday'},
		weekStartsOn: 0,
		use24HFormat: true,
		change0Hour: true,
		show2DigitsHour: false,
		showPresets: true,
                presets: [
			{label:"Full Coverage", days:[0,1,2,3,4,5,6], hours:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23]},
			{label:"Afternoons", days:[0,1,2,3,4,5,6], hours:[12,13,14,15,16,17]},
			{label:"Evenings", days:[0,1,2,3,4,5,6], hours:[18,19,20,21,22,23]},
			{label:"Mornings", days:[0,1,2,3,4,5,6], hours:[6,7,8,9,10,11]},
			{label:"Weekdays", days:[1,2,3,4,5], hours:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23]},
			{label:"Weekends", days:[0,6], hours:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23]},
			{label:"Weekends including Friday", days:[0,5,6], hours:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23]}
		],
		labels: {
			am: 'AM',
			pm: 'PM',
			presets: 'Presets',
			presetsSubtitle: '',
			choosePreset: 'Select a Preset'
		},
		data: []
	};

	var updateValue = function($cells) {
		var val = [];
		$cells.each(function(){
			if ($(this).data('state')) {
				val.push({day: $(this).data('day'), hour: $(this).data('hour')});
			};
		});
		value = val;
	};
	
	var toggleGrid = function(dataA, dataB, $grid, dragging) {
		dragging = (typeof dragging === "undefined") ? false : dragging;

		if (!dataA || !dataB) return false;
		
		// Determine the box that's being updated
		var newState = (dataA['state'] ? 0 : 1);

		var minHour = Math.min(dataA['hour'], dataB['hour']);
		var maxHour = Math.max(dataA['hour'], dataB['hour']);

		var minDay = Math.min(dataA['day'], dataB['day']);
		var maxDay = Math.max(dataA['day'], dataB['day']);

		var $cells = $grid.find('.dayparts-cell');

		$cells.removeClass('dragging-active').removeClass('dragging-inactive');

		$cells.each(function(){
			if ($(this).data('hour') >= minHour && $(this).data('hour') <= maxHour &&
				$(this).data('day') >= minDay && $(this).data('day') <= maxDay) {
				// This Cell is somewhere in the Dragged area
				
				if (dragging) {
					if (newState) {
						$(this).addClass('dragging-active');
					} else {
						$(this).addClass('dragging-inactive');
					};
				} else {
					$(this).data('state', newState);
					if (newState) {
						$(this).removeClass('hour-inactive');
						$(this).addClass('hour-active');
					} else {
						$(this).removeClass('hour-active');
						$(this).addClass('hour-inactive');
					};
				};
			};
		});

		updateValue($cells);

	};

}));

