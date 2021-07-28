from .load_map import CorpusLoader
from . import app
import json
import requests
from datetime import datetime
from pathlib import Path
import re

import networkx as nx

class Centrality:
    """
    Class to perform operations over AIF graphs.

    The class pulls data from AIFdb through url creation, calls the translation of AIF json into a networkx directed graph.
    Functions also perform operations over the networkx graphs

    """
    @staticmethod
    def get_nodeset_path(nodeset_id):
        """
        Function to create a nodeset path based on the nodeset id in the examples folder
        """
        directory_path = 'examples/'
        node_path = directory_path + 'nodeset' + nodeset_id + '.json'
        return node_path
    
    @staticmethod
    def get_svg_path(nodeset_id):
        """
        Function to create an svg path based on the nodeset id in the examples folder
        """
        #corpus_name = 'US2016tv'
        directory_path = 'examples/'
        node_path = directory_path + nodeset_id + '.svg'
        return node_path
    
    @staticmethod
    def create_svg_url(nodeset_id, isMap):
        """
        Function to create an svg url based on the nodeset id or corpus shortname from aifdb
        Parameters
        
        nodeset_id: str
        isMap: Bool
            True if nodeset id
            False if corpus shortname
        """
        if isMap:
            return 'http://www.aifdb.org/diagram/svg/' + nodeset_id
        else:
            return 'http://corpora.aifdb.org/' + nodeset_id + '/svg/'
        return node_path
    
    @staticmethod
    def create_json_url(nodeset_id, isMap):
        
        """
        Function to create an AIFdb url based on the nodeset id or corpus shortname from aifdb


        Parameters
        ----------

        nodeset_id: str
        isMap: Bool
            True if nodeset id
            False if corpus shortname
        """

        if isMap:
            return 'http://www.aifdb.org/json/' + nodeset_id
        else:
            return 'http://corpora.aifdb.org/' + nodeset_id + '/json/'
        return node_path

    @staticmethod
    def get_graph(node_path):
        """
        Function to create a networkx graph from json data.
        Calls the corpus loader class, opens the file at a path, and returns the graph.

        Parameters
        ----------
        node_path: path to AIF json data to create networkx graph.
        """
        corpus_loader = CorpusLoader()
        try:
            with app.open_resource(node_path) as json_data:
                graph = corpus_loader.parse_json(json.load(json_data))
        except(IOError):
            print('File was not found:')
            print(node_path)
            
        return graph
    
    @staticmethod
    def get_graph_url(node_path):
        """
        Function to create a networkx graph from a url containing json data.
        Calls the corpus loader class, opens the file at the url, and returns the graph.

        Parameters
        ----------
        node_path: path to AIF json data to create networkx graph.
        """
        corpus_loader = CorpusLoader()
        try:
            jsn_string = requests.get(node_path).text

            #Check for bracket to determine if string contains JSON data
            strng_ind = jsn_string.index('{')
            n_string = jsn_string[strng_ind:]
            dta = json.loads(n_string)
            graph = corpus_loader.parse_json(dta)
        except(IOError):
            print('File was not found:')
            print(node_path)
            
        return graph

    @staticmethod
    def remove_redundant_nodes(graph):
        """
        Function to remove all IAT nodes leaving only AIF nodes - I-nodes and S-nodes

        Find the nodes,add them to a list and then remove from graph using networkx function.

        Parameters
        ----------
        graph: aif_graph for corpus
        """
        node_types=nx.get_node_attributes(graph,'type')

        nodes_to_remove =  [x for x,y in graph.nodes(data=True) if y['type']=='TA' or y['type']=='L' or y['type']=='YA']

        graph.remove_nodes_from(nodes_to_remove)
        
        return graph

    @staticmethod
    def remove_iso_nodes(graph):
        """
        Function to remove isolated nodes from the graph.

        Parameters
        ----------
        graph: aif_graph for corpus
        """
        graph.remove_nodes_from(list(nx.isolates(graph)))
        return graph
        
    @staticmethod
    def get_eigen_centrality(graph):
        """
        Function to get centrality of I-nodes from a graph.

        Function calculates eigenvector centrality for all nodes and then selects I-nodes from the graph.
        Where Eigen vector centrality cannot converge an exception is thrown, at which point normalised degree centrality is used.

        Parameters
        ----------
        graph: aif_graph for corpus
        """
        try:
            cent = nx.eigenvector_centrality_numpy(graph)
        except:
            cent = nx.degree_centrality(graph)
            
        nx.set_node_attributes(graph, cent, 'central')
        i_nodes =  [(x,y['central'],y['text']) for x,y in graph.nodes(data=True) if y['type']=='I']
        return i_nodes
        
    @staticmethod        
    def sort_by_centrality(i_nodes):
        """
        Function to sort I-nodes by the centrality.

        Outputs a tuple of I-node ID and text.
        Parameters
        ----------
        i_nodes: I_nodes extracted from the aif graph
        """
        sorted_by_second = sorted(i_nodes, key=lambda tup: tup[1])
        ordered_ids = [(i[0],i[2]) for i in sorted_by_second]
        
        return ordered_ids
    
    @staticmethod
    def get_schemes(graph):
        """
        Function to get schemes from S-nodes.

        Function is implmented for all possible S-nodes, but currently only RAs have schemes.
        Parameters
        ----------
        graph: aif_graph for corpus
        """
        all_nodes =  [(x,y['text']) for x,y in graph.nodes(data=True) if y['type']=='RA' and y['text']!='Default Inference' or y['type']=='CA' and y['text']!='Default Conflict' or y['type']=='MA' and y['text']!='Default Rephrase']
        return all_nodes

    @staticmethod
    def get_ra_i_schemes_nodes(graph, scheme_ras):
        """
        Function to get the I-node connected to a scheme s-node.

        Function is implmented for all possible S-nodes, but currently only RAs have schemes.
        Function takes an S-node and finds all successors of the node. An S-node should only have a single outgoing edge to an I-node.
        Therefore, the first element from the returned list is taken.
        Outputs a tuple containing the S-node ID, s-node text I_node id and I-node text.
        Parameters
        ----------
        graph: aif_graph for corpus
        scheme_ras: all s-nodes that contain some form of scheme - i.e. not a default
        """
        ra_tups = []
        for ra in scheme_ras:
            node_succ = list(graph.successors(ra[0]))
            i_1 = node_succ[0]
            i_1_text = graph.nodes[i_1]['text']

            ra_tup = (ra[0], ra[1],i_1, i_1_text)
            ra_tups.append(ra_tup)
        return ra_tups

    @staticmethod
    def get_all_schemes_nodes(graph, scheme_ras):
        """
        Function to get the I-nodes connected to a scheme s-node - both incoming and outgoing.

        Function is implmented for all possible S-nodes, but currently only RAs have schemes.
        Function takes an S-node and finds all successors of the node. An S-node should only have a single outgoing edge to an I-node.
        Therefore, the first element from the returned list is taken.
        Function thentakes an S-node and finds all predecessors of the node. An S-node may have several incoming I-nodes. If an IAT graph it will also have connections to a YA node which can be ignored.
        Therefore, the list is iterated.
        Outputs a tuple containing the S-node ID, s-node text I_node id and I-node text.
        Parameters
        ----------
        graph: aif_graph for corpus
        scheme_ras: all s-nodes that contain some form of scheme - i.e. not a default
        """
        ra_tups = []
        for ra in scheme_ras:
            node_succ = list(graph.successors(ra[0]))
            s_tup = (ra[0], ra[1],ra[0], ra[1])
            ra_tups.append(s_tup)
            i_1 = node_succ[0]
            i_1_text = graph.nodes[i_1]['text']

            ra_tup = (ra[0], ra[1],i_1, i_1_text)
            ra_tups.append(ra_tup)

            node_pred = list(graph.predecessors(ra[0]))
            for ns in node_pred:
                i_2_text = graph.nodes[ns]['text']
                i_2_type = graph.nodes[ns]['type']

                if i_2_type != 'YA':
                    ra_tup_2 = (ra[0], ra[1],ns, i_2_text)
                    ra_tups.append(ra_tup_2)
        return ra_tups

    @staticmethod
    def list_nodes(graph):
        """
        Function to get all nodes from a graph in a list.

        Parameters
        ----------
        graph: aif_graph for corpus
        """
        return list(graph)
    
    @staticmethod
    def get_s_node_list(graph):
        """
        Function to get all S-nodes from a graph in a list.

        Parameters
        ----------
        graph: aif_graph for corpus
        """
        s_nodes =  [x for x,y in graph.nodes(data=True) if y['type']=='MA' or y['type']=='RA' or y['type']=='CA' or y['type']=='PA']
        return s_nodes
    

    @staticmethod
    def get_l_node_list(graph):
        """
        Function to get all l-nodes from a graph in a list.

        Parameters
        ----------
        graph: aif_graph for corpus
        """
        l_nodes =  [(x,y['text']) for x,y in graph.nodes(data=True) if y['type']=='L']
        return l_nodes

    @staticmethod
    def get_divergent_nodes(graph):
        """
        Function to get all I-nodes that have multiple outgoing edges.

        Parameters
        ----------
        graph: aif_graph for corpus
        """
        list_of_nodes = []
    
        for v in list(graph.nodes):
            node_pres = []
            node_pres = list(graph.successors(v))
            if len(node_pres) > 1:
                list_of_nodes.append(v)
        return list_of_nodes
    
    @staticmethod
    def get_loc_prop_pair(graph):
        """
        Function to get all L-nodes that are connected to an I-node through a YA-node.

        First find all predeccessors of an I-node, iterate these nodes to ensure they are YAs. Agreeing YAs have a different format so ignore these.

        From the YAs find all predeccessors, get the corresponding L-nodes for the I-node.

        Return a locution - I-node ID tuple list.

        Parameters
        ----------
        graph: aif_graph for corpus
        """
        i_node_ids =  [x for x,y in graph.nodes(data=True) if y['type']=='I']
        locution_prop_pair = []
        for node_id in i_node_ids:
            preds = list(graph.predecessors(node_id))
            for pred in preds:
                node_type=graph.nodes[pred]['type']
                node_text = graph.nodes[pred]['text']

                if node_type == 'YA' and node_text != 'Agreeing':
                    ya_preds = list(graph.predecessors(pred))
                    for ya_pred in ya_preds:
                        pred_node_type=graph.nodes[ya_pred]['type']
                        pred_node_text=graph.nodes[ya_pred]['text']

                        if pred_node_type == 'L':
                            locution_prop_pair.append((ya_pred, node_id))
        return locution_prop_pair

    @staticmethod
    def get_child_edges(graph):
        """
        Function to get all edges connected to a node as a child of the node.

        First find all the ancestors of a node.

        Find all edges connected to node in reverse.

        Return list of nodes and tuples, with conclusion node as first element and a list as second element.

        Parameters
        ----------
        graph: aif_graph for corpus
        """
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

    @staticmethod
    def get_all_edges(graph):
        """
        Function to get all edges connected to a node in both directions from the node.

        First find all the ancestors of a node.

        Find all edges connected to node using in and out edge functions.

        Return list of nodes and tuples, with conclusion node as first element and a list as second element.

        Parameters
        ----------
        graph: aif_graph for corpus
        """

        list_of_nodes = []
        list_of_edges = []

        for v in list(graph.nodes):
            node_pres = []
            node_pres = list(nx.ancestors(graph, v))
            list_of_nodes.append((v, node_pres))
            edges = []
            edges = list(graph.in_edges(v))
            res_list = []
            res_list = [(x[0], x[1]) for x in edges]
            list_of_edges.append((v, res_list))
            edges_1 = []
            edges_1 = list(graph.out_edges(v))
            res_list1= []
            res_list1 = [(x[0], x[1]) for x in edges_1]
            list_of_edges.append((v, res_list1))

        return list_of_nodes, list_of_edges
