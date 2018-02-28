$(document).ready(function() {
	var $search = $('#search'),
		$search_input = $search.find('#search-input'),
		$search_clear = $search.find('#search-clear'),
		$search_auto = $search.find('#search-complete'),
		$failed = $('#failed');
	var auto_source = $search_auto.find('#complete-template').html();
	var auto_template = Handlebars.compile(auto_source);

	var lastSearch = "";
	var lastAuto = "";
	var lastAutos = [];
	var autoPos = 0, autoResults;
	function setAuto(arr, over) {
		$('.auto-result').off('click', autoClick);
		if(arr && arr.length > 0) {
			var loc = lastAutos.lastIndexOf(arr[0]);
			if(loc >= 0 || over) {
				lastAutos.splice(loc, 1);
				autoPos = 0;
				autoResults = arr;
				var info = {results: arr.slice(1)};
				$search_auto.html(auto_template(info));
			}
			$('.auto-result').on('click', autoClick);
		} else {
			$search_auto.html('');
		}
	}
	
	function updateAutoScroll() {
		if(autoResults) {
			var new_auto = autoResults[autoPos];
			lastAuto = new_auto; // Make sure hitting left or right won't screw it up
			$search_input.val(new_auto); // Set it in the search bar

			$search_auto.find('.auto-result').each(function(i) {
				var $el = $(this);
				if(autoPos === i + 1) { // Since the real index 0 is your original query
					$el.addClass('selected');
				} else {
					$el.removeClass('selected');
				}
			});
		}
	}

	function loadAuto(search_term) {
		lastAuto = search_term;
		lastAutos.push(search_term);
		if(search_term.length === 0) {
			setAuto([''], true);
			return;
		}
		// Data Example
		//(["Linux'",["Linux","Linux kernel","Linux Mint","Linux distribution","Linux Foundation","Linus Torvalds","Linux gaming","Linux malware","Linux adoption","Linux on z Systems"]])
		$.getJSON('/api?search=' + encodeURIComponent(search_term), function(data) {
			var results = [search_term];
			for(var i = 0; i < data[1].length; i++) { // Set method 1 descript at top
				results.push(data[1][i]);
			}
			setAuto(results);
		}).fail(function() {
			setAuto();
		});
	}
	// Auto complete :D
	var auto_visible = false;
	function showAuto(term) {
		var search_term = term;
		if(typeof term !== 'string') {
			search_term = $search_input.val().replace(/\s+/g, ' ');
		}
		loadAuto(search_term);
		if(auto_visible === false && search_term.length > 0) {
			$search.addClass('auto');
			auto_visible = true;
		}
	}
	function hideAuto() {
		if(auto_visible === true) {
			$search_input.focus();
			$search.removeClass('auto');
			auto_visible = false;
		}
	}
	function autoClick() {
		if($(this).data('invalid') === true) {
			return;
		}
		var search_term = $(this).text();
		$search_input.val(search_term);
		hideAuto();
	}
	var lastInput = "";
	function searchUpdated() {
		var search_term = $search_input.val().replace(/\s+/g, ' ');
		if(lastInput === search_term) {
			return;
		}
		lastInput = search_term;
		if(search_term.length > 0) {
			showAuto(search_term);
		} else {
			showAuto('');
			hideAuto();
		}
	}

	/* Open New Page From searchPressEnter Event Start */
	function searched() {
		var input = $search_input.val().replace(/\s+/g, ' ');
		if(input.length > 0) {
			window.open("/search?action=" + encodeURIComponent(input))
		}
	}
	/* Open New Page From searchPressEnter Event End */

	/* KeyBoard Event Start */
	function searchPressEnter(event){
		if (event.keyCode == 13){
			searched();
			hideAuto();
		} 
	}
	function searchPressed(e) {
		switch(e.which) {
			case 38: // Up arrow
				if(autoPos <= 0) {
					autoPos = autoResults.length;
				}$search_input.val()
				autoPos--;
				updateAutoScroll();
				e.preventDefault();
				break;
			case 40: // Down arrow
				autoPos++;
				if(autoPos >= autoResults.length) {
					autoPos = 0;
				}
				updateAutoScroll();
				e.preventDefault();
				break;
			default: 
				searchUpdated(); 
				break;
		}
	}
	/* KeyBoard Event End */

	/* Main Event Start */
	$search_input.on('keypress', searchPressEnter); // Just Enter Event
	$search_input.on('keyup', searchPressed);       // Up and Down Event
	$search_input.on('focus', showAuto);
	$search_input.on('blur', hideAuto);
	$search.on('focusin', showAuto);
	/* Main Event End */
  
	/* Clear search when clicking the X Start */
	function clear() {
		$search_input.val('');
		hideAuto(); // As well as the suggestions
	}
	$search_clear.on('click', clear);
	/* Clear search when clicking the X End */
});