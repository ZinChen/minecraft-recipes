var recipes = JSON.parse(recipesData);
var bg = JSON.parse(bgdata);
var itemSource;
var itemTpl;
var recipeSource;
var recipeTpl;

$(function() {
	itemSource = $('#item').html();
	itemTpl = Handlebars.compile(itemSource);
	recipeSource = $('#recipe').html();
	recipeTpl = Handlebars.compile(recipeSource);	
	
	$('.container').delegate('.item', 'click', function() {
		var $this = $(this);
		var id = $this.attr('id');
		var recipe = recipes[id];
		if ($this.hasClass('item--opened')) {
			$this.replaceWith(itemTpl({
				name: recipe.name[0],
				bg: bg[recipe.name[0]],
				i: id
			}));
		} else {
			$this.html(recipeTpl({
				name: recipe.name[0],
				bg: bg[recipe.name[0]],
				components: prepareRecipe(recipe.recipes[0])
			}));
		}
		$this.toggleClass('item--opened');
	});
	


	$.map(recipes, function(item, i) {
		var name = item.name[0];
		$('.container').append(itemTpl({name: name, bg: bg[name], i: i}));
	});
	
	
	// onlick place template with data 
})

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