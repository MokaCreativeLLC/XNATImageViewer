import os
from subprocess import call



    
def main():


    scans = {}
    slicer = {}

    
    #------------------------------------
    # MAIN PARAMS
    #------------------------------------
    scanPath = './scans'
    validExtensions = ['ima']
    convertedPaths = []
    
    
    #------------------------------------
    #  WALK THROUGH SCANS
    #------------------------------------   
    for root, dirs, files in os.walk(scanPath):

        #
        # Skip out of paths that we already
        # converted.
        #
        if root in convertedPaths:
            continue

        #
        # Skip
        #
        niiFound = False
        if os.path.exists(root + "/niiConvert") or 'niiConvert' in root:
            print "Skipping: %s because niiConvert already exists"%(root)
            niiFound = True 

  
        if not niiFound:
            for f in files:
                #
                # Check if ima file is there
                #
                validExt = False
                for ext in validExtensions:
                    if f.lower().endswith(ext):
                        validExt = True
                        break
                    
            #
            # If it's there run the appropriate
            # script
            #
            if validExt:
                #continue
                print "Converting .IMA files in %s..."%(root)
                command = 'mcverter %s -f "nifti" -o %s/niiConvert --nii'%(root, root)
                os.system("%s &> /dev/null"%(command))
                #call(command.split(' '))
                #convertedPaths.append(root)



    
    print "IMAS Converted"

    
if __name__ == "__main__":
    main()


