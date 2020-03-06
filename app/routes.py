from flask import render_template, request, redirect, session, Markup
from . import application
import pandas as pd
from app.centrality import Centrality
from app.svg_parse import SVGParse

@application.route('/')
@application.route('/index')
def index():
    return redirect('/form')
 
@application.route('/form') 
def my_form():
    return render_template('my-form.html') 
    
    
@application.route('/form', methods=['POST'])
def my_form_post():
    text = request.form['text']
    session['text_var'] = text
    return redirect('/results')
    
def get_ordered_nodes(node_id):
    centra = Centrality()
    node_path = centra.get_nodeset_path(node_id)
    graph = centra.get_graph(node_path)
    n_graph = centra.remove_redundant_nodes(graph)
    i_nodes = centra.get_eigen_centrality(n_graph)
    ordered_nodes = centra.sort_by_centrality(i_nodes)
    
    return ordered_nodes
    
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
    
def get_svg_file_path(node_id):
    c = Centrality()
    node_path = c.get_svg_path(node_id)
    return node_path
    
    
@application.route('/results')   
def render_text():
    text = session.get('text_var', None)
    d = get_ordered_nodes(text)
    df = pd.DataFrame(data=d, columns=['id', 'text'])
    df = df[::-1]
    
    print(df.head())
    df['id'] = df['id'].astype(str)
    svg_file = get_svg_file(text)
    svgp = SVGParse()
    svg = svgp.parse_svg_file(svg_file)
    svg_df = svgp.get_node_ids(svg_file)
    #print(svg_df.head())
    svg_df['aifid'] = svg_df['aifid'].astype(str)
    merged_df = df.merge(svg_df, left_on=['id'], right_on=['aifid'], how='left')
    merged_df.drop(['id', 'aifid'], axis=1, inplace=True)
    
    print(merged_df.head())
    merged_df = merged_df[['nodeid', 'text']]
    
    items = merged_df.to_html(header=False, index=False)
    
    
    
    return render_template('results.html', title=text, table=[items], svg=Markup(svg))
    
