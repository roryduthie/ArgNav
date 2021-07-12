from . import app
import xml.etree.ElementTree as ET
import pandas as pd

class SVGParse:
    """
    Class to parse the SVG file in order to get SVGids for processing in the main results page.
    """
    @staticmethod
    def parse_svg_file(svg_file):
        """
        function to set an SVGid in the root of the svg file.
        """
        
        try:
            ET.register_namespace("","http://www.w3.org/2000/svg")
            root = ET.fromstring(svg_file)
        
        
            #root = xmldoc.getroot()
        
            root.set('id', 'svgmap')
            root.set('width', '100%')
            root.set('height', '100%')
        except(IOError):
            print('File was not found:')
            #print(node_path)
        str_svg = ET.tostring(root)
        dec_str = str_svg.decode('utf-8')
        return dec_str
        
    @staticmethod
    def convert_list_df(tup_list, column_name_1, column_name_2):
        """
        function to convert a tuple list into a dataframe
        """
        df = pd.DataFrame(tup_list, columns =[column_name_1, column_name_2]) 
        return df
        
    @staticmethod    
    def get_node_ids(svg_file):
        """
        function that takes an svg file and extracts the svgid and the aifdb id from each node of the svg.
        """
        xmldoc = ET.ElementTree(ET.fromstring(svg_file))
        root = xmldoc.getroot()
        n_root = root[0]
        nodes = n_root.findall("./{http://www.w3.org/2000/svg}g[@class='node']")
        node_list = []
        
        for node in nodes:
    
            for child in node:
                if child.tag == "{http://www.w3.org/2000/svg}title":
                    node_list.append((child.text,node.attrib['id']))
        
        df = pd.DataFrame(node_list, columns =['aifid', 'nodeid'])
        #df = convert_list_df(node_list, 'aifid', 'nodeid')
        return df
        
    
