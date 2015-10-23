$(function() {
	$('.item').delegate('click', function() {
		$(this).toggleClass('item-opened');
	});
	
	var bg = JSON.parse(bgdata);
	var itemSource = $('#item').html();
	var item = Handlebars.compile(itemSource);
	for (var b in bg) {
		$('.container').append(item({name: b, bg: bg[b]}));
	}
})