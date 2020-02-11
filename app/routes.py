from flask import render_template, request, redirect
from app import app
import pandas as pd

@app.route('/')
@app.route('/index')
def index():
    user = 'me'
    d = {'col1': [1, 2], 'col2': [3, 4]}
    df = pd.DataFrame(data=d)
    items = df.to_html(classes='data', header="true")
    return render_template('index.html', title='Home', user=user, table=[items])
 
@app.route('/form') 
def my_form():
    return render_template('my-form.html') 
    
    
@app.route('/form', methods=['POST'])
def my_form_post():
    text = request.form['text']
    render_text(text)
    return redirect('results.html')
    
@app.route('/results')   
def render_text(text):
    text = request.args.get('text')
    processed_text = text.upper()
    return render_template('results.html', text=processed_text)