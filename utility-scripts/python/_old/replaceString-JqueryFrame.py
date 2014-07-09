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
    
   
           
def replaceInFile(src, findStr1, findStr2, replaceStr1, replaceStr2):
   
   # read the file line by line, store it.
   lines = [line for line in open(src)]
   newLines = []
   for l in lines:
       a = l
       if (findStr1 in l) and (findStr2 in l):
           a = a.replace(findStr1, replaceStr1).replace(findStr2, replaceStr2)
           if (a != l):
               print "In %s, line%i:\n    %s\nIS NOW\n    %s"%(src, lines.index(l), l, a)
       newLines.append(a)

   try:
       fl = open(src, 'w')
       for item in newLines:
           fl.write("%s" % item)
       fl.close()
       #print "Replaced '%s' with '%s' in %s."%(findStr, replaceStr, src)
   except ValueError:
        print ValueError    
        
        
        
def main():
    
    rootDir = "../scripts/widgets"
    backupDir = "scriptsBackup"
      
    findStr1 = "$("
    findStr2 = ").css("
    replaceStr1 = "utils.css.setCSS( "
    replaceStr2 = ", "
    
    skipDirs = ["jquery"];

    
    backupPath = os.path.join("./", backupDir) + "_" + datetime.now().strftime("%Y-%m-%d %H:%M:%S").replace(':','_').replace(" ", "__").strip()
    
    #  make a backup folder
    # clear it
    if (not os.path.exists(backupPath)):
         os.mkdir(backupPath)
    createBackup(rootDir, backupPath)
    
    
    for root, dirs, files in os.walk(rootDir):
       for f in files:
           
           skip = False
        
           for d in skipDirs:
               if (len(d) > 0) and (d in root):
                   skip = True;
                   break;
           
           if not skip:
               filename = (f).replace('\\', "/")          
               src = os.path.join(root, filename)
               dst = src;
               replaceInFile(dst, findStr1, findStr2, replaceStr1, replaceStr2)
               
           else:
                print ("\n [SKIPPING %s]" %(root))


if __name__ == "__main__":
    main()
