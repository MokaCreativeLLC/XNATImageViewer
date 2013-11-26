import sys
import os

def main():
    
    filePaths = ["C:/Users/skumar01/Desktop/ErinReidDataset_Prototype - Copy/Complete/22_Defaced/axial"]

    for p in filePaths:
        for root, dirs, files in os.walk(p):
           for f in files:
               
               a = root + os.sep + f
               b = a.replace("sagittal", "axial")
               if b != a:
                   print "Renaming %s with %s"%(a, b)
                   os.rename(a, b)



if __name__ == "__main__":
    main()