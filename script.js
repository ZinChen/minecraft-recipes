var recipes = JSON.parse(recipes);
var items = JSON.parse(items);
var animatedRecipes = [];
var itemSource;
var itemTpl;
var recipeSource;
var recipeTpl;
var toggledRecipes = false;
var isOnItem;
var playTimeout;

// Unused
Handlebars.registerHelper('components', function(items, options) {
	var rowDiv;
	for (var i = 0; i < items.length; i++) {
		isDivisibleByThree = 3%i === 0;
		if (i === 0 || isDivisibleByThree) {
			rowDiv = $('<div class="component-row">');
		}
	}
});

$(function() {
	itemSource = $('#item').html();
	itemTpl = Handlebars.compile(itemSource);
	recipeSource = $('#recipe').html();
	recipeTpl = Handlebars.compile(recipeSource);

	$('.container').delegate('.item', 'mouseenter', function() {
		isOnItem = true;
		if (!isPauseButtonPressed) {
			pause();
			setPauseIcon();
		}
	});
	$('.container').delegate('.item', 'mouseleave', function() {
		isOnItem = false;
		if (!isPauseButtonPressed) {
			clearTimeout(playTimeout);
			playTimeout = setTimeout(function() {
				if(!isOnItem) {
					play();
					setPauseIcon();
				}
			}, 1000);
		}
	});

	$('.container').on('click', '.item', function() {
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

		if (needle.length === 0) {
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

	$('#item-per-row').change(function() {
		var value = $(this).val();
		$('#container').attr('class',
			$('#container')
				.attr('class')
				.replace(/\bcontainer-width-\d+\b/g, '')
			);
		switch(value) {
			case "3":
				$('#container').addClass('container-width-3');
			break;
			case "4":
				$('#container').addClass('container-width-4');
			break;
		}
	});

	$('.container').on('click', '.forward-recipes', function(e) {
		e.stopPropagation();
		forwardRecipes();
	});

	$('.container').on('click', '.backward-recipes', function(e) {
		e.stopPropagation();
		backwardRecipes();
	});

	$('.container').on('click', '.pause-recipes', function(e) {
		e.stopPropagation();
		isPauseButtonPressed = !isPause;
		togglePause();
		setPauseIcon();
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
		forwardRecipes();
	}, 1000);
});

var isPause = false;
var isPauseButtonPressed;
var pause = function() {
	isPause = true;
};

var play = function() {
	isPause = false;
};

var togglePause = function() {
	isPause = !isPause;
};

var renderItem = function(id, itemChanged) {
	if (itemChanged) {
		changeItemTemplate(id);
	} else {
		changeItemAttributes(id);
	}
};

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
			components: prepareRecipe(recipe.recipes[recipePos]),
			recipesCount: recipe.recipes.length,
			currentRecipe: recipePos + 1,
			isNotOneRecipe: recipe.recipes.length > 1
		}));
		console.log(recipe.recipes.length > 1);
	}
};

var changeItemAttributes = function(id) {
	var recipe = recipes[id];
	var recipePos = recipe.recipePointer;
	var itemPos = recipe.itemPointer;
	var $this = $('#' + id);
	var item = items[recipe.name[itemPos]];
	if (!$this.hasClass('item--opened')) {
		$this.find('.inner-item')
			.attr('title', item.name)
			.css('background-position', item.bgPos);
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
		$this.find('.current-recipe-count').html(recipePos + 1);
	}
};

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
};

var foundRecipes = function(needle) {
	if (needle.length === 0) {
		return recipes;
	}

	var foundItems = [];
	var foundRecipes = [];
	for (var i = 0; i < items.length; i++) {
		var name = items[i].name.toLowerCase();
		if (name.indexOf(needle) > -1) {
			foundItems.push(i);
		}
	}
	for (var i = 0; i < recipes.length; i++) {
		recipes[i].name.forEach(function(name) {
			if(foundItems.indexOf(name) > -1 &&
				foundRecipes.indexOf(i) < 0
				) {
				foundRecipes.push(i);
			}
		});
		recipes[i].recipes.forEach(function(recipe) {
			if (recipe.length) {
				recipe.forEach(function(item) {
					if(foundItems.indexOf(item) > -1 &&
						foundRecipes.indexOf(i) < 0
						) {
						foundRecipes.push(i);
					}
				});
			}
		});
	}
	return foundRecipes;
};

var showFoundRecipes = function(foundRecipes) {
	for(var i = 0; i < recipes.length; i++) {
		if (foundRecipes.indexOf(i) > -1) {
			$('#' + i).show();
		} else {
			$('#' + i).hide();
		}
	}
};

var showAllRecipes = function() {
	for(var i = 0; i < recipes.length; i++) {
		$('#' + i).show();
	}
};

var expandAllRecipes = function(toggledRecipes) {
	for (var i = 0; i < recipes.length; i++) {
		var $item = $('#' + i);
		if (!$item.hasClass('item--opened')) {
			$item.click();
		}
	}
};

var collapseAllRecipes = function(toggledRecipes) {
	for (var i = 0; i < recipes.length; i++) {
		var $item = $('#' + i);
		if ($item.hasClass('item--opened')) {
			$item.click();
		}
	}
};

var forwardRecipes = function() {
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
};

var backwardRecipes = function() {
	for (var i = 0; i < animatedRecipes.length; i++) {
		var id = animatedRecipes[i];
		var recipe = recipes[id];
		var currentRecipe = recipe.recipePointer;
		if (recipe.recipePointer === 0) {
			recipe.recipePointer = recipe.recipes.length - 1;
		} else if (recipe.recipes.length !== 1) {
			recipe.recipePointer--;
		}
		var currentItem = recipe.itemPointer;
		if (recipe.itemPointer === 0) {
			recipe.itemPointer = recipe.name.length - 1;
		} else if (recipe.name.length !== 1) {
			recipe.itemPointer--;
		}
		renderItem(id, false);
	}
};

var setPauseIcon = function() {
	if (isPause) {
		$('.pause-recipes')
			.removeClass('fa-pause')
			.addClass('fa-play');
	} else {
		$('.pause-recipes')
			.removeClass('fa-play')
			.addClass('fa-pause');
	}
};
