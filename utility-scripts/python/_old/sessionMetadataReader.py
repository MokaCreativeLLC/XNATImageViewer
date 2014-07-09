import sys
import os

def main():
    
    regpaths = [
             "C:/Users/skumar01/Desktop/TESTScans/9/resources/DICOM/jpg",
             #"C:/Users/skumar01/Desktop/TESTScans/10/resources/DICOM/jpg",
             #"C:/Users/skumar01/Desktop/TESTScans/19/resources/DICOM/jpg",
             #"C:/Users/skumar01/Desktop/TESTScans/20/resources/DICOM/jpg",
             #"C:/Users/skumar01/Desktop/TESTScans/21/resources/DICOM/jpg",             
             ]
    
    defacedpaths = [
             "C:/Users/skumar01/Desktop/TESTScans/9/resources/DICOM_DEFACED/jpg",
             "C:/Users/skumar01/Desktop/TESTScans/10/resources/DICOM_DEFACED/jpg",
             "C:/Users/skumar01/Desktop/TESTScans/19/resources/DICOM_DEFACED/jpg",
             "C:/Users/skumar01/Desktop/TESTScans/20/resources/DICOM_DEFACED/jpg",
             "C:/Users/skumar01/Desktop/TESTScans/21/resources/DICOM_DEFACED/jpg",           
             ]
    
    scanPath = "C:/Users/skumar01/Desktop/TESTScans/21/resources/DICOM_DEFACED/jpg"


    for p in regpaths:
        for root, dirs, files in os.walk(p):
           for f in files:
               #a = root + os.sep + f
               #a = prependStr + a.replace("\\", "/").replace("..",".") + appendStr
               print '"' + root + "/" +  f + '",'
               #s.append(a)
 
        print "\n\n\n\n\n"


if __name__ == "__main__":
    main()