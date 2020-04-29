d3.selectAll("node")
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut);


function handleMouseOver(d, i) {  // Add interactivity

            // Use D3 to select element, change color and size
            d3.select(this).attr({
              "visiblity" : "hidden"
            });
}

function handleMouseOut(d, i) {
            // Use D3 to select element, change color back to normal
            console.log('')

            // Select text by id and then remove
            // Select text by id and then remove
}
