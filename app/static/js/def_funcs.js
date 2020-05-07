function uploadAIFdb() {
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
            var ids = i + 1;

            var node_data = {
                "nodeID": "" + ids,
                "text": schema_text,
                "type": schema_node
            };
            var node_data_2 = {
                "nodeID": "" + ids + ids + ids + ids,
                "text": from_text[i],
                "type": "I"
            };
            var node_data_3 = {
                "nodeID": "" + ids + ids + ids + ids + ids,
                "text": to_text[i],
                "type": "I"
            };
            var edge_data = {
                "edgeID": "" + ids + ids,
                "fromID": "" + ids + ids + ids + ids,
                "toID": "" + ids
            };
            var edge_data_2 = {
                "edgeID": "" + ids + ids + ids,
                "fromID": "" + ids,
                "toID": "" + ids + ids + ids + ids + ids
            };

            node_list.push(node_data);
            node_list.push(node_data_2);
            node_list.push(node_data_3);
            edge_list.push(edge_data);
            edge_list.push(edge_data_2);

        }
        locutions.push({});

        for (var z in node_list) {
            var item = node_list[z];

            json_aif.nodes.push({
                "nodeID": item.nodeID,
                "text": item.text,
                "type": item.type,
                "timestamp": item.timestamp,
                "scheme": item.scheme,
                "schemeID": item.schemeID
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

        $.ajax({
            url: "/background_process",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(json_aif),
            success: function(response) {

                //console.log(response);
                var obj = JSON.parse(response);
                //console.log(obj.nodeSetID);
                alert('Success! Nodeset ID is: ' + obj.nodeSetID);
            },
            error: function(err) {
                alert('error ' + err);
            }
        });

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
