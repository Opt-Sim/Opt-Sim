function startup(){ // onload help function
     
        var docHeight = $(document).height(); 
        var scrollTop = $(window).scrollTop(); 
        $('.overlay-bg').show().css({'height' : docHeight}); 
        $('.popup'+1).show().css({'top': scrollTop+20+'px'}); 
    }

$(function(){

		var $stageContainer = $("#container");
		var stageOffset = $stageContainer.offset();
		var offsetX = stageOffset.left;
		var offsetY = stageOffset.top;
		var object_name;
		var object_position_x;
		var imageCount = -1;
		var imageSrc = [
			"Images/convex.png","Images/concave.png","Images/planoconvex.png","Images/planoconcave.png","Images/negative.png"
			
		];
			
    $('#help1').click(function(event){
        event.preventDefault(); 
		startup();
    });
  
    // hide popup when user clicks on close button or if user clicks anywhere outside the container
    $('.close-btn, .overlay-bg').click(function(){
        $('.overlay-bg, .overlay-content').hide(); // hide the overlay
    });
    
    // hide the popup when user presses the esc key
    $(document).keyup(function(e) {
        if (e.keyCode == 27) { // if user presses esc key
            $('.overlay-bg, .overlay-content').hide(); //hide the overlay
        }
    });
		


		for (var i = 0; i  < imageSrc.length; i++) {
			(function() {
				var $lense, image;
				var $lense = $("#lense"+i);
				$lense.hide();
				image = new Image();
				image.onload = function () {
					$lense.show();
				}
				image.src = imageSrc[i];
				$lense.draggable({helper: 'clone'});
				$lense.data("url", "lense.png");
				$lense.data("image", image); 
			})();
		}
		
    var stage = new Kinetic.Stage({
        container: 'container',
        width: $("#container").width(),
        height: window.innerHeight * 0.95,
        listening: true
    });

	var layer = new Kinetic.Layer();
	
		
		//draw line
		var principal_axis = new Kinetic.Line({
				points: [$("#container").width()*0,$("#container").height()*0.5,$("#container").width(),$("#container").height()*0.5],
				stroke: 'black',
				strokeWidth: 2,
				lineCap: 'butt',
				lineJoin: 'bevel'
		});
		layer.add(principal_axis);
		
		var mouseToText = new Kinetic.Text({
			x: $("#container").width()*0.015,
			y: $("#container").height()*0.9,
			fontFamily: "Calibri",
			fontSize: $("#container").height()*0.06,
			fill: "black",
			stroke: null,
			text: ""
			});
		layer.add(mouseToText);

		$("#lensgroup").on("mouseover", function(){
			mouseToText.setText("Drag and Drop lens to the experimental area");
			layer.drawScene();
		});
		$("#objectgroup").on("mouseover", function(){
			mouseToText.setText("Click one of these objects");
			layer.drawScene();
		});
		$("#reset").on("mouseover", function(){
			mouseToText.setText("Click on reset to reset this experiment");
			layer.drawScene();
		});
		$("#help1").on("mouseover", function(){
			mouseToText.setText("Click on help to get help");
			layer.drawScene();
		});

	//draw Arrow after click toolbar Arrow
	var arrow_object = new Kinetic.Line({
				points: [15,$("#container").height()*0.5,15,$("#container").height()*0.3,10,$("#container").height()*0.35,15,$("#container").height()*0.3,20,$("#container").height()*0.35],
				id:"arrow",
				stroke: 'black',
				strokeWidth: 4,
				lineCap: 'butt',
				lineJoin: 'bevel',
				draggable:true,
				dragBoundFunc: function(pos) {
						return {
						  x: pos.x,
						  y: this.getAbsolutePosition().y
						}
				} 	
	});
	
	var triangle_object = new Kinetic.Polygon({ 
		x:10,
		id:"triangle",
		y: stage.getHeight()*0.5,
		stroke : "red", 
		strokeWidth : 2, 
		points : [ 0, 0, 30, 0, 30, -$("#container").height()*0.2+7],
		fill: "blue",
		draggable : true,
		dragBoundFunc: function(pos) {
			return {
				x: pos.x,
				y: this.getAbsolutePosition().y,
			};
		  }
	});
	
	var square_object = new Kinetic.Polygon({
		x:10,
		y: stage.getHeight()*0.5,
		points: [0,0,0,-$("#container").height()*0.2+4,30,-$("#container").height()*0.2+4,30,0,0,0],
		id:"square",		
		fill:'green',
		stroke: 'black',
		strokeWidth: 2,
		draggable:true,
        closed: true,
		dragBoundFunc: function(pos) {
			return {
			  x: pos.x,
			  y: this.getAbsolutePosition().y
			}
		} 	
	});	
	document.getElementById('object_arrow').addEventListener('click', function() {
		stage.get('#arrow').remove();
		stage.get('#triangle').remove();
		stage.get('#square').remove();
		layer.add(arrow_object);
		stage.find("#arrow")[0].setX(20);		
		object_name="arrow";
		deleteray();
		deleteray2();     			
		layer.draw();
    });
	document.getElementById('object_triangle').addEventListener('click', function() {
		stage.get('#arrow').remove();
		stage.get('#triangle').remove();
		stage.get('#square').remove();		
		layer.add(triangle_object);
		stage.find("#triangle")[0].setX(20);
		object_name="triangle";
		deleteray();
		deleteray2();		
		layer.draw();
	});
	document.getElementById('object_square').addEventListener('click', function() {
		stage.get('#arrow').remove();
		stage.get('#triangle').remove();	
		stage.get('#square').remove();
		layer.add(square_object);
		stage.find("#square")[0].setX(20);
		object_name="square";
		deleteray();
		deleteray2();		
		layer.draw();
	});
	layer.draw();
	
	$stageContainer.droppable({
			drop: dragDrop,
	});
	var lense_id;var ids;
	var lense_1_name=null;
	var lense_2_name=null;
	var obs,obs1,image1posi,xx,yy;
	//find the intersected point of two lines
	function intersect(x1,y1,x2,y2,x3,y3,x4,y4){
		var d = (x1-x2)*(y3-y4) - (y1-y2)*(x3-x4);
		if (d == 0) return null;
		
		var xi = ((x3-x4)*(x1*y2-y1*x2)-(x1-x2)*(x3*y4-y3*x4))/d;
		var yi = ((y3-y4)*(x1*y2-y1*x2)-(y1-y2)*(x3*y4-y3*x4))/d;
		
		return {x:xi,y:yi};
	}

	function deleteray()
	{
		stage.get('#reflected_ray1_lense1').remove();	
		stage.get('#reflected_ray2_lense1').remove();
		stage.get('#refracted_ray_convex').remove();	
	}
	function deleteray2()
	{	
		stage.get('#central_ray').remove();
		stage.get('#incident_ray').remove();
		stage.get('#refracted_ray_concave').remove();
		stage.get('#reflected_ray_concave').remove();
		stage.get('#reflected_ray_lense2_1').remove();
		stage.get('#reflected_ray_lense2_2').remove();
		stage.get('#reflected_ray_lense2_3').remove();
		stage.get('#reflected_ray_lense2_4').remove();
		stage.get('#image_1').remove();
		stage.get('#image_2').remove();
		stage.get('#image_3').remove();
		stage.get('#arr4').remove();
		stage.get('#arr5').remove();
		stage.get('#arr6').remove();
	}		

	
	function dragDrop(e, ui) {

			var xxx = parseInt(ui.offset.left - offsetX);
			var yyy = parseInt(ui.offset.top - offsetY);
			
			var element = ui.draggable;
			var data = element.data("url");
			var theImage = element.data("image");
			
			if($(ui.helper).hasClass("lenses")){
				ids=$(ui.draggable).attr("id");
				console.log();					
				lense_id=document.getElementById(ids);
				if (lense_1_name==null && lense_2_name==null )
				{				
					 var image = new Kinetic.Image({
						name: data,
						id: "lense_1",
						x: $("#container").width()*0.5-15,
						y: $("#container").height()*0.15,
						width:30,
						height:stage.getHeight()*0.7,
						image: theImage,
						draggable: false,
						dragBoundFunc: function(pos) {
								return {
								  x: pos.x,
								  y: this.getAbsolutePosition().y
								}
						} 
					});	
					//Draw vertical_axis for lense_1
					var vertical_axis = new Kinetic.Rect({
							x: $("#container").width()*0.5,
							y: ($("#container").height()*0),
							width: 1.5,
							height: $("#container").height(),
							fill: "blue",
							id:"vertical_axis1",
							text:'the testing text'
					});
					layer.add(vertical_axis);
					
					//draw left 2f of the first lense
						var twof_1 = new Kinetic.Rect({
							x: $("#container").width()*0.2-2,
							y: ($("#container").height()*0.5)-10,
							width: 4,
							height: 20,
							fill: "blue",
							id:"2f_1",
							text:'the testing text'
						});
						//draw right 2f of the first lense
						var twof_2 = new Kinetic.Rect({
							x: $("#container").width()*0.8-2,
							y: ($("#container").height()*0.5)-10,
							width: 4,
							height: 20,
							fill: "blue",
							id:"2f_2"
						});
						//draw left f of the first lense
						var focal_1 = new Kinetic.Rect({
							x: $("#container").width()*0.35-2,
							y: ($("#container").height()*0.5)-10,
							width: 4,
							height: 20,
							fill: "blue",
							id:"f_1"        
						});	
						//draw right f of the first lense
						var focal_2= new Kinetic.Rect({
							x: $("#container").width()*0.65-2,
							y: ($("#container").height()*0.5)-10,
							width: 4,
							height: 20,
							fill: "blue",
							id:"f_2"        
						});	
					layer.add(twof_1);layer.add(focal_1);layer.add(twof_2);layer.add(focal_2);
					lense_1_name=lense_id.name;
				}
				else if(lense_1_name!=null && lense_2_name==null)
				{			
					if (xxx<$("#container").width()*0.5){	
						xx=$("#container").width()*0.5-200;
						yy=$("#container").width()*0.5+200;
					}else{
						xx=$("#container").width()*0.5+200;
						yy=$("#container").width()*0.5-200;
					}
					
					stage.find("#lense_1")[0].setDraggable(true);
					if (xxx<$("#container").width()*0.5){		
							stage.find("#lense_1")[0].setX($("#container").width()*0.5+200);							
							stage.find("#lense_1")[0].setId("lense_2");
						 var image = new Kinetic.Image({
							name: data,
							id: "lense_1",
							x: xx,
							y:$("#container").height()*0.15,
							width:30,
							height:$("#container").height()*0.7,
							image: theImage,
							draggable: false,
							dragBoundFunc: function(pos) {
								return {
								  x: pos.x,
								  y: this.getAbsolutePosition().y
								}
							} 
						});						
						lense_2_name=lense_1_name;
						lense_1_name=lense_id.name;
						stage.find("#2f_1")[0].setId("2f_3");
						stage.find("#2f_2")[0].setId("2f_4");
						stage.find("#f_1")[0].setId("f_3");
						stage.find("#f_2")[0].setId("f_4");
												
						stage.find("#2f_3")[0].setX(yy+13-$("#container").width()*0.3);
						stage.find("#2f_4")[0].setX(yy+13+$("#container").width()*0.3);
						stage.find("#f_3")[0].setX(yy+13-$("#container").width()*0.15);
						stage.find("#f_4")[0].setX(yy+13+$("#container").width()*0.15);
						
						//Draw vertical_axis for lense_1
						stage.find("#vertical_axis1")[0].setX($("#container").width()*0.5+200+15);
						stage.find("#vertical_axis1")[0].setId("vertical_axis2");						
						
						var vertical_axis = new Kinetic.Rect({
								x: xx+15,
								y: ($("#container").height()*0),
								width: 1.5,
								height: $("#container").height(),
								fill: "blue",
								id:"vertical_axis1",
								text:'the testing text'
						});
						layer.add(vertical_axis);
						
						var twof_3 = new Kinetic.Rect({//draw left 2f of the second lense
								x: xx+13-$("#container").width()*0.3,
								y: ($("#container").height()*0.5)-10,
								width: 4,
								height: 20,
								fill: "red",
								id:"2f_1"
							});
							var twof_4 = new Kinetic.Rect({//draw right 2f of the second lense
								x: xx+13+$("#container").width()*0.3,
								y: ($("#container").height()*0.5)-10,
								width: 4,
								height: 20,
								fill: "red",
								id:"2f_2"
							});
							var focal_3 = new Kinetic.Rect({//draw left f of the second lense
								x: xx+13-$("#container").width()*0.15,
								y: ($("#container").height()*0.5)-10,
								width: 4,
								height: 20,
								fill: "red",
								id:"f_1"        
							});	
							var focal_4= new Kinetic.Rect({//draw right f of the second lense
								x:  xx+13+$("#container").width()*0.15,
								y: ($("#container").height()*0.5)-10,
								width: 4,
								height: 20,
								fill: "red",
								id:"f_2"        
							});	
					}
					else{
						 stage.find("#lense_1")[0].setX($("#container").width()*0.5-200);
						 var image = new Kinetic.Image({
							name: data,
							id: "lense_2",
							x: xx,
							y: $("#container").height()*0.15,
							width:30,
							height:$("#container").height()*0.7,
							image: theImage,
							draggable: false,
							dragBoundFunc: function(pos) {
								return {
								  x: pos.x,
								  y: this.getAbsolutePosition().y
								}
							} 
						});
						lense_2_name=lense_id.name;	
						stage.find("#2f_1")[0].setX(yy+13-$("#container").width()*0.3);
						stage.find("#2f_2")[0].setX(yy+13+$("#container").width()*0.3);
						stage.find("#f_1")[0].setX(yy+13-$("#container").width()*0.15);
						stage.find("#f_2")[0].setX(yy+13+$("#container").width()*0.15);
						
						//Draw vertical_axis for lense_2
						stage.find("#vertical_axis1")[0].setX($("#container").width()*0.5-200+15);
						var vertical_axis = new Kinetic.Rect({
								x: xx+15,
								y: ($("#container").height()*0),
								width: 1.5,
								height: $("#container").height(),
								fill: "blue",
								id:"vertical_axis2",
								text:'the testing text'
						});
						layer.add(vertical_axis);
						
							var twof_3 = new Kinetic.Rect({//draw left 2f of the second lense
								x: xx+13-$("#container").width()*0.3,
								y: ($("#container").height()*0.5)-10,
								width: 4,
								height: 20,
								fill: "red",
								id:"2f_3"
							});
							var twof_4 = new Kinetic.Rect({//draw right 2f of the second lense
								x: xx+13+$("#container").width()*0.3,
								y: ($("#container").height()*0.5)-10,
								width: 4,
								height: 20,
								fill: "red",
								id:"2f_4"
							});
							var focal_3 = new Kinetic.Rect({//draw left f of the second lense
								x: xx+13-$("#container").width()*0.15,
								y: ($("#container").height()*0.5)-10,
								width: 4,
								height: 20,
								fill: "red",
								id:"f_3"        
							});	
							var focal_4= new Kinetic.Rect({//draw right f of the second lense
								x:  xx+13+$("#container").width()*0.15,
								y: ($("#container").height()*0.5)-10,
								width: 4,
								height: 20,
								fill: "red",
								id:"f_4"        
							});	
					}				
							layer.add(twof_3);
							layer.add(focal_3);
							layer.add(twof_4);
							layer.add(focal_4);			
					image.setDraggable(true);
				}
				else if(lense_1_name!=null && lense_2_name!=null){//when two lenses already dropped into container, if we drop extra lense it will replace one of the lenses in the container 
					if (xxx<$("#container").width()*0.5){//if dropped position of thired lense is less than half of window it will replace first lense
						stage.get('#lense_1').remove();
						 var image = new Kinetic.Image({
							name: data,
							id: "lense_1",
							x: $("#container").width()*0.5-200,
							y: $("#container").height()*0.15,
							width:30,
							height:$("#container").height()*0.7,
							image: theImage,
							draggable: false,
							dragBoundFunc: function(pos) {
								return {
								  x: pos.x,
								  y: this.getAbsolutePosition().y
								}
							} 
						});	
						lense_1_name=lense_id.name;
						//Draw vertical_axis for lense_1
						stage.get('#vertical_axis1').remove();						
						var vertical_axis = new Kinetic.Rect({
								x: $("#container").width()*0.5-200+15,
								y: ($("#container").height()*0),
								width: 1.5,
								height: $("#container").height(),
								fill: "blue",
								id:"vertical_axis1",
								text:'the testing text'
						});
						layer.add(vertical_axis);
					}else{//if dropped position of thired lense is greater than half of window it will replace second lense
						stage.get('#lense_2').remove();
						var image = new Kinetic.Image({
							name: data,
							id: "lense_2",
							x: $("#container").width()*0.5+200,
							y: $("#container").height()*0.15,
							width:30,
							height:$("#container").height()*0.7,
							image: theImage,
							draggable: false,
							dragBoundFunc: function(pos) {
								return {
								  x: pos.x,
								  y: this.getAbsolutePosition().y
								}
							} 
						});	
						lense_2_name=lense_id.name;
						//Draw vertical_axis for lense_2
						stage.get('#vertical_axis2').remove();						
						var vertical_axis = new Kinetic.Rect({
								x: $("#container").width()*0.5+200+15,
								y: ($("#container").height()*0),
								width: 1.5,
								height: $("#container").height(),
								fill: "blue",
								id:"vertical_axis2",
								text:'the testing text'
						});
						layer.add(vertical_axis);
					}					
					image.setDraggable(true);//After dropped second lense enabble already exist lense to be draggable
				}				
			}
		
		
			var obj;
			var lense_instance;
			var lense_1_position,lense_2_position;
			var focal_point_lense_2,x1,x2,height1,x3,y3,height3,x4,focal_point_lense_1,slope_1,slope_2,slope_3,slope_4,slope_5;
			var lense1_ray1_end_point_x,lense1_ray1_end_point_y,lense1_ray2_end_point_x,lense1_ray2_end_point_y,intersect_point_1,intersect_point_2,intersect_point_3,idd,intersect_point_1_tri_squ;
			
	function drawImage()
	{
	
		if((lense_1_name!=null || lense_2_name!=null) && (object_name=="arrow" || object_name=="triangle" || object_name=="square")){
					if(object_name=="arrow"){
						object_position_x=stage.find("#arrow")[0].getPosition().x+13;
					}else if(object_name=="triangle"){
						object_position_x=stage.find("#triangle")[0].getPosition().x+30;
					}
					else if(object_name=="square"){
						object_position_x=stage.find("#square")[0].getPosition().x+30;
					}
					lense_1_position=stage.find("#lense_1")[0].getPosition();//get the position of the first lense
					if(lense_2_name!=null){
						lense_2_position=stage.find("#lense_2")[0].getPosition();//get the position of the second lense
					}
					deleteray();
					deleteray2();
				//find slope between principal axis and the ray go through the optical center
				slope_1=($("#container").height()*0.2)/(lense_1_position.x+15-object_position_x);
				
				if(lense_2_name==null){
					lense1_ray1_end_point_y=($("#container").width()-(lense_1_position.x+15))*slope_1+$("#container").height()*0.5;
					lense1_ray1_end_point_x=$("#container").width();
				}else{
					lense1_ray1_end_point_y=(lense_2_position.x-lense_1_position.x)*slope_1+$("#container").height()*0.5;
					lense1_ray1_end_point_x=lense_2_position.x+15;
				}
				//find slope between principal axis and the ray go through the focal point
				slope_2=($("#container").height()*0.2)/($("#container").width()*0.15);
				
				if(lense_2_name==null){
					lense1_ray2_end_point_y=($("#container").width()*0.85-(lense_1_position.x+15))*slope_2+$("#container").height()*0.5;
					lense1_ray2_end_point_x=$("#container").width();
				}else{
					lense1_ray2_end_point_y=(lense_2_position.x-(lense_1_position.x+$("#container").width()*0.15))*slope_2+$("#container").height()*0.5;
					lense1_ray2_end_point_x=lense_2_position.x+15;
				}
				//draw central ray 
				var central_ray = new Kinetic.Line({
					points: [object_position_x,$("#container").height()*0.3,lense_1_position.x+15,$("#container").height()*0.5,lense1_ray1_end_point_x,lense1_ray1_end_point_y],
					stroke: 'black',
					strokeWidth: 2,
					lineCap: 'butt',
					id:'central_ray',
					lineJoin: 'bevel'
				});
				//draw ray from object to lense(half of principal ray)				
				var incident_ray = new Kinetic.Line({
					points: [object_position_x,$("#container").height()*0.3,lense_1_position.x+15,$("#container").height()*0.3],
					stroke: 'black',
					strokeWidth: 2,
					lineCap: 'butt',
					id:'incident_ray',
					lineJoin: 'bevel'
				});													
				layer.add(central_ray);
				layer.add(incident_ray);
				
				if(lense_1_name=="convex_lense"  || lense_1_name=="plano_convex_lense" || lense_1_name=="meniscus_lense"){
					focal_point_lense_1=lense_1_position.x+15+$("#container").width()*0.15;
				}else if(lense_1_name=="concave_lense" || lense_1_name=="plano_concave_lense"){
					focal_point_lense_1=lense_1_position.x+15-$("#container").width()*0.15;
				}
				//find intesection point of principal ray and central ray in first lense
				intersect_point_1=intersect(object_position_x,$("#container").height()*0.3,lense_1_position.x+15,$("#container").height()*0.5,lense_1_position.x+15,$("#container").height()*0.3,focal_point_lense_1,$("#container").height()*0.5);
				if(object_name=="triangle" || object_name=="square"){
					intersect_point_1_tri_squ=intersect(object_position_x-30,$("#container").height()*0.3,lense_1_position.x+15,$("#container").height()*0.5,lense_1_position.x+15,$("#container").height()*0.3,focal_point_lense_1,$("#container").height()*0.5);
				}
				if(object_name=="arrow"){
					if(intersect_point_1.y>$("#container").height()*0.5){	
							x1=intersect_point_1.y-5;
					}else{
							x1=intersect_point_1.y+5;							
					}
				}
				//draw the image of object if it is one lense experiment
				if(lense_2_name==null){
					if(object_name=="arrow"){
						var image_1 = new Kinetic.Line({
								points: [intersect_point_1.x,$("#container").height()*0.5,intersect_point_1.x,intersect_point_1.y,intersect_point_1.x-5,x1,intersect_point_1.x,intersect_point_1.y,intersect_point_1.x+5,x1],
								id:"image_1",
								stroke: 'black',
								strokeWidth: 3,
								lineCap: 'butt',
								lineJoin: 'bevel',
								draggable:false
						});
						
						layer.add(image_1);
					} 
					else if(object_name=="triangle"){
						var image_1 = new Kinetic.Polygon({ 							
							id:"image_1",
							stroke : "red", 
							strokeWidth : 2, 
							points : [ intersect_point_1.x, intersect_point_1.y, intersect_point_1.x,$("#container").height()*0.5,intersect_point_1_tri_squ.x,$("#container").height()*0.5],
							fill: "blue"					 
						});						
					}
					else if(object_name=="square"){
						var image_1 = new Kinetic.Polygon({							
							points: [intersect_point_1.x,intersect_point_1.y,intersect_point_1_tri_squ.x,intersect_point_1_tri_squ.y,intersect_point_1_tri_squ.x,$("#container").height()*0.5,intersect_point_1.x,$("#container").height()*0.5,intersect_point_1.x,intersect_point_1.y],
							id:"image_1",
							stroke: 'black',
							strokeWidth: 2,
							fill:"green",
							lineCap: 'butt',
							closed: true,							
							lineJoin: 'bevel'
						});						
					}


				if((object_name=="square" || object_name=="triangle") && !((intersect_point_1.x<0 || intersect_point_1.x>$("#container").width()) && (intersect_point_1_tri_squ.x<0 || intersect_point_1_tri_squ.x>$("#container").width())))
				{
					layer.add(image_1);
				}			
			}
			if(lense_1_name=="convex_lense" || lense_1_name=="plano_convex_lense" || lense_1_name=="meniscus_lense"){	//do if the dropped lense is Convex Lense					
					//draw ray from lense - focal point to border of box (half of principal ray)	
					var refracted_ray_convex = new Kinetic.Line({
							points: [lense_1_position.x+15,$("#container").height()*0.3,lense1_ray2_end_point_x,lense1_ray2_end_point_y],
							stroke: 'black',
							strokeWidth: 2,
							lineCap: 'butt',
							id:'refracted_ray_convex',
							lineJoin: 'bevel'
						});						
					layer.add(refracted_ray_convex);
				if(intersect_point_1!=null){//if there is an intesection point
				
							if(lense_2_name!=null){//do if there is second Lense		
								//find the focal point
								if((lense_2_name=="convex_lense" && intersect_point_1.x>lense_2_position.x+15) || (lense_2_name=="convex_lense" && intersect_point_1.x<lense_2_position.x+15) || (lense_2_name=="plano_convex_lense" && intersect_point_1.x>lense_2_position.x+15) || (lense_2_name=="plano_convex_lense" && intersect_point_1.x<lense_2_position.x+15) || (lense_2_name=="meniscus_lense" && intersect_point_1.x>lense_2_position.x+15) || (lense_2_name=="meniscus_lense" && intersect_point_1.x<lense_2_position.x+15)){
									focal_point_lense_2=lense_2_position.x+15+$("#container").width()*0.15;
								}else if((lense_2_name=="concave_lense" && intersect_point_1.x>lense_2_position.x+15) || (lense_2_name=="concave_lense" && intersect_point_1.x<lense_2_position.x+15) || (lense_2_name=="plano_concave_lense" && intersect_point_1.x>lense_2_position.x+15) || (lense_2_name=="plano_concave_lense" && intersect_point_1.x<lense_2_position.x+15)){
									focal_point_lense_2=lense_2_position.x+15-$("#container").width()*0.15;
								}
								// find intesection point of the principal ray and central ray in second lense if the first lense is Convex
								intersect_point_2=intersect(lense_2_position.x+15,intersect_point_1.y,focal_point_lense_2,$("#container").height()*0.5,intersect_point_1.x,intersect_point_1.y,lense_2_position.x+15,$("#container").height()*0.5);		  
								if(object_name=="triangle" || object_name=="square"){
									intersect_point_2_tri_squ=intersect(lense_2_position.x+15,intersect_point_1_tri_squ.y,focal_point_lense_2,$("#container").height()*0.5,intersect_point_1_tri_squ.x,intersect_point_1_tri_squ.y,lense_2_position.x+15,$("#container").height()*0.5);
								}
								if(object_name=="arrow"){
									if(intersect_point_2.y>$("#container").height()*0.5){	
											x1=intersect_point_2.y-5;
									}else{
											x1=intersect_point_2.y+5;							
									}
								}
								//draw the image of second lense
								if(object_name=="arrow"){
									var image_2 = new Kinetic.Line({
											points: [intersect_point_2.x,$("#container").height()*0.5,intersect_point_2.x,intersect_point_2.y,intersect_point_2.x-5,x1,intersect_point_2.x,intersect_point_2.y,intersect_point_2.x+5,x1],
											id:"image_2",
											stroke: 'black',
											strokeWidth: 4,
											lineCap: 'butt',
											lineJoin: 'bevel',
											draggable:false
									});
									layer.add(image_2);
								}
								else if(object_name=="triangle"){
									var image_2= new Kinetic.Polygon({ 							
										id:"image_2",
										stroke : "red", 
										strokeWidth : 2, 
										points : [ intersect_point_2.x, intersect_point_2.y, intersect_point_2.x,$("#container").height()*0.5,intersect_point_2_tri_squ.x,$("#container").height()*0.5],
										fill: "blue"					 
									});									
								}
								else if(object_name=="square"){
									var image_2 = new Kinetic.Polygon({							
										points: [intersect_point_2.x,intersect_point_2.y,intersect_point_2_tri_squ.x,intersect_point_2_tri_squ.y,intersect_point_2_tri_squ.x,$("#container").height()*0.5,intersect_point_2.x,$("#container").height()*0.5,intersect_point_2.x,intersect_point_2.y],
										id:"image_2",
										stroke: 'black',
										strokeWidth: 2,
										fill:"green",
										lineCap: 'butt',
										closed: true,
										lineJoin: 'bevel'
									});									
								}								
								if((object_name=="square" || object_name=="triangle") && !((intersect_point_2.x<0 || intersect_point_2.x>$("#container").width()) && (intersect_point_2_tri_squ.x<0 || intersect_point_2_tri_squ.x>$("#container").width())))
								{
									layer.add(image_2);
								}
							} 						
						//draw infinite rays if object is within F
						if(object_position_x>lense_1_position.x+15-$("#container").width()*0.15){
							if(lense_2_name==null){
							for(var i=1;i<3;i++){
								if(i==1){x4=object_position_x;idd="reflected_ray1_lense1";}
								else if(i==2){x4=lense_1_position.x+15;idd="reflected_ray2_lense1";}
									var reflected_ray = new Kinetic.Line({
										points: [intersect_point_1.x,intersect_point_1.y,x4,$("#container").height()*0.3],
										stroke: 'black',
										strokeWidth: 2,
										lineCap: 'butt',
										dashArray: [29, 1, 0.001, 1],
										id:idd,
										lineJoin: 'bevel'
									});								
									layer.add(reflected_ray);
							}
							}
						}										    
				}
			}else{ //do if the dropped lense is Concave Lense		
				deleteray();
				// Find slope between principal axis and principal ray of Concave lense
				slope_3=Math.abs($("#container").height()*0.2/($("#container").width()*0.15));
				if(lense_2_name==null){
					lense1_ray2_end_point_y=0;
					lense1_ray2_end_point_x=($("#container").height()*0.5/slope_3)+lense_1_position.x+15-$("#container").width()*0.15;
				}
				else{
					lense1_ray2_end_point_x=lense_2_position.x+15;
					lense1_ray2_end_point_y=$("#container").height()*0.5-(lense_2_position.x-(lense_1_position.x-$("#container").width()*0.15))*slope_3;
				}
				//draw line from principal focus to infinite
				var refracted_ray_concave = new Kinetic.Line({
					points: [lense_1_position.x+15,$("#container").height()*0.3,lense1_ray2_end_point_x,lense1_ray2_end_point_y],
					stroke: 'black',
					strokeWidth: 2,
					lineCap: 'butt',
					id:'refracted_ray_concave',
					lineJoin: 'bevel'
				});
				var reflected_ray_concave = new Kinetic.Line({
					points: [lense_1_position.x+15,$("#container").height()*0.3,lense_1_position.x+15-$("#container").width()*0.15+4,$("#container").height()*0.5],
					stroke: 'black',
					strokeWidth: 2,
					lineCap: 'butt',
					dashArray: [29, 1, 0.001, 1],
					id:'reflected_ray_concave',
					lineJoin: 'bevel'
				});
				layer.add(refracted_ray_concave);layer.add(reflected_ray_concave);		
				
				if(lense_2_name!=null){	//if there is second lense							
						if(lense_2_name=="convex_lense" || lense_2_name=="plano_convex_lense" || lense_2_name=="meniscus_lense"){
							focal_point_lense_2=lense_2_position.x+15+$("#container").width()*0.15;
						}else if(lense_2_name=="concave_lense" || lense_2_name=="plano_concave_lense"){
							focal_point_lense_2=lense_2_position.x+15-$("#container").width()*0.15;
						}
						//find intesection point of principal ray and central ray in second lense if second lense is Concave
						intersect_point_3=intersect(intersect_point_1.x,intersect_point_1.y,lense_2_position.x+15,$("#container").height()*0.5,lense_2_position.x+15,intersect_point_1.y,focal_point_lense_2,$("#container").height()*0.5);
						if(object_name=="triangle" || object_name=="square"){
							intersect_point_3_tri_squ=intersect(intersect_point_1_tri_squ.x,intersect_point_1_tri_squ.y,lense_2_position.x+15,$("#container").height()*0.5,lense_2_position.x+15,intersect_point_1_tri_squ.y,focal_point_lense_2,$("#container").height()*0.5);
						}
						if(object_name=="arrow"){
							if(intersect_point_3.y>$("#container").height()*0.5){	
									x1=intersect_point_3.y-5;
							}else{
									x1=intersect_point_3.y+5;							
							}
						}
						//draw the image in second lense
						if(object_name=="arrow"){
							var image_3 = new Kinetic.Line({
									points: [intersect_point_3.x,$("#container").height()*0.5,intersect_point_3.x,intersect_point_3.y,intersect_point_3.x-5,x1,intersect_point_3.x,intersect_point_3.y,intersect_point_3.x+5,x1],
									id:"image_3",
									stroke: 'black',
									strokeWidth: 4,
									lineCap: 'butt',
									lineJoin: 'bevel',
									draggable:false
							});
							
							layer.add(image_3);
						}
						else if(object_name=="triangle"){
							var image_3 = new Kinetic.Polygon({ 							
									id:"image_3",
									stroke : "red", 
									strokeWidth : 2, 
									points : [ intersect_point_3.x, intersect_point_3.y, intersect_point_3_tri_squ.x,$("#container").height()*0.5,intersect_point_3.x,$("#container").height()*0.5],
									fill: "blue"					 
							});																										
						}
						else if(object_name=="square"){
							var image_3 = new Kinetic.Polygon({							
								points: [intersect_point_3.x,intersect_point_3.y,intersect_point_3_tri_squ.x,intersect_point_3_tri_squ.y,intersect_point_3_tri_squ.x,$("#container").height()*0.5,intersect_point_3.x,$("#container").height()*0.5,intersect_point_3.x,intersect_point_3.y],
								id:"image_3",
								stroke: 'black',
								strokeWidth: 2,
								fill:"green",
								lineCap: 'butt',
								closed: true,
								lineJoin: 'bevel'
							});									
						}		
						if((object_name=="square" || object_name=="triangle") && !((intersect_point_3.x<0 || intersect_point_3.x>$("#container").width()) && (intersect_point_3_tri_squ.x<0 || intersect_point_3_tri_squ.x>$("#container").width())))
						{
							layer.add(image_3);
						}	
				} 	
			}
			if(lense_2_name!=null){
					var xx;
					if(lense_1_name=="convex_lense" || lense_1_name=="plano_convex_lense" || lense_1_name=="meniscus_lense"){
							xx=intersect_point_2;
					}else{
							xx=intersect_point_3;
					}					
					var reflected_ray_lense2_1 = new Kinetic.Line({
								points: [lense_2_position.x+15,lense1_ray1_end_point_y,xx.x,xx.y],
								stroke: 'black',
								strokeWidth: 2,
								lineCap: 'butt',
								id:'reflected_ray_lense2_1',
								lineJoin: 'bevel'
					});	
					var reflected_ray_lense2_2 = new Kinetic.Line({
							points: [lense_2_position.x+15,lense1_ray2_end_point_y,xx.x,xx.y],
							stroke: 'black',
							strokeWidth: 2,
							lineCap: 'butt',
							id:'reflected_ray_lense2_2',
							lineJoin: 'bevel'
					});	
					if(xx.x<lense_2_position.x+15){
							reflected_ray_lense2_1.setDashArray([29, 1, 0.001, 1]);										
							reflected_ray_lense2_2.setDashArray([29, 1, 0.001, 1]);
							slope_4=Math.abs((xx.y-lense1_ray1_end_point_y)/(lense_2_position.x+15-xx.x));
							slope_5=Math.abs((xx.y-lense1_ray2_end_point_y)/(lense_2_position.x+15-xx.x));
							
							if(xx.y<lense1_ray1_end_point_y)				
							lense2_ray1_end_point_y=lense1_ray1_end_point_y+slope_4*($("#container").width()-(lense_2_position.x+15));
							else
							lense2_ray1_end_point_y=lense1_ray1_end_point_y-slope_4*($("#container").width()-(lense_2_position.x+15));
							if(xx.y<lense1_ray2_end_point_y)				
							lense2_ray2_end_point_y=lense1_ray2_end_point_y+slope_5*($("#container").width()-(lense_2_position.x+15));
							else
							lense2_ray2_end_point_y=lense1_ray2_end_point_y-slope_5*($("#container").width()-(lense_2_position.x+15));
							var reflected_ray_lense2_3 = new Kinetic.Line({
								points: [lense_2_position.x+15,lense1_ray1_end_point_y,$("#container").width(),lense2_ray1_end_point_y],
								stroke: 'black',
								strokeWidth: 2,
								lineCap: 'butt',
								id:'reflected_ray_lense2_3',
								lineJoin: 'bevel'
							});
							var reflected_ray_lense2_4 = new Kinetic.Line({
								points: [lense_2_position.x+15,lense1_ray2_end_point_y,$("#container").width(),lense2_ray2_end_point_y],
								stroke: 'black',
								strokeWidth: 2,
								lineCap: 'butt',
								id:'reflected_ray_lense2_4',
								lineJoin: 'bevel'
							});
							layer.add(reflected_ray_lense2_3);
							layer.add(reflected_ray_lense2_4);
						}
						layer.add(reflected_ray_lense2_1);
						layer.add(reflected_ray_lense2_2);
			}		
		
		}
	}
			//dragmove function for Arrow object
			arrow_object.on("dragmove", function() {
				drawImage();
				arrow_object.setDragBoundFunc(function(pos){
						if(pos.x < lense_1_position.x-40){
						return {
						  x: pos.x,
						  y: this.getAbsolutePosition().y
						}
						}else{
							return {
							  x: this.getAbsolutePosition().x,
							  y: this.getAbsolutePosition().y
							}
						}
				});
				
			});
			triangle_object.on("dragmove", function() {
				drawImage();
				triangle_object.setDragBoundFunc(function(pos){
						if(pos.x < lense_1_position.x-35){
						return {
						  x: pos.x,
						  y: this.getAbsolutePosition().y
						}
						}else{
							return {
							  x: this.getAbsolutePosition().x,
							  y: this.getAbsolutePosition().y
							}
						}
				});
				
			});
			square_object.on("dragmove", function() {
				drawImage();
				square_object.setDragBoundFunc(function(pos){
						if(pos.x < lense_1_position.x-35){
						return {
						  x: pos.x,
						  y: this.getAbsolutePosition().y
						}
						}else{
							return {
							  x: this.getAbsolutePosition().x,
							  y: this.getAbsolutePosition().y
							}
						}
				});				
			});
			//double click the lenses to delete
			image.on('dblclick', function(evt) {			
				var lense_instance = evt.targetNode;
				var lense_instance_id = lense_instance.getId();
				image.remove();
				
				if(lense_instance_id=="lense_1"){
					stage.get('#2f_1').remove();
					stage.get('#2f_2').remove();
					stage.get('#f_1').remove();
					stage.get('#f_2').remove();
					stage.get('#vertical_axis1').remove();
					
					if(lense_2_name!=null){
						lense_1_name=lense_2_name;						
						stage.find("#lense_2")[0].setId("lense_1");
						lense_2_name=null;
						stage.find("#2f_3")[0].setId("2f_1");
						stage.find("#2f_4")[0].setId("2f_2");
						stage.find("#f_3")[0].setId("f_1");
						stage.find("#f_4")[0].setId("f_2");
						stage.find("#2f_1")[0].setFill("blue");
						stage.find("#2f_2")[0].setFill("blue");
						stage.find("#f_1")[0].setFill("blue");
						stage.find("#f_2")[0].setFill("blue");
						stage.find("#vertical_axis2")[0].setId("vertical_axis1");
					}else{ 
						lense_1_name=null;
						stage.get('#central_ray').remove();
						stage.get('#incident_ray').remove();
						stage.get('#refracted_ray_convex').remove();
						stage.get('#reflected_ray1_lense1').remove();
						stage.get('#reflected_ray2_lense1').remove();
						stage.get('#refracted_ray_concave').remove();
						stage.get('#reflected_ray_concave').remove();
						stage.get('#image_1').remove();
					}
				}else if(lense_instance_id=="lense_2"){
					lense_2_name=null;
					stage.get('#2f_3').remove();
					stage.get('#2f_4').remove();
					stage.get('#f_3').remove();
					stage.get('#f_4').remove();
					stage.get('#vertical_axis2').remove();
					stage.find("#2f_1")[0].setFill("blue");
					stage.find("#2f_2")[0].setFill("blue");
					stage.find("#f_1")[0].setFill("blue");
					stage.find("#f_2")[0].setFill("blue");
				}
				if(lense_1_name==null && lense_2_name==null){
					if(object_name=="arrow"){
						stage.find("#arrow")[0].setX(20);
					}
					if(object_name=="triangle"){
						stage.find("#triangle")[0].setX(20);
					}
					if(object_name=="square"){
						stage.find("#square")[0].setX(20);
					}
				}
				layer.draw();
				drawImage();
			});
			
			image.on("mouseover", function(){
				mouseToText.setText("Double click to remove lens");
				layer.drawScene();
			});
			square_object.on("mouseover", function(){
				mouseToText.setText("Drag this polygon horizontal to get ray diagram");
				layer.drawScene();
			});
			triangle_object.on("mouseover", function(){
				mouseToText.setText("Drag this Triangle horizontal to get ray diagram");
				layer.drawScene();
			});
			arrow_object.on("mouseover", function(){
				mouseToText.setText("Drag this Arrow horizontal to get ray diagram");
				layer.drawScene();
			});

			//dragmove function for lenses
			image.on("dragmove", function(evt) {
				drawImage();
				var lense_instance = evt.targetNode;
				var lense_instance_id = lense_instance.getId();
				if(lense_instance_id=="lense_1"){
					image.setDragBoundFunc(function(pos){
							if((pos.x > object_position_x+23) && (pos.x <lense_2_position.x-20)){
							return {
							  x: pos.x,
							  y: this.getAbsolutePosition().y
							}
							}else{
								return {
								  x: this.getAbsolutePosition().x,
								  y: this.getAbsolutePosition().y
								}
							}
					});
				}else{
					image.setDragBoundFunc(function(pos){
							if(pos.x > lense_1_position.x+28){
							return {
							  x: pos.x,
							  y: this.getAbsolutePosition().y
							}
							}else{
								return {
								  x: this.getAbsolutePosition().x,
								  y: this.getAbsolutePosition().y
								}
							}
					});				
				}
				if(lense_instance_id=="lense_1"){
					stage.find('#2f_1')[0].setX(lense_1_position.x+13-$("#container").width()*0.3);
					stage.find('#2f_2')[0].setX(lense_1_position.x+13+$("#container").width()*0.3);
					stage.find('#f_1')[0].setX(lense_1_position.x+13-$("#container").width()*0.15);
					stage.find('#f_2')[0].setX(lense_1_position.x+13+$("#container").width()*0.15);
					
					stage.find('#vertical_axis1')[0].setX(lense_1_position.x+15);
				}
				else if(lense_instance_id=="lense_2"){
					stage.find('#2f_3')[0].setX(lense_2_position.x+13-$("#container").width()*0.3);
					stage.find('#2f_4')[0].setX(lense_2_position.x+13+$("#container").width()*0.3);
					stage.find('#f_3')[0].setX(lense_2_position.x+13-$("#container").width()*0.15);
					stage.find('#f_4')[0].setX(lense_2_position.x+13+$("#container").width()*0.15);
					
					stage.find('#vertical_axis2')[0].setX(lense_2_position.x+15);
				}				
			});
			
			layer.add(image);
			layer.draw();
		}
		
		stage.add(layer);	
});
