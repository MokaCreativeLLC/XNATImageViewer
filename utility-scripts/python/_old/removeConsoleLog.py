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
   if os.path.exists(src):
       lines = [line for line in open(src)]
       newLines = []
       for l in lines:
           a = l
           if ('console.log' in a):
               b = a.strip(";")
               b = (b.split(')')[0] + ")").strip()
               a = a.replace(b, "")
        
           if (a.strip() == ";"):
               a = ""
           if (a != l):
               print "In %s, replaced '%s' with '%s', in line: %i\n    %s\n    %s"%(src, findStr, replaceStr, lines.index(l), l, a)
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
    
    rootDir = "../scripts/XVWidget"
    htmlFile = "../index-uncompressed.html"
    backupDir = "scriptsBackup"
      
    findStr = "////"
    replaceStr = "//"
    fileReplaceStr = replaceStr #replaceStr.split(".")[2]
    
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
               #if (findStr in src):
                   #
                   # RENAME FILE IF IT HAS THE STRING
                   # 
                   #dst = dst.replace(findStr, fileReplaceStr)
                   #os.rename(src, dst)
    
    
    
               replaceInFile(dst, findStr, replaceStr)
           else:
                print ("\n [SKIPPING %s]" %(root))



    #
    # REPLACE IN MAIN HTML
    #
    replaceInFile(htmlFile, findStr, fileReplaceStr)

if __name__ == "__main__":
    main()
