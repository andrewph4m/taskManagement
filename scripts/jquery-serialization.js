(function($) {
		$.fn.extend({
			toObject: function(){
				//implement toObject: toObject will be invoked on a form wrapped by a jQuery object which will be serialised to an array then to an object by $.each
				var result = {};
				// SerializeArray(): An existing jQuery function that serialises a form (wrapped in a jQuery object) to a JavaScript array
				$.each(this.serializeArray(), function(i, v){
					result[v.name] = v.value;
				});
				return result;
			},
			fromObject: function(obj) {
				//implement fromObject
				$.each(this.find(':input'), function(i, v){
					var name = $(v).attr('name');
					if (obj[name])
						$(v).val(obj[name]);
						//v.value = obj[name];
					else
						$(v).val('');
						//v.value = '';
				});
			}
		});
	})(jQuery);