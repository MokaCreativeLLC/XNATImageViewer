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
    
   
           
def replaceFor(src):
   
   # read the file line by line, store it.
   lines = [line for line in open(src)]
   newLines = []
   
   
   for l in lines:
       oldLine = l
       b = l
       if ("for" in b):
           if (not "," in b):
               b = b.replace('\t','').replace('\n','').replace("for", "").replace("(", "").replace(")", "").replace("{", "")
               
               if (b.count(";") == 2):
                   #print "\nBefore: %s" %(b)                
                   b = b.split(";")
                   if (len(b) == 3):
                       
                       # remove trailing whitespaces
                       for i in range(len(b)):
                           b[i] = b[i].rstrip().lstrip()

                       
                       if (not '<=' in b[1]) and ('<' in b[1]):
                           
                           #
                           # Get the variable name
                           #
                           varArr = b[0].rstrip().lstrip().replace("var",'').split('=')
                           for i in range(len(varArr)):
                               varArr[i] = varArr[i].lstrip().rstrip()
                           
                           midSplit =  (b[1].strip().split("<"))
                           for i in range(len(midSplit)):
                               midSplit[i] = midSplit[i].lstrip().rstrip()
                           
                           varName = varArr[0]
                           
                           fullStr = "for (var %s = %s" %(varName, varArr[1])
                           fullStr +=  (", len = %s; %s < len; " % ( midSplit[1], varName))
                           fullStr += b[2] + ") {"
                           l = fullStr
                           l = oldLine.split("for")[0] + l
                           
                       
           
       if (l != oldLine):
           print "\nIn %s, in line: %i\n\n%sIS NOW\n%s"%(src, lines.index(oldLine), oldLine, l)
           newLines.append(l)
       else:
           newLines.append(oldLine)

   try:
       fl = open(src, 'w')
       for item in newLines:
           fl.write("%s" % item)
       fl.close()
       #print "Replaced '%s' with '%s' in %s."%(findStr, replaceStr, src)
   except ValueError:
        print ValueError    
        
        
        
def main():
    
    rootDir = "../scripts"
    htmlFile = "../index.html"
    backupDir = "scriptsBackup"
    
    skipDirs = ["jquery"];

    
    backupPath = os.path.join("./", backupDir) + "_" + datetime.now().strftime("%Y-%m-%d %H:%M:%S").replace(':','_').replace(" ", "__").strip()
    
    #  make a backup folder
    if (not os.path.exists(backupPath)):
         os.mkdir(backupPath)
    
    # create backup
    createBackup(rootDir, backupPath)
    
    for root, dirs, files in os.walk(rootDir):
       for f in files:
           

           # Determine skippable
           skip = False
           for d in skipDirs:
               if (len(d) > 0) and (d in root):
                   skip = True;
                   break;
           
           if not skip:
               filename = (f).replace('\\', "/")          
               src = os.path.join(root, filename)
               replaceFor(src)
               
           else:
                print ("\n********[SKIPPING %s]********" %(root))


if __name__ == "__main__":
    main()
