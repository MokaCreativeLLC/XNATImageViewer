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
        
        
def getStartLine(v):
    return "goog.provide('" + v[0] + "." + v[1]  + "');\n"

def getEndLine(v):
    return "\ngoog.exportProperty(" + v[0] + ".prototype, '" + v[1] + "', " + v[0] + ".prototype." + v[1] + ");\n" 
        
def main():
    
    indexFile = "../index-uncompressed.html"
    namespaceDir = "../scripts/XVWidget"
    backupDir = "scriptsBackup"

    textArr = []
    nameSpaces = []
    
    fDict = {}


    backupPath = os.path.join("./", backupDir) + "_" + datetime.now().strftime("%Y-%m-%d %H:%M:%S").replace(':','_').replace(" ", "__").strip()
    
    #  make a backup folder
    # clear it
    if (not os.path.exists(backupPath)):
         os.mkdir(backupPath)
    
    createBackup(namespaceDir, backupPath)
    
    
    #
    # Parse the namespace dir for namespaces
    #
    for root, dirs, files in os.walk(namespaceDir):
       for f in files:
           if f.endswith('.js') and root.endswith('functions'):
               src = os.path.join(root, f)
               lines = [line for line in open(src)]
               
               for l in lines:
                   if ('prototype' in l):
                       l = l.split('=')[0].strip()
                       v = l.split('.prototype.')
                       fDict[f] = [getStartLine(v), getEndLine(v)]

               lines.append(fDict[f][1])
               lines.insert(0,fDict[f][0])
            
               print "Adding: %s to %s"%(fDict[f], src)

               fl = open(src, 'w')
               for item in lines:
                   fl.write("%s" % item)
               fl.close()
                       

    #print startStr + '--n="utils" ' + endStr
if __name__ == "__main__":
    main()
