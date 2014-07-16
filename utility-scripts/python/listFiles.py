import os
import pprint


FILE_PREFIX = 'xiv.ui.layouts.interactors'
PPRINT = pprint.PrettyPrinter(indent=2)
IMG_VIEW_HOME = os.environ.get('XNATIMAGEVIEWER_HOME')
LOAD_PATH = IMG_VIEW_HOME + \
            "/src/main/scripts/viewer/xiv/sample-data/slicer-scenes/XnatSamples_MR12"


def getFiles(walkPath):
    """ Use os.walk to walk through the file list.
    """
    fileDict = {}
    for root, dirs, files in os.walk(walkPath):
       for f in files:
           if not root in  fileDict:
               fileDict[root] = []
           fileDict[root].append(os.path.join(root, f)) 
    return fileDict



def printWithReplace(fileDict, opt_searchStr = '', opt_replaceStr = ''):
    """ 
    Prints the dictionary.
    
    @param fileDict: The file dictionary
    @type fileDict: dict

    @param fileDict: The optional search string.
    @type opt_searchStr: string

    @param fileDict: The optional replace string.
    @type opt_replaceStr: string

    """
    
    printStr = '';
    for key, val in fileDict.iteritems():
        printStr += '\n\n[\n';
        for fileName in val:
            printStr += '\'' + \
            fileName.replace(opt_searchStr, opt_replaceStr) + "\',\n"
        printStr += ']';

    print printStr



def main():
    fileDict = getFiles(LOAD_PATH)
    #PPRINT.pprint(fileDict)
    for key, val in fileDict.iteritems():
        for val2 in fileDict[key]:
            _str = FILE_PREFIX + '.' + \
                   os.path.basename(val2.rpartition('.')[0])
            print '\'' + _str + '\': ' + _str + ',' 
        


if __name__ == "__main__":
    main()
