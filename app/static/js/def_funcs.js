/**
The code below is a set of default functions that can be used in the results page to operate over javascript arrays, html tables, and JSON.
*/

function get_l_node_text(i_node_id){
    /**
        Function to get the text from an L-node given the I-node ID. Uses the l-node - I-node pair array.
    */
    for(z = 0; z < lnode_inode_list.length; z++){
        var lnode_id = lnode_inode_list[z][0];
        var inode_id = lnode_inode_list[z][1];

        if(i_node_id == inode_id){
            //return lnode_id;
            for(zz = 0; zz < lnode_id_list.length; zz++){
                var l_id = lnode_id_list[zz];
                if(l_id == lnode_id){
                    var ltext = lnode_text_list[zz];
                    return [l_id, ltext];
                }
            }
        }
    }
}

function uploadAIFdb(upload_bool) {
    /**
        Function to upload AIF to AIFdb. The function takes annotated data from several lists. From list is the node from which an edge comes, to list is the node receiving an edge. All IAT structures are created automatically where IAT mode has been selected. AIFdb automatically assigns node IDs on upload and so IDs only need to be unique within this package.
    */
        var node_list = [];
        var edge_list = [];
        var locutions = [];
        var json_aif = {
            "nodes": [],
            "edges": [],
            "locutions": []

        };

        if (to_annotation_list.length < 1) {
            return;
        }

        for (i = 0; i < to_annotation_list.length; i++) {
            var date = new Date().toISOString().substr(0, 19).replace('T', ' ');
            var schema_node = schema_list[i];
            var schema_text = '';
            var schemeID = '';
            if (schema_node == 'RA') {
                schema_text = "Default Inference";
                schemeID = "72";
            }
            if (schema_node == 'CA') {
                schema_text = "Default Conflict";
                schemeID = "71";
            }
            if (schema_node == 'MA') {
                schema_text = "Default Rephrase";
                schemeID = "144";
            }
            if (schema_node == 'TA') {
                schema_text = "Default Transition";
                schemeID = "82";
            }
            if (schema_node == 'Agreeing') {
                schema_text = "Agreeing";
                schema_node = 'YA';
                schemeID = "82";
            }

            var ids = i + 1;
            if(iat_mode){

                var t_type = to_type[i];
                var f_type = from_type[i];

                if(t_type == 'L' && f_type == 'L'){
                    var node_data = {
                    "nodeID": "" + ids,
                    "text": schema_text,
                    "type": schema_node
                    };

                    var node_data_2 = {
                    "nodeID": "" + ids + ids + ids + ids,
                    "text": from_text[i],
                    "type": from_type[i]
                    };

                    var node_data_3 = {
                    "nodeID": "" + ids + ids + ids + ids + ids,
                    "text": to_text[i],
                    "type": to_type[i]
                    };

                    var edge_data = {
                    "edgeID": "e" + ids + ids,
                    "fromID": "" + ids + ids + ids + ids,
                    "toID": "" + ids
                    };

                    var edge_data_2 = {
                    "edgeID": "e" + ids + ids + ids,
                    "fromID": "" + ids,
                    "toID": "" + ids + ids + ids + ids + ids
                    };

                    node_list.push(node_data);
                    node_list.push(node_data_2);
                    node_list.push(node_data_3);
                    edge_list.push(edge_data);
                    edge_list.push(edge_data_2);

                }else if(t_type == 'I' && f_type == 'L'){

                    //agreeing
                    var node_data = {
                    "nodeID": "" + ids,
                    "text": schema_text,
                    "type": schema_node
                    };

                    //ta
                    var node_data_ta = {
                    "nodeID": "ta" + ids,
                    "text": "Default Transition",
                    "type": "TA"
                    };

                    //orig locution
                    var node_data_2 = {
                    "nodeID": "" + ids + ids + ids + ids,
                    "text": from_text[i],
                    "type": from_type[i]
                    };

                    //orig i node
                    var node_data_3 = {
                    "nodeID": "" + ids + ids + ids + ids + ids,
                    "text": to_text[i],
                    "type": to_type[i]
                    };

                    //call function to find L-node
                    var i_node_id = to_annotation_list[i];
                    var vals = get_l_node_text(i_node_id);
                    var l_id = vals[0];
                    var l_text = vals[1];

                    //other locution
                    var node_data_4 = {
                    "nodeID": "L" + ids,
                    "text": l_text,
                    "type": "L"
                    };

                    var edge_data = {
                    "edgeID": "e" + ids + ids,
                    "fromID": "" + ids,
                    "toID": "" + ids + ids + ids + ids + ids
                    };

                    var edge_data_2 = {
                    "edgeID": "e" + ids + ids + ids,
                    "fromID": "L" + ids,
                    "toID": "ta" + ids
                    };

                    var edge_data_3 = {
                    "edgeID": "e" + ids + ids + ids + ids,
                    "fromID": "ta" + ids,
                    "toID": "" + ids + ids + ids + ids
                    };

                    var edge_data_4 = {
                    "edgeID": "e" + ids + ids + ids + ids + ids,
                    "fromID": "ta" + ids,
                    "toID": "" + ids
                    };

                    node_list.push(node_data);
                    node_list.push(node_data_2);
                    node_list.push(node_data_3);
                    node_list.push(node_data_4);
                    node_list.push(node_data_ta);
                    edge_list.push(edge_data);
                    edge_list.push(edge_data_2);
                    edge_list.push(edge_data_3);
                    edge_list.push(edge_data_4);

                }else if(t_type == 'I' && f_type == 'I'){

                    //RA/CA/MA
                    var node_data = {
                    "nodeID": "" + ids,
                    "text": schema_text,
                    "type": schema_node
                    };

                    //ta
                    var node_data_ta = {
                    "nodeID": "ta" + ids,
                    "text": "Default Transition",
                    "type": "TA"
                    };


                    if(schema_node == 'RA'){
                        var node_data_ya = {
                        "nodeID": "ya" + ids,
                        "text": "Arguing",
                        "type": "YA"
                        };
                    } else if(schema_node == 'CA'){
                        var node_data_ya = {
                        "nodeID": "ya" + ids,
                        "text": "Disagreeing",
                        "type": "YA"
                        };
                    } else if(schema_node == 'MA'){
                        var node_data_ya = {
                        "nodeID": "ya" + ids,
                        "text": "Restating",
                        "type": "YA"
                        };
                    }


                    //orig i
                    var node_data_2 = {
                    "nodeID": "" + ids + ids + ids + ids,
                    "text": from_text[i],
                    "type": from_type[i]
                    };

                    //orig i 2
                    var node_data_3 = {
                    "nodeID": "" + ids + ids + ids + ids + ids,
                    "text": to_text[i],
                    "type": to_type[i]
                    };



                    //call function to find L-node
                    var i_node_id_to = to_annotation_list[i];
                    var i_node_id_from = from_annotation_list[i];
                    var vals_to = get_l_node_text(i_node_id_to);
                    var l_id_to = vals_to[0];
                    var l_text_to = vals_to[1];


                    var vals_from = get_l_node_text(i_node_id_from);
                    var l_id_from = vals_from[0];
                    var l_text_from = vals_from[1];

                    //to locution
                    var node_data_4 = {
                    "nodeID": "Lto" + ids,
                    "text": l_text_to,
                    "type": "L"
                    };

                    //from locution
                    var node_data_5 = {
                    "nodeID": "Lfr" + ids,
                    "text": l_text_from,
                    "type": "L"
                    };




                    var edge_data = {
                    "edgeID": "e" + ids + ids,
                    "fromID": "" + ids,
                    "toID": "" + ids + ids + ids + ids + ids
                    };

                    var edge_data_2 = {
                    "edgeID": "e" + ids + ids + ids,
                    "fromID": "Lto" + ids,
                    "toID": "ta" + ids
                    };

                    var edge_data_3 = {
                    "edgeID": "e" + ids + ids + ids + ids,
                    "fromID": "ta" + ids,
                    "toID": "Lfr" + ids
                    };

                    var edge_data_4 = {
                    "edgeID": "e" + ids + ids + ids + ids + ids,
                    "fromID": "" + ids + ids + ids + ids,
                    "toID": "" + ids
                    };

                    var edge_data_5 = {
                    "edgeID": "e" + ids + ids + ids + ids + ids + ids,
                    "fromID": "ta" + ids,
                    "toID": "ya" + ids
                    };

                    var edge_data_6 = {
                    "edgeID": "e" + ids + ids + ids + ids + ids + ids + ids,
                    "fromID": "ya" + ids,
                    "toID": "" + ids
                    };

                    node_list.push(node_data);
                    node_list.push(node_data_2);
                    node_list.push(node_data_3);
                    node_list.push(node_data_4);
                    node_list.push(node_data_5);
                    node_list.push(node_data_ta);
                    node_list.push(node_data_ya);

                    edge_list.push(edge_data);
                    edge_list.push(edge_data_2);
                    edge_list.push(edge_data_3);
                    edge_list.push(edge_data_4);
                    edge_list.push(edge_data_5);
                    edge_list.push(edge_data_6);
                }





            }
            else{
                var node_data = {
                "nodeID": "" + ids,
                "text": schema_text,
                "type": schema_node
                };
                var node_data_2 = {
                "nodeID": "" + ids + ids + ids + ids,
                "text": from_text[i],
                "type": from_type[i]
                };
                var node_data_3 = {
                "nodeID": "" + ids + ids + ids + ids + ids,
                "text": to_text[i],
                "type": to_type[i]
                };
                var edge_data = {
                "edgeID": "e" + ids + ids,
                "fromID": "" + ids + ids + ids + ids,
                "toID": "" + ids
                };
                var edge_data_2 = {
                "edgeID": "e" + ids + ids + ids,
                "fromID": "" + ids,
                "toID": "" + ids + ids + ids + ids + ids
                };

                node_list.push(node_data);
                node_list.push(node_data_2);
                node_list.push(node_data_3);
                edge_list.push(edge_data);
                edge_list.push(edge_data_2);
            }



        }
        locutions.push({});

        for (var z in node_list) {
            var item = node_list[z];

            json_aif.nodes.push({
                "nodeID": item.nodeID,
                "text": item.text,
                "type": item.type,
                "timestamp": item.timestamp,
            });
        }

        for (var z in edge_list) {
            var item = edge_list[z];

            json_aif.edges.push({
                "edgeID": item.edgeID,
                "fromID": item.fromID,
                "toID": item.toID
            });
        }
        json_aif.locutions.push({});

    //section below needs uncommented for upload to AIFdb
        if (upload_bool == "true"){
        if (confirm('You are about to make changes to the corpus. By clicking cancel a map will be created but the corpus will NOT be changed. ')) {
            corporaUp = "true";
        }else{
            corporaUp = "false";
        }


        var corp = {
            'corpusUp': corporaUp,
            'aif': json_aif,
            'upload_bool': upload_bool
        }


        $.ajax({
            url: "/background_process",
            type: "POST",
            contentType: "application/json",
            credentials: 'same-origin',
            data: JSON.stringify(corp),
            success: function(response) {

                console.log(response);


                alert(response);
            },
            error: function(err) {
                alert('error ' + err);
            }
        });
        }else{
            var corp = {
            'aif': json_aif
            };

            var fileName = 'myData.json';

            // Create a blob of the data
            var fileToSave = new Blob([JSON.stringify(json_aif)], {
            type: 'application/json',
            name: fileName
            });

            // Save the file
            saveAs(fileToSave, fileName);
        }
    }

    function toggleButton() {
        var x = document.getElementsByClassName("tableclass")[0];
        var canvas = document.getElementsByClassName("canvasclass")[0];
        var annclass = document.getElementsByClassName("annotationclass")[0];
        var locclass = document.getElementsByClassName("locutionclass")[0];

        if (x.style.display === "none") {
            x.style.display = "block";
            //display central issues

            if (annclass.style.display === "none" || annclass.style.display === "") {

                if(locclass.style.display === "none" && iat_mode === true){
                    canvas.style.width = "90%";
                }
                else if (iat_mode === false){
                    canvas.style.width = "80%";
                }else{
                    canvas.style.width = "80%";
                }
            } else {
                if(locclass.style.display === "none" && iat_mode=== true){
                    canvas.style.width = "70%";
                }
                else if(iat_mode === true){
                    canvas.style.width = "60%";
                }
                else{
                    canvas.style.width = "100%";
                }
            }

            $("#btn_table_text").html("&#8679; Centrality &#8679;");
        } else {
            //hide central issues
            console.log(iat_mode);
            console.log(annclass.style.display);
            $("#btn_table_text").html("&#8681; Centrality &#8681;");
            if (annclass.style.display === "none" && iat_mode === false || annclass.style.display === "" && iat_mode === false) {
                canvas.style.width = "100%";
            } else if(annclass.style.display === "block" && iat_mode === true){
                if(locclass.style.display === "none" && iat_mode === true){
                    canvas.style.width = "80%";
                }else{
                    canvas.style.width = "70%";
                }

            }else if(iat_mode === true){
                if(locclass.style.display === "none"){
                    canvas.style.width = "100%";
                }
                else{
                    canvas.style.width = "100%";
                }

            }else{
                canvas.style.width = "80%";
            }

            x.style.display = "none";
        }
    }

    function toggleAnnButton() {
        var x = document.getElementsByClassName("annotationclass")[0];
        var canvas = document.getElementsByClassName("canvasclass")[0];
        var tabclass = document.getElementsByClassName("tableclass")[0];
        var locclass = document.getElementsByClassName("locutionclass")[0];

        if (x.style.display === "none") {
            //display ann panel
            x.style.display = "block";
            canvas.style.width = "60%";

            if (tabclass.style.display === "none") {
                canvas.style.width = "80%";
            } else {
                if (locclass.style.display === "none"){
                    canvas.style.width = "70%";
                }
                else{
                    canvas.style.width = "60%";
                }

            }

            $("#btn_ann_text").html("&#8681; Annotation &#8681;");
        } else {
            //hide ann panel
            $("#btn_ann_text").html("&#8679; Annotation &#8679;");
            if (tabclass.style.display === "none") {
                canvas.style.width = "100%";
            } else {
                if (locclass.style.display === "none"){
                    canvas.style.width = "90%";
                }else{
                    canvas.style.width = "80%";
                }

            }
            x.style.display = "none";
        }
    }

    function toggleLocButton() {
        var x = document.getElementsByClassName("locutionclass")[0];
        var canvas = document.getElementsByClassName("canvasclass")[0];
        var annclass = document.getElementsByClassName("annotationclass")[0];
        var tabclass = document.getElementsByClassName("tableclass")[0];

        if (x.style.display === "none") {
            //display loc button
            x.style.display = "block";

            if (annclass.style.display === "none" || annclass.style.display === "") {
                if (tabclass.style.display === "none") {
                    canvas.style.width = "90%";
                }else{
                    canvas.style.width = "90%";
                }

            } else {
                canvas.style.width = "70%";
            }

            $("#btn_loc_text").html("&#8679; Locutions &#8679;");
        } else {
            //hide loc button
            $("#btn_loc_text").html("&#8681; Locutions &#8681;");
            if (annclass.style.display === "none" || annclass.style.display === "") {
                canvas.style.width = "90%";
                if(tabclass.style.display === "none"){
                    canvas.style.width = "100%";
                }
            } else {
                if(tabclass.style.display === "none"){
                    canvas.style.width = "90%";
                }
                else{
                    canvas.style.width = "70%";
                }

            }

            x.style.display = "none";
        }
    }

    function toggleSchemeButton() {
        var x = document.getElementsByClassName("schemeclass")[0];
        var canvas = document.getElementsByClassName("canvasclass")[0];
        var annclass = document.getElementsByClassName("annotationclass")[0];
        var tabclass = document.getElementsByClassName("tableclass")[0];
        var locclass = document.getElementsByClassName("locutionclass")[0];

        if (x.style.display === "none") {
            //display loc button
            x.style.display = "block";

            if (annclass.style.display === "none" || annclass.style.display === "") {
                if (tabclass.style.display === "none") {
                    canvas.style.width = "90%";
                }else{
                    canvas.style.width = "90%";
                }

            } else {
                canvas.style.width = "70%";
            }

            $("#btn_loc_text").html("&#8679; Schemes &#8679;");
        } else {
            //hide loc button
            $("#btn_loc_text").html("&#8681; Schemes &#8681;");
            if (annclass.style.display === "none" || annclass.style.display === "") {
                canvas.style.width = "90%";
                if(tabclass.style.display === "none"){
                    canvas.style.width = "100%";
                }
            } else {
                if(tabclass.style.display === "none"){
                    canvas.style.width = "90%";
                }
                else{
                    canvas.style.width = "70%";
                }

            }

            x.style.display = "none";
        }
    }

    function searchtab() {
        var input, filter, table, tr, td, i, txtValue;
        input = document.getElementById("tabsearch");
        filter = input.value.toUpperCase();
        table = document.getElementsByClassName('dataframe')[0];
        tr = table.getElementsByTagName("tr");
        for (i = 0; i < tr.length; i++) {
            td = tr[i].getElementsByTagName("td")[1];
            if (td) {
                txtValue = td.textContent || td.innerText;
                if (txtValue.toUpperCase().indexOf(filter) > -1) {
                    tr[i].style.display = "";
                } else {
                    tr[i].style.display = "none";
                }
            }
        }
    }

    function locsearchtab() {
        var input, filter, table, tr, td, i, txtValue;
        input = document.getElementById("locsearch");
        filter = input.value.toUpperCase();
        table = document.getElementsByClassName('locframe')[0];
        tr = table.getElementsByTagName("tr");
        for (i = 0; i < tr.length; i++) {
            td = tr[i].getElementsByTagName("td")[0];
            if (td) {
                txtValue = td.textContent || td.innerText;
                if (txtValue.toUpperCase().indexOf(filter) > -1) {
                    tr[i].style.display = "";
                } else {
                    tr[i].style.display = "none";
                }
            }
        }
    }

    function schemesearchtab() {
        var input, filter, table, tr, td, i, txtValue;
        input = document.getElementById("schemesearch");
        filter = input.value.toUpperCase();
        table = document.getElementsByClassName('schemeframe')[0];
        tr = table.getElementsByTagName("tr");
        for (i = 0; i < tr.length; i++) {
            td = tr[i].getElementsByTagName("td")[0];
            if (td) {
                txtValue = td.textContent || td.innerText;
                if (txtValue.toUpperCase().indexOf(filter) > -1) {
                    tr[i].style.display = "";
                } else {
                    tr[i].style.display = "none";
                }
            }
        }
    }


