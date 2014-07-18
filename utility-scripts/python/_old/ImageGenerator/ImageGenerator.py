import sys
import os
from PIL import Image
import shutil
import GenerateBySagittalReference





#===============================================================================
# 
#
#===============================================================================
def generateImages(basePath, referenceAxis):
 

    # 
    # Check if a folder match exists for the reference axis, raise an 
    # error if it doesn't.
    #
    if not referenceAxis in os.listdir(basePath):
        err  =   """Generate Images Error:  Reference Folders must be named according to axis:
                    sagittal, coronal, axial."""
        raise err 
    
    
    #
    # Establish pathnames + related parameters
    #   
    coronalDir = os.path.join(basePath, "coronal")
    axialDir = os.path.join(basePath, "axial")
    sagittalDir = os.path.join(basePath, "sagittal")    
    axisPaths = [coronalDir, axialDir, sagittalDir]
    referenceImagePath = os.path.join(basePath, referenceAxis)

                
    #
    # Create directories as needed
    #
    for p in axisPaths:
          if not os.path.exists(p): 
              os.mkdir(p)
        
        
    #
    # Count the total files, get the size of the reference images (they should be all the same)
    #
    fileCount = 0
    refFileNames = []
    genSize = None
    
    for root, dirs, files in os.walk(referenceImagePath):
       for f in files:
            fn = root + "/" + f
            
            #
            # Right now the files should be jpeg format
            #
            if (fn.endswith("jpg") or fn.endswith("jpeg")):
                fileCount += 1
                im = Image.open(root + "/" + f)
                
                if (genSize == None):
                    genSize = im.size
                    
                if (im.size != genSize):
                    print "INEQUALITY IN IMAGE SIZES: %s, %s, %s"%(fn, im.size, genSize) + ". Cancelling!"
                    return
                
                refFileNames.append(root + "/" + f)

    
    
    #
    # Create images
    #               
    
    if (referenceAxis == "sagittal"):
        createBlankImages(axialDir, os.path.basename(basePath) + "_" + "axial" + "_", genSize[1], "jpg", [fileCount, genSize[1]])
        createBlankImages(coronalDir, os.path.basename(basePath) + "_" + "coronal" + "_", genSize[1], "jpg", [fileCount, genSize[1]])
        GenerateBySagittalReference.generateAxial(axialDir, genSize, refFileNames)
        GenerateBySagittalReference.generateCoronal(coronalDir, genSize, refFileNames)

    print "DONE"

            
            

#===============================================================================
# Creats a numeric string based upon a total set of strings, so as to
# maintain a conistent string length
#===============================================================================
def makeNumericString(num, totalNums):
    totalStr = str(totalNums) 
    numStr = str(num)
    
    if (len(numStr) < len(totalStr)):
        while len(numStr) < len(totalStr):
            numStr = "0" + numStr
    return numStr
    
  
  
  
#===============================================================================
# Creates set of blank image files (grayscale, see mode argument)
# based on the arguments.
#===============================================================================
def createBlankImages(location, filename, numFiles, fileType, size, mode = "L"):
    
    print ("Creating blank images in %s"%(location))
    #
    # Validate + Change filetype string
    #
    if fileType[0] == ".":
        fileType = fileType[1:]


    #
    # Validate filename
    #
    checkForIllegalChars(filename)
        
 
        
    for x in range(1, numFiles+1):
        img = Image.new( mode, (size[0] , size[1]), "black")
        pixels = img.load()
        
        #
        # Fill every pixed color black
        #
        for i in range(img.size[0]):  
            for j in range(img.size[1]):
                pixels[i,j] = 0 
        
        newFn = os.path.join(location, filename + "_" + makeNumericString(x, numFiles)) + ".jpg"
        img.save(newFn, "JPEG")   
        
        



#===============================================================================
# As stated
#===============================================================================
def checkForIllegalChars(str):
    import re
    re1 = re.compile(r"[<>/{}[\]~`]");
    if re1.search(str):
        raise("Invalid filename")

        
        



#===============================================================================
# As stated
#===============================================================================
def main():   
    #
    # Take in a root directory and build the rest of the 
    # images based on what exists there
    #
    basePath = "../../TESTSCANS"
    #folders = os.listdir(basePath)
    folderList = ["02_Defaced", "07_Defaced", "08_Defaced", "17_Defaced", "18_Defaced", "24_Defaced"]
    for folder in folderList:
        f = basePath + "/" + folder
        generateImages(f, "sagittal")
#        return
        
        
        
if __name__ == "__main__":
    main()