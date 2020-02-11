from flask import render_template
from app import app
import pandas as pd

@app.route('/')
@app.route('/index')
def index():
    user = {'username': 'Miguel'}
    d = {'col1': [1, 2], 'col2': [3, 4]}
    df = pd.DataFrame(data=d)
    items = df.to_html(classes='data', header="true")
    return render_template('index.html', title='Home', user=user, table=[items])