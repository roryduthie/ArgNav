# ArgNav
Navigate argument diagrams using python and flask. 


# Using the tool

Maps can be loaded from AIFdb (http://www.aifdb.org/search) or corpora (http://corpora.aifdb.org/) using either an argument map number e.g. 14151 or a corpus shortname e.g. muc3.

On the left side of the tool central issues are listed which can be clicked to automatically pan and zoom teh argument map. 

Nodes in the argument map can also be clicked to collpase them. 

On the right side of the tool is the annotation panel. Relations are annotated by holding shift and click a node, then holding shift again and clicking a second node. A dialogue box appears, select the relation type and the annotation appears in the annotation tab. 

Annotation can be deleted by clicking on the annotation in the right tab. 

Annotation can be saved to AIFdb by clicking the upload button, this returns an argument map number. 

# Running the tool locally

The tool uses python with flask, HTML, CSS, JavaScript and jQuery. 

The master branch is developed specifically for integration with a server. To run the code locally it is likely that all isntance of @application within the code will need to be repalce with @app. Instances of application.open_resource will also need replaced with app.open_resource. 

