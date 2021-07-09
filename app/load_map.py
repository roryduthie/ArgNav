import json
from datetime import datetime
from pathlib import Path

import networkx as nx


class CorpusLoader:
     """
        Class to take a corpus or nodeset id and load it into a networkx graph


    """
    @staticmethod
    def parse_timestamp(timestamp):
        """
        Function to parse a timestamp from a node.


        Parameters
        ----------
        timestamp: timestamp of node in %Y-%m-%d %H:%M:%S datetime format
        """
        try:
            cast_timestamp = datetime.strptime(timestamp, '%Y-%m-%d %H:%M:%S')
        except (ValueError, TypeError):
            print('Failed datetime(timestamp) casting:')
            print(timestamp)
            cast_timestamp = timestamp
        return cast_timestamp

    @staticmethod
    def parse_scheme_id(scheme_id):
        """
        Function to parse the scheme ID.


        Parameters
        ----------
        scheme_id: str
        """
        try:
            cast_scheme_id = int(scheme_id)
        except (ValueError, TypeError):
            print('Failed int(schemeID) casting:')
            print(scheme_id)
            cast_scheme_id = scheme_id
        return cast_scheme_id

    @staticmethod
    def parse_node_id(node_id):
        """
        Function to parse node ID as an Int.


        Parameters
        ----------
        node_id: str
        """
        try:
            cast_node_id = int(node_id)
        except (ValueError, TypeError):
            print('Failed int(nodeID) casting:')
            print(node_id)
            cast_node_id = node_id
        return cast_node_id

    @staticmethod
    def parse_edge_id(edge_id):
        """
        Function to parse edge ID as an Int.


        Parameters
        ----------
        edge_id: str
        """
        try:
            case_edge_id = int(edge_id)
        except (ValueError, TypeError):
            print('Failed int(edgeID) casting:')
            print(edge_id)
            case_edge_id = edge_id
        return case_edge_id

    def load_corpus(self, directory_path):
        """
        Function to load a corpus or nodeset and extract the json data


        Parameters
        ----------
        directory_path: str
        """
        directory_path = Path(directory_path)
        json_files = directory_path.rglob('*.json')
        node_sets = {}

        for file in json_files:

            node_set_id = file.stem
            try:
                node_set_id = int(file.stem.replace('nodeset', ''))
            except (ValueError, TypeError):
                print('Failed int(nodesetID) casting:')
                print(file.stem)

            with open(str(file)) as json_data:
                node_sets[node_set_id] = self.parse_json(json.load(json_data))

        return node_sets
        

    def parse_json(self, node_set):
        """
        Function to create a graph from the AIF json

        Creates nodes and edges in a graph based on the node type.

        Parameters
        ----------
        node_set: list - containing node_set ids and JSON data
        """
        G = nx.DiGraph()
        locution_dict = {}

        for node in node_set['nodes']:
            if 'scheme' in node:
                G.add_node(self.parse_node_id(node['nodeID']), text=node.get('text', None), type=node.get('type', None),
                           timestamp=self.parse_timestamp(node.get('timestamp', None)), scheme=node.get('scheme', None),
                           scheme_id=self.parse_scheme_id(node.get('schemeID', None)))
            else:
                G.add_node(self.parse_node_id(node['nodeID']), text=node.get('text', None), type=node.get('type', None),
                           timestamp=self.parse_timestamp(node.get('timestamp', None)))

        for edge in node_set['edges']:
            from_id = self.parse_edge_id(edge['fromID'])
            to_id = self.parse_edge_id(edge['toID'])
            G.add_edge(from_id, to_id)

        for locution in node_set['locutions']:
            node_id = self.parse_node_id(locution['nodeID'])
            locution_dict[node_id] = locution
        return G
