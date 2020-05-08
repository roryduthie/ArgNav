d3.selectAll('.node')
        .on("click", handleMouseClick)
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut);

    

    var dt = dynamicTable.config('annotationtable', ['from', 'to', 'type'], ['From', 'To', 'Type'], 'No annotation to list...');

    function addRowHandlers() {
        var rows = document.getElementById("annotationtable").rows;
        var table = document.getElementById("annotationtable");
        for (i = 1; i < rows.length; i++) {
            rows[i].onclick = function() {
                return function() {
                    if (confirm('You are about to delete this row. Are you sure?')) {
                        var ind = this.rowIndex;

                        if (ind > 0) {
                            table.deleteRow(ind);
                            from_annotation_list.splice(ind - 1, 1);
                            to_annotation_list.splice(ind - 1, 1);
                            from_text.splice(ind - 1, 1);
                            to_text.splice(ind - 1, 1);
                            schema_list.splice(ind - 1, 1);
                            annotation_counter = annotation_counter - 1;
                           
                        }

                        
                    } else {
                        return;
                    }

                };
            }(rows[i]);
        }
    }



    function double_click(element, aif_id) {

        var textels = element.selectAll('text').nodes();
        var poly = element.selectAll('polygon');
        console.log(poly);
        poly.attr("fill", "skyblue");

        var allText = '';
        for (z = 0; z < textels.length; z++) {
            allText = allText + textels[z].innerHTML + ' ';
        }
        allText = allText.trim();
        if (!annotation_flag) {
            from_type.push('I');
            //console.log(allText);
            from_annotation_list.push(aif_id);
            from_text.push(allText);
            var selection = document.getElementsByClassName("selectionbar")[0];
            selection.style.display = "block";
            var ptag = document.getElementById('par');
            ptag.innerHTML = allText;
            annotation_flag = true;

        } else {
            //console.log('TO');
            to_annotation_list.push(aif_id);
            to_type.push('I');
            to_text.push(allText);
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

    function populate_table() {
        var json_data = get_JSON();
        dt.load(json_data, true);

        addRowHandlers();
    }

    function dialogue_btn_click() {
        //console.log($('#schema'));
        schema_type = $('#schema').val();
        schema_list.push(schema_type);
        return $('#schema').val();
    }

    function get_JSON() {
        var to_val = to_text[annotation_counter - 1];
        var from_val = from_text[annotation_counter - 1];
        var schema_val = schema_list[annotation_counter - 1];

        var json_data = [{
            from: from_val,
            to: to_val,
            type: schema_val
        }];
        return json_data;
    }

    function handleMouseClick(d, i) { 
        var currEl = d3.select(this);
        var currNodeId = currEl.select('title').text();

        if (d3.event.shiftKey) {

            double_click(currEl, currNodeId);

            return;
        }

        var isClicked = d3.select(this).attr('nodeValue');


        var check_snode_flag = check_s_node(snode_list, currNodeId);

        if (check_snode_flag) {
            return;
        }

        var curr_svg_id = get_svg_id(currNodeId);
        var is_visible = check_visible(curr_svg_id);

        if (is_visible) {

            var sel_nodes = [];
            var sel_edges = [];
            getNodes(currNodeId, sel_nodes);
            getEdges(currNodeId, sel_edges);

            var sel_nodes_copy = $.extend(true, [], sel_nodes);;
            sel_nodes_copy.push(currNodeId);

            var div_flag = check_divergent_graph(divergent_list, sel_nodes_copy);

            if (alert_box_flag == false && div_flag == true) {
                if (confirm('Sub-graph has divergent node, collapsing this sub-graph may lose information in other sub-graphs. Click ok to confirm and hide this message')) {
                    alert_box_flag = true;
                } else {
                    alert_box_flag = false;
                    return;
                }
            }

            var all_nodes = [];
            var node_list_copy = $.extend(true, [], node_list);;

            for (i = 0; i < sel_nodes.length; i++) {

                node_id = sel_nodes[i];

                var check_div_flag = check_divergent_node(divergent_list, node_id);

                if (check_div_flag) {
                    continue;
                }

                svg_id = get_svg_id(node_id);

                if (isClicked == 'true') {
                    show_node(svg_id);
                    show_table_row(svg_id);
                    currEl.attr('nodeValue', 'false');

                } else {

                    hide_node(svg_id);
                    hide_table_row(svg_id);

                    currEl.attr('nodeValue', 'true');
                }

            }
            if (currEl.attr('nodeValue') == 'true') {
                var copy = currEl.clone(true).attr("transform", "translate(-5,5)");
                copy.style("opacity", 1);
                var copy1 = currEl.clone(true).attr("transform", "translate(-10,10)");
                copy1.style("opacity", 1);
                currEl.raise().classed("active", true);
            } else {
                currElcp = currEl;
                var allEls = d3.selectAll('#' + currEl.attr('id')).nodes();
                for (z = 0; z < allEls.length - 1; z++) {
                    allEls[z].remove();
                }
            }

            hide_edges(sel_edges, isClicked);
        } else {
            console.log('Invisble Node');
        }

    }

    function check_s_node(snodes_list, aif_id) {
        if (snodes_list.indexOf(parseInt(aif_id)) !== -1) {
            return true;
        } else {
            return false;
        }
    }

    function check_divergent_node(divergent_node_list, aif_id) {
        if (divergent_node_list.indexOf(aif_id) !== -1) {
            return true;
        } else {
            return false;
        }
    }

    function check_divergent_graph(divergent_node_list, sub_graph_list) {
        for (i = 0; i < sub_graph_list.length; i++) {
            aif_id = sub_graph_list[i];

            if (divergent_node_list.indexOf(aif_id) !== -1) {
                return true;
            }
        }

        return false;
    }

    function hide_edges(sel_edges, isClicked) {
        for (i = 0; i < sel_edges.length; i++) {
            var edge_title = sel_edges[i];
            //edge_title = edge_title.toString();
            var fromEdge = edge_title[0];
            var toEdge = edge_title[1];

            var edgeText = fromEdge + '->' + toEdge;

            if (edgeText == '->') {
                return;
            }


            var edgeG = '';

            edgeG = d3.selectAll('.edge')
                .filter(function() {
                    return d3.select(this).select('title').text() == edgeText; 
                });

            var edge_ID = '';

            if (edgeG == '') {
                return;
            }
            //console.log(edgeG);
            try {
                edge_ID = edgeG.attr("id");
            } catch (e) {
                console.log(e);
            }

            if (isClicked == 'true') {
                show_node(edge_ID);
            } else {
                hide_node(edge_ID);
            }

        }
    }

    function check_visible(svg_id) {
        svg_class_id = '#' + svg_id;
        var visibility = d3.select(svg_class_id).style("opacity");

        if (visibility < 0.1) {
            return false;
        }

        return true;
    }

    function hide_table_row(svg_id) {
        var table = document.getElementsByClassName('dataframe')[0];
        //console.log(table);

        var svg_class_id = '';
        svg_class_id = svg_id;

        if (svg_class_id == '') {
            return;
        }

        if (table) {
            for (var i = 0; i < table.rows.length; i++) {
                var textTable = tableText(table.rows[i]);
                if (svg_id == textTable) {
                    //console.log(table.rows[i]);
                    table.rows[i].style.display = "none";
                    break;
                }

            }
        }

    }

    function show_table_row(svg_id) {
        var table = document.getElementsByClassName('dataframe')[0];
        //console.log(table);

        var svg_class_id = '';
        svg_class_id = svg_id;

        if (svg_class_id == '') {
            return;
        }

        if (table) {
            for (var i = 0; i < table.rows.length; i++) {
                var textTable = tableText(table.rows[i]);
                if (svg_id == textTable) {
                    //console.log(table.rows[i]);
                    table.rows[i].style.display = "table-row";
                    break;
                }

            }
        }

    }

    function tableText(tableRow) {
        var aifid = tableRow.childNodes[1].innerHTML;
        return aifid;

    }

    function hide_node(svg_id) {

        svg_class_id = '#' + svg_id;

        if (svg_class_id == '#') {
            return;
        }

        var allEls = d3.selectAll(svg_class_id).nodes();

        if (allEls.length > 2) {

            for (z = 0; z < allEls.length - 1; z++) {
                console.log(allEls[z].remove());
                allEls[z].remove();
            }
        }

        d3.select(svg_class_id)
            .transition()
            .attr("transform", "translate(0,50)")
            .duration(500)
            .style("opacity", 0);

    }

    function show_node(svg_id) {
        svg_class_id = '#' + svg_id;

        if (svg_class_id == '#') {
            return;
        }
        d3.select(svg_class_id)
            .transition()
            .attr("transform", "translate(0,0)")
            .duration(500)
            .style("opacity", 1);

    }

    function get_svg_id(aif_id) {
        for (i = 0; i < aif_nodes_list.length; i++) {
            aif_list_id = aif_nodes_list[i];
            svg_list_id = svg_nodes_list[i];
            if (aif_list_id == aif_id) {
                return svg_list_id;
            }
        }
        return '';
    }

    function handleMouseOver(d, i) { // Add interactivity

        var visibility = d3.select(this).style("opacity");

        if (visibility < 0.1) {
            d3.select(this).style("cursor", "default");
            d3.select(this).style("opacity", 0);
        } else {
            d3.select(this).style("cursor", "cell");
            d3.select(this).style("opacity", 0.3);
        }
    }

    function getNodes(nodeID, sel_n_list) {
        for (i = 0; i < node_list.length; i++) {
            var node_id = node_list[i][0];

            if (node_id == nodeID) {
                nodes = node_list[i][1];
                sel_n_list.push(...nodes);

                return sel_n_list;
            }
        }

    }

    function getEdges(nodeID, sel_e_list) {
        for (i = 0; i < edge_list.length; i++) {
            var node_id = edge_list[i][0];

            if (node_id == nodeID) {
                edges = edge_list[i][1];
                sel_e_list.push(...edges);

                return sel_e_list;
            }
        }

    }

    function handleMouseOut(d, i) {
        var visibility = d3.select(this).style("opacity");

        if (visibility < 0.1) {
            d3.select(this).style("cursor", "default");
            d3.select(this).style("opacity", 0);
        } else {
            d3.select(this).style("cursor", "default");
            d3.select(this).style("opacity", 1);
        }

    }
