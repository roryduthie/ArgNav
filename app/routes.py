from flask import render_template, request, redirect, session, Markup
from . import application
import pandas as pd
from urllib.request import urlopen
from app.centrality import Centrality
from app.svg_parse import SVGParse
import requests
import json
import urllib
import tempfile
import os
import uuid


@application.route('/')
@application.route('/index')
def index():
    return redirect('/form')
 
@application.route('/form')
def my_form():
    return render_template('my-form.html') 
    
    
@application.route('/form', methods=['POST'])
def my_form_post():
    iat_mode = 'false'
    text = request.form['text']
    iat_mode = request.form['iat_mode']
    session['text_var'] = text
    session['iat_mode'] = iat_mode
    return redirect('/results')
    
def get_ordered_nodes(node_id, isMap):
    centra = Centrality()
    #node_path = centra.get_nodeset_path(node_id)
    #Add extension for L-nodes here
    node_path = centra.create_json_url(node_id, isMap)
    graph = centra.get_graph_url(node_path)
    graph = centra.remove_iso_nodes(graph)
    l_nodes = centra.get_l_node_list(graph)
    l_node_i_node = centra.get_loc_prop_pair(graph)
    n_graph = centra.remove_redundant_nodes(graph)
    list_of_nodes = centra.list_nodes(graph)
    divergent_nodes = centra.get_divergent_nodes(n_graph)
    s_nodes = centra.get_s_node_list(n_graph)
    i_nodes = centra.get_eigen_centrality(n_graph)
    ordered_nodes = centra.sort_by_centrality(i_nodes)
    children, edges = centra.get_child_edges(n_graph)
    
    return ordered_nodes, list_of_nodes, divergent_nodes, children, edges, s_nodes, l_nodes, l_node_i_node
    
def get_svg_file(node_id):
    c = Centrality()
    node_path = c.get_svg_path(node_id)
    try:
        with application.open_resource(node_path) as file:
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

def check_iat_var(iat_var):
    if iat_var == 'true':
        return 'true'
    else:
        return 'false'
    
    
@application.route('/results')
def render_text():
    text = session.get('text_var', None)
    iat_var = session.get('iat_mode', None)

    iat_mode = check_iat_var(iat_var)
    global isMap
    global corpusName

    isMap = text.isdigit() 
    corpusName = text
    ordered_nodes, all_nodes, div_nodes, child_nodes, child_edges, s_nodes, l_nodes, l_i_nodes = get_ordered_nodes(text, isMap)
    df = pd.DataFrame(data=ordered_nodes, columns=['id', 'text'])

    l_node_id = []
    l_node_text = []

    if iat_mode == 'true':
        df_locutions = pd.DataFrame(l_nodes, columns=['id', 'text'])
        l_node_id = df_locutions['id'].tolist()
        l_node_text = df_locutions['text'].tolist()


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
    
    return render_template('results.html', title=text, table=[items], svg=Markup(svg), child_nodes=child_nodes, child_edges=child_edges, svg_nodes=svg_nodes, aif_nodes=aif_nodes, div_nodes=div_nodes, s_nodes=s_nodes, l_node_id=l_node_id, l_node_text=l_node_text, iat_mode=iat_mode, l_i_nodes=l_i_nodes)


@application.route('/background_process', methods=['POST'])
def get_corpus_id(corpusShortName):

    with urllib.request.urlopen("http://corpora.aifdb.org/list.php") as url:
        data = json.loads(url.read().decode())

    for attrs in data['corpora']:
        corpusSName = attrs['shortname']
        lock = attrs['locked']
        if corpusSName == corpusShortName:

            corpusID = attrs['corpusID']
            if lock == '1':
                return '-1'
            return corpusID
def get_map_id_from_json(rsp):

    data = rsp.json()
    mapID = data['nodeSetID']
    return mapID

@application.route('/background_process', methods=['POST'])
def background_process_test():
    data = json.dumps(request.get_json())
    filename = uuid.uuid4().hex
    filename = filename + '.json'
    with open(filename,"w") as fo:
        fo.write(data)
    files = {
        'file': (filename, open(filename, 'rb')),
    }

    #App ID needed to post to corpora


    #get corpus ID
    mapID = '-1'
    st_response = ''
    #Use isMap to determine where to put file, either in corpus or not.
    #Use corpus name to do upload. Produce alert box to determine corpus name.
    #If user does not want corpus upload then, just pass back map else corpus upload.
    if isMap:
        response = requests.post('http://www.aifdb.org/json/', files=files, auth=('test', 'pass'))

        mapID = get_map_id_from_json(response)

        if response.ok:

            st_response = 'SUCCESS! ID is ' + str(mapID)
        else:
            st_response = 'ERROR in Map Upload, this may be an annotation error.'
    else:
        appID = '0644439a08954902c64d1d2bb7a6'
        corpusId = get_corpus_id(corpusName)
        response = requests.post('http://www.aifdb.org/json/', files=files, auth=('test', 'pass'))
        mapID = get_map_id_from_json(response)
        if response.ok:
            st_response = 'SUCCESS! ID is ' + str(mapID) + ' and has been uploaded to corpus.'
        else:
            st_response = 'ERROR in Map Upload, this may be an annotation error.'
            return str(st_response).replace("\'", "\"")

        payload = {'nodeSetID': mapID, 'corpusID': corpusId, 'appID':appID}
        if corpusId == '-1':
            st_response = 'ERROR corpus is locked. Use edit link to unlock. Map ID is ' + str(mapID)
            return str(st_response).replace("\'", "\"")
        else:
            resp = requests.post('http://corpora.aifdb.org/post.php', data=payload)
        if response.ok:
            if not resp.ok:
                st_response = 'ERROR in corpus Upload. Map ID is ' + str(mapID)


    #change this to pass the response back as text rather than as the full JSON output, this way we either pass back that a corpus was added to or a map uplaoded with map ID. Might be worth passing MAPID and Corpus name back in that situation.


    os.remove(filename)
    return (str(st_response).replace("\'", "\"") )
