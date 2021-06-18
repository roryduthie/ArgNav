$(function() {
  panZoomInstance = svgPanZoom('#svgmap', {
    zoomEnabled: true,
    controlIconsEnabled: true,
    fit: true,
    center: true,
    minZoom: 1, 
    maxZoom: 200,
    zoomScaleSensitivity: 1
  });
  
  // zoom out
  //panZoomInstance.zoom(0.5)
  var counter = 0

  $("#move").on("click", function() {
    // Pan by any values from -80 to 80
   panZoomInstance.zoomAtPoint(8,{x: 434, y: 395});
   
   console.log('got here');
    //zoomToPathWithID("node23");
    });
    
    });


    
function zoomToPathWithID(id){
  panZoomInstance.reset();
  function checkX(x, maxwidth){
	  if (x < 0){
			  x =0
		}else if( x > maxwidth){
			x = maxwidth
		}
	  return x
  }

  //REM: Apparently the values need some times to adjust after reset() is called, yet is seems to have no callback.
  window.setTimeout(function(){
	  //console.log('got here');
  //var heightTest = $('#canvasclass');
   //var hAdj = heightTest.height();
   console.log(document.getElementsByClassName('canvasclass'));
   var hAdj = document.getElementsByClassName('canvasclass')[0].clientHeight;
   var wAdj = document.getElementsByClassName('canvasclass')[0].clientWidth;
   //var hAdj = 500;
   console.log(wAdj);
      console.log(id);
      console.log('got here');

      var tViewport = document.querySelector('g.svg-pan-zoom_viewport');
      var tMatrix = tViewport.transform.baseVal.getItem(0).matrix;
	  //console.log('got here');
	  
      console.log(tMatrix);
      console.log(document);
      var tBBox = document.getElementById(id).getBBox();
      //var tPoint = {x: -((tBBox.x + tBBox.width / 2) * tMatrix.a + tMatrix.e), y: (tBBox.y + tBBox.height /2) * (tMatrix.d) + (tMatrix.f) + (hAdj) * 2.25}
      var tPoint = {x: 0, y: 0}
      console.log(tBBox.x);
	  console.log(wAdj / 2);
      /* if(tBBox.x < (wAdj / 3)){
      	tPoint = {x: -((tBBox.x + tBBox.width) * tMatrix.a + tMatrix.e), y: (tBBox.y + tBBox.height /2) * (tMatrix.d) + (hAdj) - (tMatrix.f)}
      }else if(tBBox.x < (wAdj / 2)){
      	tPoint = {x: ((tBBox.x) * tMatrix.a + tMatrix.e), y: (tBBox.y + tBBox.height /2) * (tMatrix.d) + (hAdj) - (tMatrix.f)}
      }else{
		  tPoint = {x: ((tBBox.x + tBBox.width * 2) * tMatrix.a + tMatrix.e), y: (tBBox.y + tBBox.height /2) * (tMatrix.d) + (hAdj) - (tMatrix.f)}
	  } */
	  var s = panZoomInstance.getSizes();
	  var origs = s.viewBox.width;
      console.log(origs);
	  var xx =0;
	  if(tBBox.x < (wAdj / 2)){
		  xx = (tBBox.x / wAdj) * (wAdj * tMatrix.a) - (tBBox.width / 2);
		  xx = checkX(xx,wAdj);
      	tPoint = {x: xx, y: (tBBox.y + tBBox.height /2) * (tMatrix.d) + (hAdj) - (tMatrix.f)}
      }else if(tBBox.x > (wAdj / 2) && tBBox.x < (origs - wAdj)){
		  xx = ((tBBox.x / wAdj) * (wAdj * tMatrix.a));
		  xx = checkX(xx,wAdj);
      	tPoint = {x: xx , y: (tBBox.y + tBBox.height /2) * (tMatrix.d) + (hAdj) - (tMatrix.f)}
      }else{
		  xx = ((tBBox.x / wAdj) * (wAdj * tMatrix.a)) + (tBBox.width / 2);
		  xx = checkX(xx,wAdj);
		  tPoint = {x: xx, y: (tBBox.y + tBBox.height /2) * (tMatrix.d) + (hAdj) - (tMatrix.f)}
	  }
	  
      //tPoint = {x: (tBBox.x * tMatrix.a) - tBBox.width /2, y: (tBBox.y + tBBox.height /2) * (tMatrix.d) + (hAdj) - (tMatrix.f)}
	  console.log(tBBox);
      console.log(tPoint);
      
      //change for very wide maps. If it's a full corpus then the SVG is created horizontal.
	  console.log('got here');
	  console.log(origs);
	  var zoomP = 8;
      if (origs >= 50000){
          
          zoomP = 210;
      }else if(origs >= 5000){
		  zoomP = 8;
	  }else if(origs < 5000 && origs >= 4000){
		  zoomP = 6;
	  }else if(origs < 4000 && origs >= 2000){
		  zoomP = 4;
	  }else{
		  zoomP = 2;
	  }
      
      panZoomInstance.zoomAtPoint(zoomP, tPoint);
	  //console.log('got here');
}, 500)
}

