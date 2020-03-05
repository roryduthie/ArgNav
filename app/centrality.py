from app.load_map import CorpusLoader
from app import app
import json
from datetime import datetime
from pathlib import Path

import networkx as nx



class Centrality:
    @staticmethod
    def get_nodeset_path(nodeset_id):
        corpus_name = 'US2016tv'
        directory_path = 'examples/'
        node_path = directory_path + 'nodeset' + nodeset_id + '.json'
        return node_path
    
    @staticmethod
    def get_svg_path(nodeset_id):
        #corpus_name = 'US2016tv'
        directory_path = 'examples/'
        node_path = directory_path + nodeset_id + '.svg'
        return node_path

    @staticmethod
    def get_graph(node_path):
        corpus_loader = CorpusLoader()
        try:
            with app.open_resource(node_path) as json_data:
                graph = corpus_loader.parse_json(json.load(json_data))
        except(IOError):
            print('File was not found:')
            print(node_path)
            
        return graph

    @staticmethod
    def remove_redundant_nodes(graph):

        node_types=nx.get_node_attributes(graph,'type')

        nodes_to_remove =  [x for x,y in graph.nodes(data=True) if y['type']=='TA' or y['type']=='L' or y['type']=='YA']

        graph.remove_nodes_from(nodes_to_remove)
        
        return graph
        
    @staticmethod
    def get_eigen_centrality(graph):
        eig_cent = nx.eigenvector_centrality_numpy(graph)
        nx.set_node_attributes(graph, eig_cent, 'eig_central')
        i_nodes =  [(x,y['eig_central'],y['text']) for x,y in graph.nodes(data=True) if y['type']=='I']
        return i_nodes
        
    @staticmethod        
    def sort_by_centrality(i_nodes):
        sorted_by_second = sorted(i_nodes, key=lambda tup: tup[1])
        ordered_ids = [(i[0],i[2]) for i in sorted_by_second]
        
        return ordered_ids