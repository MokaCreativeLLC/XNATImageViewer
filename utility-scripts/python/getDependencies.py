import sys
import os
import shutil

       

SKIP_SUBSTRS = ['goog.require(' , 'goog.provide(' , 'goog.exportSymbol(']
DEPS_PREFIXES = ['goog.', 'nrg.', 'xiv.', 'X.', 'gxnat.']


SAVE_FOR_LATERS = ['prototype']


EXPORT_PREFIX = 'goog.exportSymbol('




def parseDeps(filename):

    #
    # found deps
    #
    foundDeps = dict((key, []) for key in DEPS_PREFIXES)


    #
    # read the file, line-by-line
    #
    lines = [line for line in open(filename)]
    savers = {}
           
    for line in lines:
        #print line

        #
        # Strip the require line
        #
        if 'goog.require(' in line:
            requireLine = line.strip('goog.require(').\
                          replace(')', '').replace("'",'').\
                          replace('"', '').replace(';', '').strip()

            foundDeps[requireLine.split('.')[0] + '.'].append(requireLine);

               
        #
        # find a line with depstr in it
        #
        for depsPrefix in DEPS_PREFIXES:
            if depsPrefix in line:

                skip = False
                line = line.strip().strip(';').strip('\n')

                #
                # Skippables
                # 
                for skipSubstr in SKIP_SUBSTRS:
                    if skipSubstr in line:              
                        skip = True

                #
                #
                #
                for saver in SAVE_FOR_LATERS:
                    if saver in line:              
                        savers[saver] = line;
                        skip = True;

                #
                # Now we need to break apart the lines
                #
                foundArr =  depsPrefix + line.split(depsPrefix)[1]
                foundArr = foundArr.rsplit(" ")[0].rsplit('.')

                if not skip:
                    print foundArr
                    foundDeps[foundArr[0] + '.'].append(line)




    #print foundDeps




def main():
    imageViewerHome = os.environ.get('XNATIMAGEVIEWER_HOME')
    fileName = imageViewerHome + "/src/main/scripts/viewer/xiv/xiv.js"
    parseDeps(fileName)
        
    #
    #  WALK THROUGH + REPLACE
    #  
    #for root, dirs, files in os.walk(rootDir):

        #
        # loop the files
        #
        # for f in files:   
        # filename = os.path.join(root, f)

      

if __name__ == "__main__":
    main()