function inode_ann_click(i_id, i_text){
    if (!annotation_flag) {
            from_type.push('I');
            //console.log(allText);
            from_annotation_list.push(i_id);
            from_text.push(i_text);
            annotation_flag = true;
            var selection = document.getElementsByClassName("selectionbar")[0];
            selection.style.display = "block";
            var ptag = document.getElementById('par');
            ptag.innerHTML = i_text;

        } else {
            //console.log('TO');
            to_annotation_list.push(i_id);
            to_type.push('I');
            to_text.push(i_text);
            annotation_counter = annotation_counter + 1;
            var selection = document.getElementsByClassName("selectionbar")[0];
            selection.style.display = "none";
            $('#dialog').show();
            $('#dialog #schema').show();

            $('#dialog').dialog({
                buttons: {
                    "OK": function() {
                        $(this).dialog("close");
                        dialogue_btn_click();
                        populate_table();
                    }
                }
            });

            annotation_flag = false;

        }
}


function locution_click(l_id, l_text){
    if (!annotation_flag) {
            from_type.push('L');
            //console.log(allText);
            from_annotation_list.push(l_id);
            from_text.push(l_text);
            annotation_flag = true;
            var selection = document.getElementsByClassName("selectionbar")[0];
            selection.style.display = "block";
            var ptag = document.getElementById('par');
            ptag.innerHTML = l_text;

        } else {
            //console.log('TO');
            to_annotation_list.push(l_id);
            to_type.push('L');
            to_text.push(l_text);
            annotation_counter = annotation_counter + 1;
            var selection = document.getElementsByClassName("selectionbar")[0];
            selection.style.display = "none";
            $('#dialog').show();
            $('#dialog #schema').show();

            $('#dialog').dialog({
                buttons: {
                    "OK": function() {
                        $(this).dialog("close");
                        dialogue_btn_click();
                        populate_table();
                    }
                }
            });

            annotation_flag = false;

        }
}

window.onload=function(){
	//document.getElementsByClassName('dataframe')[0].addEventListener("click",function(e) {
	// e.target was the clicked element
	//console.log(e.currentTarget);
	//});
	var table = document.getElementsByClassName('dataframe')[0];
    var loctable = document.getElementsByClassName('locframe')[0];
    var schemeTable = document.getElementsByClassName('schemeframe')[0];
	
	if (table) {
		for (var i = 0; i < table.rows.length; i++) {
		table.rows[i].onclick = function(e) {

            if (e.shiftKey){
            var inodetext= centText(this);
            //console.log(lnode_id_list[this.rowIndex]);
            this.style.backgroundColor = "skyblue";

            inode_ann_click(inode_list[this.rowIndex], inodetext);
            }else{

			var aifid= tableText(this);
			zoomToPathWithID(aifid);
            }
			};
		}
	}

    if (loctable) {
		for (var i = 0; i < loctable.rows.length; i++) {
		loctable.rows[i].onclick = function(e) {

            if (e.shiftKey){
			var loctext= tableText(this);
			//console.log(this.rowIndex);
            //console.log(lnode_id_list[this.rowIndex]);
            this.style.backgroundColor = "skyblue";
            locution_click(lnode_id_list[this.rowIndex], loctext);
            }
			};
		}
	}

    if (schemeTable) {
        var schemeData = schemeTable.getElementsByTagName("td");
		for (var i = 0; i < schemeData.length; i++) {
		schemeData[i].onclick = function(e) {

			var aifid= schemeText(this);
            if (aifid == 0){
                //filter
                console.log(this.innerHTML);
                console.log(schemes);
                console.log('FILTER');

            }
            else{
                console.log(aifid);
                zoomToPathWithID(aifid);
            }
			//
			};
		}
	}

    function centText(tableRow) {

		var aiftext = tableRow.childNodes[3].innerHTML;
		return aiftext;

	}
	function tableText(tableRow) {

		var aifid = tableRow.childNodes[1].innerHTML;
        console.log(aifid);
		return aifid;

	}
    function schemeText(tableRow) {
        var text = '';
        var aifid = 0;
        try{
            text = tableRow.innerHTML;
        }
        catch(err){
            text = '';
        }
        try{
            aifid = tableRow.previousSibling.previousSibling.innerHTML;
            aifid = aifid.trim();
        }
        catch(err){
            aifid = 0
        }

		console.log(text);
        console.log(aifid);
		return aifid;

	}
    $(window).resize(function(){
          panZoomInstance.resize();
          panZoomInstance.fit();
          panZoomInstance.center();
        })
    
	
	}
