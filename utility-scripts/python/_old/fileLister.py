import sys
import os
import shutil


startStr = """var REPLACE = {"""
endStr = """
    viewTypeData: {
        "data": {label:"Data", option:["RAW"]}, 
        "type": {label:"Type", option:["MPRAGE"]}, 
        "image": {label:"Image", option:["DICOM"]},  
        "view" : {label:"View", option:["Axial" , "Sagittal" , "Coronal"]},  
    },
    sessionInfo:{
        "SessionID": {label:"Session ID", value: ["SESSION_021"]}, 
        "LabID": {label:"Lab ID", value: ["532"]}, 
        "Age": {label:"Age", value: ["Transverse"]},  
        "Gender": {label:"Gender", value: ["Stack"]}, 
        "Handedness": {label:"Handedness", value: ["Stack"]}, 
        "AcqDate" : {label:"Acq.Date", value: ["Stack"]}, 
        "Scan" : {label:"Scan", value: ["#####"]}, 
        "investigator":{label:"Investigator",value:  ["Stack"]}, 
        "operator":{label:"Operator", value: ["Stack"]}, 
        "type":{label:"type", value: ["MPRAGE"]}, 
    },
    
}
""" 

def main():
    
    basePath = "../TESTSCANS"
    scanDirs = os.listdir(basePath)

    for d in scanDirs:
        sagittalPath = os.path.join(basePath, d, "sagittal")
        axialPath = os.path.join(basePath, d, "axial")
        coronalPath = os.path.join(basePath, d, "coronal")

        
        JSONFilename = "SCAN_" + d
        JSONText = startStr.replace("REPLACE", JSONFilename)
        JSONText += "\n" + generateListFiles(sagittalPath)
        JSONText += "\n"  + generateListFiles(axialPath)
        JSONText += "\n" + generateListFiles(coronalPath)
        JSONText += "\n" + endStr.replace("#####", d.split("_")[0])
        
        fl = open(os.path.join(basePath, JSONFilename + ".js"), 'w')
        fl.write("%s" % JSONText)
        fl.close()
    
    print JSONText
    
    

def generateListFiles(pathName):
    str1 = "%sPaths: [\n"%(os.path.basename(pathName)) 
    for root, dirs, files in os.walk(pathName):
       for f in files:
            fn = root + "/" + f
            fn = fn.replace("\\", "/").replace("../TESTSCANS", "./TESTSCANS")
            str1 += "\""  + fn  + "\",\n"
  
    str1 += "],"
    return str1
    
if __name__ == "__main__":
    main()