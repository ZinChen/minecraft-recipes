var recipes = JSON.parse(recipes);
var items = JSON.parse(items);
var animatedRecipes = [];
var itemSource;
var itemTpl;
var recipeSource;
var recipeTpl;
var toggledRecipes = false;
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
		renderItem(id, true);
		pause();
	});

	$('#search-recipe').keyup(function() {
		var needle = 
			$(this)
				.val()
				.trim()
				.toLowerCase();

		if (needle.length == 0) {
			showAllRecipes();
			return;
		}

		var foundedRecipes = foundRecipes(needle);

		if (foundedRecipes !== null) {
			showFoundRecipes(foundedRecipes);
		}
	});

	$('#toggle-recipes-view').click(function() {
		toggledRecipes = !toggledRecipes;
		if (toggledRecipes) {
			expandAllRecipes(true);
			$(this).html('Collapse all');
		} else {
			collapseAllRecipes(true);
			$(this).html('Expand all');
		}
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
			var id = animatedRecipes[i];
			var recipe = recipes[id];
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
			renderItem(id, false);
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

var renderItem = function(id, itemChanged) {
	if (itemChanged) {
		changeItemTemplate(id);
	} else {
		changeItemAttributes(id);
	}

}

var changeItemTemplate = function(id) {
	var recipe = recipes[id];
	var recipePos = recipe.recipePointer;
	var itemPos = recipe.itemPointer;
	var $this = $('#' + id);
	var item = items[recipe.name[itemPos]];
	if (!$this.hasClass('item--opened')) {
		$this.replaceWith(itemTpl({
			name: item.name,
			bg: item.bgPos,
			i: id
		}));
	} else {
		$this.removeAttr('title');
		$this.html(recipeTpl({
			name: item.name,
			stack: 
				(recipe.stack > 1) ? recipe.stack : null,
			bg: item.bgPos,
			components: prepareRecipe(recipe.recipes[recipePos])
		}));
	}
}

var changeItemAttributes = function(id) {
	var recipe = recipes[id];
	var recipePos = recipe.recipePointer;
	var itemPos = recipe.itemPointer;
	var $this = $('#' + id);
	var item = items[recipe.name[itemPos]];
	if (!$this.hasClass('item--opened')) {
		$this.find('.inner-item')
			.attr('title', item.name)
			.css('background-position', item.bgPos)
	} else {
		var components = prepareRecipe(recipe.recipes[recipePos]);
		$this.find('.recipe-title')
			.html(item.name);
		$this.find('.recipe-result .inner-item')
			.attr('title', item.name)
			.css('background-position', item.bgPos);
		$this.find('.component .inner-item').map(function(i, el) {
			var item = components[i];
			$(el).attr('title', item.name)
				.css('background', 'none');
			if (item.bg) {
				$(el)
				.removeAttr('style')
				.css('background-position', item.bg);
			}
		});
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

	//supafix some firework recipes
	if (result.length == 8) {
		result.push({name: null, bg: null});
	}
	return result;
}

var foundRecipes = function(needle) {
	if (needle.length == 0) {
		return recipes;
	}

	var foundItems = [];
	var foundRecipes = [];
	for (var i = 0; i < items.length; i++) {
		var name = items[i].name.toLowerCase();
		if (name.indexOf(needle) > -1) {
			foundItems.push(i);
		}
	};
	for (var i = 0; i < recipes.length; i++) {
		recipes[i].name.forEach(function(name){
			if(foundItems.indexOf(name) > -1 &&
				foundRecipes.indexOf(i) < 0
				) {
				foundRecipes.push(i);
			}
		});
	};
	return foundRecipes;
}

var showFoundRecipes = function(foundRecipes) {
	for(var i = 0; i < recipes.length; i++) {
		if (foundRecipes.indexOf(i) > -1) {
			$('#' + i).show();
		} else {
			$('#' + i).hide();
		}
	}
}

var showAllRecipes = function() {
	for(var i = 0; i < recipes.length; i++) {
		$('#' + i).show();
	}
}

var expandAllRecipes = function(toggledRecipes) {
	for (var i = 0; i < recipes.length; i++) {
		var $item = $('#' + i);
		if (!$item.hasClass('item--opened')) {
			$item.click();
		}
	}
}

var collapseAllRecipes = function(toggledRecipes) {
	for (var i = 0; i < recipes.length; i++) {
		var $item = $('#' + i);
		if ($item.hasClass('item--opened')) {
			$item.click();
		}
	}
}
