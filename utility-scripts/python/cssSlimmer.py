import slimmer
from slimmer import css_slimmer
import os
import pprint


PPRINT = pprint.PrettyPrinter(indent=2)
IMG_VIEW_HOME = os.environ.get('XNATIMAGEVIEWER_HOME')
DEMO_HOME = IMG_VIEW_HOME + "/Demo.html"
MIN_CSS_FILE = IMG_VIEW_HOME + "/src/main/scripts/viewer/xiv-min.css"
TOTAL_CSS_FILE = IMG_VIEW_HOME + "/src/main/scripts/viewer/xiv-all.css"

def getXivCss(demoPath, walkPath):
    """ 
    Use os.walk to walk through the file list.
    """
    demoLines = [line for line in open(demoPath)]

    cssFiles = []
    for root, dirs, files in os.walk(walkPath):
       for f in files:
           if f.endswith('.css'):
               cssFiles.append(os.path.join(root, f)) 


    demoCssFiles = []
    for line in demoLines:
        if '.css' in line:
            line = line.split('href="')[1].split('"')[0].strip()
            demoCssFiles.append(line)

    culledCss = []
    for demoCss in demoCssFiles:
        for cssFile in cssFiles:
            if demoCss in cssFile:
                culledCss.append(cssFile)

    return culledCss



def getAllCssAsString(cssFiles):
    cssLines = []
    for cssFile in cssFiles:
        cssLines += [line for line in open(cssFile)]

    allCss = ''
    for line in cssLines:
        allCss += line    
    return allCss;


def getMinCss(cssFiles):
    allCss = getAllCssAsString(cssFiles)
    from slimmer import css_slimmer
    minCss = css_slimmer(allCss)
    return minCss


def writeFile(fileName, cssStr):
    text_file = open(fileName, "w")
    text_file.write(cssStr)
    text_file.close()

def main():
    cssFiles = getXivCss(DEMO_HOME, IMG_VIEW_HOME)
    #minCss = getMinCss(cssFiles)
    #writeMinCss(MIN_CSS_FILE, minCss)

    allCss = getAllCssAsString(cssFiles)
    writeFile(TOTAL_CSS_FILE, allCss)

if __name__ == "__main__":
    main()
