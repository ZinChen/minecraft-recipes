var recipes = JSON.parse(recipesData);
var bg = JSON.parse(bgdata);
var itemSource;
var itemTpl;
var recipeSource;
var recipeTpl;

var duplicates = [];

var stacks = JSON.parse(itemStackSizes);
var next = recipes[recipes.length - 2];
for (var i = recipes.length - 1; i > 0; i--) {
	recipes[i - 1].stack = parseInt(stacks[i - 1]);
	var recipe = recipes[i];
	var next = recipes[i - 1];
	if (recipe.name[0] == next.name[0] && next.name[0] != 'Golden Apple') {
		next.recipes = next.recipes.concat(recipe.recipes);
		next.name = next.name.concat(recipe.name);
		duplicates.push(i);
		recipes.splice(i, 1);
	}
}

var items = [];
var itemsIndex = [];
for (var item in bg) {
	items.push({'name': item, 'bg-pos': bg[item]});
	itemsIndex.push(item);
}

// for (var i = 0; i < recipes.length; i++) {
// 	var recipe = recipes[i];
// 	recipes[i].name = replaceNamesWithId(recipes[i].name);

// 	for (var j = 0; j < recipe.recipes.length; j++) {
// 		recipes[i].recipes[j] = replaceNamesWithId(recipes[i].recipes[j]);
// 	}
// }

function replaceNamesWithId(items) {
	for (var i = 0; i < items.length; i++) {
		items[i] = itemsIndex.indexOf(items[i]);
	}
	return items;
}

$(function() {
	itemSource = $('#item').html();
	itemTpl = Handlebars.compile(itemSource);
	recipeSource = $('#recipe').html();
	recipeTpl = Handlebars.compile(recipeSource);

	// $('.container').delegate('.item', 'hover', function)
	$('.container').delegate('.item', 'mouseenter', function() {
		// console.log(1);
		// console.log($(this).attr('id'));
		pause();
	});
	$('.container').delegate('.item', 'mouseleave', function() {
		play();
	})

	$('.container').delegate('.item', 'click', function() {
		pause();
		var $this = $(this);
		var id = $this.attr('id');
		$this.toggleClass('item--opened');
		renderItem(id);
		pause();
	});

	$.map(recipes, function(item, i) {
		item.recipePointer = 0;
		item.itemPointer = 0;
		var name = item.name[0];
		$('.container').append(itemTpl({name: name, bg: bg[name], i: i}));
		// $('#' + i).toggleClass('item--opened');
		// renderItem(i);
	});
	
	setInterval(function() {
		if (isPause) { return; }
		for (var i = 0; i < recipes.length; i++) {
			if (recipes[i].recipes.length === 1) {
				continue;
			}
			var recipe = recipes[i];
			var currentRecipe = recipe.recipePointer;
			if (recipe.recipes.length - 1 === recipe.recipePointer) {
				recipe.recipePointer = 0;
			} else if (recipe.recipes.length !== 1) {
				recipe.recipePointer++;
			}
			var currentItem = recipe.itemPointer;
			if (recipe.name.length - 1 === recipe.itemPointer) {
				recipe.itemPointer = 0;
			} else if (recipe.name.length !== 1) {
				recipe.itemPointer++;
			}
			renderItem(i);
		}
	}, 1000);
	// onlick place template with data 
})
var isPause = false;
var pause = function() {
	isPause = true;
}

var play = function() {
	isPause = false;
}

var renderItem = function(id) {
	var recipe = recipes[id];
	var recipePos = recipe.recipePointer;
	var itemPos = recipe.itemPointer;
	var $this = $('#' + id);
	if (!isElementInViewport($this)) {
		return;
	}
//	console.log(recipe.position);
	if (!$this.hasClass('item--opened')) {
		$this.replaceWith(itemTpl({
			name: recipe.name[itemPos],
			bg: bg[recipe.name[itemPos]],
			i: id
		}));
	} else {
		$this.removeAttr('title');
		$this.html(recipeTpl({
		// $('#test').html(recipeTpl({
			name: recipe.name[itemPos],
			bg: bg[recipe.name[itemPos]],
			components: prepareRecipe(recipe.recipes[recipePos])
		}));
	}
}

var prepareRecipe = function(recipe) {
	var result = [];
	var item = {};
	$(recipe).map(function(i, el) {
		item = {name: el, bg: bg[el]};
		result.push(item);
//		console.log(item);
	});
	return result;
}

function isElementInViewport (el) {
    //special bonus for those using jQuery
    if (typeof jQuery === "function" && el instanceof jQuery) {
        el = el[0];
    }
    var rect = el.getBoundingClientRect();
    return (
        rect.top >= -300 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + 300 && /*or $(window).height() */
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
    );
}