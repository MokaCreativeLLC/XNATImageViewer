import os



def getFiles(walkPath):
    """ Use os.walk to walk through the file list.
    """
    fileDict = {}
    walkPath = '../../sample-data'
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
    walkPath = '../../sample-data'
    fileDict = getFiles(walkPath)
    
    searchStr = '../../'
    replaceStr = ''

    printWithReplace(fileDict, searchStr, replaceStr);
    



if __name__ == "__main__":
    main()
