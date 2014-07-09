import sys
import os
import shutil
import collections
import pprint
from subprocess import call


IMG_VIEW_HOME = os.environ.get('XNATIMAGEVIEWER_HOME')
LOAD_PATH = IMG_VIEW_HOME + \
            "/src/main/scripts/viewer/gxnat"
PROVIDE = 'goog.provide('





def filterLastCapital(depLine):
    """
    Filters an isolated dependency line by breaking it apart by the periods, 
    and thenfinding the last capitalized sub-property. 

    -----------------
    EXAMPLES: 
    -----------------

    filterLastCapital('nrg.ui.Component.getElement')
    >>> 'nrg.ui.Component'

    filterLastCapital('nrg.ui.Component.SubComponent')
    >>> 'nrg.ui.Component.SubComponent'


    -----------------
    EXCEPTIONS:
    -----------------

    # Does not filter 2-level dependency lines
    filterLastCapital('nrg.string')
    >>> 'nrg.string'

    # Returns the property/dependecy before the last if no capitals
    filterLastCapital('nrg.fx.fadeIn')
    >>> 'nrg.fx'



    @type depLine: string
    @param depLine: The dependency line

    @rtype: string
    @return: The filtered dependecy line.
    """
    lastCap = -1;
    count = 0;
    filteredDepLine = ''

    #---------------
    # split the dependencies
    #---------------
    depArr = depLine.split('.') 
    for depSub in depArr:
        if len(depSub) > 0 and depSub[0].isupper():
            lastCap = count
        count += 1
        
    #print 'DEP ARR:', depArr[-1], depArr[-1].isupper()
    #---------------
    # If we have a two-level dependecy (i.e 'goog.math') then
    # we just keep the entire line.  
    #
    # We can filter any unneeded things manually.
    #---------------
    if len(depArr) == 2:
        filteredDepLine = depLine

    #---------------
    # If there are no capital letters in the dependency line, we filter
    # to the second to last property
    #---------------
    elif lastCap == -1:
        filteredDepLine = depLine.rpartition('.')[0]


    #---------------
    # ALL caps
    #---------------
    elif len(depArr) > 1 and depArr[-1].isupper():
        filteredDepLine = depLine.rpartition('.')[0]


    #---------------
    # Otherwise we create a new dependecy based on the last capital letter.
    # For instance, if we have 'nrg.ui.Component.getElement' we crop this to
    # 'nrg.ui.Component'
    #---------------
    else:
        filteredDepLine = ''
        count = 0;
        for depSub in depArr:
            filteredDepLine += depSub + '.'
            #print filteredDepLine
            if count == lastCap:
                filteredDepLine = filteredDepLine[:-1]
                break
            count += 1





    #print '\ndepLine: ', depLine
    #print lastCap
    #print 'depArr:', depArr          
    #print 'filtered:', filteredDepLine
    return filteredDepLine




def stripRequireLine(line):
    """
    @type line: string
    @param line: The line to strip

    @rtype: string, string
    @return: The stripped line, the store key for the reqLine
    """
    reqLine = line.strip(REQUIRE_PREFIX).\
              replace(')', '').\
              replace("'",'').\
              replace('"', '').\
              replace(';', '').\
              replace('//', '').strip()
    return reqLine.split('.')[0] + '.', reqLine 
    


def getProvides(fileLines):
    """
    @type fileLines: array.<string>
    @param fileLines: the filelines to parse

    @rtype: array.<string>
    @return: the provides 
    """
    provides = []  
    for line in fileLines:
        if PROVIDE_PREFIX in line:
            prov = line.split(PROVIDE_PREFIX + '\'')[1]
            prov = prov.replace(' ' , '').split('\'')[0]
            #print 'PROV', prov
            if not prov in provides:
                provides.append(prov.strip())
    return provides



def stripDepsPrefixLine(line, depsPrefix):
    """
    @type line: string
    @param line: The line to strip

    @rtype: string, string
    @return: The stripped line, the store key for the reqLine
    """

    skip = False
    line = line.strip().strip(';').strip('\n')
    savers = {}


    #---------------
    # Skippables
    # ---------------
    for skipSubstr in SKIP_SUBSTRS:
        if skipSubstr in line:  
            skip = True



    #---------------
    # Savers
    #---------------
    for saver in SAVE_FOR_LATERS:
        if saver in line:              
            savers[saver] = line;
            skip = True;

    #---------------
    # Now we need to break apart the lines
    #---------------
    foundArr =  depsPrefix + line.split(depsPrefix)[1]
    foundArr = foundArr.rsplit(" ")[0].rsplit('.')

    if not skip:
        return foundArr[0] + '.', line 
    else:
        return None, None

    




def tallyDependencies(foundDeps):
    """
    @type foundDeps: dict
    @param foundDeps: The found dependency dictionary
    """

    talliedDeps = {}
    #---------------
    # Loop through every found depency line
    #---------------
    for dep, item in foundDeps.iteritems():
        for line in item:

            #print '\n\nline:', line
            #---------------
            # Split line by dep
            #---------------        
            depSplit = line
            if dep in depSplit:
                depSplit = depSplit.split(dep)[1]

            #---------------
            # Split line by left splitters
            #---------------
            for splitter in LEFT_SPLITTERS:
                if splitter in depSplit:
                    depSplit = depSplit.split(splitter)[0]

            #---------------
            # Split line by EventType
            #---------------
            if 'EventType' in depSplit:
                depSplit  = depSplit.split('.EventType')[0] 

            #---------------
            # Skip all that have nothing after the splut
            #---------------
            if (len(depSplit) == 0):
                continue

            #---------------
            # filtered the last capital
            #---------------
            key = filterLastCapital(dep + depSplit)

            #
            # tally the dep
            #
            if not talliedDeps.has_key(key):
                talliedDeps[key] = 0
            talliedDeps[key] += 1

    return talliedDeps



