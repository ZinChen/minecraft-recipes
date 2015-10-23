// main parser
var result = [];
var bg = {};

//Object.keys(bg).length
//762

var getName = function($this) {
	var name = '';
	if ($this.data('minetip-text') && $this.data('minetip-title')) {
		name = 
			removeSymbolsFromBegin($this.data('minetip-text'),'&7') 
			+ ' ' 
			+ $this.data('minetip-title');
	} else if($this.data('minetip-title')) {
		name = $this.data('minetip-title');
		if (name === '&d' || name === '&b') {
			name = 'Golden Apple';
		}
	} else {
		name = $this.find('a').attr('title');
		
	}
	if (!name) {
		name = 'empty';
	}
	if (name.indexOf(' (page does not exist)') > 0) {
		name = name.substr(0, name.indexOf(' (page does not exist)'));
	}
	return name;
}

var removeSymbolsFromBegin = function(s, symbols) {
	if (s.indexOf(symbols) === 0) {
		s = s.substr(symbols.length);
	}
	return s;
}


var recipeTables = $('.load-page-content > table > tbody > tr');
recipeTables.each(function() {
	var object = {};
	var $this = $(this);
	
	var category = $this.closest('.load-page').find('h3 .mw-headline').html();
	var name = [];
	$this.find('.mcui-output .invslot-item').each(function() {
		name.push(getName($(this)));
	});
	
	var recipes = [];
	var count = $this.find('.animated').first().children().length;
	if (count === 0) {
		count = 1;
	}
	for (var i = 0; i < count; i++) {
		recipes.push([]);
	};

//	TODO add category "closest .load-page-content"
//	get css background .find('.mcui-input > .mcui-row > .invslot .invslot-item a span').first().css('background-position');
//	sort elements by name (?) or make other array with name as key
	
	$this.find('.mcui-input > .mcui-row > .invslot').each(function() {
		if ($(this).find('.invslot-item').length === 0) {
			for (var i = 0; i < count; i++) {
				recipes[i].push(0);
			};
		} else if (count > 1 && $(this).hasClass('animated')) {
			$(this).find('.invslot-item').map(function(i, item){
				var name = getName($(item));
				recipes[i].push(name);
			})
		} else {
			var cellItem = $(this).find('.invslot-item');
			for (var i = 0; i < count; i++) {
				recipes[i].push(getName(cellItem));
			};
		}
	});

	object = {
		'name': name,
		'category': category,
		'recipes': recipes,
	};
	result.push(object);
});

$('.load-page-content > table > tbody > tr .invslot-item').each(function() {
	var $this = $(this);
	var name = getName($this);

	if(!bg[name]) {
		var bgPos = $this.find('a span').css('background-position');
		bg[name] = bgPos;
	}
});

console.log(JSON.stringify(result));
JSON.stringify(bg);

//bg = JSON.parse(bgdata);
//for (var b in bg) {$('.item').first().clone().appendTo('.container').find('.inner-item').css('background-position', bg[b]);}