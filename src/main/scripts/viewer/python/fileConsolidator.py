import sys
import os
import shutil
from datetime import datetime


   
           
def addToFile(src, addLines, excluders):
   
   # read the file line by line, store it.
   if os.path.exists(src):
       lines = [line for line in open(src)]
       for addLine in addLines:
           keepStr = True
           for excluder in excluders:
               if excluder in addLine:
                   keepStr = False

           if keepStr:
              lines.append(addLine)
           else:
               print "Skipping line: %s"%(addLine)

       try:
           # delete existing src
           # os.remove(src)
           # fl = open(src.split('.js')[0] + "TEST.js", 'w')
           # os.remove(src)
           fl = open(src, 'w')
           for item in lines:
               fl.write("%s" % item)
           fl.close()

       except ValueError:
            print ValueError    
        
        
        
def main():


    
    #------------------------------------
    # MAIN PARAMS
    #------------------------------------
    consolidatedFile = "../utils/style/utils.style.js"
    directoryToLookIn = "../utils/style"
    excludeStrs = ['goog.provide', 'goog.export', 'goog.require']


    # Make backup consolidateFile
    backupFile = consolidatedFile.rsplit('.js')[0] + "-BACKUP.js"
    shutil.copy(consolidatedFile, consolidatedFile.split('.js')[0] + "-BACKUP.js")

    
    #------------------------------------
    #  WALK THROUGH + CONSOLIDATE
    #------------------------------------   
    lines = []
    for root, dirs, files in os.walk(directoryToLookIn):
       for f in files:
           filename = (f).replace('\\', "/") 
           src = os.path.join(root, filename)
           if src == consolidatedFile or filename.startswith(".")  or filename.endswith('-BACKUP.js'):
               print "\tExcluding file: %s"%(src)
               continue              
           else:
               print "Using file: %s"%(src)
               lines.append('\n\n\n//**********************************************************\n')
               lines.append('//     CONSOLIDATED from: "%s"\n'%(src))
               lines.append('//**********************************************************\n')

               lines = lines + [line for line in open(src)]
              
    addToFile(consolidatedFile, lines, excludeStrs)
                   

if __name__ == "__main__":
    main()
