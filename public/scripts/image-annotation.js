$(document).ready(function(){
    
    var email = "";
    var currentImgJSON = {};
    var lastImgId = "";
    var annotationObj = {
        "user": "",
        "label": "",
        "modified": ""
    };
    
    // Prevent user pressing return to submit form
    // Only because I have attached keydown event listeners
    // to the entire doc and it messes up the form submission
    // and I was too lazy to fix it properly
    $(window).keydown(function(event){
        if(event.keyCode == 13) {
            event.preventDefault();
            return false;
        }
    });
    
    // Put the cursor in the email entry box
    $("#user_email").focus();
    
    // If the user enters an email, hide the form and show the image
    // returned from the database
    $(function() {
        $("#user_email_error").hide();
        $("#traffic_image").hide();
        $("#submit_btn").click(function() {
            $("#user_email_error").hide();
            email = $("#user_email").val();
            if (email.length === 0) {
                $("#user_email_error").show();
                $("#user_email").focus();
            } else {
                console.log(email);
                annotationObj.user = email;
                var today = new Date();
                annotationObj.modified = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate()+' '+
                						 today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                $("form").hide();
                $.get("test_get_image", function(data, status) {
                    console.log("Data: " + JSON.stringify(data));
                    currentImgJSON = data;
                    if (currentImgJSON._id !== false) {
                    	$("#traffic_image").show();
                    	$.post("test_get_image_data", {'url': currentImgJSON.url}, function(imdata,status){
                        	$("#traffic_image").html('<img src="data:image/jpg;base64,' + imdata + '"></img><p class="smalltext">Image url:<br>' + currentImgJSON.url + '</p>');
                   		});
               		} else {
               			$("#traffic_image").html('<p>ALL IMAGES HAVE BEEN ANNOTATED BY AT LEAST 3 PEOPLE! No more work to do :)</p>');
               		}
                });
            }
        });
    });
    
    // Listen for keypresses
    $(document).keydown(function(event) {
        
        var annotateImage = function() {
        	var today = new Date();
            annotationObj.modified = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate()+' '+
               						 today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
            if (currentImgJSON.hasOwnProperty("annotation")) {
                console.log("adding to annotations array");
                currentImgJSON.annotation.push(annotationObj);
            } else {
                console.log("creating new annotations array");
                currentImgJSON.annotation = [annotationObj];
                console.log(currentImgJSON.annotation);
            }
        }

        var doUpdate = false;
        var undo = false;
        if (email.length !== 0) {
            
            // Left or w
            if (event.keyCode === 65 ||
                event.keyCode === 37) {
                
                annotationObj.label = "no-congestion";
                annotateImage();
                doUpdate = true;
            // Right or d
            } else if (event.keyCode === 68 ||
                       event.keyCode === 39) {
                
                annotationObj.label = "congestion";
                annotateImage();
                doUpdate = true;
            // Up or w
            } else if (event.keyCode === 87 ||
                       event.keyCode === 38) {
                
                annotationObj.label = "unknown";
                annotateImage();
                doUpdate = true;
            // Down or s
            } else if (event.keyCode === 83 ||
                       event.keyCode === 40) {
                
                annotationObj.label = "not-sure";
                annotateImage();
                doUpdate = true;
            // u (undo)
            } else if (event.keyCode === 85) {
                undo = true;
            }
                
        } else {
            console.log("Empty email!");
        }
        // Post the annotation and get a new image to annotate
        if (doUpdate) {
            // POST to the database to update the document
            $.post("annotate_image", currentImgJSON, function(data, status) {
                console.log("Data: " + JSON.stringify(data));
                
                // Update last image annotation text on this page
                $( '<div id="last_annotation">Last image marked as <strong>' + 
                    currentImgJSON.annotation.slice(-1)[0].label + 
                    '</strong> at ' + 
                    currentImgJSON.annotation.slice(-1)[0].modified + 
                    '</div>' )
                .replaceAll("#last_annotation");
                
                // Get the next image from the server and display it
                if (data._id !== false) {
                    $.post("test_get_image_data", {'url': data.url}, function(imdata,status){
                        $("#traffic_image").html('<img src="data:image/jpg;base64,' + imdata + '"></img><p  class="smalltext">Image url:<br>' + data.url + '</p>');
                   	});
                   	// Store the new data in the currentImgJSON
                	lastImgId = currentImgJSON._id;
                	currentImgJSON = data;
               	} else {
               		$("#traffic_image").html('<p>ALL IMAGES HAVE BEEN ANNOTATED BY AT LEAST 3 PEOPLE! No more work to do :)</p>');
               	}
            });
        } else if (undo) {
            if (lastImgId.length === 0) {
                // Update last image annotation text on this page
                $( '<div id="last_annotation">No previous image annotation to undo!</div>' )
                .replaceAll("#last_annotation");
            } else {
                $.get("get-image-info-by-id?id=" + lastImgId, function(lastImgData, status) {
                    if (lastImgData.hasOwnProperty("annotation")) { // this should always be true!
                        lastImgData.annotation.pop();
                        if (lastImgData.annotation.length === 0) {
                            delete lastImgData.annotation;
                        }
                        // Store the new data in the currentImgJSON
                        lastImgId = "";
                        currentImgJSON = lastImgData;
                        $.post("remove_last_annotation", currentImgJSON, function(undoData, status) {
                            console.log("Undo data: " + JSON.stringify(undoData));
                
                            // Update last image annotation text on this page
                            $( '<div id="last_annotation">Last image annotation <strong>undone</strong></div>' )
                            .replaceAll("#last_annotation");

                            // Get the previous image from the server and display it
                            $.post("test_get_image_data", {'url': currentImgJSON.url}, function(imdata,status){
                               $("#traffic_image").html('<img src="data:image/jpg;base64,' + imdata + '"></img><p class="smalltext">Image url:<br>' + currentImgJSON.url + '</p>');
                                $.get("doc_rev?id=" + currentImgJSON._id, function(data, success) {
                                    currentImgJSON._rev = data;
                                });
                            });
                            
                            
                        });
                    } else {
                        console.log("Last annotation not saved, not undone! Warning warning!!!");
                    }
                });
            }
        }
    });
});