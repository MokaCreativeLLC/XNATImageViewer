import sys
import os
import shutil
import collections
       

IMG_VIEW_HOME = os.environ.get('XNATIMAGEVIEWER_HOME')
LOAD_FILE = IMG_VIEW_HOME + \
            "/src/main/scripts/viewer/xiv/lib/nrg/ui/ZipTabs.js"



SKIP_SUBSTRS = ['goog.require(' , 
                'goog.provide(' , 
                'goog.exportSymbol(', 
                '=function', 
                '= function']


GOOG_SKIPPERS = [
    'goog.inherits',
    'goog.base',
    'goog.isArray',
    'goog.isNumber',
    'goog.isString',
    'goog.isObject',
    'goog.dispose',
    'goog.getUid',
    'goog.isDef',
    'goog.isDefAndNotNull',
    'goog.getCssName']

LEFT_SPLITTERS = ['(', '}', '{', ')', ',', '_', '=', '>', '//', '[', ' ', '\'']

DEPS_PREFIXES = ['goog.', 'X.', 'nrg.', 'gxnat.', 'xiv.']

SAVE_FOR_LATERS = ['prototype']

EXPORT_PREFIX = 'goog.exportSymbol('
REQUIRE_PREFIX = 'goog.require('
PROVIDE_PREFIX = 'goog.provide('




def filterLastCapital(depLine):
    

    depArr = depLine.split('.')

    lastCap = -1;
    count = 0;
    newLine = ''
 
    for depSub in depArr:
        if len(depSub) > 0 and depSub[0].isupper():
            lastCap = count
        count += 1
        
    if len(depArr) == 2:
        newLine = depLine

    elif lastCap == -1:
        newLine = depLine.rpartition('.')[0]

    else:
        newLine = ''
        count = 0;
        for depSub in depArr:
            newLine += depSub + '.'
            #print newLine
            if count == lastCap:
                newLine = newLine[:-1]
                break
            count += 1

    #print '\ndepLine: ', depLine
    #print lastCap
    #print 'depArr:', depArr          
    #print 'filtered:', newLine
    return newLine




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
    providers = []                                            


    for line in lines:
        #print line

        #
        # Strip the require line
        #
        if 'goog.require(' in line:
            requireLine = line.strip('goog.require(').\
                          replace(')', '').replace("'",'').\
                          replace('"', '').replace(';', '').\
                          replace('//', '').strip()

            foundDeps[requireLine.split('.')[0] + '.'].append(requireLine);

               
        #
        # find a line with depstr in it
        #
        for depsPrefix in DEPS_PREFIXES:
            if depsPrefix in line:

                skip = False
                line = line.strip().strip(';').strip('\n')

                #
                # Skippables and providers
                # 
                for skipSubstr in SKIP_SUBSTRS:
                    if skipSubstr in line:              
                        skip = True
                        if PROVIDE_PREFIX in line:
                            prov = line.split(PROVIDE_PREFIX + '\'')[1]
                            prov = prov.replace(' ' , '').split('\'')[0]
                            #print 'PROV', prov
                            providers.append(prov)

                #
                # Savers
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
                    #print foundArr
                    foundDeps[foundArr[0] + '.'].append(line)


  
    talliedDeps = collections.OrderedDict()
    depsByRoot = {}

    #
    # Loop throgh every line
    #
    for dep, item in foundDeps.iteritems():
        for line in item:

            #print '\n\nline:', line
            #
            # Split line by dep
            #            
            depSplit = line
            if dep in depSplit:
                depSplit = depSplit.split(dep)[1]

            #
            # Split line by left splitters
            #
            for splitter in LEFT_SPLITTERS:
                if splitter in depSplit:
                    depSplit = depSplit.split(splitter)[0]

            #
            # Split line by EventType
            #
            if 'EventType' in depSplit:
                depSplit  = depSplit.split('EventType')[0] + 'EventType' 

            if (len(depSplit) == 0):
                continue


            key = filterLastCapital(dep + depSplit)

            #
            # tally the dep
            #
            if not talliedDeps.has_key(key):
                talliedDeps[key] = 0
            talliedDeps[key] += 1

    #print talliedDeps
    #
    # Retally by main prefix
    #
    for dep in talliedDeps:
        # skip anything ending with a period
        if dep.endswith('.'):
            continue

        depPrefix = dep.split('.')[0] + '.'

        
        if not depsByRoot.has_key(depPrefix):
            depsByRoot[depPrefix] = []


        isProvider = False
        for prov in providers:
            if prov in dep:
                isProvider = True

        isGoogSkipper = False
        for skip in GOOG_SKIPPERS:
            if skip in dep:
                isGoogSkipper = True

        #print isProvider, dep
        if isProvider:
            continue
        elif isGoogSkipper:
            continue
        else:
            depsByRoot[depPrefix].append(REQUIRE_PREFIX + '\'' + dep + '\');')
            

    #
    # PRINT!!
    #       
    for depPrefix in DEPS_PREFIXES:
        if depsByRoot.has_key(depPrefix):
            print '\n// ' + depPrefix.split('.')[0]
            for req in depsByRoot[depPrefix]:
                print req
                continue




def main():
    parseDeps(LOAD_FILE)
        
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
