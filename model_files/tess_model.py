from PIL import Image,ImageEnhance,ImageFilter, ImageOps
from pytesseract import image_to_string
import io
import tempfile
import numpy as np
import matplotlib.pyplot as plt
from matplotlib import cm
from cv2 import cv2, threshold

import pytesseract
pytesseract.pytesseract.tesseract_cmd=r'C:\\Program Files\\Tesseract-OCR\\tesseract.exe'

def get_string_from_image(img40):
    
    custom_config = r'--oem 3 --psm 6 -c tessedit_char_whitelist=  abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    text = image_to_string(img40,lang = 'eng', config=custom_config)
    
    return text

def dpi_resize(image):    
    length_x, width_y = image.size
    factor = min(1, float(1024.0 / length_x))
    size = int(factor * length_x), int(factor * width_y)
    image_resize = image.resize(size, Image.ANTIALIAS)
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='1.png')
    temp_filename = temp_file.name
    image_resize.save(temp_filename, dpi=(300, 300)) #dpi(300,300)
    return temp_filename

def add_border(img):
    white = [255,255,255]
    img = cv2.copyMakeBorder(img,30,30,30,30,cv2.BORDER_CONSTANT,value=white)
    return img

def enlarge_img(image, scale_percent):
    width = int(image.shape[1] * scale_percent / 100)
    height = int(image.shape[0] * scale_percent / 100)
    dim = (width, height)
    resized_image = cv2.resize(image, dim, interpolation = cv2.INTER_AREA)
    return resized_image

def imageProcess_func(img):
    white_pix = np.sum(img == 255)
    black_pix = np.sum(img == 0)
    if white_pix > black_pix:
        return threshold_func(img)
    else:
        print("inverse")
        return inverse_func(img)

def inverse_func(img):
    pass

def threshold_func(img):
    fixed_res,fixed_img = cv2.threshold(img,0,255,cv2.THRESH_BINARY+cv2.THRESH_OTSU)
    for i in range(0,255):
        ret,thresh1 = cv2.threshold(img,127,255,cv2.THRESH_BINARY)
        print(fixed_res , " " , ret , '\n')
        if thresh1 - fixed_img > 0:
            return thresh1

    return fixed_img 

def final_func(img):
    img2 = enlarge_img(img, 150)
    img3 = add_border(img2)
    numpy_image = np.asarray(img3)
    opencv_image=cv2.cvtColor(numpy_image, cv2.COLOR_RGB2BGR)
    # opencv_image = cv2.GaussianBlur(opencv_image, (5, 5), 0)
    opencv_image = cv2.cvtColor(numpy_image, cv2.COLOR_BGR2GRAY)
    opencv_image = opencv_image.astype("uint8")
    # ret3,opencv_image = cv2.threshold(opencv_image,0,255,cv2.THRESH_BINARY+cv2.THRESH_OTSU)
    
    # processed_image = imageProcess_func(opencv_image)
    
    # img_gray = cv2.cvtColor(opencv_image, cv2.COLOR_RGB2GRAY)
    # img_gray_blur = cv2.medianBlur(img_gray,1)
    # print("Type of image: " , type(processed_image))
    final_img = dpi_resize(Image.fromarray(opencv_image))
    final_img = Image.open(final_img)
    return get_string_from_image(final_img)

# cv2.imshow("jnbefd",img_gray)
# cv2.waitKey(0)
# cv2.destroyAllWindows()