def getRawDependency(line):
    """
    @type line: string
    @param line: The line to get the raw dependencies from

    @rtype: ?string, ?string 
    @return: A dictionary of the raw dependencies
    """    

    #---------------
    # store 'goog.require(' lines
    #---------------
    if REQUIRE_PREFIX in line: 
        return stripRequireLine(line)

    #---------------
    # find a line with a DEPS_PREFIX (see above) in it
    #---------------
    for depsPrefix in DEPS_PREFIXES:
        if depsPrefix in line:
            depsLineKey, depsLine = stripDepsPrefixLine(line, depsPrefix)
            if depsLineKey != None:
                return depsLineKey, depsLine

    return None, None

    


def getDependenciesByRoot(talliedDeps, skippables = []):
    """
    @type talliedDeps: array.<string> | dict.<string, string>
    @param talliedDeps: The tallied dependices

    @rtype: dict
    @return: A dictionary of the dependencies by root.
    """  

    depsByRoot = {}
    for dep in talliedDeps:

        #---------------
        # skip anything ending with a period
        #---------------
        if dep.endswith('.'): continue

        
        #---------------
        # Derive the root dependency key
        #---------------
        depPrefix = dep.split('.')[0] + '.'        
        if not depsByRoot.has_key(depPrefix):
            depsByRoot[depPrefix] = []

        #---------------
        # Derive the root dependency key
        #---------------
        isSkipper = False
        for skippable in skippables:
            if skippable == dep.strip():
                isSkipper = True


        isGoogSkipper = False
        for skip in GOOG_SKIPPERS:
            if skip in dep:
                isGoogSkipper = True

        #print isProvider, dep
        if isSkipper or isGoogSkipper: 
            continue
        else: 
            depsByRoot[depPrefix].append(dep)
    
    return depsByRoot

    


def getRawDependencies(fileLines):
    """
    @type fileLines: array.<string>
    @param fileLines: the filelines to parse

    @rtype: dict
    @return: A dictionary of the raw dependencies
    """
    rawDeps = dict((key, []) for key in DEPS_PREFIXES)
    for line in fileLines:
        key, val = getRawDependency(line)
        if key:
            rawDeps[key].append(val)
    return rawDeps




def getDependencies(filename):
    """
    @type filename: string
    @param filename: the file to parse
    """
    fileLines = [line for line in open(filename)]

    #---------------
    # Get the provides
    #--------------- 
    provides = getProvides(fileLines)
    #print "PROVIDES"
    #PPRINT.pprint(provides)

    #---------------
    # Get the raw dependicies dictionary
    #--------------- 
    rawDeps = getRawDependencies(fileLines)
    PPRINT.pprint(rawDeps)

    #---------------
    # Tally the dependencies from the raw dependencies
    #---------------
    talliedDeps = tallyDependencies(rawDeps)

    #---------------
    # Filter the tallied dependencies
    #---------------
    depsByRoot = getDependenciesByRoot(talliedDeps, provides)

    #---------------
    # PRINT!!
    #---------------      
    depLines = []
    for depPrefix in DEPS_PREFIXES:
        if depsByRoot.has_key(depPrefix):
            depLines.append('\n// ' + depPrefix.split('.')[0] + '\n')
            for req in depsByRoot[depPrefix]:
                depLines.append(REQUIRE_PREFIX + '\'' + req + '\');\n')
                continue

    depLines.append('\n//-----------\n\n')
    return depLines




def moveProvide(filename):
    """
    @type filename: string
    @param filename: the file to parse
    """

    fileLines = [line for line in open(filename)]

    newFileLines = 
    for line in fileLines:
        
    #---------------
    # Get the dependencies as lines
    #---------------

    depsAsLines = getDependencies(filename) 
    for l in depsAsLines: print l

    #---------------
    # Add dependencies to the top of the file's lines
    #---------------
    fileLines = depsAsLines + [line for line in open(filename)]


    #---------------
    # Re-write the file
    #---------------
    _file = open(filename, "w")
    for line in fileLines:
        _file.write(line)
    _file.close()




def openFile(filename):
    """
    @type filename: string
    @param filename: the file to parse
    """
    os.system("open " + filename)




def main():
    #---------------
    # Walk through LOAD_PATH, modifying each file
    #---------------
    files = []
    for (dirpath, dirnames, filenames) in os.walk(LOAD_PATH):
        for f in filenames:
            if dirpath == LOAD_PATH and not f.startswith('.'):
                filename = os.path.join(dirpath, f)
                files.append(filename)
                modifyFile(filename)
    #---------------
    # Open each file using the default system editor
    #---------------
    for f in files:
        openFile(f)

      


if __name__ == "__main__":
    main()
