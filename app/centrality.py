from .load_map import CorpusLoader
from . import application
import json
import requests
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
    def create_svg_url(nodeset_id, isMap):
        
        if isMap:
            return 'http://www.aifdb.org/diagram/svg/' + nodeset_id
        else:
            return 'http://corpora.aifdb.org/' + nodeset_id + '/svg/'
        return node_path
    
    @staticmethod
    def create_json_url(nodeset_id, isMap):
        
        if isMap:
            return 'http://www.aifdb.org/json/' + nodeset_id
        else:
            return 'http://corpora.aifdb.org/' + nodeset_id + '/json/'
        return node_path

    @staticmethod
    def get_graph(node_path):
        corpus_loader = CorpusLoader()
        try:
            with application.open_resource(node_path) as json_data:
                graph = corpus_loader.parse_json(json.load(json_data))
        except(IOError):
            print('File was not found:')
            print(node_path)
            
        return graph
    
    @staticmethod
    def get_graph_url(node_path):
        corpus_loader = CorpusLoader()
        try:
            graph = corpus_loader.parse_json(json.loads(requests.get(node_path).text))
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
    
    @staticmethod
    def list_nodes(graph):
        return list(graph)
    
    @staticmethod
    def get_s_node_list(graph):
        s_nodes =  [x for x,y in graph.nodes(data=True) if y['type']=='MA' or y['type']=='RA' or y['type']=='CA' or y['type']=='PA']
        return s_nodes
    
    @staticmethod
    def get_divergent_nodes(graph):
        list_of_nodes = []
    
        for v in list(graph.nodes):
            node_pres = []
            node_pres = list(graph.successors(v))
            if len(node_pres) > 1:
                list_of_nodes.append(v)
        return list_of_nodes
    
    @staticmethod
    def get_child_edges(graph):
        list_of_nodes = []
        list_of_edges = []
    
        for v in list(graph.nodes):
            node_pres = []
            node_pres = list(nx.ancestors(graph, v))
            list_of_nodes.append((v, node_pres))
            edges = []
            edges = list(nx.edge_dfs(graph,v, orientation='reverse'))
            res_list = []
            res_list = [(x[0], x[1]) for x in edges]
            list_of_edges.append((v, res_list))
        
        return list_of_nodes, list_of_edges
