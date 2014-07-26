import sys
import os
import shutil
from datetime import datetime


def createBackup(rootDir, backupPath):
    for root, dirs, files in os.walk(rootDir):
       for f in files:
           filename = (f).replace('\\', "/")
           rVal = root.replace(rootDir, "")
           dst = (os.path.join("./", backupPath + "/" + rVal + "/" + filename)).replace("\\", "/").replace("//", "/")           
           src = os.path.join(root, filename)                                                                                                            
           
           # make paths that don't exist
           if (not os.path.exists(os.path.dirname(dst))):
                os.makedirs(os.path.dirname(dst))
           
           # copy files to backup
           shutil.copyfile(src, dst)
    
   
           
def replaceInFile(src, findStr, replaceStr):
   
   # read the file line by line, store it.
   lines = [line for line in open(src)]
   newLines = []
   for l in lines:
       l = l.replace(findStr, replaceStr)
       newLines.append(l)

   try:
       fl = open(src, 'w')
       for item in newLines:
           fl.write("%s" % item)
       fl.close()
       print "Replaced '%s' with '%s' in %s."%(findStr, replaceStr, src)
   except ValueError:
        print ValueError    
        
        
        
def main():
    
    rootDir = "../scripts"
    skipDir = "../scripts/jquery"
    endFile = "../scripts/EVERYTHING.js"

    textArr = [];
    
    for root, dirs, files in os.walk(rootDir):
       for f in files:
           
           filename = (f).replace('\\', "/")          
           src = os.path.join(root, filename)
           
           if not skipDir in root:
               lines = [line for line in open(src)]
               
               textArr += lines


    fl = open(endFile, 'w')
    for item in textArr:
        fl.write("%s" % item)
    fl.close()


if __name__ == "__main__":
    main()
