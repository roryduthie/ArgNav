from flask import render_template, request, redirect, session, Markup
from . import app
import pandas as pd
from urllib.request import urlopen
from app.centrality import Centrality
from app.svg_parse import SVGParse
import requests
import json
import tempfile
import os
import uuid


@app.route('/')
@app.route('/index')
def index():
    return redirect('/form')
 
@app.route('/form') 
def my_form():
    return render_template('my-form.html') 
    
    
@app.route('/form', methods=['POST'])
def my_form_post():
    text = request.form['text']
    session['text_var'] = text
    return redirect('/results')
    
def get_ordered_nodes(node_id, isMap):
    centra = Centrality()
    #node_path = centra.get_nodeset_path(node_id)
    node_path = centra.create_json_url(node_id, isMap)
    graph = centra.get_graph_url(node_path)
    n_graph = centra.remove_redundant_nodes(graph)
    list_of_nodes = centra.list_nodes(graph)
    divergent_nodes = centra.get_divergent_nodes(n_graph)
    s_nodes = centra.get_s_node_list(n_graph)
    i_nodes = centra.get_eigen_centrality(n_graph)
    ordered_nodes = centra.sort_by_centrality(i_nodes)
    children, edges = centra.get_child_edges(n_graph)
    
    return ordered_nodes, list_of_nodes, divergent_nodes, children, edges, s_nodes
    
def get_svg_file(node_id):
    c = Centrality()
    node_path = c.get_svg_path(node_id)
    try:
        with app.open_resource(node_path) as file:
            svg = file.read()
    except(IOError):
        print('File was not found:')
        print(node_path)
    return svg

def get_svg_file_url(node_id, isMap):
    c = Centrality()
    node_path = c.create_svg_url(node_id, isMap)
    try:
        file = urlopen(node_path)
        svg = file.read()
    except(IOError):
        print('File was not found:')
        print(node_path)
    return svg


    
def get_svg_file_path(node_id):
    c = Centrality()
    node_path = c.get_svg_path(node_id)
    return node_path
    
    
@app.route('/results')   
def render_text():
    text = session.get('text_var', None)
    isMap = text.isdigit() 
    ordered_nodes, all_nodes, div_nodes, child_nodes, child_edges, s_nodes = get_ordered_nodes(text, isMap)
    df = pd.DataFrame(data=ordered_nodes, columns=['id', 'text'])
    
    #re-index into reverse order - so nodes with highest centrality are at the right end of the dataframe
    df = df[::-1]
    
    all_nodes_df = pd.DataFrame(data=all_nodes, columns=['id'])
    
    all_nodes_df['id'] = all_nodes_df['id'].astype(str)
    df['id'] = df['id'].astype(str)
    
    svg_file = get_svg_file_url(text, isMap)
    svgp = SVGParse()
    svg = svgp.parse_svg_file(svg_file)
    svg_df = svgp.get_node_ids(svg_file)
    #print(svg_df.head())
    svg_df['aifid'] = svg_df['aifid'].astype(str)
    
    merged_df = df.merge(svg_df, left_on=['id'], right_on=['aifid'], how='left')
    df_select = all_nodes_df.merge(svg_df, left_on=['id'], right_on=['aifid'], how='left')
    merged_df.drop(['id', 'aifid'], axis=1, inplace=True)
    
    svg_nodes = df_select['nodeid'].tolist()
    aif_nodes = df_select['aifid'].tolist()
    
    merged_df = merged_df[['nodeid', 'text']]
    
    items = merged_df.to_html(header=False, index=False)
    
    
    
    return render_template('results.html', title=text, table=[items], svg=Markup(svg), child_nodes=child_nodes, child_edges=child_edges, svg_nodes=svg_nodes, aif_nodes=aif_nodes, div_nodes=div_nodes, s_nodes=s_nodes)
    
@app.route('/background_process', methods=['POST'])
def background_process_test():
    data = json.dumps(request.get_json())
    filename = uuid.uuid4().hex
    filename = filename + '.json'
    with open(filename,"w") as fo:
        fo.write(data)
    files = {
        'file': (filename, open(filename, 'rb')),
    }

    response = requests.post('http://www.aifdb.org/json/', files=files, auth=('test', 'pass'))

    os.remove(filename)
    return (response.text)
