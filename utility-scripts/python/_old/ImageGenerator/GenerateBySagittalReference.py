import sys
import os
from PIL import Image
import shutil

def generateCoronal(blankDir, genSize, refFileNames):
    print("Generating coronal images in %s"%(blankDir))
    for root, dirs, files in os.walk(blankDir):
       for i in range(0, len(files)): # i is 256
            fn = root + "/" + files[i]
            
            img = Image.open(fn) 
            pix = img.load()
            size = img.size;         

            for k in range(0, len(refFileNames)):
                
                refImg = Image.open(refFileNames[len(refFileNames) -k -1]);
                refPx = refImg.load();
                refSize = refImg.size;
                
                for j in range(0, refSize[1]): # j is 256
                    pix[k, j] = refPx[ i , j]
            
            img.save(fn, "JPEG");
            
         
                

def generateAxial(blankDir, genSize, refFileNames):
    print("Generating axial images in %s"%(blankDir))
    for root, dirs, files in os.walk(blankDir):
       for i in range(0, len(files)): # i is 160
            fn = root + "/" + files[i]
            
            img = Image.open(fn) 
            pix = img.load()
            size = img.size;         

            for k in range(0, len(refFileNames)):

                refImg = Image.open(refFileNames[k]);
                refPx = refImg.load();
                refSize = refImg.size;
                for j in range(0, refSize[1]): # j is 256
                    pix[k, j] = refPx[ j , (refSize[1]- i -1)]

            img.save(fn, "JPEG");