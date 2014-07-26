import sys
import os

def main():
    
    scriptPath = "../utils/"
    
    """
    from os import listdir
    from os.path import isfile, join
    onlyfiles = [ f for f in listdir(mypath) if isfile(join(mypath,f)) ]
    
    print onlyfiles
    """
    s = []
    
    
    prependStr = '<script  type="text/javascript" src="'
    appendStr = '"></script>'
    
    for root, dirs, files in os.walk(scriptPath):
       for f in files:
           if not f.startswith('.') and f.endswith('.js'):
               print f
           a = root + os.sep + f
           a = prependStr + a.replace("\\", "/").replace("..",".") + appendStr
           #print a
           #print '"' + a  + '"' + " ,"
           s.append(a)
 
    #print s


if __name__ == "__main__":
    main()
