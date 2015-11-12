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
	if (
		!$this.closest(".mcui-output").length && 
		$this.closest('td').prev().find('p:contains("Damaged")').length > 0
	) {
		name = "Damaged " + name;
	}
	return name;
}

var removeSymbolsFromBegin = function(s, symbols) {
	if (s.indexOf(symbols) === 0) {
		s = s.substr(symbols.length);
	}
	return s;
}

//$('.load-page-content').each(function() {
//	var $this = $(this);
//	var $title = $this.prev().find('.mw-headline');
//	if($title.has('a').length) {
//		var category = $title.find('a').html();
//	} else {
//		var category = $title.html();
//	}
//});
var itemStackSizes = [];
$('.load-page-content> table > tbody > tr .mcui-output').each(function() {
	var $this = $(this);
	var stackSize = $this.find('.invslot-stacksize');
	if (stackSize.length > 0) {
		itemStackSizes.push(stackSize.first().html());
	} else {
		itemStackSizes.push(1);
	}
});	

$('.load-page-content> table > tbody > tr .mcui-output').each(function() {
	var $this = $(this);
	// $this.find('.invslot-stacksize').first(function() {
	// 	var $this = $(this);
	console.log($this.find('.invslot-stacksize').length);
		if ($this.find('.invslot-stacksize').length > 0) {
			console.log(getName($this) + ' : ' + $this.find('invslot-stacksize').html());
		}
	// });

});

$('.load-page-content> table > tbody > tr').each(function() {
	var $this = $(this);
	var object = {};
	var name = [];
	$this.find('.mcui-output .invslot-item').each(function() {
		name.push(getName($(this)));
	});

	var $title = $this.closest('.load-page').find('.mw-headline');
	if($title.has('a').length) {
		var category = $title.find('a').html();
	} else {
		var category = $title.html();
	}
	
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
		'stack': itemStackSizes[result.length];
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

var mergeItems = function() {
	var prev = recipes[1];
	recipes.forEach(function(recipe, i, recipes) {
		if (recipe.name[0] == prev.name[0] && recipe.name[0] != 'Golden Apple') {
			// prev.recipes = prev.recipes.concat(recipe.recipes);
			// recipes = recipes.splice(i, 1);
			console.log(recipe.name[0]);
		}
		prev = recipe;
	});
}