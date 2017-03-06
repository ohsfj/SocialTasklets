$(document).ready(function(){
    // WebSocket
    var socket = io.connect();
	
	//Step 1: Showing Tasklet request
	socket.on('ShowTaskletRequest', function (data) {
        var zeit = new Date(data.zeit);
        $('#content').append(
            $('<li></li>').append(
                // Uhrzeit
                $('<span>').text('[' +
                    (zeit.getHours() < 10 ? '0' + zeit.getHours() : zeit.getHours())
                    + ':' +
                    (zeit.getMinutes() < 10 ? '0' + zeit.getMinutes() : zeit.getMinutes())
                    + '] '
                ),
                $('<b>').text('Buyer: '),
				$('<span>').text('You (' + data.name + ') have sent a Tasklet request - '),
                //QoC text
                $('<span>').text('QoC Cost: ' + data.cost + ' ' + 'QoC Privacy: ' + data.privacy ))
        );
        // scroll down
        $('body').scrollTop($('body')[0].scrollHeight);
    });
	
	// Step 8: Showing coins block status
	socket.on('ShowCoinsBlock', function (data) {
        var zeit = new Date(data.zeit);
		// Coins block was successful
		if(data.success){
		 $('#content').append(
            $('<li></li>').append(
                // Uhrzeit
                $('<span>').text('[' +
                    (zeit.getHours() < 10 ? '0' + zeit.getHours() : zeit.getHours())
                    + ':' +
                    (zeit.getMinutes() < 10 ? '0' + zeit.getMinutes() : zeit.getMinutes())
                    + '] '
                ),
				$('<span>').text('Coins from ' + data.buyer + ' were successfully blocked for ' + data.seller + ' regarding TaskletID ' + data.taskletid))
				);
        
		// scroll down
        $('body').scrollTop($('body')[0].scrollHeight);
		}
		
		// Coins block was not successful
		if(!data.success)
        $('#content').append(
            $('<li></li>').append(
                // Uhrzeit
                $('<span>').text('[' +
                    (zeit.getHours() < 10 ? '0' + zeit.getHours() : zeit.getHours())
                    + ':' +
                    (zeit.getMinutes() < 10 ? '0' + zeit.getMinutes() : zeit.getMinutes())
                    + '] '
                ),
				$('<span>').text('Alert! Coins from ' + data.buyer + ' were not successfully blocked for ' + data.seller + ' regarding TaskletID ' + data.taskletid +
				' - Transaction was cancelled.'))
				);
        
		// scroll down
        $('body').scrollTop($('body')[0].scrollHeight);

    });

    socket.on('TaskletCalc', function (data) {
        var zeit = new Date(data.zeit);
        var buttonid = data.taskletid +"_send";
            //noinspection JSAnnotator,JSAnnotator
            $('#content').append(
            $('<li></li>').append(
                // Uhrzeit
                $('<span>').text('[' +
                    (zeit.getHours() < 10 ? '0' + zeit.getHours() : zeit.getHours())
                    + ':' +
                    (zeit.getMinutes() < 10 ? '0' + zeit.getMinutes() : zeit.getMinutes())
                    + '] '
                ),
                $('<b>').text('Buyer: Tasklet '),
                // ID
                $('<b>').text(typeof(data.taskletid) != 'undefined' ? data.taskletid : ''),
                $('<b>').text(' ready for calculation - '),
                // Text
                $('<span>').text('Seller: ' + data.seller + ' ' )),
                $('<input/>').attr({
                    type: "button",
                    id: buttonid,
                    value: "Send Tasklet to Seller"
                })
        );
        $('#' + buttonid).click({id: data.taskletid}, sendTaskletToSeller);

        // scroll down
        $('body').scrollTop($('body')[0].scrollHeight);

    });

    socket.on('TaskletFinished', function (data) {
        var zeit = new Date(data.zeit);
        var buttonid = data.taskletid +"_finished";
        //noinspection JSAnnotator,JSAnnotator
        $('#content').append(
            $('<li></li>').append(
                // Uhrzeit
                $('<span>').text('[' +
                    (zeit.getHours() < 10 ? '0' + zeit.getHours() : zeit.getHours())
                    + ':' +
                    (zeit.getMinutes() < 10 ? '0' + zeit.getMinutes() : zeit.getMinutes())
                    + '] '
                ),
                $('<b>').text('Buyer: Tasklet '),
                // ID
                $('<b>').text(typeof(data.taskletid) != 'undefined' ? data.taskletid : ''),
                $('<b>').text(' result received from '),
                // Text
                $('<span>').text('Seller:' + data.seller + ' ' )),
            $('<input/>').attr({
                type: "button",
                id: buttonid,
                value: "Send Confirmation to SFBroker"
            })
        );
        $('#' + buttonid).click({id: data.taskletid}, sendConfirmationToSFBroker);

        // scroll down
        $('body').scrollTop($('body')[0].scrollHeight);

    });

    socket.on('TaskletReceived', function (data) {
        var zeit = new Date(data.zeit);
        var buttonid = data.taskletid +"_received";
        var cycles = data.taskletid +"_computation";
        //noinspection JSAnnotator,JSAnnotator
        $('#content').append(
            $('<li></li>').append(
                // Uhrzeit
                $('<span>').text('[' +
                    (zeit.getHours() < 10 ? '0' + zeit.getHours() : zeit.getHours())
                    + ':' +
                    (zeit.getMinutes() < 10 ? '0' + zeit.getMinutes() : zeit.getMinutes())
                    + '] '
                ),
                $('<b>').text('Seller: Tasklet '),
                // ID
                $('<b>').text(typeof(data.taskletid) != 'undefined' ? data.taskletid : ''),
                $('<b>').text(' calculated - '),
                // Text
                $('<span>').text('Buyer:' + data.buyer + ' ' )),
                $('<input/>').attr({
                type: "button",
                id: buttonid,
                value: "Send Confirmation to SFBroker"
                }),
                $('<input/>').attr({
                id: cycles, placeholder: "computation_cylces"
            })
        );
        $('#' + buttonid).click({id: data.taskletid}, sendConfirmationToSFBroker);

        // scroll down
        $('body').scrollTop($('body')[0].scrollHeight);

    });
    
    // Sending a message
    function send(){
        // Reading the input fields
        var cost = $('#cost').val();
		var privacy = $('#privacy').val();
        // Sending socket
        socket.emit('TaskletRequest', {cost: cost, privacy: privacy});
        // Empty input fields
        $('#cost').val('');
		$('#privacy').val('');
    }
    // Trigger function when clicking
    $('#send').click(send);

    // Trigger send to Seller
    function sendTaskletToSeller(tasklet){
        var zeit = new Date();
        $(this).prop("disabled",true);
        $('#content').append(
            $('<li></li>').append(
                // Uhrzeit
                $('<span>').text('[' +
                    (zeit.getHours() < 10 ? '0' + zeit.getHours() : zeit.getHours())
                    + ':' +
                    (zeit.getMinutes() < 10 ? '0' + zeit.getMinutes() : zeit.getMinutes())
                    + '] '
                ),
                $('<b>').text('Tasklet '),
                // ID
                $('<b>').text(tasklet.data.id),

                $('<b>').text(' send to Seller')
            )
        )
    };

    // Trigger send to Seller
    function sendConfirmationToSFBroker(tasklet){
        var zeit = new Date();
        $(this).prop("disabled",true);
        $('#content').append(
            $('<li></li>').append(
                // Uhrzeit
                $('<span>').text('[' +
                    (zeit.getHours() < 10 ? '0' + zeit.getHours() : zeit.getHours())
                    + ':' +
                    (zeit.getMinutes() < 10 ? '0' + zeit.getMinutes() : zeit.getMinutes())
                    + '] '
                ),
                $('<b>').text('Tasklet '),
                // ID
                $('<b>').text(tasklet.data.id),

                $('<b>').text(' confirmed')
            )
        )
    };

    // Trigger send computation cycles to SFBroker
    function sendConfirmationToSFBroker(tasklet){
        var zeit = new Date();
        $(this).prop("disabled",true);
        $('#' + tasklet.data.id + "_computation")
        $('#content').append(
            $('<li></li>').append(
                // Uhrzeit
                $('<span>').text('[' +
                    (zeit.getHours() < 10 ? '0' + zeit.getHours() : zeit.getHours())
                    + ':' +
                    (zeit.getMinutes() < 10 ? '0' + zeit.getMinutes() : zeit.getMinutes())
                    + '] '
                ),
                $('<b>').text('Computation cycles of tasklet '),
                // ID
                $('<b>').text(tasklet.data.id),

                $('<b>').text(' send')
            )
        )
    };

});