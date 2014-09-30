$(document).ready(function(){

	var RefreshDevices = function(){
		$("#devices").html('');
		$.getJSON('/devices', function(devices){
			var newOption;
			newOption = $(document.createElement('option'));
			newOption.text("TODOS");
			newOption.attr('value', '*');
			$("#devices").append(newOption);
			for(var i in devices){
				newOption = $(document.createElement('option'));
				newOption.text(devices[i].model + " ("+devices[i].platform+" "+devices[i].version+") " + devices[i].uuid);
				newOption.attr('value', devices[i].token);
				$("#devices").append(newOption);
			}
		});
	}

	var ClearDevices = function(){
		$("#devices").html('');
		$.get('/removedevices', function(result){
			console.log(result);
		});
	}

	var SendMessage = function(){
		$.post('/send', {title: $("#title").val(), message: $("#message").val(),device: $("#devices").val()}, function(data){
			console.log(data);
		});
	}

	$(document).on('click', '[do-RefreshDevices]', function(e){
		e.preventDefault();
		RefreshDevices();
	});

	$(document).on('click', '[do-ClearDevices]', function(e){
		e.preventDefault();
		ClearDevices();
	});

	$(document).on('click', '[do-SendMessage]', function(e){
		e.preventDefault();
		SendMessage();
	});

});