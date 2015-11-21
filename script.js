var recipes = JSON.parse(recipes);
var items = JSON.parse(items);
var animatedRecipes = [];
var itemSource;
var itemTpl;
var recipeSource;
var recipeTpl;

$(function() {
	itemSource = $('#item').html();
	itemTpl = Handlebars.compile(itemSource);
	recipeSource = $('#recipe').html();
	recipeTpl = Handlebars.compile(recipeSource);

	$('.container').delegate('.item', 'mouseenter', function() {
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


	for (var i = 0; i < recipes.length; i++) {
		if (recipes[i].name.length > 1) {
			animatedRecipes.push(i);
		}
	}

	$.map(recipes, function(item, i) {
		item.recipePointer = 0;
		item.itemPointer = 0;
		var itemId = item.name[0];
		var name = items[itemId].name;
		$('.container').append(itemTpl({name: name, bg: items[itemId].bgPos, i: i}));
	});
	
	setInterval(function() {
		if (isPause) { return; }
		for (var i = 0; i < animatedRecipes.length; i++) {
			var recipe = recipes[animatedRecipes[i]];
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
});

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
	if (!$this.hasClass('item--opened')) {
		$this.replaceWith(itemTpl({
			name: items[recipe.name[itemPos]].name,
			bg: items[recipe.name[itemPos]].bgPos,
			i: id
		}));
	} else {
		$this.removeAttr('title');
		$this.html(recipeTpl({
			name: items[recipe.name[itemPos]].name,
			bg: items[recipe.name[itemPos]].bgPos,
			components: prepareRecipe(recipe.recipes[recipePos])
		}));
	}
}

var prepareRecipe = function(recipe) {
	var result = [];
	var item = {};
	$(recipe).map(function(i, el) {
		if (el > -1) {
			item = {name: items[el].name, bg: items[el].bgPos};
		} else {
			item = {name: null, bg: null};
		}
		result.push(item);
	});
	return result;
}
