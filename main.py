import jsonpickle
import json
import unicodedata as ud
from PIL import Image,ImageEnhance,ImageFilter, ImageOps
from flask import Flask, flash, request, Response, redirect, url_for, jsonify, make_response
from model_files.tess_model import final_func
import base64
import numpy as np
from cv2 import cv2
from flask_cors import core, cross_origin
import re

app = Flask(__name__)

def data_uri_to_cv2_img(uri):
    encoded_data = uri.split(',')[1]
    nparr = np.fromstring(base64.b64decode(encoded_data), np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return img

@app.route("/json", methods=['GET','POST'])
@cross_origin()
def upload_file():
    data = request.get_data()
    new_str = data.decode('utf-8')
    data1 = json.loads(new_str)
    Img64 = data1["image64"]
    img = data_uri_to_cv2_img(Img64)
    result = final_func(img)
    result.strip()
    
    string = result.replace(u"’", u"'")
    string = string.replace(u"\u2019", u"\u0027")
    string = re.sub(u'\u2019',u"\u0027", string)
    result = re.sub(u'’',u"'", string)

    # string_encode = result.encode("ascii", "ignore")
    # string_decode = string_encode.decode()

    # string_encode = string_decode.encode("ascii", "ignore")
    # string_decode = string_encode.decode()
    # newstr = result.strip()
    print(result)
    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True)