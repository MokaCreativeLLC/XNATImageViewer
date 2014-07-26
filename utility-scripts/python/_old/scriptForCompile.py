import sys
import os
import shutil
import subprocess
from datetime import datetime

        
def callCommand(cmd):
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, shell=True)
    (out, err) = proc.communicate()
    print "DONE: ", err
        
def main():
    
    indexFile = "../index-uncompressed.html"
    namespaceDir = "../scripts"
    textArr = [];
    nameSpaces = [];

   
    #
    # Parse indexFile for "<script" tag to identify scripts
    #
    lines = [line for line in open(indexFile)]
    for l in lines:
        if (".js" in l):
            if (not "testscans" in l):
                
                scr = l.split("src=")[1].split('"')[1]
                print scr
                textArr.append(scr)


    #
    # Get namespaces by os.walk, opening files, and looking for "goog.exportSymbol"
    #
    for root, dirs, files in os.walk(namespaceDir):
       for f in files:
           if f.endswith('.js'):
               lines = [line for line in open(os.path.join(root, f))]
               currLine = ""
               beginLine = False
               for l in lines:
                   l = l.strip()
                   if ("goog.exportSymbol" in l) and ("(" in l):
                       currLine = l
                       #print "\n\nBEGIN STREAM: ", l
                       beginLine = True
                   if beginLine:
                       if (l != currLine):
                           #print "\tADDING: ", l, "to", currLine
                           currLine += l
                           #print "\tCURRLINE: ", currLine
                       if (")" in l):
                           v = currLine.split(",")[1].split(")")[0].strip();
                           #print "FINAL LINE: ", currLine
                           #print "END STREAM: ", v
                           nameSpaces.append(v)
                           beginLine = False

    #
    # Append to final namespace string
    #
    namespaceStr = ""
    #for n in nameSpaces:
    #    namespaceStr += '--n="' + n + '" '
    
    
    #
    # Get the files to include
    #
    for root, dirs, files in os.walk(namespaceDir):
       for f in files:
           #if (root.endswith('functions')) and (not f.startswith(".")):
           if (not f.startswith(".") and (f.endswith(".js"))): 
               filepath = os.path.abspath(os.path.join(root, f))
               #print filepath
               s = ' --i=' + filepath
               #print s
               totalPath = filepath.split("/")
               filename = totalPath[-1]
               threePath = totalPath[-2] + "/" + totalPath[-1]

               if (len(totalPath) > 2):
                   threePath = totalPath[-3] + "/" + threePath
 
               #
               # Check duplicates
               #
               addStrToNamespace = True
               if  (threePath in namespaceStr):
                   
                   #print '\n', threePath, " already found!"
                   startNum = namespaceStr.find(threePath, 0)
                   #print "HERE: ", namespaceStr[startNum-70 : startNum + len(threePath)]
                   #print filepath
                   #print filepath in namespaceStr
                   addStrToNamespace = False
                   
               if (addStrToNamespace): 
                   if ("goog/base" in s):

                       
                       print "**************************", s
                   namespaceStr += " " + s + " "

    
    #
    # Define surrounding strings
    #
   # startStr = "python /Users/sunilkumar/Desktop/Work/XNATImageViewerTesting/scripts/utils/lib/X/lib/google-closure-library/closure/bin/build/closurebuilder.py --root=/Users/sunilkumar/Desktop/Work/XNATImageViewerTesting/scripts/ "
    startStr = "python /Users/sunilkumar/Desktop/Work/XNATImageViewerTesting/closure-library/closure/bin/build/closurebuilder.py --root=/Users/sunilkumar/Desktop/Work/XNATImageViewerTesting/scripts/ --root=/Users/sunilkumar/Desktop/Work/XNATImageViewerTesting/closure-library/ "
    midStr = ""
    endStr = "--output_mode=compiled --compiler_jar=/Users/sunilkumar/Desktop/Work/XNATImageViewerTesting/scripts/utils/lib/X/lib/google-closure-compiler/compiler.jar --output_file=/Users/sunilkumar/Desktop/Work/XNATImageViewerTesting/TESTCOMPILE.js"
    advancedStr = ' --compiler_flags="--compilation_level=ADVANCED_OPTIMIZATIONS" '
    
    
    #
    # Doublecheck the namespace string
    # to see if there are duplicates
    #
    namespaceArr = namespaceStr.split(" ")
    cleanArr = []
    for a in namespaceArr:
        a = a.strip()
        if (len(a) > 0):
            cleanArr.append(a)
    #for a in cleanArr:
    #    print a, (cleanArr.count(a))
        
    buildOrderFile = "/Users/sunilkumar/Desktop/Work/XNATImageViewerTesting/build.txt"
    advancedfinalStr = startStr + namespaceStr + endStr + advancedStr + " > " + buildOrderFile
    uncompiledfinalStr = startStr + namespaceStr + "> /Users/sunilkumar/Desktop/Work/XNATImageViewerTesting/build.txt"
    
    
    callCommand(uncompiledfinalStr)
    #print advancedfinalStr
    #print uncompiledfinalStr

    #os.system(finalStr)
    #try:
        #a = os.system(advancedfinalStr)

    #
    # The lines "-Xms200m -Xmx200m" are to give the jvm more virtual memory
    #
    javaCmd = "java -d64 -Xms200m -Xmx200m -client -jar /Users/sunilkumar/Desktop/Work/XNATImageViewerTesting/closure-compiler/compiler.jar "
    advCmd = "--compilation_level=ADVANCED_OPTIMIZATIONS"
    outputFile = "--js_output_file /Users/sunilkumar/Desktop/Work/XNATImageViewerTesting/TESTCOMPILE.js"
    depLines = []
    culledLines = []
    for line in open(buildOrderFile):
        depLines.append(line.strip())
    
    for depLine in depLines:
        #culledLines.append(depLine)
        if not depLine in culledLines:
            culledLines.append(depLine)
        else:
            print "***********Found duplicate dependency: %s\n\t\tRemoving from list!"%(depLine)

    cmdVal = javaCmd
    for line in culledLines:
        cmdVal += " --js " + line
    
    #cmdVal += " " + advCmd
    cmdVal += " " + outputFile
    
    print "CALLING: ", cmdVal
    
    callCommand(cmdVal)
    
if __name__ == "__main__":
    main()
